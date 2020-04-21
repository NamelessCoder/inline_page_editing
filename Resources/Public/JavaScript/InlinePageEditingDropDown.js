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
 * Module: TYPO3/CMS/InlinePageEditing/InlinePageEditingDropDown
 */
define(['jquery'], function($) {

    /**
     *
     * @type {{}}
     * @exports TYPO3/CMS/InlinePageEditing/InlinePageEditingDropDown
     */
    var InlinePageEditingDropDown = {};

    InlinePageEditingDropDown.convertToDropdown = function(element) {
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

    $(".t3js-page-new-ce a:first-child").each(function() { InlinePageEditingDropDown.convertToDropdown($(this)); });

    return InlinePageEditingDropDown;
});
