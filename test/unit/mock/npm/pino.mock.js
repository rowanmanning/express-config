'use strict';

const td = require('testdouble');

exports.initMock = () => {
	const pino = td.func('pino');
	pino.mockLogger = {
		info: td.func('pino logger.info'),
		error: td.func('pino logger.error')
	};
	td.when(pino(), {ignoreExtraArgs: true}).thenReturn(pino.mockLogger);
	return pino;
};
