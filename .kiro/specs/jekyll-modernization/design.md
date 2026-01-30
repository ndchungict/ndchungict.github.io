# Design Document: Jekyll Blog Modernization

## Overview

This design outlines the comprehensive modernization of a Jekyll blog project from Jekyll 3.10.0 (constrained by GitHub Pages) to Jekyll 4.4.0 with updated Ruby environment and dependencies. The modernization focuses on maintaining all existing functionality while enabling modern development practices and improved performance.

The current project uses the Devlopr Jekyll theme with 27 Vietnamese blog posts covering automation testing, DevOps, and language learning. The site includes custom pagination, categories, author profiles, and social integrations.

## Architecture

### Current Architecture Constraints
- **Jekyll 3.10.0**: Locked by github-pages gem
- **Ruby 2.6.10**: System Ruby version (incompatible with modern gems)
- **Outdated Dependencies**: Many gems constrained to older versions
- **GitHub Pages Deployment**: Currently optimized for GitHub Pages hosting

### Target Architecture
- **Jekyll 4.4.0**: Latest stable version with performance improvements
- **Ruby 3.3.5**: As specified in .ruby_version file
- **Modern Gem Ecosystem**: Latest compatible versions of all dependencies
- **Local Development Focus**: Optimized for local development workflow

### Migration Strategy
1. **Ruby Environment Setup**: Ensure Ruby 3.3.5 is available
2. **Dependency Liberation**: Remove github-pages gem constraints
3. **Incremental Updates**: Update gems systematically to avoid conflicts
4. **Configuration Migration**: Update Jekyll configuration for 4.x compatibility
5. **Validation**: Ensure all content renders correctly

## Components and Interfaces

### Ruby Environment Manager
**Purpose**: Manage Ruby version and gem dependencies
**Key Components**:
- Ruby Version Manager (rbenv/rvm/asdf)
- Bundler 2.5.15+
- RubyGems (latest compatible)

**Interface**:
```bash
# Version verification
ruby --version  # Should return 3.3.5
bundle --version  # Should return 2.5.15+
gem --version  # Latest compatible
```

### Jekyll Core System
**Purpose**: Static site generation with modern Jekyll
**Key Components**:
- Jekyll 4.4.0 core
- Liquid templating engine
- Markdown processor (kramdown)
- SASS/SCSS processor

**Interface**:
```yaml
# _config.yml core settings
title: NguyenChung
url: "https://ndchungict.github.io"
baseurl: ""
markdown: kramdown
highlighter: rouge
permalink: pretty
```

### Plugin Ecosystem
**Purpose**: Extend Jekyll functionality with modern plugins
**Key Components**:
- **jekyll-paginate-v2**: Enhanced pagination (replacing jekyll-paginate)
- **jekyll-feed**: RSS/Atom feed generation
- **jekyll-seo-tag**: SEO metadata
- **jekyll-sitemap**: XML sitemap generation
- **jekyll-gist**: GitHub Gist embedding

**Interface**:
```ruby
# Gemfile plugins section
group :jekyll_plugins do
  gem 'jekyll-feed', '~> 0.17.0'
  gem 'jekyll-paginate-v2', '~> 3.0'
  gem 'jekyll-gist', '~> 1.5.0'
  gem 'jekyll-seo-tag', '~> 2.8.0'
  gem 'jekyll-sitemap', '~> 1.4.0'
end
```

### Content Management System
**Purpose**: Preserve and render existing blog content
**Key Components**:
- Post collection (27 Vietnamese blog posts)
- Page collection (about, contact, etc.)
- Author profiles
- Category and tag taxonomies
- Media assets (images, thumbnails)

**Interface**:
```yaml
# Front matter structure (preserved)
---
layout: post
title: "Post Title"
summary: "Post summary"
author: chungnd
date: '2024-09-01 13:35:23 +0700'
category: ['develop','automation']
tag: [cypress,guides]
thumbnail: /assets/post_images/it/image.png
keywords: cypress,tutorial,automation
permalink: /custom-permalink/
---
```

