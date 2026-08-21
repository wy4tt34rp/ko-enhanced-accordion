<?php
namespace Vela\EnhancedAccordion;

if ( ! defined( 'ABSPATH' ) ) exit;

use ET\Builder\Framework\DependencyManagement\Interfaces\DependencyInterface;
use ET\Builder\Framework\Utility\HTMLUtility;
use ET\Builder\FrontEnd\BlockParser\BlockParserStore;
use ET\Builder\FrontEnd\Module\Style;
use ET\Builder\Packages\Module\Module;
use ET\Builder\Packages\Module\Options\Css\CssStyle;
use ET\Builder\Packages\Module\Options\Element\ElementClassnames;
use ET\Builder\Packages\Module\Options\Element\ElementComponents;
use ET\Builder\Packages\ModuleLibrary\ModuleRegistration;

trait Module_Support {
	public static function module_classnames( $args ) {
		$args['classnamesInstance']->add( ElementClassnames::classnames( array( 'attrs' => $args['attrs']['module']['decoration'] ?? array() ) ) );
	}
	public static function module_script_data( $args ) { $args['elements']->script_data( array( 'attrName' => 'module' ) ); }
	protected static function parent_context( $block ) {
		$parent = BlockParserStore::get_parent( $block->parsed_block['id'], $block->parsed_block['storeInstance'] );
		return is_object( $parent ) ? array( 'attrs' => $parent->attrs ?? array(), 'id' => $parent->id ?? '', 'name' => $parent->blockName ?? '' ) : array( 'attrs' => array(), 'id' => '', 'name' => '' );
	}
	protected static function child_ids( $block ) { return array_map( static function( $inner ) { return $inner['id']; }, $block->parsed_block['innerBlocks'] ?? array() ); }
	protected static function decorations( $attrs, $block ) {
		return ElementComponents::component( array( 'attrs' => $attrs['module']['decoration'] ?? array(), 'id' => $block->parsed_block['id'], 'orderIndex' => $block->parsed_block['orderIndex'], 'storeInstance' => $block->parsed_block['storeInstance'] ) );
	}
	protected static function text_value( $attrs, $key, $fallback ) {
		$value = $attrs[ $key ]['innerContent']['desktop']['value'] ?? '';
		return is_string( $value ) && '' !== trim( wp_strip_all_tags( $value ) ) ? $value : $fallback;
	}
	protected static function icon_value( $value, $fallback ) {
		if ( is_string( $value ) ) {
			$value = sanitize_text_field( $value );
			return '' !== $value && '[object Object]' !== $value ? $value : $fallback;
		}
		if ( is_object( $value ) ) $value = (array) $value;
		if ( ! is_array( $value ) ) return $fallback;

		$unicode = $value['unicode'] ?? $value['decodedUnicode'] ?? $value['icon'] ?? '';
		if ( ! is_scalar( $unicode ) || '' === (string) $unicode ) return $fallback;

		$type = 'fa' === ( $value['type'] ?? $value['iconSet'] ?? 'divi' ) ? 'fa' : 'divi';
		$weight = (string) ( $value['weight'] ?? $value['fontWeight'] ?? '400' );
		if ( ! preg_match( '/^\d+$/', $weight ) ) $weight = '400';

		return sanitize_text_field( (string) $unicode ) . '||' . $type . '||' . $weight;
	}
}

