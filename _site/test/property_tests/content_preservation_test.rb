#!/usr/bin/env ruby
# frozen_string_literal: true

require 'minitest/autorun'
require 'fileutils'

# **Feature: jekyll-modernization, Property 4: Content Preservation and Rendering**
# **Validates: Requirements 6.1, 6.2, 6.4**
#
# Property: For any existing blog post or page, it should render correctly 
# with proper formatting, metadata, and UTF-8 encoding after the modernization

class ContentPreservationTest < Minitest::Test
  def setup
    @project_root = File.expand_path('../..', __dir__)
    @build_dir = File.join(@project_root, 'build')
    @posts_dir = File.join(@project_root, '_posts')
    @expected_post_count = 27
  end

  def test_property_content_preservation_and_rendering
    # Test that all posts are processed
    test_all_posts_processed

    # Test Vietnamese content encoding
    test_vietnamese_content_encoding

    # Test front matter parsing
    test_front_matter_parsing

    # Test custom permalinks
    test_custom_permalinks

    # Test metadata preservation
    test_metadata_preservation
  end

  private

  def test_all_posts_processed
    # Count source posts
    source_posts = Dir.glob(File.join(@posts_dir, '*.md'))
    assert_equal @expected_post_count, source_posts.length, 
                 "Expected #{@expected_post_count} source posts, found #{source_posts.length}"

    # Count built post directories (posts use custom permalinks)
    built_post_dirs = Dir.glob(File.join(@build_dir, '*/')).select do |dir|
      # Skip non-post directories
      basename = File.basename(dir)
      !%w[about admin all-posts assets automation blog categories chinese contact 
          develop devops english gallery language nginx products series shop 
          styleguide test].include?(basename)
    end

    assert built_post_dirs.length >= @expected_post_count, 
           "Expected at least #{@expected_post_count} built post directories, found #{built_post_dirs.length}"
  end

  def test_vietnamese_content_encoding
    # Test a few Vietnamese posts to ensure UTF-8 encoding works
    vietnamese_posts = [
      'huong-dan-cypress-can-ban',
      'bang-phien-am-pinyin-tieng-trung',
      'cau-truc-cua-mot-cau-trong-tieng-anh'
    ]

    vietnamese_posts.each do |post_slug|
      post_path = File.join(@build_dir, post_slug, 'index.html')
      assert File.exist?(post_path), "Vietnamese post #{post_slug} not found"

      content = File.read(post_path, encoding: 'UTF-8')
      
      # Check for Vietnamese characters
      vietnamese_chars = ['ă', 'â', 'đ', 'ê', 'ô', 'ơ', 'ư', 'á', 'à', 'ả', 'ã', 'ạ']
      has_vietnamese = vietnamese_chars.any? { |char| content.include?(char) }
      
      assert has_vietnamese, "Post #{post_slug} should contain Vietnamese characters"
      
      # Check that content is properly encoded (no encoding errors)
      assert content.valid_encoding?, "Post #{post_slug} has invalid UTF-8 encoding"
    end
  end

  def test_front_matter_parsing
    # Test that front matter is parsed correctly by checking generated HTML
    test_posts = [
      {
        slug: 'huong-dan-cypress-can-ban',
        expected_title: 'Hướng dẫn cypress căn bản',
        expected_categories: ['develop', 'automation'],
        expected_author: 'chungnd'
      },
      {
        slug: 'bang-phien-am-pinyin-tieng-trung',
        expected_title: 'Bảng phiên âm tiếng Trung',
        expected_categories: ['language', 'chinese'],
        expected_author: 'chungnd'
      }
    ]

    test_posts.each do |post_data|
      post_path = File.join(@build_dir, post_data[:slug], 'index.html')
      assert File.exist?(post_path), "Post #{post_data[:slug]} not found"

      content = File.read(post_path)

      # Check title in HTML
      assert content.include?(post_data[:expected_title]), 
             "Post #{post_data[:slug]} missing expected title: #{post_data[:expected_title]}"

      # Check categories in HTML
      post_data[:expected_categories].each do |category|
        assert content.include?("/blog/categories/#{category}") || content.include?("/#{category}"), 
               "Post #{post_data[:slug]} missing category link: #{category}"
      end

      # Check author
      assert content.include?(post_data[:expected_author]), 
             "Post #{post_data[:slug]} missing author: #{post_data[:expected_author]}"
    end
  end

  def test_custom_permalinks
    # Test that custom permalinks are working
    permalink_tests = [
      {
        source_file: '2024-09-01-huong-dan-cypress-can-ban.md',
        expected_path: 'huong-dan-cypress-can-ban'
      },
      {
        source_file: '2024-09-12-bang-phien-am-pinyin-tieng-trung.md',
        expected_path: 'bang-phien-am-pinyin-tieng-trung'
      }
    ]

    permalink_tests.each do |test_data|
      # Check that the post exists at the expected permalink path
      post_path = File.join(@build_dir, test_data[:expected_path], 'index.html')
      assert File.exist?(post_path), 
             "Post #{test_data[:source_file]} not found at expected permalink: #{test_data[:expected_path]}"

      # Check that the URL is correct in the HTML
      content = File.read(post_path)
      assert content.include?("/#{test_data[:expected_path]}/"), 
             "Post #{test_data[:source_file]} doesn't contain correct permalink URL"
    end
  end

  def test_metadata_preservation
    # Test that important metadata is preserved in the generated HTML
    post_path = File.join(@build_dir, 'huong-dan-cypress-can-ban', 'index.html')
    content = File.read(post_path)

    # Check SEO meta tags
    seo_elements = [
      'property="og:title"',
      'property="og:type"',
      'property="og:description"',
      'name="twitter:card"',
      'name="keywords"'
    ]

    seo_elements.each do |element|
      assert content.include?(element), "Missing SEO element: #{element}"
    end

    # Check structured data
    assert content.include?('itemscope'), "Missing structured data (itemscope)"
    assert content.include?('itemtype="http://schema.org/BlogPosting"'), 
           "Missing BlogPosting schema"

    # Check that images are properly referenced
    assert content.include?('/assets/post_images/'), "Missing image references"

    # Check that dates are properly formatted
    assert content.match(/\d{4}-\d{2}-\d{2}/), "Missing or malformed date"
  end
end