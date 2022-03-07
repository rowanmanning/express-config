'use strict';

const td = require('testdouble');

exports.initMock = () => {
	const notFound = td.func('@rowanmanning/not-found');
	notFound.mockMiddleware = td.func('@rowanmanning/not-found middleware');
	td.when(notFound(), {ignoreExtraArgs: true}).thenReturn(notFound.mockMiddleware);
	return notFound;
};