class Accordion_Module implements DependencyInterface {
	use Module_Support;
	public function load() { add_action( 'init', array( self::class, 'register_modules' ) ); }
	public static function register_modules() {
		ModuleRegistration::register_module( VELA_EA_MODULE_JSON_PATH . 'item/', array( 'render_callback' => array( Item_Module::class, 'render_callback' ) ) );
		ModuleRegistration::register_module( VELA_EA_MODULE_JSON_PATH . 'accordion/', array( 'render_callback' => array( self::class, 'render_callback' ) ) );
	}
	public static function custom_css() {
		return array(
			'accordionItem'     => array( 'label' => __( 'Accordion Item', 'ko-enhanced-accordion' ), 'subName' => 'accordionItem', 'selectorSuffix' => ' .ko_enhanced_accordion_item' ),
			'openAccordionItem' => array( 'label' => __( 'Open Accordion Item', 'ko-enhanced-accordion' ), 'subName' => 'openAccordionItem', 'selectorSuffix' => ' .ko_enhanced_accordion_item.is-open' ),
			'accordionTitle'    => array( 'label' => __( 'Accordion Title', 'ko-enhanced-accordion' ), 'subName' => 'accordionTitle', 'selectorSuffix' => ' .ko_enhanced_accordion_item__title > button' ),
			'accordionIcon'     => array( 'label' => __( 'Accordion Icon', 'ko-enhanced-accordion' ), 'subName' => 'accordionIcon', 'selectorSuffix' => ' .ko_enhanced_accordion_item__icon' ),
			'accordionContent'  => array( 'label' => __( 'Accordion Content', 'ko-enhanced-accordion' ), 'subName' => 'accordionContent', 'selectorSuffix' => ' .ko_enhanced_accordion_item__content-inner' ),
		);
	}
	public static function module_styles( $args ) {
		$attrs = $args['attrs'] ?? array(); $elements = $args['elements'];
		Style::add( array( 'id' => $args['id'], 'name' => $args['name'], 'orderIndex' => $args['orderIndex'], 'storeInstance' => $args['storeInstance'], 'styles' => array(
			$elements->style( array( 'attrName' => 'module', 'styleProps' => array( 'disabledOn' => array( 'disabledModuleVisibility' => $args['settings']['disabledModuleVisibility'] ?? null ) ) ) ),
			$elements->style( array( 'attrName' => 'itemLayout', 'styleProps' => array( 'advancedStyles' => array(
				array( 'componentName' => 'divi/common', 'props' => array( 'attr' => $attrs['itemLayout']['advanced']['itemGap'] ?? array(), 'property' => '--ko-ea-item-gap' ) ),
			) ) ) ),
			$elements->style( array( 'attrName' => 'behavior', 'styleProps' => array( 'advancedStyles' => array(
				array( 'componentName' => 'divi/common', 'props' => array( 'attr' => $attrs['behavior']['advanced']['closedIconColor'] ?? array(), 'property' => '--ko-ea-icon-color' ) ),
				array( 'componentName' => 'divi/common', 'props' => array( 'attr' => $attrs['behavior']['advanced']['closedIconSize'] ?? array(), 'property' => '--ko-ea-icon-size' ) ),
			) ) ) ),
			$elements->style( array( 'attrName' => 'iconStyle', 'styleProps' => array( 'advancedStyles' => array(
				array( 'componentName' => 'divi/common', 'props' => array( 'attr' => $attrs['iconStyle']['advanced']['iconColor'] ?? array(), 'property' => '--ko-ea-open-icon-color' ) ),
				array( 'componentName' => 'divi/common', 'props' => array( 'attr' => $attrs['iconStyle']['advanced']['iconSize'] ?? array(), 'property' => '--ko-ea-open-icon-size' ) ),
			) ) ) ),
			$elements->style( array( 'attrName' => 'toggleStyle', 'styleProps' => array( 'advancedStyles' => array(
				array( 'componentName' => 'divi/common', 'props' => array( 'attr' => $attrs['toggleStyle']['advanced']['openBackground'] ?? array(), 'property' => '--ko-ea-open-background' ) ),
				array( 'componentName' => 'divi/common', 'props' => array( 'attr' => $attrs['toggleStyle']['advanced']['closedBackground'] ?? array(), 'property' => '--ko-ea-closed-background' ) ),
				array( 'componentName' => 'divi/common', 'props' => array( 'attr' => $attrs['toggleStyle']['advanced']['dividerColor'] ?? array(), 'property' => '--ko-ea-divider-color' ) ),
				array( 'componentName' => 'divi/common', 'props' => array( 'attr' => $attrs['toggleStyle']['advanced']['dividerWidth'] ?? array(), 'property' => '--ko-ea-divider-width' ) ),
			) ) ) ),
			$elements->style( array( 'attrName' => 'titleText' ) ),
			$elements->style( array( 'attrName' => 'closedTitleText' ) ),
			$elements->style( array( 'attrName' => 'bodyText' ) ),
			CssStyle::style( array(
				'selector'         => $args['orderClass'],
				'attr'             => $attrs['css'] ?? array(),
				'cssFields'        => self::custom_css(),
				'orderClass'       => $args['orderClass'],
				'baseOrderClass'   => $args['baseOrderClass'] ?? null,
				'isCustomPostType' => ! empty( $args['isCustomPostType'] ),
			) ),
		) ) );
	}
	public static function render_callback( $attrs, $content, $block, $elements ) {
		$parent = self::parent_context( $block );
		$duration = absint( $attrs['behavior']['advanced']['duration']['desktop']['value'] ?? 180 );
		$state = 'open' === ( $attrs['behavior']['advanced']['initialState']['desktop']['value'] ?? 'closed' ) ? 'open' : 'closed';
		$close_current = 'off' === ( $attrs['behavior']['advanced']['closeCurrent']['desktop']['value'] ?? 'on' ) ? 'off' : 'on';
		$icon = self::icon_value( $attrs['behavior']['advanced']['closedIcon']['desktop']['value'] ?? null, '&#xf078;||fa||900' );
		$open_icon = self::icon_value( $attrs['iconStyle']['advanced']['openIcon']['desktop']['value'] ?? null, '&#xf077;||fa||900' );
		$icon_placement = 'left' === ( $attrs['iconStyle']['advanced']['iconPlacement']['desktop']['value'] ?? 'right' ) ? 'left' : 'right';
		$items = HTMLUtility::render( array(
			'tag'                => 'div',
			'attributes'         => array(
				'class'                   => 'ko_enhanced_accordion__items',
				'data-duration'           => $duration,
				'data-initial-state'      => $state,
				'data-close-current'      => $close_current,
				'data-icon-placement'     => $icon_placement,
				'data-closed-icon'        => $icon,
				'data-open-icon'          => $open_icon,
			),
			'childrenSanitizer'  => 'et_core_esc_previously',
			'children'           => $content,
		) );
		return Module::render( array( 'orderIndex' => $block->parsed_block['orderIndex'], 'storeInstance' => $block->parsed_block['storeInstance'], 'id' => $block->parsed_block['id'], 'name' => $block->block_type->name, 'moduleCategory' => $block->block_type->category, 'moduleClassName' => 'ko_enhanced_accordion', 'attrs' => $attrs, 'elements' => $elements, 'classnamesFunction' => array( self::class, 'module_classnames' ), 'scriptDataComponent' => array( self::class, 'module_script_data' ), 'stylesComponent' => array( self::class, 'module_styles' ), 'parentAttrs' => $parent['attrs'], 'parentId' => $parent['id'], 'parentName' => $parent['name'], 'childrenIds' => self::child_ids( $block ), 'children' => self::decorations( $attrs, $block ) . $items ) );
	}
}

