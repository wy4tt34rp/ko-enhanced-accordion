<?php
/**
 * Regression contract for the WordPress -> Divi attribute handoff.
 *
 * This fixture uses the shipped metadata and WordPress's documented missing-key
 * default behavior. It is not a substitute for installation/runtime browser QA.
 * Run: php tests/preset-inheritance.php
 */
define( 'ABSPATH', __DIR__ . '/' );
$registered_filters = array();
function add_action() {}
function add_filter( $name, $callback, $priority = 10, $accepted_args = 1 ) {
	global $registered_filters;
	$registered_filters[ $name ] = array( $callback, $priority, $accepted_args );
}
function plugin_dir_path( $file ) { return dirname( $file ) . '/'; }
function plugin_dir_url( $file ) { return 'https://example.test/plugins/ko-enhanced-accordion/'; }
require dirname( __DIR__ ) . '/ko-enhanced-accordion.php';

function expect_same( $expected, $actual, $message ) {
	if ( $expected !== $actual ) {
		throw new RuntimeException( $message . '\nExpected: ' . var_export( $expected, true ) . '\nActual: ' . var_export( $actual, true ) );
	}
}
function metadata_defaults( $metadata ) {
	$defaults = array();
	foreach ( $metadata['attributes'] as $name => $schema ) {
		if ( isset( $schema['default'] ) ) $defaults[ $name ] = $schema['default'];
	}
	return $defaults;
}
function prepare_missing_attributes( $attributes, $schemas ) {
	// WordPress fills a complete top-level default only when that key is absent.
	foreach ( array_diff_key( $schemas, $attributes ) as $name => $schema ) {
		if ( isset( $schema['default'] ) ) $attributes[ $name ] = $schema['default'];
	}
	return $attributes;
}
function resolve_handoff( $metadata, $wp_args, $preset, $local = array() ) {
	$prepared = prepare_missing_attributes( $local, $wp_args['attributes'] );
	// Divi owns fallback defaults; preset values precede explicit local values.
	return array_replace_recursive( metadata_defaults( $metadata ), $preset, $prepared );
}
function dv( $value ) { return array( 'desktop' => array( 'value' => $value ) ); }

$hook = $registered_filters['register_block_type_args'] ?? null;
expect_same( array( 'vela_ea_preserve_divi_preset_defaults', 10, 2 ), $hook, 'The scoped native registration filter must be registered with two arguments.' );
$filter = $hook[0];
$parent = json_decode( file_get_contents( dirname( __DIR__ ) . '/modules-json/accordion/module.json' ), true );
$child = json_decode( file_get_contents( dirname( __DIR__ ) . '/modules-json/item/module.json' ), true );

$parent_preset = array(
	'behavior' => array( 'advanced' => array(
		'duration' => dv( '200ms' ),
		'initialState' => dv( 'open' ),
		'closedIcon' => dv( array( 'unicode' => '&#xe050;', 'type' => 'divi', 'weight' => '400' ) ),
		'closedIconColor' => dv( '#d91823' ),
		'closedIconSize' => dv( '24px' ),
	) ),
	'itemLayout' => array( 'advanced' => array( 'itemGap' => array(
		'desktop' => array( 'value' => '22px' ),
		'tablet' => array( 'value' => '12px' ),
		'phone' => array( 'value' => '8px' ),
	) ) ),
	'toggleStyle' => array( 'advanced' => array( 'closedBackground' => dv( '#f4f4f4' ) ) ),
);
$child_preset = array(
	'module' => array( 'decoration' => array( 'border' => dv( array( 'radius' => array(
		'topLeft' => '0px', 'topRight' => '0px', 'bottomLeft' => '0px', 'bottomRight' => '0px', 'sync' => 'on',
	) ) ) ) ),
	'contentLinkStyle' => array( 'advanced' => array( 'enabled' => dv( 'on' ), 'linkColor' => dv( '#d91823' ) ) ),
);

foreach ( array( array( $parent, $parent_preset ), array( $child, $child_preset ) ) as $case ) {
	list( $metadata, $preset ) = $case;
	$original = array( 'attributes' => $metadata['attributes'], 'render_callback' => 'unchanged-callback' );
	$before = $original;
	$fixed = $filter( $original, $metadata['name'] );
	expect_same( $before, $original, 'Registration must not mutate source metadata.' );
	expect_same( 'unchanged-callback', $fixed['render_callback'], 'The Divi rendering callback must stay intact.' );
	foreach ( $metadata['attributes'] as $name => $schema ) {
		$expected_schema = $schema;
		unset( $expected_schema['default'] );
		expect_same( $expected_schema, $fixed['attributes'][ $name ], 'Only the WordPress schema default may change.' );
	}
	$legacy = resolve_handoff( $metadata, $original, $preset );
	$correct = array_replace_recursive( metadata_defaults( $metadata ), $preset );
	if ( $legacy === $correct ) throw new RuntimeException( 'Fixture must reproduce the injected-default regression.' );
	expect_same( $correct, resolve_handoff( $metadata, $fixed, $preset ), 'Saved presets must win over metadata defaults.' );
	expect_same( metadata_defaults( $metadata ), resolve_handoff( $metadata, $fixed, array() ), 'Modules without a preset must keep all original fallback defaults.' );
}

$fixed = $filter( array( 'attributes' => $parent['attributes'] ), $parent['name'] );
$local = array( 'behavior' => array( 'advanced' => array( 'duration' => dv( '420ms' ) ) ) );
$resolved = resolve_handoff( $parent, $fixed, $parent_preset, $local );
expect_same( '420ms', $resolved['behavior']['advanced']['duration']['desktop']['value'], 'An explicit local value must still override a preset.' );
expect_same( '#d91823', $resolved['behavior']['advanced']['closedIconColor']['desktop']['value'], 'A partial local group must not erase sibling preset values.' );
expect_same( '8px', $resolved['itemLayout']['advanced']['itemGap']['phone']['value'], 'Responsive preset values must remain intact.' );

$fixed_child = $filter( array( 'attributes' => $child['attributes'] ), $child['name'] );
$local_content = array(
	'itemTitle' => array( 'innerContent' => dv( 'Existing title' ) ),
	'content' => array( 'innerContent' => dv( '<p>Existing <a href="/example/">rich content</a>.</p>' ) ),
	'contentLinkStyle' => array( 'advanced' => array( 'enabled' => dv( 'off' ) ) ),
);
$resolved_child = resolve_handoff( $child, $fixed_child, $child_preset, $local_content );
expect_same( $local_content['itemTitle'], $resolved_child['itemTitle'], 'Saved item titles must remain unchanged.' );
expect_same( $local_content['content'], $resolved_child['content'], 'Saved rich content must remain unchanged.' );
expect_same( 'off', $resolved_child['contentLinkStyle']['advanced']['enabled']['desktop']['value'], 'A child local opt-out must override its preset.' );

$unrelated = array( 'attributes' => $parent['attributes'], 'other' => true );
expect_same( $unrelated, $filter( $unrelated, 'divi/accordion' ), 'Native Divi modules must be unchanged.' );
expect_same( $unrelated, $filter( $unrelated, 'another/enhanced-accordion' ), 'Other plugins must be unchanged.' );
expect_same( array(), $filter( array(), $parent['name'] ), 'Missing schemas must be tolerated.' );
expect_same( array( 'attributes' => null ), $filter( array( 'attributes' => null ), $child['name'] ), 'Non-array schemas must be tolerated.' );
echo "Preset inheritance regression checks passed.\n";
