(function () {
  'use strict';

  var accordionSelector = '.ko_enhanced_accordion__items';
  var groupSelector = '.ko-enhanced-accordion-group';
  var itemSelector = '.ko_enhanced_accordion_item';
  var buttonSelector = '.ko_enhanced_accordion_item__title > button';
  var panelSelector = '.ko_enhanced_accordion_item__content';

  function decodeUnicode(value) {
    var hex = /^&#x([0-9a-f]+);?$/i.exec(value);
    var codePoint;
    if (hex) {
      codePoint = parseInt(hex[1], 16);
      return codePoint <= 0x10FFFF ? String.fromCodePoint(codePoint) : value;
    }
    var decimal = /^&#([0-9]+);?$/.exec(value);
    if (decimal) {
      codePoint = parseInt(decimal[1], 10);
      return codePoint <= 0x10FFFF ? String.fromCodePoint(codePoint) : value;
    }
    return value;
  }

  function iconValue(raw, fallback) {
    var source = typeof raw === 'string' && raw && raw !== '[object Object]' ? raw : fallback;
    var parts = source.split('||');
    var fallbackParts = fallback.split('||');
    var weight = /^\d+$/.test(parts[2] || '') ? parts[2] : (fallbackParts[2] || '400');
    return {
      glyph: decodeUnicode(parts[0] || fallbackParts[0]),
      type: parts[1] === 'fa' ? 'fa' : 'divi',
      weight: weight
    };
  }

  function duration(accordion) {
    var value = Number(accordion.dataset.duration);
    return Number.isFinite(value) && value >= 0 ? value : 180;
  }

  function animationOptions(accordion) {
    return { duration: duration(accordion), easing: 'ease-in-out' };
  }

  function itemsFor(accordion) {
    return Array.prototype.filter.call(
      accordion.querySelectorAll(itemSelector),
      function (item) { return item.closest(accordionSelector) === accordion; }
    );
  }

  function accordionsForGroup(group) {
    return Array.prototype.filter.call(
      group.querySelectorAll(accordionSelector),
      function (accordion) { return accordion.closest(groupSelector) === group; }
    );
  }

  function itemsForCloseScope(accordion) {
    var group = accordion.closest(groupSelector);
    if (!group) return itemsFor(accordion);

    return accordionsForGroup(group).reduce(function (items, groupedAccordion) {
      return items.concat(itemsFor(groupedAccordion));
    }, []);
  }

  function parts(item) {
    return {
      button: item.querySelector(buttonSelector),
      panel: item.querySelector(panelSelector)
    };
  }

  function setIcon(item, state) {
    var accordion = item.closest(accordionSelector);
    var icon = item.querySelector('.ko_enhanced_accordion_item__icon');
    if (!accordion || !icon) return;
    var selected = state === 'open'
      ? iconValue(accordion.dataset.openIcon, '&#xf077;||fa||900')
      : iconValue(accordion.dataset.closedIcon, '&#xf078;||fa||900');
    icon.textContent = selected.glyph;
    icon.style.fontFamily = selected.type === 'fa' ? 'FontAwesome' : 'ETmodules';
    icon.style.fontWeight = selected.weight;
    icon.dataset.iconType = selected.type;
  }

  function stopAnimation(panel) {
    if (panel._velaAnimation) {
      panel._velaAnimation.cancel();
      panel._velaAnimation = null;
    }
  }

  function closeItem(item, animate) {
    var accordion = item.closest(accordionSelector);
    var itemParts = parts(item);
    var button = itemParts.button;
    var panel = itemParts.panel;
    if (!accordion || !button || !panel) return;

    var wasHidden = panel.hidden;
    var startHeight = panel.getBoundingClientRect().height;
    var startOpacity = parseFloat(getComputedStyle(panel).opacity);
    if (!Number.isFinite(startOpacity)) startOpacity = 1;
    stopAnimation(panel);
    setIcon(item, 'closed');
    item.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');

    function finish() {
      panel._velaAnimation = null;
      panel.style.display = 'none';
      panel.style.height = '';
      panel.style.opacity = '';
      panel.hidden = true;
    }

    if (!animate || wasHidden || startHeight <= 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }

    panel.hidden = false;
    panel.style.display = 'block';
    panel.style.height = startHeight + 'px';
    panel.style.opacity = String(startOpacity);
    panel._velaAnimation = panel.animate(
      [
        { height: startHeight + 'px', opacity: startOpacity },
        { height: '0px', opacity: 0 }
      ],
      animationOptions(accordion)
    );
    panel._velaAnimation.onfinish = finish;
  }

  function openItem(item, animate) {
    var accordion = item.closest(accordionSelector);
    var itemParts = parts(item);
    var button = itemParts.button;
    var panel = itemParts.panel;
    if (!accordion || !button || !panel) return;

    var startHeight = panel.hidden ? 0 : panel.getBoundingClientRect().height;
    var startOpacity = panel.hidden ? 0 : parseFloat(getComputedStyle(panel).opacity);
    if (!Number.isFinite(startOpacity)) startOpacity = 0;
    stopAnimation(panel);
    setIcon(item, 'open');
    panel.hidden = false;
    panel.style.display = 'block';
    item.classList.add('is-open');
    button.setAttribute('aria-expanded', 'true');

    if (!animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      panel.style.height = '';
      panel.style.opacity = '';
      return;
    }

    panel.style.height = 'auto';
    panel.style.opacity = '1';
    var height = panel.getBoundingClientRect().height;
    panel.style.height = startHeight + 'px';
    panel.style.opacity = String(startOpacity);
    panel._velaAnimation = panel.animate(
      [
        { height: startHeight + 'px', opacity: startOpacity },
        { height: height + 'px', opacity: 1 }
      ],
      animationOptions(accordion)
    );
    panel._velaAnimation.onfinish = function () {
      panel._velaAnimation = null;
      panel.style.height = '';
      panel.style.opacity = '';
    };
  }

  function prepareItem(item) {
    var itemParts = parts(item);
    var button = itemParts.button;
    var panel = itemParts.panel;
    if (!button || !panel) return;

    if (item.dataset.koEnhancedItem !== 'true') {
      var panelId = panel.id || 'ko-ea-panel-' + Math.random().toString(36).slice(2);
      var buttonId = button.id || panelId + '-button';
      panel.id = panelId;
      button.id = buttonId;
      button.setAttribute('aria-controls', panelId);
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-labelledby', buttonId);
      item.dataset.koEnhancedItem = 'true';
      closeItem(item, false);
    } else {
      setIcon(item, item.classList.contains('is-open') ? 'open' : 'closed');
    }
  }

  function applyInitialState(accordion) {
    var state = accordion.dataset.initialState === 'open' ? 'open' : 'closed';
    var items = itemsFor(accordion);
    if (state === 'open' && !items.length) return false;
    if (accordion._koAppliedInitialState === state) return false;
    accordion._koAppliedInitialState = state;

    items.forEach(function (item) { closeItem(item, false); });
    if (state === 'open' && items.length) openItem(items[0], false);
    return true;
  }

  function normalizeGroupState(group) {
    var groupedAccordions = accordionsForGroup(group);
    if (groupedAccordions.some(function (groupedAccordion) {
      return groupedAccordion.dataset.closeCurrent === 'off';
    })) return;

    var firstOpenItem = null;
    groupedAccordions.forEach(function (groupedAccordion) {
      itemsFor(groupedAccordion).forEach(function (item) {
        if (!item.classList.contains('is-open')) return;
        if (!firstOpenItem) {
          firstOpenItem = item;
          return;
        }
        closeItem(item, false);
      });
    });
  }

  function handleClick(event) {
    var accordion = event.currentTarget;
    var button = event.target.closest(buttonSelector);
    if (!button || button.closest(accordionSelector) !== accordion) return;

    var item = button.closest(itemSelector);
    if (!item) return;
    event.preventDefault();

    if (item.classList.contains('is-open')) {
      closeItem(item, true);
      return;
    }

    if (accordion.dataset.closeCurrent !== 'off') {
      itemsForCloseScope(accordion).forEach(function (other) {
        if (other !== item && other.classList.contains('is-open')) closeItem(other, true);
      });
    }
    openItem(item, true);
  }

  function initializeAccordion(accordion) {
    itemsFor(accordion).forEach(prepareItem);
    if (accordion.dataset.koEnhancedAccordion !== 'true') {
      accordion.dataset.koEnhancedAccordion = 'true';
      accordion.addEventListener('click', handleClick);
    }
    if (applyInitialState(accordion)) {
      var group = accordion.closest(groupSelector);
      if (group) normalizeGroupState(group);
    }
  }

  function scan(root) {
    if (!root || (root.nodeType !== 1 && root.nodeType !== 9)) return;
    if (root.matches && root.matches(accordionSelector)) initializeAccordion(root);
    if (root.querySelectorAll) root.querySelectorAll(accordionSelector).forEach(initializeAccordion);
    if (root.closest) {
      var parent = root.closest(accordionSelector);
      if (parent) initializeAccordion(parent);
    }
  }

  function start() {
    scan(document);
    new MutationObserver(function (records) {
      records.forEach(function (record) {
        if (record.type === 'attributes') {
          if (record.attributeName === 'class') {
            if (record.target.matches && record.target.matches(groupSelector)) {
              scan(record.target);
              normalizeGroupState(record.target);
            }
            return;
          }
          initializeAccordion(record.target);
          return;
        }
        record.addedNodes.forEach(scan);
      });
    }).observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'data-initial-state', 'data-duration', 'data-close-current', 'data-icon-placement', 'data-closed-icon', 'data-open-icon']
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
}());
