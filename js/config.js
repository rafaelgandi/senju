requirejs.config({
	baseUrl: 'js',
	waitSeconds:200,
	urlArgs: '_='+(new Date()).getTime(),
	paths: {
		'senju': 'util/senju'
	}
});