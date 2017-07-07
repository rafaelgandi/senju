define(function (require) {
	"use strict";
	require('util/domReady!');
	var r2 = require('senju!resources/r1.html');
	
	return {
		init: function () {
			return 'hi from mod2';
		}
	};
});