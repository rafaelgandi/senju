define(function (require) {
	"use strict";
	require('util/domReady!');
	var mod1 = require('mod1');
	var mod2 = require('mod2');
	var r = require('senju!resources/r1.html');
	var r2 = require('senju!resources/r1.html');
	console.log(r);
	console.log(r2);
	document.getElementById('foo').innerHTML = r.templates.bar;
	
	console.log(mod1.init());
	console.log(mod2.init());
});