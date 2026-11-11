import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const expectedVersion = '1.1.16';
const expectedPluginDescription = ' * Description:       Adds KO: Enhanced Accordion for Divi 5. Add ko-enhanced-accordion-group to a common Row or Section to coordinate modules across columns.';
const accordion = JSON.parse(read('src/components/accordion/module.json')); const item = JSON.parse(read('src/components/item/module.json'));
const builtAccordion = JSON.parse(read('modules-json/accordion/module.json')); const builtItem = JSON.parse(read('modules-json/item/module.json'));
if (accordion.title !== 'KO: Enhanced Accordion' || accordion.name !== 'ko/enhanced-accordion') throw new Error('Module identity is incorrect.');
if (accordion.childModuleName !== item.name) throw new Error('Parent-child metadata mismatch.');
if (accordion.childModuleTitleAttribute !== 'itemTitle') throw new Error('Accordion Item Title is not configured as the automatic child display label.');
if (JSON.stringify(accordion) !== JSON.stringify(builtAccordion) || JSON.stringify(item) !== JSON.stringify(builtItem)) throw new Error('Built metadata is out of sync.');
const expectedCssFields = {
  accordionItem: ' .ko_enhanced_accordion_item',
  openAccordionItem: ' .ko_enhanced_accordion_item.is-open',
  accordionTitle: ' .ko_enhanced_accordion_item__title > button',
  accordionIcon: ' .ko_enhanced_accordion_item__icon',
  accordionContent: ' .ko_enhanced_accordion_item__content-inner',
};
for (const [subName, selectorSuffix] of Object.entries(expectedCssFields)) {
  const field = accordion.customCssFields?.[subName];
  if (!field || field.subName !== subName || field.selectorSuffix !== selectorSuffix || !field.label) throw new Error(`Invalid ${subName} custom CSS field metadata.`);
}
const expectedChildCssFields = {
  accordionItem: { label: 'Accordion Item', selectorSuffix: '.ko_enhanced_accordion_item' },
  accordionTitle: { label: 'Title', selectorSuffix: ' .ko_enhanced_accordion_item__title > button' },
  accordionIcon: { label: 'Icon', selectorSuffix: ' .ko_enhanced_accordion_item__icon' },
  accordionContentPanel: { label: 'Content Panel', selectorSuffix: ' .ko_enhanced_accordion_item__content' },
  accordionContent: { label: 'Content', selectorSuffix: ' .ko_enhanced_accordion_item__content-inner' },
};
if (JSON.stringify(Object.keys(item.customCssFields ?? {})) !== JSON.stringify(Object.keys(expectedChildCssFields))) throw new Error('Accordion Item custom CSS field set is incorrect.');
for (const [subName, expected] of Object.entries(expectedChildCssFields)) {
  const field = item.customCssFields?.[subName];
  if (!field || field.label !== expected.label || field.subName !== subName || field.selectorSuffix !== expected.selectorSuffix) throw new Error(`Invalid child ${subName} custom CSS field metadata.`);
}
if (accordion.settings.advanced !== 'auto') throw new Error('Automatic Advanced settings are required for the native CSS group.');
if (item.settings.advanced !== 'auto') throw new Error('Accordion Item automatic Advanced settings are required for Freeform CSS.');
if (!item.attributes.itemTitle || item.attributes.title) throw new Error('Accordion Item must use the non-reserved itemTitle attribute.');
if (item.attributes.itemTitle.settings.innerContent.item.label !== 'Title') throw new Error('Accordion Item Title control is missing.');
if (accordion.attributes.behavior.settings.advanced.closedIcon.item.component.name !== 'divi/icon-picker') throw new Error('Native Divi icon picker is missing.');
if (accordion.attributes.iconStyle.settings.advanced.openIcon.item.component.name !== 'divi/icon-picker') throw new Error('Native Divi open icon picker is missing.');
if (accordion.attributes.behavior.settings.advanced.closedIcon.item.label !== 'Open Icon'
  || accordion.settings.groups.designClosedIcon.component.props.groupLabel !== 'Open Icon'
  || accordion.attributes.iconStyle.settings.advanced.openIcon.item.label !== 'Close Icon'
  || accordion.settings.groups.designIcon.component.props.groupLabel !== 'Close Icon') throw new Error('Open Icon and Close Icon labels are incorrect.');
