'use strict';

const td = require('testdouble');

exports.initMock = () => {
	const http = {
		createServer: td.func('http.createServer'),
		mockAddress: {
			address: 'mock-server-address',
			port: 'mock-server-port'
		},
		mockServer: {
			address: td.func('http server.address'),
			close: td.func('http server.close'),
			listen: td.func('http server.listen')
		}
	};

	td.when(http.createServer(), {ignoreExtraArgs: true}).thenReturn(http.mockServer);
	td.when(http.mockServer.address(), {ignoreExtraArgs: true}).thenReturn(http.mockAddress);
	td.when(http.mockServer.close(), {
		defer: true,
		ignoreExtraArgs: true
	}).thenCallback();
	td.when(http.mockServer.listen(), {
		defer: true,
		ignoreExtraArgs: true
	}).thenCallback();

	return http;
};
