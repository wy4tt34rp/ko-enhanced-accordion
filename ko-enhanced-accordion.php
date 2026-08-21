<?php
/**
 * Plugin Name:       KO: Enhanced Accordion
 * Plugin URI:        https://velaagency.com
 * Description:       Adds KO: Enhanced Accordion for Divi 5. Add ko-enhanced-accordion-group to a common Row or Section to coordinate modules across columns.
 * Version:           1.1.15
 * Author:            KO
 * Author URI:        https://velaagency.com
 * License:           GPL-2.0-or-later
 * Text Domain:       ko-enhanced-accordion
 * Requires at least: 6.8
 * Requires PHP:      7.4
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'VELA_EA_VERSION', '1.1.15' );
define( 'VELA_EA_PATH', plugin_dir_path( __FILE__ ) );
define( 'VELA_EA_URL', plugin_dir_url( __FILE__ ) );
define( 'VELA_EA_MODULE_JSON_PATH', VELA_EA_PATH . 'modules-json/' );

function vela_ea_register_dependencies( $dependency_tree ) {
	require_once VELA_EA_PATH . 'includes/class-vela-ea-modules.php';
	$dependency_tree->add_dependency( new \Vela\EnhancedAccordion\Accordion_Module() );
}
add_action( 'divi_module_library_modules_dependency_tree', 'vela_ea_register_dependencies' );

function vela_ea_enqueue_frontend_assets() {
	if ( function_exists( 'et_builder_d5_enabled' ) && et_builder_d5_enabled() ) {
		wp_enqueue_style( 'vela-enhanced-accordion', VELA_EA_URL . 'assets/css/vela-enhanced-accordion.css', array(), VELA_EA_VERSION );
		wp_enqueue_script( 'vela-enhanced-accordion', VELA_EA_URL . 'assets/js/vela-enhanced-accordion.js', array(), VELA_EA_VERSION, true );
	}
}
add_action( 'wp_enqueue_scripts', 'vela_ea_enqueue_frontend_assets' );

function vela_ea_enqueue_builder_assets() {
	if ( ! function_exists( 'et_builder_d5_enabled' ) || ! et_builder_d5_enabled() || ! function_exists( 'et_core_is_fb_enabled' ) || ! et_core_is_fb_enabled() ) return;

	\ET\Builder\VisualBuilder\Assets\PackageBuildManager::register_package_build( array(
		'name' => 'vela-enhanced-accordion-builder', 'version' => VELA_EA_VERSION,
		'script' => array( 'src' => VELA_EA_URL . 'assets/js/vela-enhanced-accordion-builder.js', 'deps' => array( 'react', 'divi-module-library', 'divi-vendor-wp-hooks' ), 'enqueue_top_window' => false, 'enqueue_app_window' => true ),
	) );
	\ET\Builder\VisualBuilder\Assets\PackageBuildManager::register_package_build( array(
		'name' => 'vela-enhanced-accordion-style', 'version' => VELA_EA_VERSION,
		'style' => array( 'src' => VELA_EA_URL . 'assets/css/vela-enhanced-accordion.css', 'deps' => array(), 'enqueue_top_window' => false, 'enqueue_app_window' => true ),
	) );
	\ET\Builder\VisualBuilder\Assets\PackageBuildManager::register_package_build( array(
		'name' => 'vela-enhanced-accordion-runtime', 'version' => VELA_EA_VERSION,
		'script' => array( 'src' => VELA_EA_URL . 'assets/js/vela-enhanced-accordion.js', 'deps' => array(), 'enqueue_top_window' => false, 'enqueue_app_window' => true ),
	) );
}
add_action( 'divi_visual_builder_assets_before_enqueue_scripts', 'vela_ea_enqueue_builder_assets' );

function vela_ea_divi_notice() {
	if ( current_user_can( 'activate_plugins' ) && ! function_exists( 'et_builder_d5_enabled' ) ) {
		echo '<div class="notice notice-warning"><p>' . esc_html__( 'KO: Enhanced Accordion requires Divi 5.', 'ko-enhanced-accordion' ) . '</p></div>';
	}
}
add_action( 'admin_notices', 'vela_ea_divi_notice' );
