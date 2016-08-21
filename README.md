TYPO3 Extension: Inline Page Editing
====================================

Converts the content element preview area into a click-to-edit integration. Clicking the content element
opens an edit form with a select set of form fields which can be defined in TCA.

Credits
-------

The main body of work for this extension was sponsored by [Systime A/S](https://systime.dk) who publish
interactive educational material. They required a usability improvement for their many editors - which they
commissioned me to execute and then kindly allowed me to contribute this back to the community in the form
of this extension. Thanks, Systime!

Installation
------------

The extension is only available for installing using Composer:

```bash
composer require namelesscoder/inline-page-editing
```

After requiring the package with Composer you must activate the extension key in Extension Manager, or call:

```
./typo3/cli_dispatch.phpsh extbase extension:install inline_page_editing
```

The extension has no dependencies (except for TYPO3 CMS) and works for TYPO3 7CMS .6 LTS and upward.

Configuration
-------------

The configuration for this extension exists exclusively in TCA and any modifications or additions must be
added to TCA as well. The extension ships with core defaults in `Configuration/TCA/Overrides/tt_content.php`
and these defaults can be changed and extended either by a second extension (recommended) which defines
`inline_page_editing` as a dependency extension (to cause correct loading order); alternatively it is
possible to override these in `typo3conf/AdditionalConfiguration.php` (which you can also write to using
the `lowlevel` system extension's backend module).

There are two possible target definitions which require different configurations. One for regular content
element types and one for plugins (which share one content type and have an additional sub type).

For regular content types:

```php
$GLOBALS['TCA']['tt_content']['types']['textmedia]['inlineEditedFields'] = 'header,bodytext';
```

Note that the `types` array is used and the `CType` is the index. The array (which normally contains just
`showitem` with a list of fields the content type shows) receives an added `inlineEditedFields` index which
contains a plain CSV list of TCA field names that must be shown, in the order to show them.

Any content type can be configured, including those you add yourself. However, default configuration is only
provided for core content types - to enable editing for custom content types you add configuration for each.

And for plugins (`list_type`) sub-types:

```php
$GLOBALS['TCA']['tt_content']['types']['list']['my_plugin']['inlineEditedFields'] = 'header,pi_flexform';
```

Note the additional index `my_plugin` which you must set to your plugins so-called signature. For Extbase
plugins the signature is generated using `extensionkey_pluginname` Where `extensionkey` is the target
extension key without underscores - and `pluginname` is the name of the plugin as defined in the plugin
registration (for legacy reasons you often see `Pi1` and so on in these names).

If you are in doubt about which plugin signature a particular plugin uses you can insert an instance, note
the UID of the content element and look up the `list_type` value in the database directly.

Conflicts and issues
--------------------

Remarkably enough there are no major conflicts; rich text editing works, hooks will still trigger, access
restrictions (exclude fields) are respected, record locking/unlocking happens correctly and TCA overrides
are fully supported, as are custom fields added by extensions.

There is however one known conflict due to JavaScript integrations:

* The `t3editor` extension is not supported and any field using the syntax highlighted editor cannot be
  edited inline (updates are ignored). When `t3editor` is installed this applies to the `html` content type.

And some minor issues stemming by the framework integration:

* TCA `displayCond` is not respected due to the way TYPO3 works when editing a list of specific columns.
  This behavior matches what happens when you click the top-of-column edit icon in the "list" module to edit
  a specific column of all shown records and can be considered per-design, albeit not fully intuitive.
* Previews had to be recreated for some content types, causing them to display slightly different from the
  normal content previews. The technical reason for this is the HTML DOM structure that is output when
  generating custom previews vs. letting the core generate them: nesting is different when a hook is not
  responsible for rendering. A fix can be expected for this in the future.
