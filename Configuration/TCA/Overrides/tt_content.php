<?php
$GLOBALS['TCA']['tt_content']['types']['header']['inlineEditedFields'] = 'header';
$GLOBALS['TCA']['tt_content']['types']['textmedia']['inlineEditedFields'] = 'header,bodytext';
$GLOBALS['TCA']['tt_content']['types']['text']['inlineEditedFields'] = $GLOBALS['TCA']['tt_content']['types']['textmedia']['inlineEditedFields'];
$GLOBALS['TCA']['tt_content']['types']['textpic']['inlineEditedFields'] = $GLOBALS['TCA']['tt_content']['types']['textmedia']['inlineEditedFields'];
$GLOBALS['TCA']['tt_content']['types']['bullets']['inlineEditedFields'] = 'header,bullets_type,bodytext';
$GLOBALS['TCA']['tt_content']['types']['table']['inlineEditedFields'] = 'header,table_delimiter,table_caption,bodytext,table_footer';
$GLOBALS['TCA']['tt_content']['types']['uploads']['inlineEditedFields'] = 'header,media';
$GLOBALS['TCA']['tt_content']['types']['menu']['inlineEditedFields'] = 'header,menu_type,pages';
$GLOBALS['TCA']['tt_content']['types']['html']['inlineEditedFields'] = 'bodytext';
$GLOBALS['TCA']['tt_content']['types']['shortcut']['inlineEditedFields'] = 'records';
$GLOBALS['TCA']['tt_content']['types']['list']['inlineEditedFields'] = 'header,pi_flexform';
