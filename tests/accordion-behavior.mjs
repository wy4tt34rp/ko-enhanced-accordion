import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const accordionMetadata = JSON.parse(fs.readFileSync(path.join(root, 'src/components/accordion/module.json'), 'utf8'));
const itemMetadata = JSON.parse(fs.readFileSync(path.join(root, 'src/components/item/module.json'), 'utf8'));
const defaultTitleFont = accordionMetadata.attributes.titleText.default.decoration.font.font.desktop.value;
const defaultItemRadius = itemMetadata.attributes.module.default.decoration.border.desktop.value.radius;
const playwrightModule = process.env.KO_EA_PLAYWRIGHT_MODULE || 'playwright';
const { chromium } = await import(playwrightModule);
const browserCandidates = [
  process.env.KO_EA_BROWSER_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const executablePath = browserCandidates.find((candidate) => fs.existsSync(candidate));

if (!executablePath) throw new Error('No supported Chromium browser executable was found.');

const browser = await chromium.launch({ executablePath, headless: true });

try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(path.join(root, 'tests/accordion-behavior.html')).href);
  await page.waitForFunction(() => {
    const accordions = document.querySelectorAll('.ko_enhanced_accordion__items');
    return accordions.length > 0 && Array.from(accordions).every((accordion) => accordion.dataset.koEnhancedAccordion === 'true');
  });
  await page.addStyleTag({ content: `
    [data-testid="default-style-module"] .ko_enhanced_accordion_item__title > button {
      font-size: ${defaultTitleFont.size};
      line-height: ${defaultTitleFont.lineHeight};
    }
    [data-testid="default-styles"] > .ko_enhanced_accordion_item {
      border-radius: ${defaultItemRadius.topLeft};
    }
  ` });

  async function itemState(testId, index = 0) {
    const item = page.locator(`[data-testid="${testId}"] > .ko_enhanced_accordion_item`).nth(index);
    return item.evaluate((element) => {
      const button = element.querySelector('.ko_enhanced_accordion_item__title > button');
      const panel = element.querySelector('.ko_enhanced_accordion_item__content');
      return {
        open: element.classList.contains('is-open'),
        expanded: button?.getAttribute('aria-expanded'),
        hidden: panel?.hidden,
      };
    });
  }

  async function expectOpen(testId, index, expected, message) {
    await page.waitForFunction(({ targetTestId, targetIndex, targetState }) => {
      const container = document.querySelector(`[data-testid="${targetTestId}"]`);
      const element = container?.querySelectorAll(':scope > .ko_enhanced_accordion_item')[targetIndex];
      const button = element?.querySelector('.ko_enhanced_accordion_item__title > button');
      const panel = element?.querySelector('.ko_enhanced_accordion_item__content');
      return element?.classList.contains('is-open') === targetState
        && button?.getAttribute('aria-expanded') === (targetState ? 'true' : 'false')
        && panel?.hidden === !targetState;
    }, { targetTestId: testId, targetIndex: index, targetState: expected });
    const state = await itemState(testId, index);
    assert.equal(state.open, expected, `${message}: open class`);
    assert.equal(state.expanded, expected ? 'true' : 'false', `${message}: aria-expanded`);
    assert.equal(state.hidden, !expected, `${message}: panel hidden state`);
  }

  async function clickItem(testId, index = 0) {
    await page.locator(`[data-testid="${testId}"] > .ko_enhanced_accordion_item`).nth(index).locator('.ko_enhanced_accordion_item__title > button').click();
  }

  async function iconState(testId, index = 0) {
    return page.locator(`[data-testid="${testId}"] > .ko_enhanced_accordion_item`).nth(index).evaluate((element) => {
      const icon = element.querySelector('.ko_enhanced_accordion_item__icon');
      const button = element.querySelector('.ko_enhanced_accordion_item__title > button');
      const itemStyle = getComputedStyle(element);
      const iconStyle = icon ? getComputedStyle(icon) : null;
      return {
        backgroundColor: itemStyle.backgroundColor,
        borderRadius: itemStyle.borderTopLeftRadius,
        dividerColor: itemStyle.borderBottomColor,
        glyph: icon?.textContent || '',
        iconType: icon?.dataset.iconType,
        fontFamily: iconStyle?.fontFamily,
        fontSize: iconStyle?.fontSize,
        fontWeight: iconStyle?.fontWeight,
        color: iconStyle?.color,
        titleFontSize: button ? getComputedStyle(button).fontSize : null,
        titleLineHeight: button ? getComputedStyle(button).lineHeight : null,
      };
    });
  }

  async function linkState(testId) {
    return page.locator(`[data-testid="${testId}"]`).evaluate((link) => {
      const style = getComputedStyle(link);
      const iconStyle = getComputedStyle(link, '::after');
      const iconContent = iconStyle.content.replace(/^['"]|['"]$/g, '');
      return {
        backgroundColor: style.backgroundColor,
        borderRadius: style.borderTopLeftRadius,
        borderWidth: style.borderTopWidth,
        color: style.color,
        display: style.display,
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontStyle: style.fontStyle,
        fontWeight: style.fontWeight,
        gap: style.gap,
        letterSpacing: style.letterSpacing,
        lineHeight: style.lineHeight,
        marginBottom: style.marginBottom,
        paddingTop: style.paddingTop,
        textDecorationLine: style.textDecorationLine,
        textTransform: style.textTransform,
        iconCodePoint: iconContent && iconContent !== 'none' ? iconContent.codePointAt(0) : null,
        iconColor: iconStyle.color,
        iconFontFamily: iconStyle.fontFamily,
        iconFontSize: iconStyle.fontSize,
        iconFontWeight: iconStyle.fontWeight,
        iconLineHeight: iconStyle.lineHeight,
        iconOpacity: iconStyle.opacity,
        iconPosition: iconStyle.position,
      };
    });
  }

  const closedDefaultStyle = await iconState('default-styles');
  assert.equal(closedDefaultStyle.backgroundColor, 'rgb(241, 243, 245)', 'The default closed background uses the Vela light gray.');
  assert.equal(closedDefaultStyle.borderRadius, '10px', 'The default Accordion Item uses 10px corners.');
  assert.equal(closedDefaultStyle.dividerColor, 'rgba(0, 0, 0, 0)', 'The default divider is transparent.');
  assert.equal(closedDefaultStyle.glyph.codePointAt(0), 0xf078, 'The default closed item uses the caret-down glyph.');
  assert.equal(closedDefaultStyle.iconType, 'fa', 'The default closed icon uses Font Awesome.');
  assert.match(closedDefaultStyle.fontFamily || '', /FontAwesome/, 'The default closed icon uses the Font Awesome font family.');
  assert.equal(closedDefaultStyle.fontSize, '16px', 'The default closed icon is 16px.');
  assert.equal(closedDefaultStyle.fontWeight, '900', 'The default closed icon uses the solid weight.');
  assert.equal(closedDefaultStyle.color, 'rgb(245, 130, 32)', 'The default closed icon uses Vela orange.');
  assert.equal(closedDefaultStyle.titleFontSize, '18px', 'The default title is 18px.');
  assert.ok(Math.abs(parseFloat(closedDefaultStyle.titleLineHeight) - 25.2) < 0.01, 'The default title uses a 1.4em line height.');
  await clickItem('default-styles');
  await expectOpen('default-styles', 0, true, 'The default-styled item opens normally');
  const openDefaultStyle = await iconState('default-styles');
  assert.equal(openDefaultStyle.backgroundColor, 'rgb(241, 243, 245)', 'The default open background uses the Vela light gray.');
  assert.equal(openDefaultStyle.glyph.codePointAt(0), 0xf077, 'The default open item uses the caret-up glyph.');
  assert.equal(openDefaultStyle.iconType, 'fa', 'The default open icon uses Font Awesome.');

  const closedSavedStyle = await iconState('saved-styles');
  assert.equal(closedSavedStyle.backgroundColor, 'rgb(226, 232, 240)', 'A saved closed background overrides the default.');
  assert.equal(closedSavedStyle.borderRadius, '4px', 'A saved Accordion Item radius overrides the default.');
  assert.equal(closedSavedStyle.glyph.codePointAt(0), 0xf107, 'A saved closed icon overrides the default.');
  assert.equal(closedSavedStyle.fontSize, '21px', 'A saved closed icon size overrides the default.');
  assert.equal(closedSavedStyle.color, 'rgb(18, 52, 86)', 'A saved closed icon color overrides the default.');
  assert.equal(closedSavedStyle.titleFontSize, '22px', 'A saved title size overrides the default.');
  assert.ok(Math.abs(parseFloat(closedSavedStyle.titleLineHeight) - 35.2) < 0.01, 'A saved title line height overrides the default.');
  await clickItem('saved-styles');
  await expectOpen('saved-styles', 0, true, 'The saved-style item opens normally');
  const openSavedStyle = await iconState('saved-styles');
  assert.equal(openSavedStyle.backgroundColor, 'rgb(255, 243, 232)', 'A saved open background overrides the default.');
  assert.equal(openSavedStyle.glyph.codePointAt(0), 0xf106, 'A saved open icon overrides the default.');
  assert.equal(openSavedStyle.fontSize, '22px', 'A saved open icon size overrides the default.');
  assert.equal(openSavedStyle.color, 'rgb(101, 67, 33)', 'A saved open icon color overrides the default.');

  for (const testId of ['plain-cta-link', 'divi-class-cta-link']) {
    const ctaLink = await linkState(testId);
    assert.equal(ctaLink.backgroundColor, 'rgba(0, 0, 0, 0)', `${testId} uses a transparent background.`);
    assert.equal(ctaLink.borderRadius, '0px', `${testId} removes button corners.`);
    assert.equal(ctaLink.borderWidth, '0px', `${testId} removes button borders.`);
    assert.equal(ctaLink.color, 'rgb(241, 103, 34)', `${testId} matches the text-only button color.`);
    assert.equal(ctaLink.display, 'inline-flex', `${testId} uses the text CTA layout.`);
    assert.match(ctaLink.fontFamily || '', /MuseoSans 700/, `${testId} matches the text-only button font family.`);
    assert.equal(ctaLink.fontSize, '16px', `${testId} uses the Content Links text size.`);
    assert.equal(ctaLink.fontStyle, 'normal', `${testId} matches the text-only button font style.`);
    assert.equal(ctaLink.fontWeight, '500', `${testId} matches the text-only button weight.`);
    assert.equal(ctaLink.gap, '10px', `${testId} uses the Content Links icon gap.`);
    assert.equal(ctaLink.letterSpacing, 'normal', `${testId} matches the text-only button letter spacing.`);
    assert.equal(ctaLink.lineHeight, '16px', `${testId} matches the text-only button line height.`);
    assert.equal(ctaLink.marginBottom, '0px', `${testId} removes Divi module margins.`);
    assert.equal(ctaLink.paddingTop, '0px', `${testId} removes Divi Button padding.`);
    assert.equal(ctaLink.textDecorationLine, 'none', `${testId} matches the text-only button decoration.`);
    assert.equal(ctaLink.textTransform, 'none', `${testId} matches the text-only button capitalization.`);
    assert.equal(ctaLink.iconCodePoint, 0xf054, `${testId} uses a right chevron.`);
    assert.equal(ctaLink.iconColor, 'rgb(241, 103, 34)', `${testId} chevron follows the link color.`);
    assert.match(ctaLink.iconFontFamily || '', /FontAwesome/, `${testId} uses the Font Awesome icon font.`);
    assert.equal(ctaLink.iconFontSize, '16px', `${testId} matches the text-only button icon size.`);
    assert.equal(ctaLink.iconFontWeight, '900', `${testId} keeps the solid chevron weight.`);
    assert.equal(ctaLink.iconLineHeight, '16px', `${testId} aligns the chevron to the text-only button line height.`);
    assert.equal(ctaLink.iconOpacity, '1', `${testId} keeps the chevron visible.`);
    assert.equal(ctaLink.iconPosition, 'static', `${testId} keeps the chevron in the text flow.`);
  }
  const defaultInlineLink = await linkState('default-inline-link');
  assert.equal(defaultInlineLink.color, 'rgb(24, 48, 87)', 'A disabled sibling retains its explicit link color.');
  assert.equal(defaultInlineLink.fontWeight, '400', 'A disabled sibling retains its explicit link weight.');
  assert.notEqual(defaultInlineLink.display, 'inline-flex', 'A disabled sibling is not changed by an enabled item or stale parent state.');
  assert.equal(defaultInlineLink.iconCodePoint, null, 'A disabled sibling does not receive a chevron.');

  await expectOpen('group-left', 0, true, 'The first grouped page-load item remains open');
  await expectOpen('group-right', 0, false, 'The second grouped page-load item is normalized closed');
  await expectOpen('isolated-group', 0, true, 'A separate group keeps its own open item');

  await expectOpen('dynamic-group-left', 0, true, 'An ungrouped left module keeps its initial open state');
  await expectOpen('dynamic-group-right', 0, true, 'An ungrouped right module keeps its initial open state');
  await page.locator('[data-testid="dynamic-group-wrapper"]').evaluate((element) => element.classList.add('ko-enhanced-accordion-group'));
  await expectOpen('dynamic-group-left', 0, true, 'Adding the group class live keeps the first open item');
  await expectOpen('dynamic-group-right', 0, false, 'Adding the group class live reconciles another open item');
  await clickItem('dynamic-group-right');
  await expectOpen('dynamic-group-left', 0, false, 'The live-added group class activates cross-column closing');
  await expectOpen('dynamic-group-right', 0, true, 'The live-added group opens the selected item');

  await page.locator('[data-testid="delayed-open"]').evaluate((element) => {
    element.insertAdjacentHTML('beforeend', '<section class="ko_enhanced_accordion_item et_pb_module"><h3 class="ko_enhanced_accordion_item__title"><button type="button" aria-expanded="false">Delayed Open<span class="ko_enhanced_accordion_item__icon" aria-hidden="true">3</span></button></h3><div class="ko_enhanced_accordion_item__content"><div class="ko_enhanced_accordion_item__content-inner">Dynamically inserted content</div></div></section>');
  });
  await expectOpen('delayed-open', 0, true, 'A delayed child honors First Item Open after insertion');

  await clickItem('group-right');
  await expectOpen('group-left', 0, false, 'Opening the right column closes the left column');
  await expectOpen('group-right', 0, true, 'The selected right-column item opens');
  await expectOpen('isolated-group', 0, true, 'The separate group is unaffected');

  await clickItem('group-right');
  await expectOpen('group-right', 0, false, 'The selected grouped item can return the group to all closed');

  await clickItem('nested-outer');
  await clickItem('nested-inner');
  await expectOpen('nested-outer', 0, true, 'An inner group does not close its outer group');
  await expectOpen('nested-inner', 0, true, 'The nearest nested group opens independently');

  await expectOpen('mixed-on', 0, true, 'Mixed group preserves the enabled module initial state');
  await expectOpen('mixed-off', 0, true, 'Mixed group preserves intentional multi-open initial state');
  await clickItem('mixed-off');
  await clickItem('mixed-off');
  await expectOpen('mixed-on', 0, true, 'Opening from a disabled module does not close its peer');
  await expectOpen('mixed-off', 0, true, 'The disabled module opens alongside its peer');
  await clickItem('mixed-on');
  await clickItem('mixed-on');
  await expectOpen('mixed-on', 0, true, 'Opening from an enabled module opens the selected item');
  await expectOpen('mixed-off', 0, false, 'Opening from an enabled module closes other grouped items');

  await clickItem('single', 0);
  await clickItem('single', 1);
  await expectOpen('single', 0, false, 'Ungrouped single-open behavior still closes the previous item');
  await expectOpen('single', 1, true, 'Ungrouped single-open behavior opens the selected item');
  await clickItem('single', 1);
  await expectOpen('single', 1, false, 'Ungrouped accordions can still return to all closed');

  await clickItem('multiple', 1);
  await expectOpen('multiple', 0, true, 'Ungrouped multi-open behavior keeps the first item open');
  await expectOpen('multiple', 1, true, 'Ungrouped multi-open behavior opens another item');

  await clickItem('timed');
  await expectOpen('timed', 0, true, 'The timed accordion opens normally');
  await page.waitForTimeout(1100);
  await clickItem('timed');
  const timedClosingState = await itemState('timed');
  assert.equal(timedClosingState.open, false, 'The closing item updates its open class immediately');
  assert.equal(timedClosingState.expanded, 'false', 'The closing item updates aria-expanded immediately');
  assert.equal(timedClosingState.hidden, false, 'The panel remains visible while its selected close transition runs');
  await expectOpen('timed', 0, false, 'The timed panel is hidden after its selected close transition');

  console.log('Enhanced Accordion browser behavior checks passed.');
} finally {
  await browser.close();
}
