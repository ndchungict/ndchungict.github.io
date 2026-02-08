---
layout: post
title: "[AI] Troubleshooting Kiro"
summary: "Hướng dẫn giải quyết các vấn đề thường gặp khi sử dụng Kiro, từ installation, configuration đến runtime issues"
author: leo
date: '2026-02-06 10:00:00 +0700'
category: ['ai','kiro']
series: "huong-dan-su-dung-kiro"
thumbnail: /assets/post_images/it/post-img-laptop-code.png
keywords: kiro troubleshooting, kiro errors, kiro debugging, kiro issues, kiro problems
permalink: /huong-dan-su-dung-kiro/troubleshooting
usemathjax: false
---

# Chương 20: Troubleshooting

## Tóm Tắt

Hướng dẫn giải quyết các vấn đề thường gặp khi sử dụng Kiro, từ installation, configuration, đến runtime issues và performance problems.

## Installation Issues

### Kiro Không Khởi Động

**Triệu chứng:**
```
Kiro crashes on startup
Error: Cannot find module...
```

**Giải pháp:**

```bash
# 1. Xóa cache
rm -rf ~/.kiro/cache
rm -rf ~/.kiro/logs

# 2. Reset settings
rm -rf ~/.kiro/settings

# 3. Reinstall
# macOS
brew uninstall kiro
brew install kiro

# Windows
winget uninstall Amazon.Kiro
winget install Amazon.Kiro

# Linux
sudo apt remove kiro
sudo apt install kiro

# 4. Start with reset flag
kiro --reset
```

### Permission Errors (Linux/macOS)

**Triệu chứng:**
```
EACCES: permission denied
```

**Giải pháp:**

```bash
# Fix .kiro directory permissions
chmod -R 755 ~/.kiro

# Fix workspace permissions
chmod -R 755 .kiro/

# If using sudo (not recommended)
sudo chown -R $USER:$USER ~/.kiro
```

### Missing Dependencies

**Triệu chứng:**
```
Error: Python not found
Error: Git not found
```

**Giải pháp:**

```bash
# Install Python
# macOS
brew install python3

# Ubuntu/Debian
sudo apt install python3 python3-pip

# Windows
winget install Python.Python.3

# Install Git
# macOS
brew install git

# Ubuntu/Debian
sudo apt install git

# Windows
winget install Git.Git

# Verify installations
python3 --version
git --version
```

## MCP Server Issues

### MCP Server Không Kết Nối

**Triệu chứng:**
```
MCP server failed to start
Connection timeout
```

**Giải pháp:**

```bash
# 1. Check uvx installation
uvx --version

# 2. Reinstall uv
pip install --upgrade uv

# 3. Test MCP server manually
uvx awslabs.aws-documentation-mcp-server@latest

# 4. Check logs
# View → Output → Select MCP server

# 5. Restart MCP servers
# Command Palette → MCP: Reconnect All Servers
```

### MCP Server Chạy Chậm

**Giải pháp:**

```json
// .kiro/settings/mcp.json
{
  "mcpServers": {
    "aws-docs": {
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"  // Reduce logging
      }
    }
  }
}
```

### AWS Credentials Issues

**Triệu chứng:**
```
AWS credentials not found
Access denied
```

**Giải pháp:**

```bash
# 1. Configure AWS CLI
aws configure

# 2. Verify credentials
aws sts get-caller-identity

# 3. Set profile in MCP config
{
  "mcpServers": {
    "aws-api": {
      "env": {
        "AWS_PROFILE": "your-profile",
        "AWS_REGION": "us-east-1"
      }
    }
  }
}

# 4. Check credentials file
cat ~/.aws/credentials
cat ~/.aws/config
```

## Specs Issues

### Kiro Không Generate Design

**Triệu chứng:**
- Click "Refine" nhưng không có gì xảy ra
- Design.md trống

**Giải pháp:**

