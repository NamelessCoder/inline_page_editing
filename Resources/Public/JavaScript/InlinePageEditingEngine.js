/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */

/**
 * Module: TYPO3/CMS/InlinePageEditing/InlinePageEditingEngine
 */
define(['jquery'], function($) {

    /**
     *
     * @type {{}}
     * @exports TYPO3/CMS/InlinePageEditing/InlinePageEditingEngine
     */
    var InlinePageEditing = {};

    InlinePageEditing.getUrlParameter = function(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    };

    InlinePageEditing.clickEditAction = function() {
        var id = $(this).attr('data-element-id');
        var iframe = $('<iframe class="inline-editable" src="' + $(this).attr('data-edit-url') + '&element=' + id + '" id="' + id + '"></iframe>');
        if ($(this).attr('class').indexOf('open') >= 0) {
            return false;
        }
        $(this).addClass('open').removeAttr('data-toggle').tooltip('destroy');
        $(this).html(iframe);
        return false;
    };

    InlinePageEditing.initializeInsideInlineWindow = function() {
        // We are receiving an "inline" rendering request from the page module, to display the editing form
        // directly in the preview of a content element. In order to present a more reasonable form to our
        // users we remove some superfluous HTML and change some click handlers to emit window events which
        // our click handler above has added a listener for.

        $('body').addClass('inline');
        $('.module-body').removeAttr('style').removeClass('module-body');
        $('span[data-identifier="actions-edit-undo"]').parent().remove();
        $('span[data-identifier="actions-document-open"]').parent().click(InlinePageEditing.redirectParentWindowToUrl);
    };

    InlinePageEditing.resizeFrame = function() {
        // Continuously update frame height of parent by dispatching window signals
        window.parent.postMessage(
            [
                "setFrameHeight",
                InlinePageEditing.getUrlParameter('element'),
                $('div.module-docheader').height() + $('div.t3js-module-body').height() + 25
            ],
            "*"
        );
    };

    InlinePageEditing.redirectParentWindowToUrl = function() {
        window.parent.postMessage(["redirectTo", $(this).attr('href').replace('&inline=1', '')], "*");
        return false;
    };

    InlinePageEditing.initializeEditEnableListeners = function() {
        $(".inline-edit-click-enable").click(InlinePageEditing.clickEditAction);
    };

    InlinePageEditing.initializeWindowEvents = function() {
        window.addEventListener('message', function(e) {
            if (e.data[0] == 'setFrameHeight') {
                $('#' + e.data[1]).height(e.data[2] + 'px');
            } else if (e.data[0] == 'redirectTo') {
                window.location.href = e.data[1];
            } else if (e.data[0] == 'closeFrame') {
                $('#' + e.data[1]).parent().removeClass('open').html(e.data[2]).click(InlinePageEditing.clickEditAction);
            }
        }, false);
    };

    InlinePageEditing.dispatchWindowCloseEvent = function() {
        // End-of-edit reached; extract resulting HTML and message to parent window, dispatch close action.
        var html = $('#element-tt_content-' + InlinePageEditing.getUrlParameter('contentId') + ' .exampleContent').html();
        if ($(html).find('.inline-edit-click-enable').length > 0) {
            html = html.find('.inline-edit-click-enable').html();
        };
        window.parent.postMessage(["closeFrame", InlinePageEditing.getUrlParameter('element'), html], "*");
    };

    // Module initialization sequence
    if (InlinePageEditing.getUrlParameter('finished')) {
        $(InlinePageEditing.dispatchWindowCloseEvent);
    }
    if (InlinePageEditing.getUrlParameter('inline')) {
        $(InlinePageEditing.initializeInsideInlineWindow);
        setInterval(InlinePageEditing.resizeFrame, 100);
    } else {
        $(InlinePageEditing.initializeWindowEvents);
        $(InlinePageEditing.initializeEditEnableListeners);
    };

    return InlinePageEditing;
});
