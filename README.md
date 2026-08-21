# KO: Enhanced Accordion

Vela-branded WordPress plugin that adds the native Divi 5 module
`KO: Enhanced Accordion`.

Author: KO  
Email: ko@velaagency.com  
Website: https://velaagency.com

## Behavior

- Provides repeatable Accordion Item child modules.
- Uses each Accordion Item Title as its automatic display label in Divi's Visual Builder child-item lists while preserving the separate manual Element Label control.
- Uses Divi's native Open Icon and Close Icon pickers, with color and size controls. The Open Icon appears while an item is closed, and the Close Icon appears while it is open.
- Gives newly inserted modules the Vela baseline styling: light gray open and closed backgrounds, 18px titles, orange Font Awesome caret icons, and 10px Accordion Item corners.
- Keeps those defaults editable through Divi controls, with saved parent, item, or preset values taking precedence.
- Includes Layout, Item Layout, Icon, Toggle, Text, Title Text, Closed Title Text, and Body Text design groups on the parent module.
- Gives every Accordion Item its own Design > Content Links group. Its optional Text CTA treatment styles ordinary Rich Text links as text-only buttons with a right chevron. The defaults reproduce the Vela text-only button typography with color `#f16722`, the `MuseoSans 700` face at computed weight `500`, a `16px` text size and line height, and a `16px` chevron.
- Includes responsive native Link Color, Text Size, Icon Size, and Icon Gap controls for each item's Text CTA treatment. The treatment is opt-in per Accordion Item, and disabled sibling items keep their existing inline-link appearance.
- Includes a responsive Item Gap control for Desktop, Tablet, and Phone without trailing space after the final item.
- Includes native Advanced > CSS controls on the parent module and every Accordion Item.
- Gives each Accordion Item its own Freeform CSS plus scoped fields for the item root, title, icon, content panel, and content.
- Uses the selected transition speed for smooth opening and closing.
- Starts all items closed or opens the first item, based on the module setting.
- Allows the currently open item to close.
- Can close the current item when another item opens, or allow multiple items to remain open.
- Can coordinate single-open behavior across columns when their common Divi Row or Section uses the `ko-enhanced-accordion-group` CSS class.
- Keeps only the first configured open item open when multiple grouped modules request an open page-load state and every grouped module has Close Current Item enabled.
- Preserves intentional multi-open behavior when a grouped module has Close Current Item disabled.
- Uses a 180ms default open/close animation.
- Maintains `aria-expanded`, `aria-controls`, and panel relationships.
- Observes dynamically inserted Divi Builder markup without double binding.

## Release checklist

Run PHP and JavaScript syntax checks, build a versioned ZIP whose root folder is
`ko-enhanced-accordion`, inspect the ZIP contents, and compare the
extracted package with canonical source. Live browser QA is still required after
installation because source and package checks do not prove Divi runtime behavior.

## Upgrading from 1.1.13

Version 1.1.13 stored the Text CTA opt-in on the parent accordion. That setting
does not automatically migrate to individual items. After upgrading, enable
Text CTA Links under Accordion Item > Design > Content Links for each item that
should use the treatment.