```markdown
# 1. Check requirements.md có đủ chi tiết không
# Cần có:
- User stories với acceptance criteria
- Non-functional requirements
- Clear descriptions

# 2. Check steering files
# Đảm bảo có:
- tech.md với tech stack
- architecture.md với patterns

# 3. Retry với explicit prompt
"Generate design document based on requirements.md and steering files"

# 4. Check Kiro logs
# View → Output → Kiro
```

### Tasks Không Match Requirements

**Giải pháp:**

```markdown
# 1. Update requirements.md
# Make requirements more specific

# 2. Regenerate design
# Click "Refine" in Design tab

# 3. Regenerate tasks
# Click "Refine" in Tasks tab

# 4. Manual review và adjust
# Edit tasks.md directly if needed
```

### Autopilot Stuck

**Triệu chứng:**
- Autopilot không tiến triển
- Stuck on một task

**Giải pháp:**

```
# 1. Stop Autopilot
Click "Stop" button

# 2. Review current task
Check what Kiro is trying to do

# 3. Manual intervention
Complete task manually or provide more context

# 4. Resume Autopilot
Click "Continue" or start next task

# 5. Break down complex tasks
Split large tasks into smaller ones
```

## Steering Issues

### Kiro Không Tuân Thủ Steering

**Triệu chứng:**
- Code không follow quy chuẩn
- Ignore steering guidelines

**Giải pháp:**

```markdown
# 1. Make steering more specific
❌ Bad: "Write clean code"
✅ Good: 
```typescript
// ✅ Good: Use async/await
async function fetchData() {
  return await api.get('/data');
}

// ❌ Bad: Use callbacks
function fetchData(callback) {
  api.get('/data', callback);
}
```

# 2. Add examples
Show good vs bad code

# 3. Use conditional inclusion
---
inclusion: fileMatch
fileMatchPattern: '**/api/**/*.ts'
---

# 4. Check file is in .kiro/steering/
ls -la .kiro/steering/

# 5. Verify frontmatter format
---
inclusion: always
---
```

### Steering Files Conflict

**Triệu chứng:**
- Contradicting guidelines
- Kiro confused

**Giải pháp:**

```markdown
# 1. Review all steering files
grep -r "pattern" .kiro/steering/

# 2. Remove contradictions
# Example conflict:
# tech.md: "Use Redux"
# frontend.md: "Don't use Redux, use Zustand"
# → Choose one!

# 3. Organize by priority
# More specific files override general ones

# 4. Use clear naming
architecture.md → General patterns
api-design.md → API specific
testing.md → Testing specific
```

## Hooks Issues

### Hook Không Chạy

**Triệu chứng:**
- Save file nhưng hook không trigger

**Giải pháp:**

```json
// 1. Check hooks enabled
{
  "kiro.hooks.enabled": true
}

// 2. Check file pattern matches
{
  "patterns": ["src/**/*.ts"]  // Does your file match?
}

// 3. Check hook file format
{
  "name": "Hook Name",
  "version": "1.0.0",
  "when": {
    "type": "fileEdited",
    "patterns": ["**/*.ts"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Run linter"
  }
}

// 4. View hook logs
// View → Output → Kiro Hooks

// 5. Test hook manually
// Right-click hook → Test Hook
```

### Hook Gây Infinite Loop

**Triệu chứng:**
- Hook triggers itself repeatedly
- Kiro becomes unresponsive

**Giải pháp:**

```json
// ❌ Bad: Modifies file → triggers hook again
{
  "when": {
    "type": "fileEdited",
    "patterns": ["**/*.ts"]
  },
  "then": {
    "prompt": "Add comments to this file"  // Modifies file!
  }
}

// ✅ Good: Only reports, doesn't modify
{
  "when": {
    "type": "fileEdited",
    "patterns": ["**/*.ts"]
  },
  "then": {
    "prompt": "Run linter and REPORT issues. Do NOT modify files."
  }
}

// Emergency: Disable hooks
{
  "kiro.hooks.enabled": false
}
```

