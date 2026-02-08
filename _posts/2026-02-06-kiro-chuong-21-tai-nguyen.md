---
layout: post
title: "[AI] Tài Nguyên Bổ Sung"
summary: "Tổng hợp các tài nguyên hữu ích để học và sử dụng Kiro hiệu quả, bao gồm documentation, tutorials và community resources"
author: leo
date: '2026-02-06 10:00:00 +0700'
category: ['ai','kiro']
series: "huong-dan-su-dung-kiro"
thumbnail: /assets/post_images/it/post-img-laptop-code.png
keywords: kiro resources, kiro documentation, kiro tutorials, kiro community, kiro learning
permalink: /huong-dan-su-dung-kiro/tai-nguyen-bo-sung
usemathjax: false
---

# Chương 21: Tài Nguyên Bổ Sung

## Tóm Tắt

Tổng hợp các tài nguyên hữu ích để học và sử dụng Kiro hiệu quả, bao gồm documentation, tutorials, community resources, tools và learning paths.

## Tài Liệu Chính Thức

### Official Documentation

**Kiro Documentation**
- URL: https://kiro.dev/docs
- Nội dung:
  - Getting Started Guide
  - Feature Documentation
  - API Reference
  - Best Practices
  - Troubleshooting

**Kiro Blog**
- URL: https://kiro.dev/blog
- Nội dung:
  - Feature announcements
  - Use cases
  - Tips and tricks
  - Community highlights

**Changelog**
- URL: https://kiro.dev/changelog
- Theo dõi:
  - New features
  - Bug fixes
  - Breaking changes
  - Deprecations

### GitHub Resources

**Official Repositories**
- Kiro Powers: https://github.com/kirodotdev/powers
- Example Projects: https://github.com/kirodotdev/examples
- Issue Tracker: https://github.com/kirodotdev/kiro/issues

**Community Repositories**
- Awesome Kiro: https://github.com/awesome-kiro/awesome-kiro
- Kiro Templates: https://github.com/kiro-templates
- Kiro Plugins: https://github.com/kiro-plugins

## Learning Resources

### Video Tutorials

**Official YouTube Channel**
- Kiro Getting Started Series
- Feature Deep Dives
- Live Coding Sessions
- Q&A Sessions

**Community Tutorials**
- "Kiro for Beginners" by [Creator]
- "Advanced Kiro Techniques" by [Creator]
- "Building Production Apps with Kiro" by [Creator]

### Written Tutorials

**Beginner Level**
1. "Your First Kiro Project" - kiro.dev/tutorials/first-project
2. "Understanding Specs" - kiro.dev/tutorials/specs
3. "Setting Up Steering Files" - kiro.dev/tutorials/steering

**Intermediate Level**
1. "Advanced Hooks Patterns" - kiro.dev/tutorials/hooks
2. "MCP Server Integration" - kiro.dev/tutorials/mcp
3. "Team Collaboration with Kiro" - kiro.dev/tutorials/collaboration

**Advanced Level**
1. "Creating Custom Powers" - kiro.dev/tutorials/custom-powers
2. "Optimizing Kiro Performance" - kiro.dev/tutorials/performance
3. "Enterprise Kiro Setup" - kiro.dev/tutorials/enterprise

### Interactive Learning

**Kiro Playground**
- URL: https://playground.kiro.dev
- Features:
  - Try Kiro in browser
  - Interactive tutorials
  - Sample projects
  - No installation required

**Kiro Academy**
- URL: https://academy.kiro.dev
- Courses:
  - Kiro Fundamentals
  - Spec-Driven Development
  - Test Automation with Kiro
  - Team Workflows

## Community

### Discord Server

**Kiro Community Discord**
- Invite: https://discord.gg/kiro
- Channels:
  - #general - General discussion
  - #help - Get help
  - #showcase - Share projects
  - #specs - Discuss specs
  - #steering - Steering best practices
  - #hooks - Automation hooks
  - #testing - Test automation
  - #feedback - Product feedback

### Forums và Discussion

**GitHub Discussions**
- URL: https://github.com/kirodotdev/kiro/discussions
- Topics:
  - Q&A
  - Ideas
  - Show and tell
  - General

**Reddit**
- r/KiroIDE
- r/AIAssistedDevelopment

**Stack Overflow**
- Tag: `kiro-ide`
- Tag: `kiro`

### Social Media

**Twitter/X**
- @KiroIDE - Official account
- #KiroIDE - Community hashtag
- #SpecDrivenDev - Methodology hashtag

