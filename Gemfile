source "https://rubygems.org"

# Core Jekyll and dependencies
gem 'jekyll', '~> 4.4.0'
gem 'bundler', '~> 2.5.15'
gem 'webrick', '>= 1.8.2'

# Ruby 3.4+ compatibility gems
gem 'csv'
gem 'base64'

# Additional dependencies
gem 'faraday-retry'
gem 'backports', '~> 3.25.0'
gem 'kramdown'
gem 'kramdown-parser-gfm'
gem 'rouge'
gem 'puma', '>= 6.4.3'
gem 'minitest'
gem 'nokogiri'

# Removed github-pages gem to allow latest Jekyll version
# you can read more about it here 
# https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll
# https://pages.github.com/versions/

# Plugins - All compatible with GitHub Pages via GitHub Actions custom build
group :jekyll_plugins do
    # gem 'devlopr', '~> 0.4.5'
    gem 'jgd', '~> 1.14.0'                    # GitHub Pages deployment tool
    gem 'jekyll-feed', '~> 0.17.0'            # RSS/Atom feed generation - GitHub Pages compatible
    gem 'jekyll-paginate-v2', '~> 3.0'        # Enhanced pagination - requires GitHub Actions build
    gem 'jekyll-gist', '~> 1.5.0'             # GitHub Gist embedding - GitHub Pages compatible
    gem 'jekyll-seo-tag', '~> 2.8.0'          # SEO metadata - GitHub Pages compatible
    gem 'jekyll-sitemap', '~> 1.4.0'          # XML sitemap generation - GitHub Pages compatible

    # gem 'jekyll-admin', '~> 0.11.1'
end


# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
install_if -> { RUBY_PLATFORM =~ %r!mingw|mswin|java! } do
  gem "tzinfo", "~> 2.0"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1.1", :install_if => Gem.win_platform?
gem "ffi", "~> 1.16.3"