### Hook Chạy Quá Chậm

**Giải pháp:**

```json
// 1. Use specific patterns
{
  "patterns": [
    "src/**/*.ts",
    "!src/**/*.spec.ts",  // Exclude tests
    "!node_modules/**"    // Exclude dependencies
  ]
}

// 2. Use userTriggered for heavy tasks
{
  "when": {
    "type": "userTriggered"  // Manual trigger
  },
  "then": {
    "prompt": "Run full test suite"
  }
}

// 3. Optimize prompt
❌ "Run all tests and generate coverage report and update docs"
✅ "Run tests for this file only"
```

## Performance Issues

### Kiro Chạy Chậm

**Triệu chứng:**
- Slow response time
- High CPU/memory usage

**Giải pháp:**

```json
// 1. Exclude unnecessary files from indexing
{
  "kiro.indexing.excludePatterns": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.git/**",
    "**/coverage/**",
    "**/*.log",
    "**/*.map"
  ]
}

// 2. Disable unused MCP servers
{
  "mcpServers": {
    "unused-server": {
      "disabled": true
    }
  }
}

// 3. Reduce log level
{
  "env": {
    "FASTMCP_LOG_LEVEL": "ERROR"
  }
}

// 4. Clear cache
rm -rf ~/.kiro/cache

// 5. Restart Kiro
```

### Indexing Mất Nhiều Thời Gian

**Giải pháp:**

```bash
# 1. Check what's being indexed
# View → Output → Kiro Indexing

# 2. Exclude large directories
# Add to .gitignore or settings

# 3. Manual re-index
# Command Palette → Kiro: Re-index Codebase

# 4. Disable auto-indexing temporarily
{
  "kiro.indexing.enabled": false
}
```

## Testing Issues

### Tests Fail Randomly (Flaky Tests)

**Giải pháp:**

```typescript
// 1. Add retries
// playwright.config.ts
export default {
  retries: process.env.CI ? 2 : 0
};

// 2. Add proper waits
// ❌ Bad
await page.click('[data-testid="button"]');

// ✅ Good
await page.locator('[data-testid="button"]').waitFor();
await page.locator('[data-testid="button"]').click();

// 3. Use polling for assertions
await expect(async () => {
  const text = await page.textContent('[data-testid="status"]');
  expect(text).toBe('Success');
}).toPass({ timeout: 10000 });

// 4. Increase timeouts
{
  use: {
    actionTimeout: 10000,
    navigationTimeout: 30000
  }
}

// 5. Fix race conditions
// Wait for network to be idle
await page.waitForLoadState('networkidle');
```

### Test Data Conflicts

**Triệu chứng:**
```
Error: Email already exists
Unique constraint violation
```

**Giải pháp:**

```typescript
// 1. Use unique data
const email = `test-${Date.now()}@example.com`;

// 2. Clean up before each test
beforeEach(async () => {
  await prisma.user.deleteMany();
});

// 3. Use transactions
await prisma.$transaction(async (tx) => {
  // Test code
  throw new Error('Rollback'); // Rollback after test
});

// 4. Use separate test database
DATABASE_URL=postgresql://localhost:5432/test_db
```

### Tests Chạy Chậm

**Giải pháp:**

```typescript
// 1. Run tests in parallel
// playwright.config.ts
export default {
  fullyParallel: true,
  workers: 4
};

// 2. Use test sharding
npx playwright test --shard=1/4

// 3. Mock external services
jest.mock('../services/email-service');

// 4. Use in-memory database for unit tests
// 5. Skip slow tests in development
test.skip('slow test', async () => {
  // ...
});
```

## Git Issues

### Merge Conflicts in Specs

**Giải pháp:**

