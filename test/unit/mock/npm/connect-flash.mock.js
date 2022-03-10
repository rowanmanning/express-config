'use strict';

const td = require('testdouble');

exports.initMock = () => {
	const flash = td.func('connect-flash');
	flash.mockMiddleware = td.func('connect-flash middleware');
	td.when(flash(), {ignoreExtraArgs: true}).thenReturn(flash.mockMiddleware);
	return flash;
};
