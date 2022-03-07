'use strict';

const express = require('express');
const configureExpress = require('../..');

const app = configureExpress(express(), {
	publicPath: `${__dirname}/public`,
	viewPath: `${__dirname}/views`
});

app.use(app.preRoute);

app.get('/', (request, response) => {
	response.render('home');
});

app.get('/500', () => {
	throw new Error('NO THANKS');
});

app.use(app.postRoute);

app.start(3000);