**LinkedIn**
- Kiro IDE Group
- AI-Assisted Development Group

## Tools và Extensions

### VS Code Extensions (Compatible)

**Essential Extensions**
- GitLens - Git supercharged
- Prettier - Code formatter
- ESLint - JavaScript linter
- Error Lens - Inline errors
- Todo Tree - TODO management

**Testing Extensions**
- Jest Runner - Run Jest tests
- Playwright Test - Playwright integration
- REST Client - API testing

**Productivity Extensions**
- Path Intellisense - Path autocomplete
- Auto Rename Tag - HTML tag renaming
- Bracket Pair Colorizer - Bracket colors
- Better Comments - Comment highlighting

### CLI Tools

**Kiro CLI**
```bash
# Install
npm install -g @kiro/cli

# Commands
kiro init          # Initialize project
kiro spec create   # Create new spec
kiro spec validate # Validate spec
kiro hooks list    # List hooks
kiro hooks test    # Test hook
```

**Helper Scripts**
```bash
# Generate steering from existing code
npx @kiro/generate-steering

# Convert Jira tickets to specs
npx @kiro/jira-to-spec

# Export specs to documentation
npx @kiro/spec-to-docs
```

### Browser Extensions

**Kiro Web Clipper**
- Save web content to specs
- Capture requirements from websites
- Screenshot to spec

**Kiro GitHub Integration**
- View specs in GitHub
- Link PRs to specs
- Spec status in commits

## Templates và Boilerplates

### Project Templates

**Web Applications**
- React + TypeScript + Kiro
- Next.js + Kiro
- Vue.js + Kiro
- Angular + Kiro

**Backend APIs**
- Node.js + Express + Kiro
- NestJS + Kiro
- Python FastAPI + Kiro
- Go + Kiro

**Full Stack**
- MERN Stack + Kiro
- PERN Stack + Kiro
- T3 Stack + Kiro

**Mobile**
- React Native + Kiro
- Flutter + Kiro

### Spec Templates

**Feature Spec Template**
```markdown
# Requirements: [Feature Name]

## User Stories
### US-1: [Title]
**Là** [role]
**Tôi muốn** [action]
**Để** [benefit]

**Acceptance Criteria:**
- WHEN [condition], the system SHALL [behavior]

## Non-Functional Requirements
- Performance: [requirement]
- Security: [requirement]
```

**Bug Fix Spec Template**
```markdown
# Bug Fix: [Bug Title]

## Problem Description
[What's broken]

## Root Cause
[Why it's broken]

## Solution
[How to fix]

## Test Plan
[How to verify fix]
```

**Refactoring Spec Template**
```markdown
# Refactoring: [Component Name]

## Current State
[What needs refactoring]

## Target State
[Desired outcome]

## Refactoring Steps
1. [Step 1]
2. [Step 2]

## Risks
[Potential issues]
```

### Steering Templates

**Tech Stack Template**
```markdown
# Technology Stack

## Languages
- [Language]: [Version]

## Frameworks
- [Framework]: [Purpose]

## Code Standards
[Standards and conventions]

## Preferred Libraries
- For [task]: Use [library]
```

**Testing Template**
```markdown
# Testing Guidelines

## Test Strategy
- Unit: [percentage]%
- Integration: [percentage]%
- E2E: [percentage]%

## Test Structure
[AAA pattern, etc.]

## Coverage Requirements
- Minimum: [percentage]%
```

## Books và Articles

### Recommended Books

**AI-Assisted Development**
- "The AI-Powered Developer" by [Author]
- "Spec-Driven Development" by [Author]
- "Modern Software Engineering" by [Author]

**Testing**
- "The Art of Unit Testing" by Roy Osherove
- "Test-Driven Development" by Kent Beck
- "Growing Object-Oriented Software, Guided by Tests" by Freeman & Pryce

**Software Architecture**
- "Clean Architecture" by Robert C. Martin
- "Domain-Driven Design" by Eric Evans
- "Building Microservices" by Sam Newman

### Must-Read Articles

**Kiro-Specific**
1. "Introducing Kiro: The Future of AI-Assisted Development"
2. "Spec-Driven Development: A New Paradigm"
3. "How Kiro Improves Team Collaboration"

**General Development**
1. "The Twelve-Factor App" - 12factor.net
2. "AWS Well-Architected Framework" - aws.amazon.com/architecture
3. "Google Engineering Practices" - google.github.io/eng-practices

