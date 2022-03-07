'use strict';

const td = require('testdouble');

exports.initMock = () => {
	const helmet = td.func('helmet');
	helmet.mockMiddleware = td.func('helmet middleware');
	td.when(helmet(), {ignoreExtraArgs: true}).thenReturn(helmet.mockMiddleware);
	return {
		default: helmet
	};
};
