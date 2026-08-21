import React from 'react';
import { addAction } from '@wordpress/hooks';
import { ChildModulesContainer, CssStyle, ModuleContainer, StyleContainer, elementClassnames } from '@divi/module';
import { registerModule } from '@divi/module-library';
import accordionMetadata from './components/accordion/module.json';
import itemMetadata from './components/item/module.json';

const ScriptData = ({ elements }) => elements.scriptData({ attrName: 'module' });
const classnames = ({ classnamesInstance, attrs }) => classnamesInstance.add(elementClassnames({ attrs: attrs?.module?.decoration ?? {} }));
const Styles = ({ elements, settings, mode, state, noStyleTag, attrs, orderClass, baseOrderClass, isCustomPostType, item = false }) => (
  <StyleContainer mode={mode} state={state} noStyleTag={noStyleTag}>
    {elements.style({ attrName: 'module', styleProps: { disabledOn: { disabledModuleVisibility: settings?.disabledModuleVisibility } } })}
    {!item && elements.style({ attrName: 'itemLayout', styleProps: { advancedStyles: [
      { componentName: 'divi/common', props: { attr: attrs?.itemLayout?.advanced?.itemGap ?? {}, property: '--ko-ea-item-gap' } },
    ] } })}
    {!item && elements.style({ attrName: 'behavior', styleProps: { advancedStyles: [
      { componentName: 'divi/common', props: { attr: attrs?.behavior?.advanced?.closedIconColor ?? {}, property: '--ko-ea-icon-color' } },
      { componentName: 'divi/common', props: { attr: attrs?.behavior?.advanced?.closedIconSize ?? {}, property: '--ko-ea-icon-size' } },
    ] } })}
    {!item && elements.style({ attrName: 'iconStyle', styleProps: { advancedStyles: [
      { componentName: 'divi/common', props: { attr: attrs?.iconStyle?.advanced?.iconColor ?? {}, property: '--ko-ea-open-icon-color' } },
      { componentName: 'divi/common', props: { attr: attrs?.iconStyle?.advanced?.iconSize ?? {}, property: '--ko-ea-open-icon-size' } },
    ] } })}
    {!item && elements.style({ attrName: 'toggleStyle', styleProps: { advancedStyles: [
      { componentName: 'divi/common', props: { attr: attrs?.toggleStyle?.advanced?.openBackground ?? {}, property: '--ko-ea-open-background' } },
      { componentName: 'divi/common', props: { attr: attrs?.toggleStyle?.advanced?.closedBackground ?? {}, property: '--ko-ea-closed-background' } },
      { componentName: 'divi/common', props: { attr: attrs?.toggleStyle?.advanced?.dividerColor ?? {}, property: '--ko-ea-divider-color' } },
      { componentName: 'divi/common', props: { attr: attrs?.toggleStyle?.advanced?.dividerWidth ?? {}, property: '--ko-ea-divider-width' } },
    ] } })}
    {item && elements.style({ attrName: 'contentLinkStyle', styleProps: { advancedStyles: [
      { componentName: 'divi/common', props: { attr: attrs?.contentLinkStyle?.advanced?.linkColor ?? {}, property: '--ko-ea-content-link-color' } },
      { componentName: 'divi/common', props: { attr: attrs?.contentLinkStyle?.advanced?.textSize ?? {}, property: '--ko-ea-content-link-size' } },
      { componentName: 'divi/common', props: { attr: attrs?.contentLinkStyle?.advanced?.iconSize ?? {}, property: '--ko-ea-content-link-icon-size' } },
      { componentName: 'divi/common', props: { attr: attrs?.contentLinkStyle?.advanced?.iconGap ?? {}, property: '--ko-ea-content-link-icon-gap' } },
    ] } })}
    {!item && elements.style({ attrName: 'titleText' })}
    {!item && elements.style({ attrName: 'closedTitleText' })}
    {!item && elements.style({ attrName: 'bodyText' })}
    {item && elements.style({ attrName: 'itemTitle' })}
    {item && elements.style({ attrName: 'content' })}
    <CssStyle attr={attrs?.css} baseOrderClass={baseOrderClass} cssFields={elements?.moduleMetadata?.customCssFields} isCustomPostType={isCustomPostType} orderClass={orderClass} selector={orderClass} />
  </StyleContainer>
);
const value = (attrs, key, fallback) => attrs?.[key]?.innerContent?.desktop?.value || fallback;
const durationValue = (attrs) => {
  const parsed = parseInt(attrs?.behavior?.advanced?.duration?.desktop?.value, 10);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 180;
};
const encodedIconValue = (raw, fallback) => {
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    return trimmed && trimmed !== '[object Object]' ? trimmed : fallback;
  }
  if (!raw || typeof raw !== 'object') return fallback;

  const unicode = raw.unicode ?? raw.decodedUnicode ?? raw.icon;
  if (typeof unicode !== 'string' && typeof unicode !== 'number') return fallback;

  const type = raw.type === 'fa' || raw.iconSet === 'fa' ? 'fa' : 'divi';
  const rawWeight = raw.weight ?? raw.fontWeight ?? 400;
  const weight = /^\d+$/.test(String(rawWeight)) ? String(rawWeight) : '400';
  return `${String(unicode)}||${type}||${weight}`;
};
const AccordionEdit = ({ attrs, elements, id, name, childrenIds }) => (
  <ModuleContainer attrs={attrs} elements={elements} id={id} moduleClassName="ko_enhanced_accordion" name={name} scriptDataComponent={ScriptData} stylesComponent={Styles} classnamesFunction={classnames}>
    {elements.styleComponents({ attrName: 'module' })}
    <div
      className="ko_enhanced_accordion__items"
      data-duration={durationValue(attrs)}
      data-initial-state={attrs?.behavior?.advanced?.initialState?.desktop?.value || 'closed'}
      data-close-current={attrs?.behavior?.advanced?.closeCurrent?.desktop?.value || 'on'}
      data-icon-placement={attrs?.iconStyle?.advanced?.iconPlacement?.desktop?.value || 'right'}
      data-closed-icon={encodedIconValue(attrs?.behavior?.advanced?.closedIcon?.desktop?.value, '&#xf078;||fa||900')}
      data-open-icon={encodedIconValue(attrs?.iconStyle?.advanced?.openIcon?.desktop?.value, '&#xf077;||fa||900')}
    >
      <ChildModulesContainer ids={childrenIds} />
    </div>
  </ModuleContainer>
);
const ItemEdit = ({ attrs, elements, id, name, parentAttrs }) => (
  <ModuleContainer attrs={attrs} elements={elements} id={id} moduleClassName="ko_enhanced_accordion_item" name={name} parentAttrs={parentAttrs} scriptDataComponent={ScriptData} stylesComponent={(props) => <Styles {...props} item />} classnamesFunction={classnames}>
    {elements.styleComponents({ attrName: 'module' })}
    <h3 className="ko_enhanced_accordion_item__title"><button type="button" aria-expanded="false">{value(attrs, 'itemTitle', 'Accordion Item')}<span className="ko_enhanced_accordion_item__icon" aria-hidden="true">{'\uf078'}</span></button></h3>
    <div className="ko_enhanced_accordion_item__content"><div className="ko_enhanced_accordion_item__content-inner" data-content-link-style={attrs?.contentLinkStyle?.advanced?.enabled?.desktop?.value === 'on' ? 'cta' : 'default'} dangerouslySetInnerHTML={{ __html: value(attrs, 'content', 'Add your accordion content here.') }} /></div>
  </ModuleContainer>
);
const itemModule = { metadata: itemMetadata, parentsName: ['ko/enhanced-accordion'], renderers: { edit: ItemEdit } };
const accordionModule = { metadata: accordionMetadata, childrenName: ['ko/enhanced-accordion-item'], template: [['ko/enhanced-accordion-item', {}], ['ko/enhanced-accordion-item', { itemTitle: { innerContent: { desktop: { value: 'Accordion Item 2' } } } }]], renderers: { edit: AccordionEdit } };
addAction('divi.moduleLibrary.registerModuleLibraryStore.after', 'vela.enhancedAccordion', () => { registerModule(itemModule.metadata, itemModule); registerModule(accordionModule.metadata, accordionModule); });
