=== KO: Enhanced Accordion ===
Contributors: ko
Tags: divi, accordion, accessibility
Requires at least: 6.8
Requires PHP: 7.4
Stable tag: 1.1.15
License: GPLv2 or later

Adds the native Divi 5 module KO: Enhanced Accordion.

Author: KO
Contact: ko@velaagency.com
Website: https://velaagency.com

== Description ==

KO: Enhanced Accordion contains repeatable Accordion Item child modules. It lets
the builder choose the closed icon with Divi's native icon picker, set its color
and size, set responsive spacing between items, choose the transition speed,
and select whether all items are closed or the first item is open on page load.
Visitors may return the module to an all-closed state, and ARIA state is
synchronized during interaction. In the Visual Builder, each Accordion Item's
display label automatically follows its Title while the manual Element Label
control remains available.

The parent module and every Accordion Item include Advanced > CSS. Each item
provides Freeform CSS plus scoped fields for its root, title, icon, content
panel, and content.

Each Accordion Item includes Design > Content Links with an optional Text CTA
treatment. When enabled for an item, ordinary links added with that item's Rich
Text editor automatically reproduce the Vela text-only button typography with
color #f16722, the MuseoSans 700 face at computed weight 500, a 16px text size
and line height, and a 16px right chevron. Responsive Link Color, Text Size,
Icon Size, and Icon Gap controls are available on every item. The treatment is
disabled by default and scoped per Accordion Item, so disabled sibling items
keep their existing inline-link appearance.

Version 1.1.13 stored the Text CTA opt-in on the parent accordion. That setting
does not automatically migrate to individual items. After upgrading, enable
Text CTA Links under Accordion Item > Design > Content Links for each item that
should use the treatment.

To coordinate Enhanced Accordion modules across Divi columns, add the CSS class
`ko-enhanced-accordion-group` to their common Row or Section. When Close Current
Item is enabled, opening an item closes any open item in that same group. Modules
without the wrapper class continue to operate independently. Keep Close Current
Item enabled on every grouped module for consistent one-open behavior.

== Installation ==

1. Upload and activate the plugin ZIP.
2. Clear Divi and site caches.
3. Verify an Accordion module on the front end and in the Visual Builder.

== Changelog ==

= 1.1.15 =
* Corrected Text CTA defaults to reproduce the Vela text-only button typography: #f16722, MuseoSans 700 at computed weight 500, 16px text and line height, and a 16px chevron.
* Fixed the version 1.1.14 mismatch where the numeric weight matched but the inherited font face, line height, and icon size differed.
* Preserved per-item responsive controls and isolation from disabled sibling links.

= 1.1.14 =
* Moved the optional Text CTA treatment to Accordion Item > Design > Content Links so it can be enabled independently for each item.
* Matched the Vela text-only button baseline with link color #f16722 and font weight 500.
* Kept responsive Link Color, Text Size, Icon Size, and Icon Gap controls on every Accordion Item while leaving disabled sibling links unchanged.
* Existing version 1.1.13 parent Text CTA opt-ins do not migrate automatically; enable the treatment on each desired item after upgrading.

= 1.1.13 =
* Added an optional Design > Content Links treatment for automatic text CTA links inside Accordion Item content.
* Added responsive link color, text size, chevron size, and chevron gap controls without requiring Divi Button classes.

= 1.1.12 =
* Added Advanced > CSS and Freeform CSS support to every Accordion Item.
* Added scoped item fields for the item root, title, icon, content panel, and content in both the Visual Builder and frontend.

= 1.1.11 =
* Made the established Vela accordion appearance the default for newly inserted parent modules and Accordion Items.
* Added light gray toggle backgrounds, 18px titles, orange Font Awesome caret icons, and 10px item corners while preserving local overrides.

= 1.1.10 =
* Used each Accordion Item Title as its automatic display label in Divi's Visual Builder child-item lists.
* Preserved the separate manual Element Label control without overwriting it.

= 1.1.9 =
* Added the cross-column group class instructions to the plugin description shown on the WordPress Plugins screen.

= 1.1.8 =
* Added optional cross-column single-open behavior through the `ko-enhanced-accordion-group` Row or Section class.
* Kept grouped page-load state to one open item when Close Current Item is enabled on all grouped modules.

= 1.1.7 =
* Added native Advanced > CSS controls, including Freeform CSS and scoped accordion element fields.
* Rendered custom CSS consistently in the Visual Builder and on the frontend.

= 1.1.6 =
* Added a responsive Item Gap setting for Desktop, Tablet, and Phone.
* Prevented Divi's tablet and phone module margin from overriding Enhanced Accordion item spacing.

= 1.1.5 =
* Centered icon glyphs on the accordion title line.
* Smoothed closing so it uses the full selected transition duration.
* Reversed the Open Icon and Close Icon labels to describe the action each icon performs.

= 1.1.4 =
* Corrected Divi 5 icon-object handling so selected open and close icons render in the builder and on the front end.
* Prevented Divi's generic icon sizing from overriding the module's selected icon sizes.

= 1.1.3 =
* Added native-style Layout, Icon, Toggle, Text, Title Text, Closed Title Text, and Body Text design groups.

= 1.1.2 =
* Corrected the OnLoad Behavior option labels and restored their saved values.
* Improved dynamic Divi Builder initialization and click handling.
* Added a Close Current Item toggle for single-open or multi-open behavior.
* Renamed the icon controls to Close Icon.

= 1.1.1 =
* Restored the Accordion Item Title field in the Divi 5 settings panel.

= 1.1.0 =
* Rebuilt as the native Divi 5 module KO: Enhanced Accordion.
* Added repeatable items, native closed-icon controls, transition speed, and page-load state.
