'use strict';

const td = require('testdouble');

exports.initMock = () => {
	const pinoHttp = td.func('pino-http');
	pinoHttp.mockMiddleware = td.func('pino-http middleware');
	td.when(pinoHttp(), {ignoreExtraArgs: true}).thenReturn(pinoHttp.mockMiddleware);
	return {default: pinoHttp};
};
