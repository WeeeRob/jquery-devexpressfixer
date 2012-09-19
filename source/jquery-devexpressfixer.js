/// <reference path="http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.8.1-vsdoc.js"/>
/// <reference path="ASPxScriptIntelliSense.js"/>

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

	if (!String.prototype.endsWith) {
		String.prototype.endsWith = function(suffix) {
			return this.indexOf(suffix, this.length - suffix.length) !== -1;
		};
	}

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

	function valueChanged(s, e) {
		/// <summary>
		/// Event handler for DevExpress value changes
		/// </summary>
		/// <param name="s" type="object">
		/// DevExpress clientside API object
		/// </param>
		/// <param name="e" type="MVCxClientBeginCallbackEventArgs">
		/// Event object that gets passed through in the form
		/// </param>
		var inputElement = null;

		if (s.inputElement === null) {
			/*
			if (s.name.endsWith('_DDD_C')) {
				// It's a date so event fired on different elements, so do it manually
				var relatedS = window[s.name.substring(0, s.name.length - 6)];
				//inputElement = relatedS.inputElement;
			}
			else {
				// console.log('Not sure what to do with ' + s.name);
			}
			*/
			inputElement = $('input[name="' + s.name + '"]');
		}
		else {
			inputElement = s.inputElement;
		}

		if (inputElement != null) {
			$(inputElement).trigger('change');
			//console.log('triggered change, val is ' + $(inputElement).val());
			//console.log(inputElement);
		}
		else {
			//console.log('Nothing to trigger change on ' + s.name);
			//console.log(s);
		}
	}

	// These should be all the MVC ones as of 31/08/2012 (well the ones mentioned in the documentation anyway). 
	// NOTE: Are there any what won't have any client side API that we should remove? 
	var typesToCheck;

	function initTypesToCheck() {
		/// <summary>
		/// Initializes the typesToCheck array which contains all types used on the page
		/// </summary>
		var allTypes = [
			'MVCxClientCalendar', 'MVCxClientCallbackPanel', 'MVCxClientChart', 'MVCxClientComboBox', 'MVCxClientDockPanel', 'MVCxClientFilterControl', 'MVCxClientGridView', 'MVCxClientHtmlEditor', 'MVCxClientListBox', 'MVCxClientNavBar', 'MVCxClientPageControl', 'MVCxClientPivotGrid', 'MVCxClientPopupControl', 'MVCxClientReportViewer', 'MVCxClientScheduler', 'MVCxClientTreeView', 'MVCxClientUploadControl', 
			'ASPxClientBinaryImage', 'ASPxClientButton', 'ASPxClientButtonEdit', 'ASPxClientCalendar', 'ASPxClientCaptcha', 'ASPxClientCheckBox', 'ASPxClientCheckBoxList', 'ASPxClientColorEdit', 'ASPxClientComboBox', 'ASPxClientDateEdit', 'ASPxClientDropDownEdit', 'ASPxClientEdit', 'ASPxClientFilterControl', 'ASPxClientHyperLink', 'ASPxClientImage', 'ASPxClientLabel', 'ASPxClientListBox', 'ASPxClientListEdit', 'ASPxClientListEditItem', 'ASPxClientMemo', 'ASPxClientProgressBar', 'ASPxClientRadioButton', 'ASPxClientRadioButtonList', 'ASPxClientSpinEdit', 'ASPxClientStaticEdit', 'ASPxClientTextBox', 'ASPxClientTextEdit', 'ASPxClientTimeEdit', 'ASPxClientTrackBar', 'ASPxClientValidationSummary'
		];
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

	function checkItem(devExpressObj, id) {
		/// <summary>
		/// Checks the item then attaches the callback handler if required
		/// </summary>
		/// <param name="instance" type="object">
		/// Object to test if it's a DevExpress object
		/// </param>
		if (isDevExpressType(devExpressObj)) {
			if (typeof devExpressObj.BeginCallback !== 'undefined') {
				devExpressObj.BeginCallback.AddHandler(beginCallback);
			}

			if (typeof devExpressObj.SelectedIndexChanged !== 'undefined') {
				devExpressObj.SelectedIndexChanged.AddHandler(valueChanged);
			}
			else if (typeof devExpressObj.ValueChanged !== 'undefined') {
				devExpressObj.ValueChanged.AddHandler(valueChanged);
			}
			else {
				// console.log('No value change handler for ' + id);
			}
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
				var id = $(this).attr('id');
				checkItem(window[id], id);
			});
		}
		else {
			// This is likely to be slow so try and use a selector!
			for (var key in window) {
				if (window.hasOwnProperty(key)) {
					checkItem(window[key], key);
				}
			}
		}
	};

})(jQuery);