class Item_Module {
	use Module_Support;
	public static function custom_css() {
		return array(
			'accordionItem'         => array( 'label' => __( 'Accordion Item', 'ko-enhanced-accordion' ), 'subName' => 'accordionItem', 'selectorSuffix' => '.ko_enhanced_accordion_item' ),
			'accordionTitle'        => array( 'label' => __( 'Title', 'ko-enhanced-accordion' ), 'subName' => 'accordionTitle', 'selectorSuffix' => ' .ko_enhanced_accordion_item__title > button' ),
			'accordionIcon'         => array( 'label' => __( 'Icon', 'ko-enhanced-accordion' ), 'subName' => 'accordionIcon', 'selectorSuffix' => ' .ko_enhanced_accordion_item__icon' ),
			'accordionContentPanel' => array( 'label' => __( 'Content Panel', 'ko-enhanced-accordion' ), 'subName' => 'accordionContentPanel', 'selectorSuffix' => ' .ko_enhanced_accordion_item__content' ),
			'accordionContent'      => array( 'label' => __( 'Content', 'ko-enhanced-accordion' ), 'subName' => 'accordionContent', 'selectorSuffix' => ' .ko_enhanced_accordion_item__content-inner' ),
		);
	}
	public static function module_styles( $args ) {
		$attrs = $args['attrs'] ?? array(); $elements = $args['elements'];
		Style::add( array( 'id' => $args['id'], 'name' => $args['name'], 'orderIndex' => $args['orderIndex'], 'storeInstance' => $args['storeInstance'], 'styles' => array(
			$elements->style( array( 'attrName' => 'module', 'styleProps' => array( 'disabledOn' => array( 'disabledModuleVisibility' => $args['settings']['disabledModuleVisibility'] ?? null ) ) ) ),
			$elements->style( array( 'attrName' => 'itemTitle' ) ),
			$elements->style( array( 'attrName' => 'content' ) ),
			$elements->style( array( 'attrName' => 'contentLinkStyle', 'styleProps' => array( 'advancedStyles' => array(
				array( 'componentName' => 'divi/common', 'props' => array( 'attr' => $attrs['contentLinkStyle']['advanced']['linkColor'] ?? array(), 'property' => '--ko-ea-content-link-color' ) ),
				array( 'componentName' => 'divi/common', 'props' => array( 'attr' => $attrs['contentLinkStyle']['advanced']['textSize'] ?? array(), 'property' => '--ko-ea-content-link-size' ) ),
				array( 'componentName' => 'divi/common', 'props' => array( 'attr' => $attrs['contentLinkStyle']['advanced']['iconSize'] ?? array(), 'property' => '--ko-ea-content-link-icon-size' ) ),
				array( 'componentName' => 'divi/common', 'props' => array( 'attr' => $attrs['contentLinkStyle']['advanced']['iconGap'] ?? array(), 'property' => '--ko-ea-content-link-icon-gap' ) ),
			) ) ) ),
			CssStyle::style( array(
				'selector'         => $args['orderClass'],
				'attr'             => $attrs['css'] ?? array(),
				'cssFields'        => self::custom_css(),
				'orderClass'       => $args['orderClass'],
				'baseOrderClass'   => $args['baseOrderClass'] ?? null,
				'isCustomPostType' => ! empty( $args['isCustomPostType'] ),
			) ),
		) ) );
	}
	public static function render_callback( $attrs, $content, $block, $elements ) {
		$parent = self::parent_context( $block );
		$title = self::text_value( $attrs, 'itemTitle', __( 'Accordion Item', 'ko-enhanced-accordion' ) );
		$body = self::text_value( $attrs, 'content', __( 'Add your accordion content here.', 'ko-enhanced-accordion' ) );
		$content_link_style = 'on' === ( $attrs['contentLinkStyle']['advanced']['enabled']['desktop']['value'] ?? 'off' ) ? 'cta' : 'default';
		$button = '<button type="button" aria-expanded="false">' . esc_html( wp_strip_all_tags( $title ) ) . '<span class="ko_enhanced_accordion_item__icon" aria-hidden="true">&#xf078;</span></button>';
		$children = '<h3 class="ko_enhanced_accordion_item__title">' . $button . '</h3><div class="ko_enhanced_accordion_item__content"><div class="ko_enhanced_accordion_item__content-inner" data-content-link-style="' . esc_attr( $content_link_style ) . '">' . wp_kses_post( $body ) . '</div></div>';
		return Module::render( array( 'orderIndex' => $block->parsed_block['orderIndex'], 'storeInstance' => $block->parsed_block['storeInstance'], 'id' => $block->parsed_block['id'], 'name' => $block->block_type->name, 'moduleCategory' => $block->block_type->category, 'moduleClassName' => 'ko_enhanced_accordion_item', 'attrs' => $attrs, 'elements' => $elements, 'classnamesFunction' => array( self::class, 'module_classnames' ), 'scriptDataComponent' => array( self::class, 'module_script_data' ), 'stylesComponent' => array( self::class, 'module_styles' ), 'parentAttrs' => $parent['attrs'], 'parentId' => $parent['id'], 'parentName' => $parent['name'], 'children' => self::decorations( $attrs, $block ) . $children ) );
	}
}
