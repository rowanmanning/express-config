/**
 * @module @rowanmanning/express-config
 */
'use strict';

const express = require('express');
const expressPreactViews = require('express-preact-views');
const expressSession = require('express-session');
const flash = require('connect-flash');
const {default: helmet} = require('helmet');
const http = require('http');
const {nanoid} = require('nanoid');
const notFound = require('@rowanmanning/not-found');
const pino = require('pino').default;
const pinoHttp = require('pino-http').default;
const {promisify} = require('util');
const {redirectToHTTPS} = require('express-http-to-https');
const renderErrorPage = require('@rowanmanning/render-error-page');

/**
 * Configure an Express application.
 *
 * @access public
 * @param {express.Application} app
 *     The Express application to configure.
 * @param {ExpressConfigOptions} [options]
 *     The configuration options.
 * @returns {express.Application & ConfiguredExpressApplication}
 *     Returns the configured express application.
 */
module.exports = function configureExpress(app, options) {
	options = applyDefaultOptions(options);

	/**
	 * @type {express.Application & ConfiguredExpressApplication}
	 */
	// @ts-ignore
	const configuredApp = app;

	// Configure default routing behaviour
	configuredApp.enable('case sensitive routing');
	configuredApp.enable('strict routing');

	// Configure JSON output
	configuredApp.set('json spaces', '\t');

	// Remove x-powered-by header
	configuredApp.disable('x-powered-by');

	// Set the trust proxy settings
	configuredApp.set('trust proxy', options.trustProxy);

	// Register a Preact view engine
	configuredApp.set('views', options.viewPath);
	configuredApp.set('view engine', 'jsx');
	configuredApp.engine('jsx', expressPreactViews.createEngine(options.expressPreact));

	// Augment the app with a logger
	configuredApp.log = pino(options.pino);

	// Create pre and post route middleware
	configuredApp.preRoute = [];
	configuredApp.postRoute = [];

	// Create a server
	const server = configuredApp.server = http.createServer(app);

	/**
	 * @type {Function}
	 * @param {any} port
	 * @param {any} hostname
	 * @param {any} backlog
	 * @param {any} listeningListener
	 * @returns {Promise<http.Server>}
	 */
	const listen = promisify(server.listen.bind(server));

	// Create a promisified start function
	configuredApp.start = async function start(...args) {
		await listen(...args);

		/**
		 * @type {{address: string, port: number}}
		 */
		// @ts-ignore
		const serverAddress = server.address();

		configuredApp.log.info({
			msg: 'Server started',
			address: serverAddress?.address,
			port: serverAddress?.port
		});
	};

	// Create a promisified stop function
	const close = promisify(server.close.bind(server));
	configuredApp.stop = async function stop() {
		await close();
		configuredApp.log.info('Server stopped');
	};

	// Configure Helmet middleware
	if (options.helmet !== false) {
		configuredApp.preRoute.push(
			helmet(options.helmet)
		);
	}

	// Configure express-http-to-https middleware
	if (options.redirectToHttps) {
		const {ignoreHosts, ignoreRoutes, redirectCode} = options.redirectToHttps;
		configuredApp.preRoute.push(
			redirectToHTTPS(ignoreHosts, ignoreRoutes, redirectCode)
		);
	}

	// Configure static route middleware
	if (options.static && typeof options.publicPath === 'string') {
		configuredApp.preRoute.push(
			express.static(options.publicPath, options.static)
		);
	}

	// Configure request body parsing middleware
	if (options.jsonBody !== false) {
		configuredApp.preRoute.push(
			express.json(options.jsonBody)
		);
	}
	if (options.urlencodedBody !== false) {
		configuredApp.preRoute.push(
			express.urlencoded(options.urlencodedBody)
		);
	}

	// Configure session middleware
	if (options.session !== false) {
		const sessionOptions = Object.assign({}, options.session, {
			name: options.sessionName,
			secret: options.sessionSecret ?? nanoid(),
			store: options.sessionStore
		});
		configuredApp.preRoute.push(
			expressSession(sessionOptions),
			flash()
		);
	}

	// Configure request logging middleware
	if (options.pinoHttp !== false) {
		const httpOptions = Object.assign({}, options.pinoHttp, {logger: configuredApp.log});
		configuredApp.preRoute.push(
			pinoHttp(httpOptions)
		);
	}

	// Configure not-found middleware
	if (options.notFound !== false) {
		configuredApp.postRoute.push(
			notFound(options.notFound)
		);
	}

	// Configure error handling middleware
	if (options.errorPage !== false) {
		configuredApp.postRoute.push(
			renderErrorPage(options.errorPage)
		);
	}

	return configuredApp;
};