```bash
# 1. Accept incoming changes for specs
git checkout --theirs .kiro/specs/

# 2. Regenerate design and tasks
# Open spec in Kiro
# Click "Refine" in Design tab
# Click "Refine" in Tasks tab

# 3. Commit resolved specs
git add .kiro/specs/
git commit -m "Resolve spec conflicts"
```

### Large Files in Git

**Triệu chứng:**
```
warning: large files detected
```

**Giải pháp:**

```bash
# 1. Add to .gitignore
echo "test-results/" >> .gitignore
echo "playwright-report/" >> .gitignore
echo "coverage/" >> .gitignore
echo "allure-results/" >> .gitignore
echo "*.log" >> .gitignore

# 2. Remove from Git history
git rm --cached -r test-results/
git commit -m "Remove test results from Git"

# 3. Use Git LFS for large files
git lfs install
git lfs track "*.mp4"
git lfs track "*.png"
```

## Network Issues

### Kiro Không Kết Nối Internet

**Triệu chứng:**
```
Network error
Failed to fetch
```

**Giải pháp:**

```bash
# 1. Check internet connection
ping google.com

# 2. Check proxy settings
echo $HTTP_PROXY
echo $HTTPS_PROXY

# 3. Configure proxy in Kiro
{
  "http.proxy": "http://proxy.company.com:8080",
  "http.proxyStrictSSL": false
}

# 4. Check firewall
# Allow Kiro through firewall

# 5. Try different network
# Switch to different WiFi or use mobile hotspot
```

### API Rate Limiting

**Triệu chứng:**
```
429 Too Many Requests
Rate limit exceeded
```

**Giải pháp:**

```typescript
// 1. Add delays between requests
await new Promise(resolve => setTimeout(resolve, 1000));

// 2. Implement retry with backoff
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
      } else {
        throw error;
      }
    }
  }
}

// 3. Use caching
// Cache API responses to reduce requests
```

## Debug Tips

### Enable Debug Logging

```json
// settings.json
{
  "kiro.logging.level": "debug",
  "kiro.logging.file": true
}
```

### View Logs

```bash
# Kiro logs
tail -f ~/.kiro/logs/kiro.log

# MCP server logs
# View → Output → Select MCP server

# Test logs
cat test-results/test.log
```

### Debug Mode

```bash
# Start Kiro in debug mode
kiro --debug

# Debug specific feature
kiro --debug-specs
kiro --debug-hooks
kiro --debug-mcp
```

### Collect Diagnostic Info

```bash
# Generate diagnostic report
kiro --diagnostics

# Output includes:
# - Kiro version
# - System info
# - Installed extensions
# - MCP servers status
# - Recent errors
```

## Getting Help

### Before Asking for Help

1. ✅ Check this troubleshooting guide
2. ✅ Search in FAQ (Chapter 19)
3. ✅ Check official docs: kiro.dev/docs
4. ✅ Search in Discord/GitHub issues
5. ✅ Collect diagnostic info

### Where to Ask

1. **Discord Community**: Quick help from community
2. **GitHub Issues**: Bug reports và feature requests
3. **Official Support**: support@kiro.dev
4. **Stack Overflow**: Tag with `kiro-ide`

### What to Include

```markdown
## Issue Description
[Clear description of the problem]

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- Kiro version: [version]
- OS: [Windows/macOS/Linux]
- Node version: [version]
- Browser (for E2E): [Chrome/Firefox/Safari]

## Logs
```
[Paste relevant logs]
```

## Screenshots
[If applicable]

## Additional Context
[Any other relevant information]
```

## Kết Luận

Troubleshooting checklist:
- ✅ Check logs first
- ✅ Try basic solutions (restart, clear cache)
- ✅ Search documentation
- ✅ Ask community
- ✅ Report bugs with details

---

**Chương tiếp theo**: [Tài Nguyên Bổ Sung](./21-tai-nguyen.md)

---

*Bài viết được viết bằng AI 🚀*
