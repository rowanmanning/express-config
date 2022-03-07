'use strict';

const td = require('testdouble');

exports.initMock = () => {
	const renderErrorPage = td.func('@rowanmanning/render-error-page');
	renderErrorPage.mockMiddleware = td.func('@rowanmanning/render-error-page middleware');
	td.when(renderErrorPage(), {ignoreExtraArgs: true}).thenReturn(renderErrorPage.mockMiddleware);
	return renderErrorPage;
};
