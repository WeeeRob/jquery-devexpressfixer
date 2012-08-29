/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, devel:true, jquery:true, indent:4, maxerr:50 */
/*
jQuery DevExpressFixer: A plug-in to fix up the DevExpress controls callbacks so we can provide the request verificaiton token
https://github.com/WeeeRob/jquery-devexpressfixer

I have a problem with the DevExpress (http://www.devexpress.com/) MVC controls and enabling the MVC RequestVerificationToken everywhere in that DevExpress doesn't seem to think this is necessary. However with a bit of jiggerypokery it can be resolved so this plug-in does that for you. 
*/
/*
DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
Version 2, December 2004

Copyright (C) 2012 Robert Walter <weeerob@gmail.com>

Everyone is permitted to copy and distribute verbatim or modified
copies of this license document, and changing it is allowed as long
as the name is changed.

DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

0. You just DO WHAT THE FUCK YOU WANT TO.
*/
/*
This program is free software. It comes without any warranty, to
the extent permitted by applicable law. You can redistribute it
and/or modify it under the terms of the Do What The Fuck You Want
To Public License, Version 2, as published by Sam Hocevar. See
http://sam.zoy.org/wtfpl/COPYING for more details.
*/

(function ($) {

	"use strict";

	function beginCallback (s, e) {
		/// <summary>
		/// Event handler for DevExpress code callbacks
		/// </summary>
		/// <param name="s" type="object">
		/// DevExpress clientside API object
		/// </param>
		/// <param name="e" type="MVCxClientBeginCallbackEventArgs">
		/// Event object that gets passed through in the form
		/// </param>
		// Do all DevExpress client side objects use mainElement? There is a mainDev too. 
		var $form = $(s.mainElement).closest('form');
		if ($form.length !== 0) {
			var $requestVerificationToken = $('input[name="__RequestVerificationToken"]', $form);
			if ($requestVerificationToken.length !== 0) {
				// Only need to supply the RequestVerificationToken if it's in a form and the field exists.
				e.customArgs['__RequestVerificationToken'] = $requestVerificationToken.val();
			}
		}
	}

	// No default options yet
	// var defaultOpt = {};

	$.devExpressFixer = function (options) {
		/// <summary>
		/// Simple jQuery plug-in to submit the RequestVerificationToken when using DevExpress clientside callbacks
		/// </summary>
		// /// <param name="options" type="object">
		// /// Optional options object (unused presently)
		// /// </param>
		// No options yet
		// options = $.extend({}, defaultOpt, options || {});
		// TODO: This could be really slow, should we provide an optional list of the names of items we should fix?
		for (var key in window) {
			// Which other ones do we need to fix?
			// TODO: Do we need to check for MVCxClientComboBox not being defined?
			// TODO: Should we check at this stage if it's within a form
			if (window[key] instanceof MVCxClientComboBox) {
				// TODO: Do we need to check if the client API is enabled, would BeginCallback / AddHandler not exist
				// if it didn't?
				window[key].BeginCallback.AddHandler(beginCallback);
			}
		}
	};

})(jQuery);