requirejs.config({
	baseUrl: 'js',
	waitSeconds:200,
	urlArgs: '_='+(new Date()).getTime(),
	paths: {
		'senju': 'util/senju',
		'es': 'util/es.babel'
	},
	es: {
		babelStandalonePath: '/js/util/babel.6.25.0.min.js'
	}
});