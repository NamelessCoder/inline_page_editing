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

    InlinePageEditing.convertToDropdown = function(element) {
        element.wrapAll('<div class="btn-group new-content-trigger"></div>');
        var dropdown = $(element).parent();
        dropdown.append('<span class="btn btn-default btn-sm dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="sr-only">Toggle Dropdown</span><i class="fa fa-caret-down"></i> </span>');
        dropdown.append('<div class="new-content-menu dropdown-menu"></div>');
        dropdown.find('.dropdown-toggle').click(function() {
            if (dropdown.find('.dropdown-menu').is(':visible')) {
                return;
            };
            dropdown.find('.new-content-menu').html('<span class="t3js-icon icon icon-size-small icon-state-default icon-spinner-circle-light icon-spin" data-identifier="spinner-circle-light">' +
                    '<span class="icon-markup">' +
                    '<img src="/typo3/sysext/core/Resources/Public/Icons/T3Icons/spinner/spinner-circle-light.svg" width="16" height="16">' +
                    '</span>' +
                    '</span>'
            );
            var button = $(this);
            var onclick = button.attr('onclick');
            var url = element.attr('href');
            $.ajax({
                url: url,
                complete: function(response) {
                    var responseDocument = $("<div>" + response.responseText + "</div>");
                    var form = responseDocument.find('#NewContentElementController');
                    var gotoFunctionRegExp = new RegExp("function goToalt_doc\(\)[^\n]+\n([^\}]+)", "g");
                    var gotoFunctionBody = gotoFunctionRegExp.exec(response.responseText)[2];
                    eval('goToalt_doc = function() { ' + gotoFunctionBody.replace('return false;', '') + '; }');
                    var icon;
                    var link;
                    $('.new-content-menu').html('');
                    dropdown.find('.new-content-menu').append(form);
                    form.hide();
                    var tabTitles = form.find('.nav.nav-tabs.t3js-tabs a, .t3js-tabmenu-item a');
                    var index = 0;
                    var html = '<div class="row">';
                    form.find('.tab-content div[role="tabpanel"]').each(function() {
                        html += '<div class="col-xs-12 col-sm-6">';
                        html += '<h4>' + $(tabTitles[index]).text() + '</h4>';
                        var subIndex = 0;
                        $(this).find('.media').each(function() {
                            icon = $(this).find('.icon-markup img');
                            link = $(this).find('a:first-child');
                            link.attr('title', $(this).html());
                            link.html('');
                            link.css({whiteSpace: "nowrap"});
                            link.prepend(icon).addClass('dropdown-item pull-left');
                            subIndex++;
                            html += link.wrap('<div>').parent().html();
                            //$(html).prepend(link);


                        });
                        html += '</div>';
                        if (index - 1 % 2 == 0 && index > 0) {
                            html += '</div><div class="row">';
                        }
                        index++;
                    });
                    html += '</div>';
                    dropdown.find('.new-content-menu').append(html);
                    dropdown.find('a').tooltip({html: true});
                    dropdown.find('.new-content-menu').css({width: dropdown.parent().parent().width()});
                }
            });
        });
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
                $(window.document).find('html').height()
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
        $(".t3js-page-new-ce a:first-child").each(function() { InlinePageEditing.convertToDropdown($(this)); });
    };

    return InlinePageEditing;
});