## Conferences và Events

### Kiro Events

**KiroCon**
- Annual conference
- Keynotes, workshops, networking
- Latest features and roadmap

**Kiro Meetups**
- Local meetups worldwide
- Monthly online meetups
- Community presentations

**Webinars**
- Monthly feature webinars
- Q&A sessions
- Guest speakers

### Related Conferences

**AI & Development**
- AI DevWorld
- ML Conference
- AI Summit

**Software Engineering**
- QCon
- GOTO Conference
- DevOps Enterprise Summit

**Testing**
- Selenium Conference
- TestBash
- Automation Guild

## Podcasts

**Kiro-Related**
- "The Kiro Podcast" - Official podcast
- "AI-Assisted Development" - Industry podcast
- "Spec-Driven Dev" - Methodology podcast

**General Development**
- "Software Engineering Daily"
- "The Changelog"
- "Syntax.fm"

## Newsletters

**Kiro Newsletter**
- Weekly updates
- Tips and tricks
- Community highlights
- Subscribe: newsletter@kiro.dev

**Related Newsletters**
- "AI Weekly" - AI news
- "JavaScript Weekly" - JS ecosystem
- "Testing Weekly" - Testing news

## Certification

### Kiro Certifications

**Kiro Certified Developer**
- Level: Beginner
- Topics: Basics, Specs, Steering
- Duration: 2 hours
- Cost: Free

**Kiro Certified Professional**
- Level: Intermediate
- Topics: Advanced features, Team workflows
- Duration: 4 hours
- Cost: $99

**Kiro Certified Architect**
- Level: Advanced
- Topics: Enterprise setup, Custom powers
- Duration: 8 hours
- Cost: $299

### Preparation Resources

**Study Guides**
- Official study guide
- Practice exams
- Sample projects

**Training Courses**
- Kiro Academy courses
- Video tutorials
- Hands-on labs

## Support

### Official Support

**Email Support**
- support@kiro.dev
- Response time: 24-48 hours

**Enterprise Support**
- Dedicated support team
- Priority response
- Custom training

**Bug Reports**
- GitHub Issues
- Include diagnostic info
- Follow issue template

### Community Support

**Discord**
- Real-time help
- Community experts
- Quick responses

**Stack Overflow**
- Tag: kiro-ide
- Searchable Q&A
- Upvote helpful answers

**GitHub Discussions**
- Long-form discussions
- Feature requests
- Best practices

## Contributing

### How to Contribute

**Documentation**
- Fix typos
- Add examples
- Translate docs

**Code**
- Bug fixes
- New features
- Performance improvements

**Community**
- Answer questions
- Write tutorials
- Share projects

**Powers**
- Create new powers
- Improve existing powers
- Share with community

### Contribution Guidelines

1. Read CONTRIBUTING.md
2. Fork repository
3. Create feature branch
4. Make changes
5. Write tests
6. Submit pull request

## Roadmap

### Upcoming Features

**Q1 2026**
- Multi-agent collaboration
- Enhanced MCP protocol
- Visual spec editor

**Q2 2026**
- Mobile app
- Cloud sync
- Team analytics

**Q3 2026**
- AI model selection
- Custom AI training
- Advanced automation

**Q4 2026**
- Enterprise features
- Compliance tools
- Advanced security

## Staying Updated

### Follow Updates

1. ✅ Subscribe to newsletter
2. ✅ Follow on Twitter/X
3. ✅ Join Discord
4. ✅ Watch GitHub repo
5. ✅ Check changelog regularly

### RSS Feeds

- Blog: https://kiro.dev/blog/feed.xml
- Changelog: https://kiro.dev/changelog/feed.xml
- Releases: https://github.com/kirodotdev/kiro/releases.atom

## Kết Luận

Tài nguyên phong phú để học Kiro:
- 📚 Official documentation
- 🎥 Video tutorials
- 👥 Active community
- 🛠️ Tools và templates
- 📖 Books và articles
- 🎓 Certifications

**Next Steps:**
1. Join Discord community
2. Follow official blog
3. Try sample projects
4. Share your experience
5. Contribute back

---

**Chúc bạn thành công với Kiro!** 🚀

---

*Tài liệu này được tổng hợp từ các nguồn công khai về Kiro IDE cho mục đích học tập và nghiên cứu.*

*Phiên bản: 1.0 | Cập nhật: Tháng 1/2026*

---

*Bài viết được viết bằng AI 🚀*
