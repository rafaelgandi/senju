define(function (require) {
	"use strict";
	require('util/domReady!');
	
	return {
		init: function (_foo) {
			let ffun = (_param) => {
				//alert(_param);
			};
			if (_foo) {
				let me = 'aaaaa';
			}
			let bar = ffun`fasdf
			asdfdas
			asdfasd
			asdfads ${(_foo) ? 'heheh' : 'barrr'} adsfasdf
			
			asdfasdf
			
			asdfasdf`;
			return 'hi from mod1';
		}
	};
});