/**
 * Apply default values to some Express Config options.
 *
 * @access private
 * @param {ExpressConfigOptions} [options]
 *     The configuration options.
 * @returns {ExpressConfigOptions}
 *     Returns the defaulted options.
 */
function applyDefaultOptions(options) {
	return Object.assign({}, module.exports.defaultOptions, options);
}

/**
 * Custom Pino serializers for use in request/response logging.
 *
 * @access private
 * @type {object}
 */
module.exports.pinoSerializers = {

	/**
	 * Serialize an HTTP request for use in logging.
	 *
	 * @access private
	 * @param {express.Request} request
	 *     The request to serialize.
	 * @returns {object}
	 *     Returns a representation of the request.
	 */
	request(request) {
		return {
			id: request.id,
			method: request.method,
			url: request.url
		};
	},

	/**
	 * Serialize an HTTP response for use in logging.
	 *
	 * @access private
	 * @param {express.Response} response
	 *     The response to serialize.
	 * @returns {object}
	 *     Returns a representation of the response.
	 */
	response(response) {
		return {
			statusCode: response.statusCode
		};
	}

};

/**
 * Default Express Config options.
 *
 * @access private
 * @type {ExpressConfigOptions}
 */
module.exports.defaultOptions = {
	errorPage: {
		errorLogger: (error, request) => {
			request.log.error(error);
		},
		errorLoggingFilter: error => {
			return error.statusCode !== 404;
		},
		errorLoggingSerializer: error => {
			return {error};
		}
	},
	expressPreact: {
		beautify: true
	},
	jsonBody: {
		strict: false
	},
	pinoHttp: {
		autoLogging: {
			ignorePaths: [
				'/favicon.ico'
			]
		},
		customAttributeKeys: {
			req: 'request', // eslint-disable-line id-denylist
			res: 'response', // eslint-disable-line id-denylist
			err: 'error' // eslint-disable-line id-denylist
		},
		genReqId: request => request.headers['x-request-id'] || nanoid(10),
		serializers: {
			req: module.exports.pinoSerializers.request, // eslint-disable-line id-denylist
			res: module.exports.pinoSerializers.response // eslint-disable-line id-denylist
		}
	},
	publicPath: `${process.cwd()}/public`,
	redirectToHttps: {
		ignoreHosts: [/^localhost:\d+$/i]
	},
	sessionName: 'Session',
	session: {
		cookie: {
			maxAge: 1000 * 60 * 60 * 24 * 7, // One week
			sameSite: 'strict',
			secure: (process.env.NODE_ENV === 'production')
		},
		resave: false,
		saveUninitialized: false
	},
	static: {
		maxAge: (
			process.env.NODE_ENV === 'production' ?
				1000 * 60 * 60 * 24 * 7 : // One week
				0
		)
	},
	trustProxy: true,
	urlencodedBody: {
		extended: false
	},
	viewPath: `${process.cwd()}/views`
};

/**
 * @typedef {object} ConfiguredExpressApplication
 * @property {pino.BaseLogger} log
 *     A Pino logger instance used by the app.
 * @property {Array<express.Handler>} preRoute
 *     Middleware functions to be added before main application routes.
 * @property {Array<express.Handler>} postRoute
 *     Middleware functions to be added after main application routes.
 * @property {http.Server} server
 *     The HTTP server bound to the Express application.
 * @property {function(number):Promise} start
 *     A promisified method to start the HTTP server. Has the same signature as
 *     `http.Server.prototype.listen` but returns a promise instead of using a callback.
 * @property {function():Promise} stop
 *     A promisified method to stop the HTTP server. Has the same signature as
 *     `http.Server.prototype.close` but returns a promise instead of using a callback.
 */

