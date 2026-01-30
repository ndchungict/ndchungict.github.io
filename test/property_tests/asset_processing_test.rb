#!/usr/bin/env ruby
# frozen_string_literal: true

require 'minitest/autorun'
require 'fileutils'

# **Feature: jekyll-modernization, Property 6: Asset Processing and Delivery**
# **Validates: Requirements 7.2, 7.4, 7.5, 9.4**
#
# Property: For any theme asset (CSS, JavaScript, images, fonts), it should be 
# processed correctly and accessible in the generated site

class AssetProcessingTest < Minitest::Test
  def setup
    @project_root = File.expand_path('../..', __dir__)
    @build_dir = File.join(@project_root, 'build')
    @assets_dir = File.join(@build_dir, 'assets')
  end

  def test_property_asset_processing_and_delivery
    # Test CSS compilation and processing
    test_css_compilation

    # Test JavaScript processing
    test_javascript_processing

    # Test image processing and delivery
    test_image_processing

    # Test font processing and delivery
    test_font_processing

    # Test asset URL generation
    test_asset_url_generation

    # Test social media integration assets
    test_social_media_assets
  end

  private

  def test_css_compilation
    # Check main CSS file exists and has content
    main_css = File.join(@assets_dir, 'css', 'main.css')
    assert File.exist?(main_css), "Main CSS file not found"
    
    css_content = File.read(main_css)
    assert css_content.length > 10000, "CSS file appears to be empty or too small"

    # Check that SASS compilation worked
    assert css_content.include?('example-main'), "Custom SASS styles not compiled"
    assert css_content.include?('color:blue'), "Custom SASS styles not processed correctly"

    # Check that CSS variables are present (theme support)
    assert css_content.include?('--main-background-color'), "CSS variables not present"
    assert css_content.include?('--bold-color'), "Theme CSS variables not present"

    # Check that responsive design media queries are present
    assert css_content.include?('@media'), "Media queries not present"
    assert css_content.include?('320px'), "Mobile breakpoints not present"

    # Check that CSS is compressed (no unnecessary whitespace)
    assert !css_content.include?("\n\n"), "CSS not properly compressed"
  end

  def test_javascript_processing
    # Check that JavaScript files are copied
    js_dir = File.join(@assets_dir, 'js')
    assert Dir.exist?(js_dir), "JavaScript directory not found"

    expected_js_files = [
      'mode-switcher.js',
      'search.js',
      'on-scroll-progress.js',
      'custom.min.js'
    ]

    expected_js_files.each do |js_file|
      js_path = File.join(js_dir, js_file)
      assert File.exist?(js_path), "JavaScript file #{js_file} not found"
      
      js_content = File.read(js_path)
      assert js_content.length > 0, "JavaScript file #{js_file} is empty"
    end

    # Check that mode-switcher.js has expected functionality
    mode_switcher_path = File.join(js_dir, 'mode-switcher.js')
    mode_switcher_content = File.read(mode_switcher_path)
    assert mode_switcher_content.include?('modeSwitcher'), "Mode switcher function not found"
    assert mode_switcher_content.include?('localStorage'), "Theme persistence not implemented"
  end

  def test_image_processing
    # Check that images directory exists
    img_dir = File.join(@assets_dir, 'img')
    assert Dir.exist?(img_dir), "Images directory not found"

    # Check that essential images are present
    essential_images = [
      'chungnd_favicon.ico',
      'chungnd.png',
      'profile.png',
      'sample_cover.jpg'
    ]

    essential_images.each do |image|
      image_path = File.join(img_dir, image)
      assert File.exist?(image_path), "Essential image #{image} not found"
      assert File.size(image_path) > 0, "Image #{image} is empty"
    end

    # Check that post images are copied
    post_images_dir = File.join(@assets_dir, 'post_images')
    assert Dir.exist?(post_images_dir), "Post images directory not found"

    # Check specific post image categories
    %w[it chinese english].each do |category|
      category_dir = File.join(post_images_dir, category)
      assert Dir.exist?(category_dir), "Post images category #{category} not found"
      
      images = Dir.glob(File.join(category_dir, '*'))
      assert images.length > 0, "No images found in category #{category}"
    end

    # Check that a specific post image exists
    cypress_image = File.join(post_images_dir, 'it', 'huong-dan-cypress-can-ban.png')
    assert File.exist?(cypress_image), "Specific post image not found"
  end

  def test_font_processing
    # Check that font-awesome fonts are available
    font_awesome_dir = File.join(@assets_dir, 'bower_components', 'font-awesome', 
                                'web-fonts-with-css', 'webfonts')
    assert Dir.exist?(font_awesome_dir), "Font-awesome webfonts directory not found"

    # Check that essential font formats are present
    font_formats = %w[.woff .woff2 .ttf .eot .svg]
    font_formats.each do |format|
      fonts = Dir.glob(File.join(font_awesome_dir, "*#{format}"))
      assert fonts.length > 0, "No fonts found in #{format} format"
    end

    # Check specific font files
    expected_fonts = [
      'fa-solid-900.woff2',
      'fa-brands-400.woff2',
      'fa-regular-400.woff2'
    ]

    expected_fonts.each do |font|
      font_path = File.join(font_awesome_dir, font)
      assert File.exist?(font_path), "Font file #{font} not found"
      assert File.size(font_path) > 1000, "Font file #{font} appears to be corrupted"
    end
  end

  def test_asset_url_generation
    # Check that assets are referenced correctly in HTML
    index_path = File.join(@build_dir, 'index.html')
    index_content = File.read(index_path)

    # Check CSS references
    assert index_content.include?('/assets/css/main.css'), "Main CSS not referenced in HTML"
    assert index_content.include?('/assets/bower_components/'), "Bower components not referenced"

    # Check JavaScript references
    assert index_content.include?('/assets/js/mode-switcher.js'), "Mode switcher JS not referenced"
    assert index_content.include?('/assets/js/search.js'), "Search JS not referenced"

    # Check that URLs use the correct base URL
    assert index_content.include?('https://ndchungict.github.io/assets/'), 
           "Assets not using correct base URL"
  end

  def test_social_media_assets
    # Check that social media integration assets are working
    post_path = File.join(@build_dir, 'huong-dan-cypress-can-ban', 'index.html')
    post_content = File.read(post_path)

    # Check FontAwesome social icons
    social_icons = [
      'fab fa-github',
      'fab fa-linkedin', 
      'fab fa-facebook',
      'fab fa-twitter'
    ]

    social_icons.each do |icon|
      assert post_content.include?(icon), "Social media icon #{icon} not found"
    end

    # Check that social media meta tags are present
    social_meta_tags = [
      'property="og:image"',
      'name="twitter:card"',
      'property="og:title"'
    ]

    social_meta_tags.each do |tag|
      assert post_content.include?(tag), "Social media meta tag #{tag} not found"
    end

    # Check that social sharing buttons are present
    assert post_content.include?('twitter-share-button'), "Twitter share button not found"
    assert post_content.include?('fb-share-button'), "Facebook share button not found"
  end
end