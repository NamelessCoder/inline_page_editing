// Wrapping closure to execute everything in the context of TYPO3.jQuery
(function($) {

    var elementId = getUrlParameter('element');

    var clickAction = function() {
        var id = $(this).attr('data-element-id');
        var iframe = $('<iframe class="inline-editable" src="' + $(this).attr('data-edit-url') + '&element=' + id + '" id="' + id + '"></iframe>');
        if ($(this).attr('class').indexOf('open') >= 0) {
            return false;
        }
        $(this).addClass('open').removeAttr('data-toggle').tooltip('destroy');
        $(this).html(iframe);
        return false;
    };

    $(document).ready(function() {

        if (getUrlParameter('finished') == 1) {
            // End-of-edit reached; extract resulting HTML and message to parent window, dispatch close action.
            var html = $('#element-tt_content-' + getUrlParameter('contentId') + ' .exampleContent').html();
            if ($(html).find('.inline-edit-click-enable').length > 0) {
                html = html.find('.inline-edit-click-enable').html();
            };
            window.parent.postMessage(["closeFrame", getUrlParameter('element'), html], "*");
        } else {
            $(".inline-edit-click-enable").click(clickAction);
        };

        if (getUrlParameter('inline') == '1') {
            // We are receiving an "inline" rendering request from the page module, to display the editing form
            // directly in the preview of a content element. In order to present a more reasonable form to our
            // users we remove some superfluous HTML and change some click handlers to emit window events which
            // our click handler above has added a listener for.
            var timer = setInterval(function() {
                if ($('.module-docheader').length == 0) {
                    return;
                }
                $('body').addClass('inline');
                $('.module-body').removeAttr('style').removeClass('module-body');
                $('.module-docheader-bar-column-left').appendTo($('form'));
                $('span[data-identifier="actions-edit-undo"]').parent().remove();
                $('span[data-identifier="actions-document-open"]').parent().click(function() {
                    window.parent.postMessage(["redirectTo", $(this).attr('href').replace('&inline=1', '')], "*");
                    return false;
                });
                $('button[name="_savedok"]').attr('name', '_saveandclosedok').next().remove();
                $('input[name="closeDoc"').val('1');
                clearInterval(timer);
            }, 50);

            // Continuously update frame height of parent by dispatching window signals
            setInterval(function() {
                window.parent.postMessage(["setFrameHeight", elementId, $(window.document).height()], "*");
            }, 250);
        };

    });

    window.addEventListener('message', function(e) {
        if (e.data[0] == 'setFrameHeight') {
            $('#' + e.data[1]).height(e.data[2] + 'px');
        } else if (e.data[0] == 'redirectTo') {
            window.location.href = e.data[1];
        } else if (e.data[0] == 'closeFrame') {
            $('#' + e.data[1]).parent().click(clickAction).removeClass('open').html(e.data[2]);
        }
    }, false);

})(TYPO3.jQuery);
