'use strict';

const td = require('testdouble');

exports.initMock = () => {
	const expressSession = td.func('express-session');
	expressSession.mockMiddleware = td.func('express-session middleware');
	td.when(expressSession(), {ignoreExtraArgs: true}).thenReturn(expressSession.mockMiddleware);
	return expressSession;
};
