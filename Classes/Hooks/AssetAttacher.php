<?php
namespace NamelessCoder\InlinePageEditing\Hooks;

use TYPO3\CMS\Core\Page\PageRenderer;
use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Class AssetAttacher
 */
class AssetAttacher
{

    /**
     * @var boolean
     */
    protected static $loaded = false;

    /**
     * @return void
     */
    public function includeJavascriptInPageRendererIfNotIncluded()
    {
        if (!static::$loaded) {
            $pageRenderer = GeneralUtility::makeInstance(PageRenderer::class);
            $pageRenderer->loadJquery();
            $pageRenderer->loadRequireJsModule('TYPO3/CMS/InlinePageEditing/InlinePageEditingEngine');
            if (version_compare(ExtensionManagementUtility::getExtensionVersion('core'), '8.7', '<')) {
                $pageRenderer->loadRequireJsModule('TYPO3/CMS/InlinePageEditing/InlinePageEditingDropDown');
            }
            $pageRenderer->addCssFile(
                GeneralUtility::getFileAbsFileName('EXT:inline_page_editing/Resources/Public/Stylesheet/Styles.css')
            );
            static::$loaded = true;
        }
    }

}
