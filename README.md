
# @rowanmanning/express-config

A library to configure [Express](https://expressjs.com/) in my preferred way.

```js
const app = configureExpress(express());
```


## Table of Contents

  * [What is this?](#what-is-this)
  * [Requirements](#requirements)
  * [Usage](#usage)
    * [Express extensions](#express-extensions)
      * [`app.log`](#applog)
      * [`app.preRoute`](#apppreroute)
      * [`app.postRoute`](#apppostroute)
      * [`app.start()`](#appstart)
      * [`app.stop()`](#appstop)
    * [Options](#options)
      * [`errorPage`](#errorpage)
      * [`expressPreact`](#expresspreact)
      * [`helmet`](#helmet)
      * [`jsonBody`](#jsonbody)
      * [`notFound`](#notfound)
      * [`pino`](#pino)
      * [`pinoHttp`](#pinohttp)
      * [`publicPath`](#publicpath)
      * [`redirectToHttps`](#redirecttohttps)
      * [`session`](#session)
      * [`sessionName`](#sessionname)
      * [`sessionSecret`](#sessionsecret)
      * [`sessionStore`](#sessionstore)
      * [`static`](#static)
      * [`urlencodedBody`](#urlencodedbody)
      * [`viewPath`](#viewpath)
    * [Full Example](#full-example)
  * [Contributing](#contributing)
  * [License](#license)


## What is this?

This is a library which sets a lot of Express configurations and generally gets an Express app closer to being production ready (based on my personal preferences). It includes a lot of pre-configured middleware and a few convenenient additions to Express:

  * Express configurations like strict and case-sensitive routing enabled by default

  * A [Preact view engine](https://github.com/edwjusti/express-preact-views/#readme), so that views can be written in JSX

  * Consistent JSON-based logging with [Pino](https://getpino.io/#/) and [Pino HTTP](https://github.com/pinojs/pino-http#readme)

  * Promisified `start()` and `stop()` methods

  * [Helmet](https://helmetjs.github.io/) to help tick many of the basic security boxes for a production app

  * Automatically [redirect to HTTPS](https://github.com/SegFaultx64/express-http-to-https#readme) when not on `localhost`

  * Automatically parse JSON and URLEncoded request bodies

  * In-memory [sessions](https://github.com/expressjs/session#readme) set up by default, with the option to configure other [session stores](https://github.com/expressjs/session#compatible-session-stores)

  * [Flash messages](https://github.com/jaredhanson/connect-flash#readme) for temporary session data

  * Static serving middleware set up to serve from the `public` directory

  * Automatically render an customisable HTML [error page](https://github.com/rowanmanning/render-error-page#readme)


## Requirements

This library requires the following to run:

  * [Node.js](https://nodejs.org/) 14+


## Usage

Install with [npm](https://www.npmjs.com/) alongside Express:

```sh
npm install express @rowanmanning/express-config
```

Load the libraries into your code with a `require` call:

```js
const express = require('express');
const configureExpress = require('@rowanmanning/express-config');
```

Call the configure function with an Express app:

```js
const app = express();
configureExpress(app);
// app is now configured
```

The configured app is also returned, so the following is equivalent:

```js
const app = configureExpress(express());
```

You can tweak my configurations by passing an [options object](#options) (documented below) as a second argument:

```js
const app = configureExpress(express(), {
    // Options go here
});
```

### Express extensions

By default, configuring Express adds a few new properties and methods.

#### `app.log`

The `log` property of the returned Express app contains a [Pino](https://github.com/pinojs/pino#readme) logger. This allows you to log app information in a consistent way:

```js
app.log.info('This is a message logged through Pino');
```

The Pino logger is also available in the `request` object of any route handler (via [Pino HTTP](https://github.com/pinojs/pino-http#readme)), and logs will be augmented with request information:

```js
app.get('/', (request, response) => {
    request.log.info('Someone visited the home page');
    request.send('Hello World!');
});
```

#### `app.preRoute`

The `preRoute` property is an array containing all middleware that should be run _before_ any application routes. This includes many of the features outlined in the ["What is this?"](#what-is-this) section of this README. Different middleware can be [enabled/disabled](#options).

```js
app.use(app.preRoute);
app.get('/', (request, response) => {
    // etc.
});
```

#### `app.postRoute`

The `postRoute` property is an array containing all middleware that should be run _after_ any application routes. This includes many of the features outlined in the ["What is this?"](#what-is-this) section of this README. Different middleware can be [enabled/disabled](#options).

```js
app.get('/', (request, response) => {
  // etc.
});
app.use(app.postRoute);
```

#### `app.server`

The `server` property is set to a Node.js [HTTP Server](https://nodejs.org/api/http.html#class-httpserver) which has been created with the Express application.

#### `app.start()`

The `start` method is a promisified version of `app.listen`. It has exactly the same signature as [`app.listen`](https://expressjs.com/en/api.html#app.listen) except that it returns a promise and auto-logs when the server has started.

```js
app.start(process.env.PORT || 8080).then(() => {
    // All good to go!
});
```

```js
await app.start();
// All good to go!
```

#### `app.stop()`

The `stop` method is a promisified version of `app.server.close`. It has exactly the same signature as [`server.close`](https://nodejs.org/api/http.html#serverclosecallback) except that it returns a promise and auto-logs when the server has stopped.

```js
app.close().then(() => {
    // All done
});
```

```js
await app.close();
// All done
```

### Options

Although most of the configurations have sensible defaults which work for all the apps I build, everything is still configurable by passing an options object as a second argument. The available options are:


#### `errorPage`

Configuration options to pass into [@rowanmanning/render-error-page](https://github.com/rowanmanning/render-error-page#readme).

Use an object to change configurations or set to `false` to disable the render-error-page middleware entirely.

#### `expressPreact`

Configuration options to pass into [express-preact-views](https://github.com/edwjusti/express-preact-views/#readme).

#### `helmet`

Configuration options to pass into [Helmet](https://helmetjs.github.io/).

Use an object to change configurations or set to `false` to disable Helmet entirely.

#### `jsonBody`

Configuration options to pass into [express.json](https://expressjs.com/en/api.html#express.json).

Use an object to change configurations or set to `false` to disable the express.json middleware entirely

#### `notFound`

Configuration options to pass into [@rowanmanning/not-found](https://github.com/rowanmanning/not-found#readme).

Use an object to change configurations or set to `false` to disable the not-found middleware entirely.

#### `pino`

Configuration options to pass into [Pino](https://github.com/pinojs/pino#readme).

#### `pinoHttp`

Configuration options to pass into [Pino HTTP](https://github.com/pinojs/pino-http#readme).

Use an object to change configurations or set to `false` to disable the pino-http middleware entirely.

#### `publicPath`

A directory for the Express application's static assets.

#### `redirectToHttps`

Configuration options to pass into [express-http-to-https](https://github.com/SegFaultx64/express-http-to-https#readme).

Use an object to change configurations or set to `false` to disable the express-http-to-https middleware entirely.

#### `session`

Configuration options to pass into [express-session](https://github.com/expressjs/session#readme).

The `sessionName`, `sessionSecret`, and `sessionStore` configurations should be used before this, as their values will override any that are passed in the `session` option.

Use an object to change configurations or set to `false` to disable the express-session middleware entirely.

#### `sessionName`

The name of the session cookie. [see documentation](https://github.com/expressjs/session#name).

#### `sessionSecret`

A secret used to sign the session ID cookie. [see documentation](https://github.com/expressjs/session#secret).

If `undefined` it will default to a random string but sessions will be invalidated every time the application restarts.

#### `sessionStore`

A session store object. [see documentation](https://github.com/expressjs/session#compatible-session-stores).

If `undefined` it will default to an in-memory session store, but sessions will be cleared every time the application restarts.

#### `static`

Configuration options to pass into [express.static](https://expressjs.com/en/api.html#express.static).

Use an object to change configurations or set to `false` to disable the express.static middleware entirely

#### `trustProxy`

Configuration option for the [express `trust proxy` setting](https://expressjs.com/en/guide/behind-proxies.html). Defaults to `true`.

#### `urlencodedBody`

Configuration options to pass into [express.urlencoded](https://expressjs.com/en/api.html#express.urlencoded).

Use an object to change configurations or set to `false` to disable the express.urlencoded middleware entirely.

#### `viewPath`

A directory or an array of directories for the Express application's views. If an array, the views are looked up in the order they occur in the array.

### Full Example

This is what a fully configured app looks like, with all default options and all middleware:

```js
const express = require('express');
const configureExpress = require('@rowanmanning/configure-express');

const app = configureExpress(express(), {
    publicPath: `${__dirname}/public`,
    viewPath: `${__dirname}/views`
});

// Mount the pre-route middleware
app.use(app.preRoute);

app.get('/', (request, response) => {
    response.render('home');
});

// More routes go here

// Mount the post-route middleware
app.use(app.postRoute);

app.start(process.env.PORT || 8080);
```


## Contributing

[The contributing guide is available here](docs/contributing.md). All contributors must follow [this library's code of conduct](docs/code_of_conduct.md).


## License

Licensed under the [MIT](LICENSE) license.<br/>
Copyright &copy; 2022, Rowan Manning
