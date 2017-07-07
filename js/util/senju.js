/*	
	Senju
	-----
	Resource loader require js plugin.
	Author: Rafael Gandionco (www.rafaelgandi.tk)
	LM: 2017-07-07
	
	@license RequireJS Senju Copyright (c) 2017
	Available via the MIT license.
	See: https://github.com/rafaelgandi/senju for details
*/
(function ($, JSON) {
	"use strict";
	if (typeof $ === 'undefined') { throw 'jQuery is required to use senju plugin'; }
	if (typeof JSON === 'undefined') { throw 'JSON is required to use senju plugin'; }
	var $body = $('body'),
		$head = $('head');
	
	function getResource(_file, _callback) { // AJAX call to resource file
		_callback = _callback || function () {};
		$.get(_file, _callback);
	}
	
	function createTempElement() {
		var $temp = $('<div />');
		$temp[0].style.cssText = 'position: absolute;left:-9999px;top:-9999px;display:none;opacity:0;';
		return $temp;
	}
	
	function getResourceElements($temp) {
		var $templates = $temp.find('template'),
			$styles = $temp.find('style'),
			$externalCss = $temp.find('csslink');
		return {
			$templates: $templates,
			$styles: $styles,
			$externalCss: $externalCss
		};
	}
	
	function extractTemplates($templates) {
		var templateObj = {};
		$templates.each(function () {
			var $me = $(this),
				id = $me.attr('id');
			if (! id) { return !!1 }
			// Remove comments
			// See: http://stackoverflow.com/a/5654032
			templateObj[id] = $.trim($me.html().replace(/<!--([\s\S]*?)-->/mig, ''));
		});
		return templateObj;
	}
	
	function handleStyles($styles, _resourcePath) {
		var cssText = '<style type="text/css" data-resource="'+_resourcePath+'">';
		$styles.each(function () {
			var $me = $(this),
				variables = $me.attr('variables');
			cssText += $me.html();
			// If there are css variables set, then add their values to the 
			// rendered css styles.
			if (!! variables) {
				variables = variables.split(',');
				var keyvalue;
				// Simple css variables engine //
				for (var i = 0; i < variables.length; i++) {
					keyvalue = variables[i];
					if (keyvalue.indexOf(':') !== -1) {
						var p = keyvalue.split(':');
						cssText = cssText.replace(new RegExp('\\$'+p[0], 'ig'), p[1]);
					}
				}
			}	
		});
		cssText += '</style>';
		$head.append(cssText);
	}
	
	function makeCssLink(_src, _resourcePath, _callback) {
		_callback = _callback || function () {};
		$head.append('<link rel="stylesheet" href="'+_src+'" type="text/css" data-resource="'+_resourcePath+'">');
		// Use image loading to simulate css file onload.
		// Cool technique to know when the stylesheet is loaded.
		// See: http://www.backalleycoder.com/2011/03/20/link-tag-css-stylesheet-load-event/
		var img = new Image();
		img.onerror = _callback;
		img.src = _src;
	}
	
	function handleExternalCss($externalCss, _resourcePath, _callback) {
		_callback = _callback || function () {};
		var links = '',
			cssFetchLogger = null,
			cssFilePendingIdentifier = '!sen~*|*~ju!';
		$externalCss.each(function () {
			var $me = $(this),
				src = $me.attr('src'),
				wait = $me.attr('wait');
			if (!! wait) {
				cssFetchLogger = cssFetchLogger || {};
				cssFetchLogger[src] = cssFilePendingIdentifier; // pending
				makeCssLink(src, _resourcePath, (function (src) {
					return function () {
						cssFetchLogger[src] = 'loaded';
					}
				})(src));
			}	
			else {
				makeCssLink(src, _resourcePath);
			}			
		});
		if (!! cssFetchLogger) {					
			// Poll to make sure all the css links have loaded.
			var timer;
			(function poll() {
				clearTimeout(timer);
				// Convert cssFetchLogger to a json string so I can just check the index of 
				// the "!sen~*|*~ju!" string for pending(still loading) css files. Because 
				// of this I no longer need to loop through the cssFetchLogger object.
				if (JSON.stringify(cssFetchLogger).indexOf(cssFilePendingIdentifier) !== -1) {
					timer = setTimeout(poll, 30);
					return;
				}			
				// All CSS files have finished loading.
				_callback();
			})();
		}
		else {
			_callback();
		}
	}
	
	function resolveResourceName(_name) {
		var name = $.trim(_name)
		// Remove any query string //
		.replace(/\?.*/ig, '')
		// Normalize the extension (.html) //
		.replace('.html', '')
		.replace('.htm', '')
		.replace('.xml') + '.html';
		return name;
	}
	
	// Require JS plugin API //
	// See: http://requirejs.org/docs/plugins.html
	define({	
		load: function (name, req, onLoad, config) {
			var	RESPONSE_OBJ = { templates: {} },
				cacheBuster = (new Date()).getTime();
			if (typeof config.urlArgs !== 'undefined') {
				cacheBuster = config.urlArgs('', '').replace(/^[\?\&][\S]+=/, '');
			}
			getResource(resolveResourceName(req.toUrl(name)) + '?_=' + cacheBuster, function (res) {
				var $temp = createTempElement(),					
					resourceElements;
				$temp.detach().html(res);
				resourceElements = getResourceElements($temp);
				$temp.remove();
				// Get templates. //	
				if (resourceElements.$templates.length) {
					RESPONSE_OBJ.templates = extractTemplates(resourceElements.$templates);
				}
				function _doStyleHandlingThenLoad() {
					// Set inline css styles. //
					if (resourceElements.$styles.length) {
						handleStyles(resourceElements.$styles, name);
					}
					onLoad(RESPONSE_OBJ);
				}
				// Get and set external css links. //
				if (resourceElements.$externalCss.length) {
					handleExternalCss(resourceElements.$externalCss, name, _doStyleHandlingThenLoad);
				}
				else {
					_doStyleHandlingThenLoad();
				}				
			});
		}
	});
})(window.jQuery, window.JSON);