for (const key of ['initialState', 'duration', 'closeCurrent', 'closedIcon', 'closedIconColor', 'closedIconSize']) if (!accordion.attributes.behavior.settings.advanced[key]) throw new Error(`Missing ${key} control.`);
const initialState = accordion.attributes.behavior.settings.advanced.initialState.item;
if (initialState.label !== 'OnLoad Behavior'
  || initialState.component.props.options.closed.label !== 'All Items Closed'
  || initialState.component.props.options.open.label !== 'First Item Open'
  || initialState.component.props.defaultValue !== 'closed') throw new Error('OnLoad Behavior select metadata is invalid.');
const closeCurrent = accordion.attributes.behavior.settings.advanced.closeCurrent.item;
if (closeCurrent.label !== 'Close Current Item'
  || closeCurrent.component.name !== 'divi/toggle'
  || closeCurrent.component.props.defaultValue !== 'on') throw new Error('Close Current Item toggle metadata is invalid.');
for (const key of ['iconStyle', 'toggleStyle', 'titleText', 'closedTitleText', 'bodyText']) {
  if (!accordion.attributes[key]) throw new Error(`Missing native-style ${key} design attribute.`);
}
if (accordion.attributes.contentLinkStyle || accordion.settings.groups.designContentLinks) throw new Error('Content Links controls must not remain on the parent Accordion module.');
if (!item.attributes.contentLinkStyle || item.settings.groups.designContentLinks?.component?.props?.groupLabel !== 'Content Links') throw new Error('Accordion Item must own the Content Links attribute and design group.');
const itemGap = accordion.attributes.itemLayout?.settings?.advanced?.itemGap?.item;
if (!itemGap
  || itemGap.label !== 'Item Gap'
  || itemGap.groupSlug !== 'designItemLayout'
  || itemGap.attrName !== 'itemLayout.advanced.itemGap'
  || itemGap.component?.name !== 'divi/range'
  || itemGap.features?.responsive !== true
  || itemGap.features?.sticky !== false
  || itemGap.features?.dynamicContent !== false) throw new Error('Responsive Item Gap control metadata is invalid.');
for (const device of ['desktop', 'tablet', 'phone']) {
  if (accordion.attributes.itemLayout.default?.advanced?.itemGap?.[device]?.value !== '10px') throw new Error(`Missing 10px ${device} Item Gap default.`);
}
const expectedOpenIcon = { unicode: '&#xf078;', type: 'fa', weight: '900' };
const expectedCloseIcon = { unicode: '&#xf077;', type: 'fa', weight: '900' };
if (JSON.stringify(accordion.attributes.behavior.default.advanced.closedIcon.desktop.value) !== JSON.stringify(expectedOpenIcon)
  || JSON.stringify(accordion.attributes.iconStyle.default.advanced.openIcon.desktop.value) !== JSON.stringify(expectedCloseIcon)) throw new Error('Default Vela caret icons are incorrect.');
const toggleDefaults = accordion.attributes.toggleStyle.default.advanced;
if (toggleDefaults.openBackground.desktop.value !== '#f1f3f5'
  || toggleDefaults.closedBackground.desktop.value !== '#f1f3f5'
  || toggleDefaults.dividerColor.desktop.value !== 'rgba(0,0,0,0)'
  || toggleDefaults.dividerWidth.desktop.value !== '1px') throw new Error('Default Vela toggle styling is incorrect.');
const contentLinkDefaults = item.attributes.contentLinkStyle.default.advanced;
if (contentLinkDefaults.enabled.desktop.value !== 'off'
  || contentLinkDefaults.linkColor.desktop.value !== '#f16722'
  || contentLinkDefaults.textSize.desktop.value !== '16px'
  || contentLinkDefaults.iconSize.desktop.value !== '16px'
  || contentLinkDefaults.iconGap.desktop.value !== '10px') throw new Error('Default Content Links styling is incorrect.');
