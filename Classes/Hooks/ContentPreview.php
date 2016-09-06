<?php
namespace NamelessCoder\InlinePageEditing\Hooks;

use TYPO3\CMS\Backend\Controller\EditDocumentController;
use TYPO3\CMS\Backend\Controller\PageLayoutController;
use TYPO3\CMS\Backend\Utility\BackendUtility;
use TYPO3\CMS\Backend\View\PageLayoutView;
use TYPO3\CMS\Backend\View\PageLayoutViewDrawItemHookInterface;
use TYPO3\CMS\Core\Page\PageRenderer;
use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Lang\LanguageService;

/**
 * Class ContentPreview
 * @package NamelessCoder\InlinePageEditing\Hooks
 */
class ContentPreview implements PageLayoutViewDrawItemHookInterface
{

    /**
     * @var boolean
     */
    protected static $loaded = false;

    /**
     * Path to the locallang file
     *
     * @var string
     */
    const LLPATH = 'LLL:EXT:inline_page_editing/Resources/Private/Language/locallang_be.xlf:';

    /**
     * Preprocesses the preview rendering of a content element.
     *
     * @param PageLayoutView $parentObject Calling parent object
     * @param bool $drawItem Whether to draw the item using the default functionalities
     * @param string $headerContent Header content
     * @param string $itemContent Item content
     * @param array $row Record row of tt_content
     * @return void
     */
    public function preProcess(PageLayoutView &$parentObject, &$drawItem, &$headerContent, &$itemContent, array &$row)
    {
        $contentType = $row['CType'];
        if (!isset($GLOBALS['TCA']['tt_content']['types'][$contentType]['inlineEditedFields'])) {
            return;
        }
        $this->includeJavascriptInPageRendererIfNotIncluded(
            GeneralUtility::makeInstance(PageRenderer::class)
        );
        if (empty($itemContent)) {
            switch ($contentType) {
                case 'header':
                    $itemContent = sprintf('<strong>%s</strong>',  $row['header']);
                    if ($row['subheader']) {
                        $itemContent = $parentObject->linkEditContent($parentObject->renderText($row['subheader']), $row) . '<br />';
                    }
                    break;
                case 'uploads':
                    if ($row['media']) {
                        $itemContent = $parentObject->linkEditContent($parentObject->getThumbCodeUnlinked($row, 'tt_content', 'media'), $row) . '<br />';
                    }
                    break;
                case 'menu':
                    $itemContent = $parentObject->linkEditContent('<strong>' . htmlspecialchars($parentObject->CType_labels[$contentType]) . '</strong>', $row) . '<br />';
                    $menuTypeLabel = $this->getLanguageService()->sL(
                        BackendUtility::getLabelFromItemListMerged($row['pid'], 'tt_content', 'menu_type', $row['menu_type'])
                    );
                    $menuTypeLabel = $menuTypeLabel ?: 'invalid menu type';
                    $itemContent .= $parentObject->linkEditContent($menuTypeLabel, $row);
                    break;
                case 'shortcut':
                    if (!empty($row['records'])) {
                        $itemContent = 'Shortcut: ' . $row['records'];
                    }
                    break;
                case 'text':
                case 'textpic':
                case 'textmedia':
                case 'table':
                case 'bullets':
                    if ($row['bodytext']) {
                        $itemContent = $parentObject->linkEditContent($parentObject->renderText($row['bodytext']), $row);
                    }
                    if ($row['image']) {
                        $itemContent = $parentObject->linkEditContent($parentObject->getThumbCodeUnlinked($row, 'tt_content', 'image'), $row);
                    }
                    break;
                default:
                    break;
            }
        }
        $itemContent = trim($itemContent);
        if (empty($itemContent)) {
            $itemContent = $this->getLanguageService()->sL(self::LLPATH . 'label.edit');
        }
        $drawItem = false;
        $headerContent = '';
        $itemContent = $this->renderClickEnableWrapper($itemContent, $row);
    }

    /**
     * @param EditDocumentController $controller
     * @return void
     */
    public function processEditForm(EditDocumentController $controller)
    {
        $this->includeJavascriptInPageRendererIfNotIncluded(
            GeneralUtility::makeInstance(PageRenderer::class)
        );
    }

    /**
     * @param PageRenderer $pageRenderer
     * @return void
     */
    protected function includeJavascriptInPageRendererIfNotIncluded(PageRenderer $pageRenderer)
    {
        if (!static::$loaded) {
            $pageRenderer->addJsFile(
                ExtensionManagementUtility::extRelPath('inline_page_editing') . 'Resources/Public/Javascript/Functions.js'
            );
            $pageRenderer->addJsFile(
                ExtensionManagementUtility::extRelPath('inline_page_editing') . 'Resources/Public/Javascript/Engine.js'
            );
            $pageRenderer->addCssFile(
                ExtensionManagementUtility::extRelPath('inline_page_editing') . 'Resources/Public/Stylesheet/Styles.css'
            );
        }
    }

    /**
     * @return PageLayoutController
     */
    protected function getPageLayoutController()
    {
        return $GLOBALS['SOBE'];
    }

    /**
     * @param string $itemContent
     * @param array $row
     * @return string
     */
    protected function renderClickEnableWrapper($itemContent, array $row)
    {
        $elementId = 'e' . md5(time() * microtime(true));
        $uri = rtrim(GeneralUtility::getIndpEnv('REQUEST_URI'), '&');
        $urlParameters = [
            'inline' => 1,
            'edit' => [
                'tt_content' => [
                    $row['uid'] => 'edit'
                ]
            ],
            'columnsOnly' => $this->detectFieldNamesForContentType($row['CType']),
            'returnUrl' => $uri . '&finished=1&element=' . $elementId . '&contentId=' . $row['uid']
        ];
        $editingUrl = BackendUtility::getModuleUrl('record_edit', $urlParameters);
        return sprintf(
            '<div class="inline-edit-click-enable" data-toggle="tooltip" title="Click to edit" data-placement="top"
                data-configuration="%s" data-edit-url="%s" data-element-id="%s">%s</div>',
            '',
            $editingUrl,
            $elementId,
            $itemContent
        );
    }

    /**
     * Detects which single field to display when content element enters
     * editing mode. Only a single field can be edited.
     *
     * @param string $contentType
     * @return string
     */
    protected function detectFieldNamesForContentType($contentType)
    {
        return $GLOBALS['TCA']['tt_content']['types'][$contentType]['inlineEditedFields'];
    }

    /**
     * Returns the language service
     * @return LanguageService
     */
    protected function getLanguageService()
    {
        return $GLOBALS['LANG'];
    }

}

