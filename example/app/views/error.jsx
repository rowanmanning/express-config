'use strict';

const {h, Fragment} = require('preact');

module.exports = function ErrorView({error}) {
	return (
		<Fragment>
			<h1>Error {error.statusCode}</h1>
			<p>{error.message}</p>
		</Fragment>
	);
};