### Theme System
**Purpose**: Maintain visual appearance and styling
**Key Components**:
- Devlopr theme assets
- Custom SASS/CSS files
- JavaScript components
- Responsive layouts
- Social media integrations

**Interface**:
```yaml
# Theme configuration (preserved)
author_logo: chungnd.png
author: Nguyen Chung
typewrite-text: Hi Everyone, Welcome To My Blog !
hero_cover_img: sample_cover.jpg
```

## Data Models

### Site Configuration Model
```yaml
# Enhanced _config.yml structure
title: String
subtitle: String
description: String
url: String (production URL)
baseurl: String (subpath)

# Navigation structure
urls: Array[NavigationItem]
  - text: String
    url: String
    submenu: Array[NavigationItem] (optional)

# Author information
author: String
author_bio: String
author_email: String
author_location: String
author_website_url: String

# Social links
github_username: String
facebook_username: String
# ... other social platforms

# Plugin configurations
pagination:
  enabled: Boolean
  per_page: Integer
  permalink: String
  sort_field: String
  sort_reverse: Boolean

# Build settings
plugins: Array[String]
markdown: String
highlighter: String
permalink: String
```

### Post Model
```yaml
# Front matter structure
layout: String (default: "post")
title: String (required)
summary: String (optional)
author: String (references author)
date: DateTime (required)
category: Array[String] (optional)
tag: Array[String] (optional)
thumbnail: String (image path, optional)
keywords: String (SEO, optional)
permalink: String (custom URL, optional)
usemathjax: Boolean (optional)
```

