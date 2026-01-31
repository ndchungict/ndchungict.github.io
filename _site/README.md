# Nguyen Chung's Personal Blog

[![GitHub Pages](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-blue.svg)](https://ndchungict.github.io)
[![Jekyll](https://img.shields.io/badge/Built%20with-Jekyll-red.svg)](https://jekyllrb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> A personal blog and portfolio website for sharing knowledge about automation testing, DevOps, and language learning.

## 🌟 About

Welcome to my personal website! I'm **Nguyen Duc Chung**, an Automation Test Engineer based in Vietnam. This site serves as my digital space to share:

- 🤖 **Automation Testing** guides and best practices (Cypress, Katalon, etc.)
- 🚀 **DevOps** tutorials (Docker, CI/CD, deployment strategies)
- 📚 **Language Learning** resources (English TOEIC, Chinese HSK)
- 💡 Technical articles and personal experiences

**Live Site:** [https://ndchungict.github.io](https://ndchungict.github.io)

## 🛠️ Tech Stack

This website is built with:

- **[Jekyll](https://jekyllrb.com/)** - Static site generator
- **[Devlopr Theme](https://github.com/sujaykundu777/devlopr-jekyll)** - Beautiful Jekyll theme for developers
- **GitHub Pages** - Free hosting
- **GitHub Actions** - Automated deployment

### Key Features

- ✅ Responsive design optimized for all devices
- ✅ SEO-optimized with meta tags and sitemaps
- ✅ Fast page load times
- ✅ Blog with categories and tags
- ✅ Portfolio/projects showcase
- ✅ About page with work experience and education
- ✅ Contact form integration
- ✅ Comments system (Hyvor Talk)
- ✅ Coding activity tracking (WakaTime)

## 📁 Project Structure

```
ndchungict.github.io/
├── _config.yml           # Site configuration
├── _posts/               # Blog posts (27 articles)
│   ├── 2024-09-01-huong-dan-cypress-can-ban.md
│   ├── 2024-09-19-mot-so-cau-lenh-co-ban-trong-docker.md
│   └── ...
├── _layouts/             # Page templates
├── _includes/            # Reusable components
├── _sass/                # Stylesheets
├── assets/               # Images, fonts, and other static files
├── categories/           # Category pages
├── series/               # Series pages
├── about.md              # About page
├── contact.md            # Contact page
└── index.html            # Homepage
```

## 🚀 Quick Start

### Prerequisites

- **Ruby** (version 3.3.4 or higher recommended)
- **Bundler** (version 2.5.15 or higher)
- **Node.js** (optional, for some features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ndchungict/ndchungict.github.io.git
   cd ndchungict.github.io
   ```

2. **Install dependencies**
   ```bash
   bundle install
   ```

3. **Run the development server**
   ```bash
   bundle exec jekyll serve --livereload
   ```

4. **Open your browser**
   
   Navigate to `http://localhost:4000` to see the site running locally.

### Development with Live Reload

For the best development experience with automatic browser refresh:

```bash
bundle exec jekyll serve --livereload
```

Any changes you make to the files will automatically reload the browser.

## 📝 Creating Content

### Adding a New Blog Post

1. Create a new file in `_posts/` with the format: `YYYY-MM-DD-title.md`

2. Add front matter at the top:
   ```yaml
   ---
   layout: post
   title: "Your Post Title"
   summary: "Brief description of your post"
   author: chungnd
   date: 'YYYY-MM-DD HH:MM:SS +0700'
   category: ['automation', 'devops']
   tag: [cypress, docker, tutorial]
   thumbnail: /assets/post_images/your-image.png
   keywords: keyword1, keyword2, keyword3
   permalink: /your-post-url/
   ---
   ```

3. Write your content in Markdown below the front matter

4. Save and commit your changes

### Categories

Available categories:
- `automation` - Automation testing guides
- `devops` - DevOps and infrastructure
- `language` - Language learning resources
- `develop` - General development topics

## 🎨 Customization

### Site Configuration

Edit `_config.yml` to customize:

- Site title, subtitle, and description
- Author information
- Social media links
- Navigation menu
- Work experience and education
- Projects showcase
- Comments system
- Analytics and tracking

### Styling

- Main styles are in `_sass/`
- Custom CSS can be added to `assets/css/`
- The theme uses a responsive design system

## 🚢 Deployment

This site automatically deploys to GitHub Pages using GitHub Actions.

### Deployment Strategy

The deployment target is controlled by the `DEPLOY_STRATEGY` file:
- `gh-pages` - Deploy to GitHub Pages (current setting)
- `firebase` - Deploy to Firebase Hosting
- `none` - No automatic deployment

### Manual Deployment

To manually build and deploy:

```bash
# Build the site
bundle exec jekyll build

# The built site will be in the ./build directory
```

## 🐳 Docker Support

### Using Docker

Build and run the site in a Docker container:

```bash
# Build the image
docker build -t ndchungict-blog .

# Run the container
docker run -d -p 4000:4000 -it \
  --volume="$PWD:/srv/jekyll" \
  --name "my_blog" \
  ndchungict-blog:latest jekyll serve --watch
```

### Using Docker Compose

**Development mode:**
```bash
docker-compose -f docker-compose-dev.yml up --build --remove-orphans
```

**Production mode:**
```bash
docker-compose -f docker-compose-prod.yml up --build --remove-orphans
```

## 📊 Content Statistics

- **Total Posts:** 27 articles
- **Categories:** Automation, DevOps, Language Learning
- **Languages:** Vietnamese (primary), with English and Chinese content
- **Topics Covered:**
  - Cypress automation testing
  - Docker and containerization
  - Git workflows
  - TOEIC vocabulary
  - HSK Chinese grammar

## 🤝 Contributing

While this is a personal blog, suggestions and corrections are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -am 'Add some improvement'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Open a Pull Request

## 📧 Contact

- **Email:** [ndchungict@gmail.com](mailto:ndchungict@gmail.com)
- **Website:** [https://chungnd.id.vn](https://chungnd.id.vn)
- **GitHub:** [@ndchungict](https://github.com/ndchungict)
- **Facebook:** [ndchungict](https://facebook.com/ndchungict)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

The theme is based on [Devlopr Jekyll](https://github.com/sujaykundu777/devlopr-jekyll) by Sujay Kundu, also under MIT License.

## 🙏 Acknowledgments

- **Theme:** [Devlopr Jekyll](https://github.com/sujaykundu777/devlopr-jekyll) by Sujay Kundu
- **Hosting:** [GitHub Pages](https://pages.github.com/)
- **Static Site Generator:** [Jekyll](https://jekyllrb.com/)
- **Icons:** [Font Awesome](https://fontawesome.com/)

---

**Built with ❤️ by Nguyen Duc Chung**

*Last updated: January 2026*
