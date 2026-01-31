# GitHub Pages Setup Guide

## Ruby Version Compatibility

This project uses different Ruby versions for different environments:

- **Local Development**: Ruby 3.3.5 (as specified in `.ruby-version`)
- **GitHub Actions/Pages**: Ruby 3.2.x (latest available on ubuntu-22.04)

Both versions are compatible with Jekyll 4.4.0 and all project dependencies.

## Build Configuration

- **Local Development**: Builds to `./build` directory
- **GitHub Pages**: Builds to `./_site` directory (configured in GitHub Actions)

## Deployment

The GitHub Actions workflow automatically:
1. Uses Ruby 3.2.x (latest available on GitHub Actions runners)
2. Installs dependencies with bundler caching
3. Builds the site to `_site` directory
4. Deploys to GitHub Pages

## Local Development

To run locally:
```bash
bundle exec jekyll serve
```

The site will be available at `http://localhost:4000` and build to `./build` directory.

## Troubleshooting

If you encounter Ruby version issues:
1. Ensure you have Ruby 3.3.5 installed locally (or any Ruby 3.x version)
2. Run `bundle install` to install dependencies
3. The GitHub Actions will handle the deployment with Ruby 3.2.x automatically