'use strict';

const td = require('testdouble');

exports.initMock = () => {
	const expressPreactViews = {
		createEngine: td.func('express-preact-views createEngine'),
		mockEngine: td.func('express-preact-views mock engine')
	};
	td.when(expressPreactViews.createEngine(), {ignoreExtraArgs: true}).thenReturn(expressPreactViews.mockEngine);
	return expressPreactViews;
};
