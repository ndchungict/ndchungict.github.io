#!/usr/bin/env ruby
# frozen_string_literal: true

require 'minitest/autorun'
require 'open3'

# **Feature: jekyll-modernization, Property 1: Environment Version Compliance**
# **Validates: Requirements 1.1, 1.2, 1.3, 2.1, 10.2**
#
# Property: For any Jekyll modernization setup, all environment components 
# (Ruby, Bundler, Jekyll, RubyGems) should meet or exceed their minimum 
# required versions as specified in the project configuration

class EnvironmentVersionTest < Minitest::Test
  def setup
    @required_versions = {
      ruby: '3.3.5',
      bundler: '2.5.15',
      rubygems: '3.2.3',
      jekyll: '4.3.0'
    }
  end

  def test_property_environment_version_compliance
    # Test Ruby version
    ruby_version = get_ruby_version
    assert_version_meets_requirement(ruby_version, @required_versions[:ruby], 'Ruby')

    # Test Bundler version
    bundler_version = get_bundler_version
    assert_version_meets_requirement(bundler_version, @required_versions[:bundler], 'Bundler')

    # Test RubyGems version
    rubygems_version = get_rubygems_version
    assert_version_meets_requirement(rubygems_version, @required_versions[:rubygems], 'RubyGems')

    # Test Jekyll version (if available)
    jekyll_version = get_jekyll_version
    if jekyll_version
      assert_version_meets_requirement(jekyll_version, @required_versions[:jekyll], 'Jekyll')
    end
  end

  private

  def get_ruby_version
    stdout, stderr, status = Open3.capture3('ruby --version')
    assert status.success?, "Failed to get Ruby version: #{stderr}"
    
    version_match = stdout.match(/ruby (\d+\.\d+\.\d+)/)
    assert version_match, "Could not parse Ruby version from: #{stdout}"
    
    version_match[1]
  end

  def get_bundler_version
    stdout, stderr, status = Open3.capture3('bundle --version 2>/dev/null')
    
    # If the command failed, try alternative approach
    unless status.success?
      # Try getting version from Bundler constant
      begin
        require 'bundler'
        return Bundler::VERSION
      rescue LoadError
        assert false, "Failed to get Bundler version and Bundler not available"
      end
    end
    
    # Handle both old and new Bundler version output formats
    version_match = stdout.match(/Bundler version (\d+\.\d+\.\d+)/) || 
                   stdout.match(/(\d+\.\d+\.\d+)/)
    assert version_match, "Could not parse Bundler version from: #{stdout}"
    
    version_match[1]
  end

  def get_rubygems_version
    stdout, stderr, status = Open3.capture3('gem --version')
    assert status.success?, "Failed to get RubyGems version: #{stderr}"
    
    stdout.strip
  end

  def get_jekyll_version
    stdout, stderr, status = Open3.capture3('bundle exec jekyll --version')
    return nil unless status.success?
    
    version_match = stdout.match(/jekyll (\d+\.\d+\.\d+)/)
    version_match ? version_match[1] : nil
  end

  def assert_version_meets_requirement(actual, required, component)
    actual_parts = actual.split('.').map(&:to_i)
    required_parts = required.split('.').map(&:to_i)

    # Pad arrays to same length
    max_length = [actual_parts.length, required_parts.length].max
    actual_parts += [0] * (max_length - actual_parts.length)
    required_parts += [0] * (max_length - required_parts.length)

    comparison = 0
    actual_parts.each_with_index do |part, index|
      comparison = part <=> required_parts[index]
      break if comparison != 0
    end

    assert comparison >= 0, 
           "#{component} version #{actual} does not meet minimum requirement #{required}"
  end
end