const contentLinkControls = item.attributes.contentLinkStyle.settings.advanced;
if (contentLinkControls.enabled.item.label !== 'Enable Text CTA Links'
  || contentLinkControls.enabled.item.groupSlug !== 'designContentLinks'
  || contentLinkControls.enabled.item.component.name !== 'divi/toggle'
  || contentLinkControls.enabled.item.component.props.defaultValue !== 'off'
  || contentLinkControls.enabled.item.features.responsive !== false) throw new Error('Content Links opt-in toggle metadata is invalid.');
for (const key of ['linkColor', 'textSize', 'iconSize', 'iconGap']) {
  const control = contentLinkControls[key]?.item;
  if (!control
    || control.groupSlug !== 'designContentLinks'
    || control.attrName !== `contentLinkStyle.advanced.${key}`
    || control.features?.responsive !== true
    || control.features?.sticky !== false
    || control.features?.dynamicContent !== false) throw new Error(`Responsive Content Links ${key} control metadata is invalid.`);
}
const titleFontDefault = accordion.attributes.titleText.default?.decoration?.font?.font?.desktop?.value;
if (titleFontDefault?.size !== '18px' || titleFontDefault?.lineHeight !== '1.4em') throw new Error('Default Vela title typography is incorrect.');
const itemRadiusDefault = item.attributes.module.default?.decoration?.border?.desktop?.value?.radius;
if (!itemRadiusDefault
  || itemRadiusDefault.topLeft !== '10px'
  || itemRadiusDefault.topRight !== '10px'
  || itemRadiusDefault.bottomLeft !== '10px'
  || itemRadiusDefault.bottomRight !== '10px'
  || itemRadiusDefault.sync !== 'on') throw new Error('Default Accordion Item corner radius is incorrect.');
for (const [key, label] of Object.entries({ designItemLayout: 'Item Layout', designIcon: 'Close Icon', designClosedIcon: 'Open Icon', designToggle: 'Toggle', designText: 'Text' })) {
  if (accordion.settings.groups[key]?.component?.props?.groupLabel !== label) throw new Error(`Missing ${label} design group.`);
}
if (item.settings.groups.designContentLinks?.panel !== 'design'
  || item.settings.groups.designContentLinks?.component?.props?.groupLabel !== 'Content Links') throw new Error('Accordion Item Content Links design group is invalid.');
