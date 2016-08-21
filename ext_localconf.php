<?php
if (!defined('TYPO3_MODE')) {
	die('Access denied.');
}

$GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['cms/layout/class.tx_cms_layout.php']['tt_content_drawItem']['inline_page_editing'] = \NamelessCoder\InlinePageEditing\Hooks\ContentPreview::class;

/** @var \TYPO3\CMS\Extbase\SignalSlot\Dispatcher $signalSlotDispatcher */
$signalSlotDispatcher = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(\TYPO3\CMS\Extbase\SignalSlot\Dispatcher::class);
$signalSlotDispatcher->connect(
    \TYPO3\CMS\Backend\Controller\EditDocumentController::class,
    'initAfter',
    \NamelessCoder\InlinePageEditing\Hooks\ContentPreview::class,
    'processEditForm'
);