/**
 * @typedef {object} ExpressConfigOptions
 * @property {(renderErrorPage.Options|false)} [errorPage]
 *     Configuration options to pass into {@link "https://github.com/rowanmanning/render-error-page#readme"|@rowanmanning/render-error-page}.
 *     Set to `false` to disable the render-error-page middleware entirely.
 * @property {expressPreactViews.EngineOptions} [expressPreact = {beautify: true}]
 *     Configuration options to pass into {@link "https://github.com/edwjusti/express-preact-views/#readme"|express-preact-views}.
 * @property {(import('helmet').HelmetOptions|false)} [helmet]
 *     Configuration options to pass into {@link "https://helmetjs.github.io/"|Helmet}.
 *     Set to `false` to disable Helmet entirely.
 * @property {(object | false)} [jsonBody = {strict: false}]
 *     Configuration options to pass into {@link "https://expressjs.com/en/api.html#express.json"|express.json}.
 *     Set to `false` to disable the express.json middleware entirely.
 * @property {(object | false)} [notFound]
 *     Configuration options to pass into {@link "https://github.com/rowanmanning/not-found#readme"|@rowanmanning/not-found}.
 *     Set to `false` to disable the not-found middleware entirely.
 * @property {pino.LoggerOptions} [pino]
 *     Configuration options to pass into {@link "https://github.com/pinojs/pino#readme"|pino}.
 * @property {(import('pino-http').Options|false)} [pinoHttp]
 *     Configuration options to pass into {@link "https://github.com/pinojs/pino-http#readme"|pino-http}.
 *     Set to `false` to disable the pino-http middleware entirely.
 * @property {string} [publicPath = `${process.cwd()}/public`]
 *     A directory for the Express application's static assets.
 * @property {(RedirectToHttpsConfig|false)} [redirectToHttps = {ignoreHosts: [/^localhost:\d+$/i]}]
 *     Configuration options to pass into {@link "https://github.com/SegFaultx64/express-http-to-https#readme"|express-http-to-https}.
 *     Set to `false` to disable the express-http-to-https middleware entirely.
 * @property {(object | false)} [session]
 *     Configuration options to pass into {@link "https://github.com/expressjs/session#readme"|express-session}.
 *     The `sessionSecret` and `sessionStore` configurations should be used before this, as their
 *     values will override any that are passed in the `session` option. Set to `false` to disable
 *     the express-session middleware entirely.
 * @property {string} [sessionName="Session"]
 *     The name of the session cookie. {@link "https://github.com/expressjs/session#name"|see documentation}.
 * @property {string} [sessionSecret]
 *     A secret used to sign the session ID cookie. {@link "https://github.com/expressjs/session#secret"|see documentation}.
 *     If undefined it will default to a random string but sessions will be invalidated every time
 *     the application restarts.
 * @property {expressSession.Store} [sessionStore]
 *     A session store object. {@link "https://github.com/expressjs/session#compatible-session-stores"|see documentation}.
 *     If undefined it will default to an in-memory session store, but sessions will be cleared
 *     every time the application restarts.
 * @property {(object | false)} [static]
 *     Configuration options to pass into {@link "https://expressjs.com/en/api.html#express.static"|express.static}.
 *     Set to `false` to disable the express.static middleware entirely.
 * @property {(boolean | string | number | Array<string> | Function)} [trustProxy=true]
 *     Configuration option for the {@link https://expressjs.com/en/guide/behind-proxies.html|express `trust proxy` setting}.
 * @property {(object | false)} [urlencodedBody = {extended: false}]
 *     Configuration options to pass into {@link "https://expressjs.com/en/api.html#express.urlencoded"|express.urlencoded}.
 *     Set to `false` to disable the express.urlencoded middleware entirely.
 * @property {(string | Array<string>)} [viewPath = `${process.cwd()}/views`]
 *     A directory or an array of directories for the Express application's views.
 *     If an array, the views are looked up in the order they occur in the array.
 */

/**
 * @typedef {object} RedirectToHttpsConfig
 * @property {Array<RegExp>} [ignoreHosts = [/^localhost:\d+$/i]]
 *     Hostnames on which to not enable the redirect. Ports must be added to manually.
 * @property {Array<RegExp>} [ignoreRoutes]
 *     The application routes on which to not enable the redirect.
 * @property {number} [redirectCode]
 *     The HTTP status code to return when redirecting.
 */
