'use strict';

const assert = require('node:assert');
const td = require('testdouble');

describe('lib/express-config', () => {
	let configureExpress;
	let express;
	let expressPreactViews;
	let expressSession;
	let flash;
	let helmet;
	let http;
	let nanoid;
	let notFound;
	let pino;
	let pinoHttp;
	let redirectToHTTPS;
	let renderErrorPage;

	beforeEach(() => {
		process.env.NODE_ENV = 'development';

		express = td.replace('express', require('../mock/npm/express.mock').initMock());
		expressPreactViews = td.replace('express-preact-views', require('../mock/npm/express-preact-views.mock').initMock());
		expressSession = td.replace('express-session', require('../mock/npm/express-session.mock').initMock());
		flash = td.replace('connect-flash', require('../mock/npm/connect-flash.mock').initMock());
		helmet = td.replace('helmet', require('../mock/npm/helmet.mock').initMock()).default;
		http = td.replace('node:http', require('../mock/node/http.mock').initMock());
		nanoid = td.replace('nanoid', require('../mock/npm/nanoid.mock').initMock()).nanoid;
		notFound = td.replace('@rowanmanning/not-found', require('../mock/npm/@rowanmanning/not-found.mock').initMock());
		pino = td.replace('pino', require('../mock/npm/pino.mock').initMock()).default;
		pinoHttp = td.replace('pino-http', require('../mock/npm/pino-http.mock').initMock()).default;
		redirectToHTTPS = td.replace('express-http-to-https', require('../mock/npm/express-http-to-https.mock').initMock()).redirectToHTTPS;
		renderErrorPage = td.replace('@rowanmanning/render-error-page', require('../mock/npm/@rowanmanning/render-error-page.mock').initMock());

		configureExpress = require('../../..');
	});

	it('is a function', () => {
		assert.strictEqual(typeof configureExpress, 'function');
	});

	describe('configureExpress(app, options)', () => {
		let app;
		let defaultedOptions;
		let options;

		beforeEach(() => {

			// Mock user options
			options = {mockUserOptions: true};
			defaultedOptions = {
				mockDefaultedOptions: true,
				errorPage: 'mock-error-page-options',
				expressPreact: 'mock-express-preact-options',
				helmet: 'mock-helmet-options',
				jsonBody: 'mock-parse-body-json-options',
				notFound: 'mock-not-found-options',
				pino: 'mock-pino-options',
				pinoHttp: {
					isMockPinoHttpOptions: true
				},
				publicPath: 'mock-public-path',
				redirectToHttps: {
					ignoreHosts: 'mock-ignore-hosts',
					ignoreRoutes: 'mock-ignore-routes',
					redirectCode: 'mock-redirect-code'
				},
				session: {
					isMockSessionOptions: true
				},
				sessionName: 'mock-session-name',
				sessionSecret: 'mock-session-secret',
				sessionStore: 'mock-session-storage',
				static: 'mock-static-options',
				trustProxy: 'mock-trust-proxy',
				urlencodedBody: 'mock-parse-body-urlencoded-options',
				viewPath: 'mock-view-path'
			};

			// Mock option defaulting
			td.replace(Object, 'assign');
			td.when(Object.assign({}, configureExpress.defaultOptions, options)).thenReturn(defaultedOptions);
			td.when(Object.assign({}, defaultedOptions.pinoHttp, {logger: pino.mockLogger})).thenReturn('mock-pino-http-options');
			td.when(Object.assign({}, defaultedOptions.session, {
				name: 'mock-session-name',
				secret: 'mock-session-secret',
				store: 'mock-session-storage'
			})).thenReturn('mock-session-options');

			app = configureExpress(express(), options);
		});

		it('defaults the options', () => {
			td.verify(Object.assign({}, configureExpress.defaultOptions, options), {times: 1});
		});

		it('configures case sensitive routing', () => {
			td.verify(express.mockApp.enable('case sensitive routing'), {times: 1});
		});

		it('configures strict routing', () => {
			td.verify(express.mockApp.enable('strict routing'), {times: 1});
		});

		it('configures JSON output to use tabs', () => {
			td.verify(express.mockApp.set('json spaces', '\t'), {times: 1});
		});

		it('disables the x-powered-by header', () => {
			td.verify(express.mockApp.disable('x-powered-by'), {times: 1});
		});

		it('sets the trust proxy setting', () => {
			td.verify(express.mockApp.set('trust proxy', 'mock-trust-proxy'), {times: 1});
		});

		it('sets the view path to `options.viewPath`', () => {
			td.verify(express.mockApp.set('views', 'mock-view-path'), {times: 1});
		});

		it('sets the default view engine to "jsx"', () => {
			td.verify(express.mockApp.set('view engine', 'jsx'), {times: 1});
		});

		it('creates an express-preact-views engine', () => {
			td.verify(expressPreactViews.createEngine('mock-express-preact-options'), {times: 1});
		});

		it('registers the express-preact-views engine under the "jsx" extension', () => {
			td.verify(express.mockApp.engine('jsx', expressPreactViews.mockEngine), {times: 1});
		});

		it('creates a pino logger', () => {
			td.verify(pino('mock-pino-options'), {times: 1});
		});

		it('creates an HTTP server with the Express application', () => {
			td.verify(http.createServer(express.mockApp), {times: 1});
		});

		it('creates and configures helmet middleware', () => {
			td.verify(helmet('mock-helmet-options'), {times: 1});
		});

		it('creates and configures express-http-to-https middleware', () => {
			td.verify(redirectToHTTPS(
				'mock-ignore-hosts',
				'mock-ignore-routes',
				'mock-redirect-code'
			), {times: 1});
		});

		it('creates and configures express static middleware', () => {
			td.verify(express.static('mock-public-path', 'mock-static-options'), {times: 1});
		});

		it('creates and configures express body JSON middleware', () => {
			td.verify(express.json('mock-parse-body-json-options'), {times: 1});
		});

		it('creates and configures express body urlencoded middleware', () => {
			td.verify(express.urlencoded('mock-parse-body-urlencoded-options'), {times: 1});
		});

		it('creates and configures express-session middleware', () => {
			td.verify(Object.assign({}, defaultedOptions.session, {
				name: 'mock-session-name',
				secret: 'mock-session-secret',
				store: 'mock-session-storage'
			}), {times: 1});
			td.verify(expressSession('mock-session-options'), {times: 1});
		});

		it('creates and configures connect-flash middleware', () => {
			td.verify(flash(), {times: 1});
		});

		it('creates and configures pino-http middleware with the app pino logger', () => {
			td.verify(Object.assign({}, defaultedOptions.pinoHttp, {logger: pino.mockLogger}), {times: 1});
			td.verify(pinoHttp('mock-pino-http-options'), {times: 1});
		});

		it('creates and configures not-found middleware', () => {
			td.verify(notFound('mock-not-found-options'), {times: 1});
		});

		it('creates and configures render-error-page middleware with the app pino logger', () => {
			td.verify(renderErrorPage('mock-error-page-options'), {times: 1});
		});

		it('returns the `app`', () => {
			assert.strictEqual(app, express.mockApp);
		});

		describe('app.log', () => {

			it('is a pino logger', () => {
				assert.strictEqual(app.log, pino.mockLogger);
			});

		});

		describe('app.preRoute', () => {

			it('is an array of created middleware functions', () => {
				assert.ok(Array.isArray(app.preRoute));
				assert.strictEqual(app.preRoute.every(middleware => typeof middleware === 'function'), true);
			});

			it('contains helmet middleware', () => {
				assert.ok(app.preRoute.includes(helmet.mockMiddleware));
			});

			it('contains express-http-to-https middleware', () => {
				assert.ok(app.preRoute.includes(redirectToHTTPS.mockMiddleware));
			});

			it('contains express.static middleware', () => {
				assert.ok(app.preRoute.includes(express.static.mockMiddleware));
			});

			it('contains express.json middleware', () => {
				assert.ok(app.preRoute.includes(express.json.mockMiddleware));
			});

			it('contains express.urlencoded middleware', () => {
				assert.ok(app.preRoute.includes(express.urlencoded.mockMiddleware));
			});

			it('contains express-session middleware', () => {
				assert.ok(app.preRoute.includes(expressSession.mockMiddleware));
			});

			it('contains connect-flash middleware', () => {
				assert.ok(app.preRoute.includes(flash.mockMiddleware));
			});

			it('contains pino-http middleware', () => {
				assert.ok(app.preRoute.includes(pinoHttp.mockMiddleware));
			});

		});

		describe('app.postRoute', () => {

			it('is an array of created middleware functions', () => {
				assert.ok(Array.isArray(app.postRoute));
				assert.strictEqual(app.postRoute.every(middleware => typeof middleware === 'function'), true);
			});

			it('contains not-found middleware', () => {
				assert.ok(app.postRoute.includes(notFound.mockMiddleware));
			});

			it('contains render-error-page middleware', () => {
				assert.ok(app.postRoute.includes(renderErrorPage.mockMiddleware));
			});

		});

		describe('app.server', () => {

			it('is the created HTTP server', () => {
				assert.strictEqual(app.server, http.mockServer);
			});

		});

		describe('app.start(...args)', () => {

			beforeEach(async () => {
				td.when(http.mockServer.listen('mock-arg1', 'mock-arg2', 'mock-arg3'), {
					defer: true
				}).thenCallback();
				await app.start('mock-arg1', 'mock-arg2', 'mock-arg3');
			});

			it('calls `server.listen()` with the given arguments', () => {
				td.verify(http.mockServer.listen('mock-arg1', 'mock-arg2', 'mock-arg3', td.matchers.isA(Function)), {times: 1});
			});

			it('logs that the server has started', () => {
				td.verify(pino.mockLogger.info({
					msg: 'Server started',
					address: 'mock-server-address',
					port: 'mock-server-port'
				}), {times: 1});
			});

			describe('when `server.listen()` calls back with an error', () => {
				let caughtError;
				let listenError;

				beforeEach(async () => {
					listenError = new Error('mock listen error');
					td.when(http.mockServer.listen(), {defer: true}).thenCallback(listenError);
					try {
						await app.start();
					} catch (error) {
						caughtError = error;
					}
				});

				it('rejects with the server error', () => {
					assert.strictEqual(caughtError, listenError);
				});

			});

		});

		describe('app.stop()', () => {

			beforeEach(async () => {
				td.when(http.mockServer.close(), {defer: true}).thenCallback();
				await app.stop();
			});

			it('calls `server.close()`', () => {
				td.verify(http.mockServer.close(td.matchers.isA(Function)), {times: 1});
			});

			it('logs that the server has stopped', () => {
				td.verify(pino.mockLogger.info('Server stopped'), {times: 1});
			});

			describe('when `server.close` calls back with an error', () => {
				let caughtError;
				let closeError;

				beforeEach(async () => {
					closeError = new Error('mock close error');
					td.when(http.mockServer.close(), {defer: true}).thenCallback(closeError);
					try {
						await app.stop();
					} catch (error) {
						caughtError = error;
					}
				});

				it('rejects with the server error', () => {
					assert.strictEqual(caughtError, closeError);
				});

			});

		});

		describe('when `options.helmet` is `false`', () => {

			beforeEach(() => {
				defaultedOptions.helmet = false;
				app = configureExpress(express.mockApp, options);
			});

			describe('app.preRoute', () => {

				it('does not contain helmet middleware', () => {
					assert.strictEqual(app.preRoute.includes(helmet.mockMiddleware), false);
				});

			});

		});

		describe('when `options.redirectToHttps` is `false`', () => {

			beforeEach(() => {
				defaultedOptions.redirectToHttps = false;
				app = configureExpress(express.mockApp, options);
			});

			describe('app.preRoute', () => {

				it('does not contain express-http-to-https middleware', () => {
					assert.strictEqual(app.preRoute.includes(redirectToHTTPS.mockMiddleware), false);
				});

			});

		});

		describe('when `options.static` is `false`', () => {

			beforeEach(() => {
				defaultedOptions.static = false;
				app = configureExpress(express.mockApp, options);
			});

			describe('app.preRoute', () => {

				it('does not contain express.static middleware', () => {
					assert.strictEqual(app.preRoute.includes(express.static.mockMiddleware), false);
				});

			});

		});

		describe('when `options.jsonBody` is `false`', () => {

			beforeEach(() => {
				defaultedOptions.jsonBody = false;
				app = configureExpress(express.mockApp, options);
			});

			describe('app.preRoute', () => {

				it('does not contain express.json middleware', () => {
					assert.strictEqual(app.preRoute.includes(express.json.mockMiddleware), false);
				});

			});

		});

		describe('when `options.urlencodedBody` is `false`', () => {

			beforeEach(() => {
				defaultedOptions.urlencodedBody = false;
				app = configureExpress(express.mockApp, options);
			});

			describe('app.preRoute', () => {

				it('does not contain express.urlencoded middleware', () => {
					assert.strictEqual(app.preRoute.includes(express.urlencoded.mockMiddleware), false);
				});

			});

		});

		describe('when `options.pinoHttp` is `false`', () => {

			beforeEach(() => {
				defaultedOptions.pinoHttp = false;
				app = configureExpress(express.mockApp, options);
			});

			describe('app.preRoute', () => {

				it('does not contain pino-http middleware', () => {
					assert.strictEqual(app.preRoute.includes(pinoHttp.mockMiddleware), false);
				});

			});

		});

		describe('when `options.session` is `false`', () => {

			beforeEach(() => {
				defaultedOptions.session = false;
				app = configureExpress(express.mockApp, options);
			});

			describe('app.postRoute', () => {

				it('does not contain express-session middleware', () => {
					assert.strictEqual(app.postRoute.includes(expressSession.mockMiddleware), false);
				});

				it('contains connect-flash middleware', () => {
					assert.strictEqual(app.preRoute.includes(flash.mockMiddleware), false);
				});

			});

		});

		describe('when `options.sessionSecret` is not defined', () => {

			beforeEach(() => {
				delete defaultedOptions.sessionSecret;
				td.when(Object.assign({}, defaultedOptions.session, {
					name: 'mock-session-name',
					secret: 'mock-nanoid-session-secret',
					store: 'mock-session-storage'
				})).thenReturn('mock-session-options-with-nanoid');
				td.when(nanoid()).thenReturn('mock-nanoid-session-secret');
				app = configureExpress(express.mockApp, options);
			});

			it('creates and configures express-session middleware with a nanoid as a secret', () => {
				td.verify(nanoid(), {times: 1});
				td.verify(Object.assign({}, defaultedOptions.session, {
					name: 'mock-session-name',
					secret: 'mock-nanoid-session-secret',
					store: 'mock-session-storage'
				}), {times: 1});
				td.verify(expressSession('mock-session-options-with-nanoid'), {times: 1});
			});

		});

		describe('when `options.notFound` is `false`', () => {

			beforeEach(() => {
				defaultedOptions.notFound = false;
				app = configureExpress(express.mockApp, options);
			});

			describe('app.postRoute', () => {

				it('does not contain not-found middleware', () => {
					assert.strictEqual(app.postRoute.includes(helmet.mockMiddleware), false);
				});

			});

		});

		describe('when `options.errorPage` is `false`', () => {

			beforeEach(() => {
				defaultedOptions.errorPage = false;
				app = configureExpress(express.mockApp, options);
			});

			describe('app.postRoute', () => {

				it('does not contain render-error-page middleware', () => {
					assert.strictEqual(app.postRoute.includes(renderErrorPage.mockMiddleware), false);
				});

			});

		});

	});

	describe('configureExpress.pinoSerializers', () => {

		it('contains serializers for requests and responses', () => {
			assert.strictEqual(typeof configureExpress.pinoSerializers, 'object');
			assert.strictEqual(typeof configureExpress.pinoSerializers.request, 'function');
			assert.strictEqual(typeof configureExpress.pinoSerializers.response, 'function');
		});

		describe('.request(request)', () => {

			it('returns a stripped down request object', () => {
				const mockRequest = {
					id: 'mock-id',
					method: 'mock-method',
					url: 'mock-url',
					headers: {'mock-header': 'mock-header-value'},
					query: {'mock-query': 'mock-query-value'}
				};
				assert.deepStrictEqual(configureExpress.pinoSerializers.request(mockRequest), {
					id: 'mock-id',
					method: 'mock-method',
					url: 'mock-url'
				});
			});

		});

		describe('.response(response)', () => {

			it('returns a stripped down response object', () => {
				const mockResponse = {
					id: 'mock-id',
					statusCode: 'mock-status-code',
					hostname: 'mock-hostname',
					headers: {'mock-header': 'mock-header-value'}
				};
				assert.deepStrictEqual(configureExpress.pinoSerializers.response(mockResponse), {
					statusCode: 'mock-status-code'
				});
			});

		});

	});

	describe('configureExpress.defaultOptions', () => {

		it('is an object', () => {
			assert.strictEqual(typeof configureExpress.defaultOptions, 'object');
		});

		describe('.errorPage', () => {

			it('contains default values for Error Page', () => {
				assert.strictEqual(typeof configureExpress.defaultOptions.errorPage, 'object');
				assert.strictEqual(typeof configureExpress.defaultOptions.errorPage.errorLogger, 'function');
				assert.strictEqual(typeof configureExpress.defaultOptions.errorPage.errorLoggingFilter, 'function');
				assert.strictEqual(typeof configureExpress.defaultOptions.errorPage.errorLoggingSerializer, 'function');
			});

			describe('.errorLogger(error, request)', () => {

				it('calls `request.log.error` with the given error', () => {
					const error = new Error('mock error');
					const request = {
						log: {
							error: td.func()
						}
					};
					configureExpress.defaultOptions.errorPage.errorLogger(error, request);
					td.verify(request.log.error(error), {times: 1});
				});

			});

			describe('.errorLoggingFilter(error)', () => {

				describe('when `error.statusCode` is not defined', () => {

					it('returns `true`', () => {
						const error = new Error('mock error');
						assert.strictEqual(configureExpress.defaultOptions.errorPage.errorLoggingFilter(error), true);
					});

				});

				describe('when `error.statusCode` is 200', () => {

					it('returns `true`', () => {
						const error = new Error('mock error');
						error.statusCode = 200;
						assert.strictEqual(configureExpress.defaultOptions.errorPage.errorLoggingFilter(error), true);
					});

				});

				describe('when `error.statusCode` is 300', () => {

					it('returns `true`', () => {
						const error = new Error('mock error');
						error.statusCode = 300;
						assert.strictEqual(configureExpress.defaultOptions.errorPage.errorLoggingFilter(error), true);
					});

				});

				describe('when `error.statusCode` is 400', () => {

					it('returns `true`', () => {
						const error = new Error('mock error');
						error.statusCode = 400;
						assert.strictEqual(configureExpress.defaultOptions.errorPage.errorLoggingFilter(error), true);
					});

				});

				describe('when `error.statusCode` is 500', () => {

					it('returns `true`', () => {
						const error = new Error('mock error');
						error.statusCode = 500;
						assert.strictEqual(configureExpress.defaultOptions.errorPage.errorLoggingFilter(error), true);
					});

				});

				describe('when `error.statusCode` is 404', () => {

					it('returns `false`', () => {
						const error = new Error('mock error');
						error.statusCode = 404;
						assert.strictEqual(configureExpress.defaultOptions.errorPage.errorLoggingFilter(error), false);
					});

				});

			});

			describe('.errorLoggingSerializer(error)', () => {

				it('returns the error wrapped in an object', () => {
					const error = new Error('mock error');
					assert.deepStrictEqual(
						configureExpress.defaultOptions.errorPage.errorLoggingSerializer(error),
						{error}
					);
				});

			});

		});

		describe('.expressPreact', () => {

			it('contains default values for Express Preact', () => {
				assert.deepStrictEqual(configureExpress.defaultOptions.expressPreact, {
					beautify: true
				});
			});

		});

		describe('.jsonBody', () => {

			it('contains default values for Express JSON Body', () => {
				assert.deepStrictEqual(configureExpress.defaultOptions.jsonBody, {
					strict: false
				});
			});

		});

		describe('.pinoHttp', () => {

			it('contains default values for Pino HTTP autologging', () => {
				const autoLogging = configureExpress.defaultOptions.pinoHttp.autoLogging;
				assert.deepStrictEqual(Object.keys(autoLogging), ['ignore']);
				assert.strictEqual(typeof autoLogging.ignore, 'function');
				assert.strictEqual(autoLogging.ignore({}), false);
				assert.strictEqual(autoLogging.ignore({url: '/mock-path'}), false);
				assert.strictEqual(autoLogging.ignore({url: '/'}), false);
				assert.strictEqual(autoLogging.ignore({url: '/favicon.ico'}), true);
				assert.strictEqual(autoLogging.ignore({url: '/favicon.ico?mock-query=true'}), true);
			});

			it('contains default values for Pino HTTP request ID generation', () => {
				assert.strictEqual(typeof configureExpress.defaultOptions.pinoHttp.genReqId, 'function');
			});

			describe('.genReqId(request)', () => {
				let request;
				let returnValue;

				beforeEach(() => {
					request = {
						headers: {}
					};
				});

				describe('when no `X-Request-ID` header is present', () => {

					beforeEach(() => {
						returnValue = configureExpress.defaultOptions.pinoHttp.genReqId(request);
					});

					it('generates and returns a nanoid', () => {
						td.verify(nanoid(10), {times: 1});
						assert.strictEqual(returnValue, 'mock-nanoid');
					});

				});

				describe('when an `X-Request-ID` header is present', () => {

					beforeEach(() => {
						request.headers['x-request-id'] = 'mock-header-id';
						returnValue = configureExpress.defaultOptions.pinoHttp.genReqId(request);
					});

					it('does not generate a nanoid', () => {
						td.verify(nanoid(10), {times: 0});
					});

					it('returns the header value', () => {
						assert.strictEqual(returnValue, 'mock-header-id');
					});

				});

			});

			it('contains default values for Pino HTTP custom attribute keys', () => {
				assert.deepStrictEqual(configureExpress.defaultOptions.pinoHttp.customAttributeKeys, {
					req: 'request', // eslint-disable-line id-denylist
					res: 'response', // eslint-disable-line id-denylist
					err: 'error' // eslint-disable-line id-denylist
				});
			});

			it('contains default values for Pino HTTP serializers', () => {
				assert.deepStrictEqual(configureExpress.defaultOptions.pinoHttp.serializers, {
					req: configureExpress.pinoSerializers.request, // eslint-disable-line id-denylist
					res: configureExpress.pinoSerializers.response // eslint-disable-line id-denylist
				});
			});

		});

		describe('.publicPath', () => {

			it('contains default values for the public path', () => {
				assert.deepStrictEqual(configureExpress.defaultOptions.publicPath, `${process.cwd()}/public`);
			});

		});

		describe('.redirectToHttps', () => {

			it('contains default values for Redirect to HTTPS', () => {
				assert.deepStrictEqual(configureExpress.defaultOptions.redirectToHttps, {
					ignoreHosts: [/^localhost:\d+$/i]
				});
			});

		});

		describe('.session', () => {

			it('contains default values for Express Session', () => {
				assert.deepStrictEqual(configureExpress.defaultOptions.session, {
					cookie: {
						maxAge: 604800000,
						sameSite: 'strict',
						secure: false
					},
					resave: false,
					saveUninitialized: false
				});
			});

		});

		describe('.sessionName', () => {

			it('contains a default values for Express Session name', () => {
				assert.strictEqual(configureExpress.defaultOptions.sessionName, 'Session');
			});

		});

		describe('.static', () => {

			it('contains default values for Express Static', () => {
				assert.deepStrictEqual(configureExpress.defaultOptions.static, {
					maxAge: 0
				});
			});

		});

		describe('.trustProxy', () => {

			it('contains default values for Express trustProxy', () => {
				assert.strictEqual(configureExpress.defaultOptions.trustProxy, true);
			});

		});

		describe('.urlencodedBody', () => {

			it('contains default values for Express Urlencoded body', () => {
				assert.deepStrictEqual(configureExpress.defaultOptions.urlencodedBody, {
					extended: false
				});
			});

		});

		describe('.viewPath', () => {

			it('contains default values for the view path', () => {
				assert.deepStrictEqual(configureExpress.defaultOptions.viewPath, `${process.cwd()}/views`);
			});

		});

		describe('when process.env.NODE_ENV is "production"', () => {

			beforeEach(() => {
				process.env.NODE_ENV = 'production';
				delete require.cache[require.resolve('../../..')];
				configureExpress = require('../../..');
			});

			describe('.session.cookie.secure', () => {

				it('is set to `true`', () => {
					assert.strictEqual(configureExpress.defaultOptions.session.cookie.secure, true);
				});

			});

			describe('.static.maxAge', () => {

				it('is set to a week', () => {
					assert.deepStrictEqual(configureExpress.defaultOptions.static, {
						maxAge: 604800000
					});
				});

			});

		});

	});

	describe('.default', () => {
		it('aliases the module exports', () => {
			assert.strictEqual(configureExpress, configureExpress.default);
		});
	});

});