### Gem Dependency Model
```ruby
# Target Gemfile structure
source "https://rubygems.org"

# Core dependencies
gem 'jekyll', '~> 4.4.0'
gem 'bundler', '~> 2.5.15'
gem 'webrick', '~> 1.7'

# Required for Ruby 3.4+ compatibility
gem 'csv'
gem 'base64'

# Jekyll plugins
group :jekyll_plugins do
  gem 'jekyll-feed', '~> 0.17.0'
  gem 'jekyll-paginate-v2', '~> 3.0'
  gem 'jekyll-gist', '~> 1.5.0'
  gem 'jekyll-seo-tag', '~> 2.8.0'
  gem 'jekyll-sitemap', '~> 1.4.0'
end

# Development dependencies
gem 'kramdown-parser-gfm'
gem 'rouge'
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Before defining the correctness properties, I need to analyze the acceptance criteria from the requirements to determine which ones are testable as properties.

### Property Reflection

After analyzing the acceptance criteria, I identified several areas where properties can be consolidated to eliminate redundancy:

- **Build Success**: Multiple criteria test Jekyll build success - these are combined into one comprehensive property
- **Version Verification**: Several criteria test version requirements - these are combined into one version validation property  
- **Plugin Functionality**: Individual plugin tests are combined into one comprehensive plugin property
- **Content Rendering**: Multiple content-related tests are combined into one content preservation property
- **Asset Processing**: Various asset-related tests are combined into one asset handling property

### Correctness Properties

**Property 1: Environment Version Compliance**
*For any* Jekyll modernization setup, all environment components (Ruby, Bundler, Jekyll, RubyGems) should meet or exceed their minimum required versions as specified in the project configuration
**Validates: Requirements 1.1, 1.2, 1.3, 2.1, 10.2**

**Property 2: Dependency Security and Compatibility**  
*For any* gem in the dependency tree, it should be at a recent version without known security vulnerabilities and compatible with Jekyll 4.x
**Validates: Requirements 3.1, 3.4**

**Property 3: Build Process Success**
*For any* Jekyll site configuration, the build process should complete successfully without errors and generate a complete static site
**Validates: Requirements 2.4, 3.5, 5.1, 9.5, 10.5**

**Property 4: Content Preservation and Rendering**
*For any* existing blog post or page, it should render correctly with proper formatting, metadata, and UTF-8 encoding after the modernization
**Validates: Requirements 6.1, 6.2, 6.4**

**Property 5: Plugin Ecosystem Functionality**
*For any* configured Jekyll plugin, it should load correctly and provide its intended functionality in the modernized environment
**Validates: Requirements 3.2, 4.1, 4.2, 4.3, 4.4, 8.3**

**Property 6: Asset Processing and Delivery**
*For any* theme asset (CSS, JavaScript, images, fonts), it should be processed correctly and accessible in the generated site
**Validates: Requirements 7.2, 7.4, 7.5, 9.4**

## Error Handling

### Ruby Environment Errors
- **Version Mismatch**: If system Ruby version is incompatible, provide clear instructions for using Ruby version managers (rbenv, rvm, asdf)
- **Gem Installation Failures**: Handle permission issues and suggest using `--user-install` or proper Ruby environment setup
- **Bundler Conflicts**: Resolve version conflicts by updating Bundler and clearing gem cache

### Jekyll Configuration Errors  
- **Deprecated Options**: Identify and update deprecated configuration options with modern equivalents
- **Plugin Incompatibilities**: Replace incompatible plugins with modern alternatives
- **Build Failures**: Provide detailed error messages with file locations and suggested fixes

### Content Migration Errors
- **Encoding Issues**: Ensure UTF-8 encoding is properly handled for Vietnamese content
- **Broken Links**: Validate internal links and update broken references
- **Missing Assets**: Identify and restore missing images or media files

### Development Server Errors
- **Port Conflicts**: Handle port conflicts by suggesting alternative ports or killing conflicting processes
- **Live Reload Issues**: Gracefully degrade if live reload fails while maintaining basic server functionality
- **Permission Errors**: Handle file permission issues in development environment

## Testing Strategy

### Dual Testing Approach
The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property Tests**: Verify universal properties across all inputs using randomized testing
- Both approaches are complementary and necessary for complete validation

### Unit Testing Focus
Unit tests should concentrate on:
- **Environment Setup**: Verify Ruby, Bundler, and Jekyll versions meet requirements
- **Configuration Validation**: Test that _config.yml is parsed correctly
- **Plugin Integration**: Verify each plugin loads and functions correctly
- **Content Processing**: Test that specific blog posts render correctly
- **Asset Generation**: Verify CSS compilation and asset copying
- **Error Conditions**: Test handling of invalid configurations and missing files

### Property-Based Testing Configuration
- **Testing Library**: Use a property-based testing framework appropriate for the validation language (e.g., RSpec with property testing gems for Ruby)
- **Minimum Iterations**: Each property test must run at least 100 iterations due to randomization
- **Test Tagging**: Each property test must reference its design document property using the format:
  - **Feature: jekyll-modernization, Property 1: Environment Version Compliance**
  - **Feature: jekyll-modernization, Property 2: Dependency Security and Compatibility**
  - **Feature: jekyll-modernization, Property 3: Build Process Success**
  - **Feature: jekyll-modernization, Property 4: Content Preservation and Rendering**
  - **Feature: jekyll-modernization, Property 5: Plugin Ecosystem Functionality**
  - **Feature: jekyll-modernization, Property 6: Asset Processing and Delivery**

### Integration Testing
- **End-to-End Validation**: Test complete workflow from `bundle install` to `jekyll serve`
- **Cross-Platform Testing**: Verify functionality on different operating systems
- **Performance Validation**: Ensure build times are reasonable and within acceptable limits
- **Regression Testing**: Compare output before and after modernization to ensure no functionality is lost

### Validation Checklist
1. All 27 blog posts render without errors
2. Pagination generates correct number of pages
3. RSS feed contains all posts with proper metadata
4. Sitemap includes all pages and posts
5. SEO tags are present in all pages
6. Category and tag pages are generated correctly
7. Development server starts and serves content
8. All theme assets load correctly
9. Vietnamese content displays with proper encoding
10. No security vulnerabilities in dependencies