if (!accordion.attributes.module.settings.decoration.layout) throw new Error('Missing Layout design group.');
for (const file of ['ko-enhanced-accordion.php', 'includes/class-vela-ea-modules.php', 'assets/css/vela-enhanced-accordion.css', 'assets/js/vela-enhanced-accordion.js', 'assets/js/vela-enhanced-accordion-builder.js']) if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing ${file}.`);
const pluginSource = read('ko-enhanced-accordion.php'); const readme = read('readme.txt'); const packageMetadata = JSON.parse(read('package.json'));
if (!pluginSource.includes(expectedPluginDescription)) throw new Error('Plugins-screen group instructions are missing.');
if (!new RegExp(`^ \\* Version:\\s+${expectedVersion}$`, 'm').test(pluginSource)
  || !new RegExp(`^define\\( 'VELA_EA_VERSION', '${expectedVersion}' \\);$`, 'm').test(pluginSource)
  || !new RegExp(`^Stable tag: ${expectedVersion}$`, 'm').test(readme)
  || !new RegExp(`^= ${expectedVersion} =$`, 'm').test(readme)
  || packageMetadata.version !== expectedVersion) throw new Error('Version markers are out of sync.');
const brandingFiles = ['README.md', 'readme.txt', 'ko-enhanced-accordion.php', 'includes/class-vela-ea-modules.php', 'assets/css/vela-enhanced-accordion.css', 'assets/js/vela-enhanced-accordion.js', 'assets/js/vela-enhanced-accordion-builder.js', 'modules-json/accordion/module.json', 'modules-json/item/module.json', 'src/index.jsx', 'src/components/accordion/module.json', 'src/components/item/module.json'];
const joined = [...brandingFiles.map(read), JSON.stringify(packageMetadata)].join('\n');
if (/PTI|pti[_-]|\.pti|pti-/.test(joined)) throw new Error('Branding validation failed.');
const builderSource = read('src/index.jsx'); const builtBuilder = read('assets/js/vela-enhanced-accordion-builder.js'); const phpRenderer = read('includes/class-vela-ea-modules.php'); const runtime = read('assets/js/vela-enhanced-accordion.js');
if (!builderSource.includes('encodedIconValue') || !phpRenderer.includes('function icon_value')) throw new Error('Divi icon object normalization is missing.');
if (!builderSource.includes('CssStyle')
  || !builderSource.includes('attr={attrs?.css}')
  || !builderSource.includes('cssFields={elements?.moduleMetadata?.customCssFields}')
  || !builderSource.includes('baseOrderClass={baseOrderClass}')
  || !builderSource.includes('isCustomPostType={isCustomPostType}')
  || !builderSource.includes('orderClass={orderClass}')
  || !builderSource.includes('selector={orderClass}')
  || builderSource.lastIndexOf('<CssStyle') < builderSource.lastIndexOf("attrName: 'content'")
  || !builtBuilder.includes('customCssFields')
  || !builtBuilder.includes('childModuleTitleAttribute')) throw new Error('Visual Builder custom CSS or child display-label rendering is incomplete.');
for (const subName of Object.keys(expectedChildCssFields)) {
  if (!builtBuilder.includes(subName)) throw new Error(`Built Builder bundle is missing the child ${subName} custom CSS field.`);
}
if (builderSource.includes('!item && <CssStyle')) throw new Error('Accordion Item custom CSS is excluded from the Visual Builder.');
const stylesSource = builderSource.slice(builderSource.indexOf('const Styles'), builderSource.indexOf('const value'));
const accordionEditSource = builderSource.slice(builderSource.indexOf('const AccordionEdit'), builderSource.indexOf('const ItemEdit'));
const itemEditSource = builderSource.slice(builderSource.indexOf('const ItemEdit'), builderSource.indexOf('const itemModule'));
if (!stylesSource.includes("{item && elements.style({ attrName: 'contentLinkStyle'")
  || stylesSource.includes("{!item && elements.style({ attrName: 'contentLinkStyle'")) throw new Error('Visual Builder Content Links styles must render only for Accordion Items.');
if (accordionEditSource.includes('contentLinkStyle') || accordionEditSource.includes('data-content-link-style')) throw new Error('The parent Visual Builder renderer still owns Content Links state.');
if (!itemEditSource.includes('attrs?.contentLinkStyle?.advanced?.enabled?.desktop?.value')
  || !itemEditSource.includes('data-content-link-style')
  || !itemEditSource.includes('<Styles {...props} item />')
  || itemEditSource.includes('parentAttrs?.contentLinkStyle')) throw new Error('The Accordion Item Visual Builder renderer does not own Content Links state and styles.');
const accordionPhp = phpRenderer.slice(phpRenderer.indexOf('class Accordion_Module'), phpRenderer.indexOf('class Item_Module'));
const itemPhp = phpRenderer.slice(phpRenderer.indexOf('class Item_Module'));
for (const [scope, source, finalStyle] of [['parent', accordionPhp, "'attrName' => 'bodyText'"], ['item', itemPhp, "'attrName' => 'content'"]]) {
  if (!source.includes('function custom_css')
    || !source.includes('CssStyle::style')
    || !source.includes("'selector'         => $args['orderClass']")
    || !source.includes("'attr'             => $attrs['css'] ?? array()")
    || !source.includes("'cssFields'        => self::custom_css()")
    || !source.includes("'orderClass'       => $args['orderClass']")
    || !source.includes("'baseOrderClass'   => $args['baseOrderClass'] ?? null")
    || !source.includes("'isCustomPostType' => ! empty( $args['isCustomPostType'] )")
    || source.lastIndexOf('CssStyle::style') < source.lastIndexOf(finalStyle)) throw new Error(`Frontend ${scope} custom CSS rendering is incomplete.`);
}
if (accordionPhp.includes('contentLinkStyle')
  || accordionPhp.includes('--ko-ea-content-link')
  || accordionPhp.includes('data-content-link-style')) throw new Error('The parent frontend renderer still owns Content Links state or styles.');
for (const marker of ['contentLinkStyle', '--ko-ea-content-link-color', '--ko-ea-content-link-size', '--ko-ea-content-link-icon-size', '--ko-ea-content-link-icon-gap', 'data-content-link-style']) {
  if (!itemPhp.includes(marker)) throw new Error(`The Accordion Item frontend renderer is missing ${marker}.`);
}
if (itemPhp.includes("$parent['attrs']['contentLinkStyle']")) throw new Error('Accordion Item Content Links must not fall back to parent attributes.');
if (!phpRenderer.includes('Options\\Css\\CssStyle')) throw new Error('Divi frontend CssStyle support is not imported.');
if (![builderSource, builtBuilder, phpRenderer].every((source) => source.includes('--ko-ea-item-gap'))
  || !builderSource.includes("attrs?.itemLayout?.advanced?.itemGap")
  || !phpRenderer.includes("$attrs['itemLayout']['advanced']['itemGap']")) throw new Error('Responsive Item Gap styles are not rendered in both builder and frontend.');
for (const source of [builderSource, builtBuilder, phpRenderer]) {
  if (!source.includes('--ko-ea-content-link-color')
    || !source.includes('--ko-ea-content-link-size')
    || !source.includes('--ko-ea-content-link-icon-size')
    || !source.includes('--ko-ea-content-link-icon-gap')
    || !source.includes('data-content-link-style')) throw new Error('Content Links styles or opt-in state are not rendered in both builder and frontend.');
}
if ([builderSource, builtBuilder, phpRenderer].some((source) => source.includes('ko_enhanced_accordion_item__icon et-pb-icon'))) throw new Error('Generic Divi icon class must not override module icon sizing.');
if (!runtime.includes("selected.type === 'fa' ? 'FontAwesome' : 'ETmodules'") || !runtime.includes('decodeUnicode')) throw new Error('Icon font or unicode runtime handling is missing.');
for (const source of [builderSource, builtBuilder, phpRenderer, runtime]) {
  if (!source.includes('&#xf078;') || !source.includes('&#xf077;') || !source.includes('fa') || !source.includes('900')) throw new Error('Vela Font Awesome caret fallbacks are incomplete.');
}
if (!runtime.includes('var startHeight = panel.getBoundingClientRect().height;') || !runtime.includes("easing: 'ease-in-out'")) throw new Error('Smooth close animation handling is missing.');
if (!runtime.includes("var groupSelector = '.ko-enhanced-accordion-group';")
  || !runtime.includes('function accordionsForGroup(group)')
  || !runtime.includes('accordion.closest(groupSelector) === group')
  || !runtime.includes('function itemsForCloseScope(accordion)')
  || !runtime.includes('function normalizeGroupState(group)')
  || !runtime.includes("attributeFilter: ['class', 'data-initial-state'")
  || !runtime.includes("if (state === 'open' && !items.length) return false;")) throw new Error('Scoped cross-column accordion grouping or builder lifecycle handling is incomplete.');
const css = read('assets/css/vela-enhanced-accordion.css');
if (!css.includes('align-items: center') || !css.includes('align-self: center')) throw new Error('Title icon alignment is missing.');
if (!css.includes('--ko-ea-item-gap: 10px')
  || !css.includes('.ko_enhanced_accordion .ko_enhanced_accordion__items { display: flex; flex-direction: column; gap: var(--ko-ea-item-gap); }')
  || !css.includes('.ko_enhanced_accordion .ko_enhanced_accordion__items > .ko_enhanced_accordion_item.et_pb_module { margin-bottom: 0; }')) throw new Error('Scoped Item Gap layout or child margin reset is missing.');
if (!css.includes('--ko-ea-open-background: #f1f3f5')
  || !css.includes('--ko-ea-closed-background: #f1f3f5')
  || !css.includes('--ko-ea-divider-color: transparent')
  || !css.includes('font-family: FontAwesome')
  || !css.includes('font-weight: 900')) throw new Error('Vela CSS fallbacks are incomplete.');
const ctaLinkSelector = '.ko_enhanced_accordion .ko_enhanced_accordion_item__content-inner[data-content-link-style="cta"] a';
const ctaIconSelector = `${ctaLinkSelector}::after`;
const ctaLinkBlock = css.slice(css.indexOf(`${ctaLinkSelector} {`), css.indexOf(`${ctaIconSelector} {`));
const ctaIconBlock = css.slice(css.indexOf(`${ctaIconSelector} {`), css.indexOf(`${ctaLinkSelector}:hover`));
if (!css.includes('--ko-ea-content-link-color: #f16722')
  || !css.includes('--ko-ea-content-link-size: 16px')
  || !css.includes('--ko-ea-content-link-icon-size: 16px')
  || !css.includes('--ko-ea-content-link-icon-gap: 10px')
  || !css.includes(ctaLinkSelector)
  || !ctaLinkBlock.includes('font-family: "MuseoSans 700", Helvetica, Arial, Lucida, sans-serif !important')
  || !ctaLinkBlock.includes('font-style: normal !important')
  || !ctaLinkBlock.includes('font-weight: 500 !important')
  || !ctaLinkBlock.includes('letter-spacing: normal !important')
  || !ctaLinkBlock.includes('line-height: 1em !important')
  || !ctaLinkBlock.includes('text-decoration: none !important')
  || !ctaLinkBlock.includes('text-transform: none !important')
  || ctaLinkBlock.includes('font-family: inherit')
  || !css.includes('content: "\\f054" !important')
  || !ctaIconBlock.includes('color: currentColor !important')
  || !ctaIconBlock.includes('font-weight: 900 !important')
  || css.includes('.ko_enhanced_accordion__items[data-content-link-style="cta"]')
  || css.includes('.et_pb_button_0')
  || css.includes('.text-only-button')
  || css.includes('[data-icon]')
  || css.includes('attr(data-icon)')) throw new Error('Item-scoped Content Links CTA styling is incomplete or relies on stale parent state or generated Divi classes.');
if (/^\.ko_enhanced_accordion_item__content-inner a\s*\{/m.test(css)) throw new Error('Content Links CTA styling must remain opt-in.');
if (/\.et_pb_accordion[^\n{]*\{[^}]*margin-bottom\s*:\s*0/.test(css)) throw new Error('Legacy Divi accordion margins must not be reset.');
const fixture = read('tests/accordion-behavior.html');
const contentLinksFixture = fixture.slice(fixture.indexOf('data-testid="cta-link-module"'), fixture.indexOf('data-testid="cross-column-group"'));
if (!fixture.includes('@media (max-width: 980px) { .et_pb_column .et_pb_module { margin-bottom: 30px; } }')
  || !fixture.includes('ko_enhanced_accordion_item et_pb_module')
  || !fixture.includes('data-testid="cross-column-group"')
  || !fixture.includes('data-testid="isolated-accordion-group"')
  || !fixture.includes('data-testid="nested-accordion-group"')
  || !fixture.includes('data-testid="mixed-close-current-group"')
  || !fixture.includes('data-testid="dynamic-group-wrapper"')
  || !fixture.includes('data-testid="delayed-open"')
  || !fixture.includes('data-testid="default-styles"')
  || !fixture.includes('data-testid="saved-styles"')
  || !fixture.includes('data-testid="cta-links"')
  || !fixture.includes('data-testid="plain-cta-link"')
  || !fixture.includes('data-testid="divi-class-cta-link"')
  || !fixture.includes('data-testid="default-inline-link"')
  || !fixture.includes('data-testid="unrelated-module"')
  || !fixture.includes('data-testid="legacy-accordion"')) throw new Error('Responsive Item Gap browser fixture is incomplete.');
if (!contentLinksFixture.includes('data-testid="cta-links" data-duration="0" data-initial-state="open" data-close-current="on" data-content-link-style="cta"')
  || (contentLinksFixture.match(/class="ko_enhanced_accordion_item et_pb_module"/g) ?? []).length !== 2
  || (contentLinksFixture.match(/data-content-link-style="cta"/g) ?? []).length !== 2
  || (contentLinksFixture.match(/data-content-link-style="default"/g) ?? []).length !== 1
  || !contentLinksFixture.includes('data-testid="plain-cta-link"')
  || !contentLinksFixture.includes('class="et_pb_button_0 et_pb_button et_pb_bg_layout_light et_pb_module et_flex_module text-only-button"')
  || !contentLinksFixture.includes('data-testid="default-inline-link" href="#privacy" style="color: #183057; font-weight: 400;"')) throw new Error('Per-item Content Links sibling-isolation browser fixture is incomplete.');
console.log('Enhanced Accordion module metadata and package checks passed.');
