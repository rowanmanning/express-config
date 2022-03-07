'use strict';

const td = require('testdouble');

exports.initMock = () => {
	const express = td.func('express');

	express.mockApp = {
		disable: td.func('express app.disable'),
		enable: td.func('express app.enable'),
		engine: td.func('express app.engine'),
		set: td.func('express app.set')
	};

	express.json = td.func('express.json');
	express.json.mockMiddleware = td.func('express.json middleware');
	td.when(express.json(), {ignoreExtraArgs: true}).thenReturn(express.json.mockMiddleware);

	express.urlencoded = td.func('express.urlencoded');
	express.urlencoded.mockMiddleware = td.func('express.urlencoded middleware');
	td.when(express.urlencoded(), {ignoreExtraArgs: true}).thenReturn(express.urlencoded.mockMiddleware);

	express.static = td.func('express.static');
	express.static.mockMiddleware = td.func('express.static middleware');
	td.when(express.static(), {ignoreExtraArgs: true}).thenReturn(express.static.mockMiddleware);

	td.when(express(), {ignoreExtraArgs: true}).thenReturn(express.mockApp);

	return express;
};
