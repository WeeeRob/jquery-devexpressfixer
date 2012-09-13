/// <reference path="http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.8.1-vsdoc.js"/>

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
	/// <summary>
	/// Self executing function to give variable scope
	/// </summary>
	/// <param name="$" type="object">
	/// jQuery
	/// </param>

	"use strict";

	function beginCallback(s, e) {
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
				e.customArgs.__RequestVerificationToken = $requestVerificationToken.val();
			}
		}
	}

	// These should be all the MVC ones as of 31/08/2012 (well the ones mentioned in the documentation anyway). 
	// NOTE: Are there any what won't have any client side API that we should remove? 
	var typesToCheck;

	function initTypesToCheck() {
		/// <summary>
		/// Initializes the typesToCheck array which contains all types used on the page
		/// </summary>
		var allTypes = ['MVCxClientCalendar', 'MVCxClientCallbackPanel', 'MVCxClientChart', 'MVCxClientComboBox', 'MVCxClientDockPanel', 'MVCxClientFilterControl', 'MVCxClientGridView', 'MVCxClientHtmlEditor', 'MVCxClientListBox', 'MVCxClientNavBar', 'MVCxClientPageControl', 'MVCxClientPivotGrid', 'MVCxClientPopupControl', 'MVCxClientReportViewer', 'MVCxClientScheduler', 'MVCxClientTreeView', 'MVCxClientUploadControl'];
		typesToCheck = [];

		for (var i = 0; i < allTypes.length; i++) {
			if (typeof window[allTypes[i]] !== 'undefined') {
				typesToCheck.push(window[allTypes[i]]);
			}
		}
	}

	function isDevExpressType(instance) {
		/// <summary>
		/// Checks if the type is an instance of a DevExpress client API
		/// </summary>
		/// <param name="instance" type="object">
		/// Object to test if it's a DevExpress object
		/// </param>
		/// <returns type="boolean">True if it is a DevExpress type, false otherwise</returns>
		for (var i = 0; i < typesToCheck.length; i++) {
			if (instance instanceof typesToCheck[i]) {
				return true;
			}
		}

		return false;
	}

	function checkItem(devExpressObj) {
		/// <summary>
		/// Checks the item then attaches the callback handler if required
		/// </summary>
		/// <param name="instance" type="object">
		/// Object to test if it's a DevExpress object
		/// </param>
		if (isDevExpressType(devExpressObj)) {
			// TODO: Do we need to check if the client API is enabled, would BeginCallback / AddHandler 
			// not exist if it didn't?
			devExpressObj.BeginCallback.AddHandler(beginCallback);
		}
	}

	var defaultOpt = {
		selector : null
	};

	$.devExpressFixer = function (options) {
		/// <summary>
		/// Simple jQuery plug-in to submit the RequestVerificationToken when using DevExpress clientside callbacks
		/// </summary>
		/// <param name="options" type="object">
		/// Optional options object
		/// </param>
		options = $.extend({}, defaultOpt, options || {});

		initTypesToCheck();

		if ((options.selector !== null) && (options.selector !== '')) {
			// TODO: Test this...
			$(options.selector).each(function () {
				// DevExpress stores the client side API instances as the ID of the main object
				checkItem(window[$(this).attr('id')]);
			});
		}
		else {
			// This is likely to be slow so try and use a selector!
			for (var key in window) {
				if (window.hasOwnProperty(key)) {
					checkItem(window[key]);
				}
			}
		}
	};

})(jQuery);