'use strict';

const td = require('testdouble');

exports.initMock = () => {
	const nanoid = td.func('nanoid');
	td.when(nanoid(), {ignoreExtraArgs: true}).thenReturn('mock-nanoid');
	return {nanoid};
};
