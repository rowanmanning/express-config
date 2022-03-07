'use strict';

const td = require('testdouble');

exports.initMock = () => {
	const redirectToHTTPS = td.func('express-http-to-https');
	redirectToHTTPS.mockMiddleware = td.func('express-http-to-https middleware');
	td.when(redirectToHTTPS(), {ignoreExtraArgs: true}).thenReturn(redirectToHTTPS.mockMiddleware);
	return {
		redirectToHTTPS
	};
};
