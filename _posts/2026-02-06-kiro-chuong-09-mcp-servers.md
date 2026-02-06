---
layout: post
title: "[AI] MCP Servers - Tích Hợp Công Cụ"
summary: "Hướng dẫn về Model Context Protocol (MCP) - giao thức cho phép Kiro kết nối với các servers bên ngoài để truy cập tools và data sources"
author: chungnd
date: '2026-02-06 10:00:00 +0700'
category: ['ai','kiro']
series: "huong-dan-su-dung-kiro"
thumbnail: /assets/post_images/it/post-img-laptop-code.png
keywords: mcp servers, model context protocol, aws mcp, terraform mcp, kiro integration
permalink: /huong-dan-su-dung-kiro/mcp-servers-tich-hop-cong-cu
usemathjax: false
---

# Chương 9: MCP Servers - Tích Hợp Công Cụ

## Tóm Tắt

Model Context Protocol (MCP) là giao thức cho phép Kiro kết nối với các servers bên ngoài để truy cập tools, data sources và specialized knowledge. MCP servers mở rộng khả năng của Kiro vượt xa việc chỉ generate code.

## MCP Là Gì?

MCP = Model Context Protocol

```
Kiro ←→ MCP Protocol ←→ MCP Servers ←→ External Services
```

**MCP Server có thể:**
- Đọc documentation (AWS Docs, Terraform Docs)
- Gọi APIs (AWS API, GitHub API)
- Thực thi commands (Terraform, AWS CLI)
- Truy cập databases
- Generate diagrams
- Calculate costs

## Tại Sao Cần MCP Servers?

### Không Có MCP
```
Bạn: "Tạo Lambda function theo AWS best practices"
Kiro: *Dựa vào kiến thức training data (có thể outdated)*
```

### Có MCP
```
Bạn: "Tạo Lambda function theo AWS best practices"
Kiro: *Query AWS Documentation MCP server*
      *Đọc latest Lambda docs*
      *Áp dụng current best practices*
      *Tạo code với latest features*
```

## AWS MCP Servers

### 1. AWS Documentation Server

**Chức năng:**
- Search AWS documentation
- Read service guides
- Get recommendations
- Access latest updates

**Installation:**
```json
{
  "mcpServers": {
    "aws-docs": {
      "command": "uvx",
      "args": ["awslabs.aws-documentation-mcp-server@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

**Use Cases:**
```
"Search AWS docs for Lambda best practices"
"How to configure API Gateway CORS?"
"Latest features in DynamoDB"
```

### 2. AWS Knowledge Server

**Chức năng:**
- AI-powered AWS knowledge
- Service recommendations
- Architecture patterns
- Troubleshooting help

**Installation:**
```json
{
  "mcpServers": {
    "aws-knowledge": {
      "command": "uvx",
      "args": [
        "mcp-proxy",
        "--transport",
        "streamablehttp",
        "https://knowledge-mcp.global.api.aws"
      ],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      }
    }
  }
}
```

**Use Cases:**
```
"Recommend AWS services for real-time chat app"
"Best architecture for high-traffic API"
"How to optimize Lambda cold starts?"
```

### 3. AWS API Server

**Chức năng:**
- Execute AWS CLI commands
- Query AWS resources
- Manage AWS services
- Get account information

**Installation:**
```json
{
  "mcpServers": {
    "aws-api": {
      "command": "uvx",
      "args": ["awslabs.aws-api-mcp-server@latest"],
      "env": {
        "AWS_PROFILE": "default",
        "AWS_REGION": "us-east-1"
      }
    }
  }
}
```

**Use Cases:**
```
"List all Lambda functions in my account"
"Get S3 bucket configuration"
"Check DynamoDB table status"
```

### 4. AWS Terraform Server

**Chức năng:**
- Search Terraform AWS provider docs
- Execute Terraform commands
- Run Checkov security scans
- Validate configurations

**Installation:**
```json
{
  "mcpServers": {
    "aws-terraform": {
      "command": "uvx",
      "args": ["awslabs.terraform-mcp-server@latest"],
      "autoApprove": ["SearchAwsProviderDocs"]
    }
  }
}
```

**Use Cases:**
```
"Search Terraform docs for Lambda resource"
"Run terraform plan"
"Scan infrastructure for security issues"
```

### 5. AWS CDK Server

**Chức năng:**
- CDK documentation
- Generate CDK stacks
- CDK best practices
- Construct library search

**Installation:**
```json
{
  "mcpServers": {
    "aws-cdk": {
      "command": "uvx",
      "args": ["awslabs.cdk-mcp-server@latest"]
    }
  }
}
```

**Use Cases:**
```
"Generate CDK stack for API Gateway + Lambda"
"Search CDK constructs for S3"
"CDK best practices for multi-stack apps"
```

### 6. AWS Serverless Server

**Chức năng:**
- SAM template guidance
- Deploy serverless apps
- Get CloudWatch metrics
- Search EventBridge schemas

**Installation:**
```json
{
  "mcpServers": {
    "aws-serverless": {
      "command": "uvx",
      "args": ["awslabs.aws-serverless-mcp-server@latest"]
    }
  }
}
```

**Use Cases:**
```
"Create SAM template for REST API"
"Deploy serverless application"
"Get Lambda function metrics"
```

### 7. AWS Diagram Server

**Chức năng:**
- Generate architecture diagrams
- Create flow charts
- Sequence diagrams
- Use official AWS icons

**Installation:**
```json
{
  "mcpServers": {
    "aws-diagram": {
      "command": "uvx",
      "args": ["awslabs.aws-diagram-mcp-server"],
      "autoApprove": [
        "get_diagram_examples",
        "list_icons",
        "generate_diagram"
      ]
    }
  }
}
```

**Use Cases:**
```
"Generate architecture diagram for my serverless app"
"Create sequence diagram for user authentication flow"
"List available AWS icons"
```

**Output formats:**
- PNG image
- Draw.io XML (editable)

### 8. AWS Pricing Server

**Chức năng:**
- Calculate AWS costs
- Compare regions
- Analyze Terraform/CDK projects
- Generate cost reports

**Installation:**
```json
{
  "mcpServers": {
    "aws-pricing": {
      "command": "uvx",
      "args": ["awslabs.aws-pricing-mcp-server@latest"],
      "env": {
        "AWS_PROFILE": "default",
        "AWS_REGION": "us-east-1"
      },
      "autoApprove": ["get_pricing_service_codes"]
    }
  }
}
```

**Use Cases:**
```
"Calculate cost for my Terraform infrastructure"
"Compare Lambda pricing in us-east-1 vs eu-west-1"
"Estimate monthly cost for 1M API requests"
```

### 9. AWS Core Server

**Chức năng:**
- Prompt understanding
- Translate to AWS services
- Service recommendations
- Architecture guidance

**Installation:**
```json
{
  "mcpServers": {
    "aws-core": {
      "command": "uvx",
      "args": ["awslabs.core-mcp-server@latest"]
    }
  }
}
```

## Other MCP Servers

### Fetch Server

**Chức năng:**
- Fetch web content
- Read documentation
- Access public APIs

**Installation:**
```json
{
  "mcpServers": {
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"]
    }
  }
}
```

**Use Cases:**
```
"Fetch latest React documentation"
"Read API documentation from URL"
```

### GitHub Server

**Chức năng:**
- Search repositories
- Read issues/PRs
- Access code
- Repository information

**Installation:**
```json
{
  "mcpServers": {
    "github": {
      "command": "uvx",
      "args": ["mcp-server-github"],
      "env": {
        "GITHUB_TOKEN": "your-token"
      }
    }
  }
}
```

### Filesystem Server

**Chức năng:**
- Read/write files
- Directory operations
- File search

**Installation:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "uvx",
      "args": ["mcp-server-filesystem", "/allowed/path"]
    }
  }
}
```

## Cấu Hình MCP Servers

### User Config (Global)

**Location:** `~/.kiro/settings/mcp.json`

```json
{
  "mcpServers": {
    "aws-docs": {
      "command": "uvx",
      "args": ["awslabs.aws-documentation-mcp-server@latest"],
      "disabled": false
    }
  }
}
```

**Khi nào dùng:**
- MCP servers dùng cho tất cả projects
- Personal tools và preferences

### Workspace Config (Per Project)

**Location:** `.kiro/settings/mcp.json`

```json
{
  "mcpServers": {
    "aws-terraform": {
      "command": "uvx",
      "args": ["awslabs.terraform-mcp-server@latest"]
    },
    "aws-pricing": {
      "command": "uvx",
      "args": ["awslabs.aws-pricing-mcp-server@latest"]
    }
  }
}
```

**Khi nào dùng:**
- Project-specific MCP servers
- Team shared configuration
- Commit vào Git

### Config Precedence

```
User Config < Workspace1 < Workspace2 < ...
```

Workspace config override user config.

## Complete MCP Config Example

```json
{
  "mcpServers": {
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"],
      "env": {},
      "disabled": false,
      "autoApprove": []
    },
    "aws-docs": {
      "command": "uvx",
      "args": ["awslabs.aws-documentation-mcp-server@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false,
      "autoApprove": []
    },
    "aws-core": {
      "command": "uvx",
      "args": ["awslabs.core-mcp-server@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false,
      "autoApprove": []
    },
    "aws-api": {
      "command": "uvx",
      "args": ["awslabs.aws-api-mcp-server@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR",
        "AWS_PROFILE": "default",
        "AWS_REGION": "us-east-1"
      },
      "disabled": false,
      "autoApprove": []
    },
    "aws-knowledge": {
      "command": "uvx",
      "args": [
        "mcp-proxy",
        "--transport",
        "streamablehttp",
        "https://knowledge-mcp.global.api.aws"
      ],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false,
      "autoApprove": []
    },
    "aws-cdk": {
      "command": "uvx",
      "args": ["awslabs.cdk-mcp-server@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false,
      "autoApprove": []
    },
    "aws-terraform": {
      "command": "uvx",
      "args": ["awslabs.terraform-mcp-server@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false,
      "autoApprove": ["SearchAwsProviderDocs"]
    },
    "aws-serverless": {
      "command": "uvx",
      "args": ["awslabs.aws-serverless-mcp-server@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false,
      "autoApprove": []
    },
    "aws-diagram": {
      "command": "uvx",
      "args": ["awslabs.aws-diagram-mcp-server"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false,
      "autoApprove": [
        "get_diagram_examples",
        "list_icons",
        "generate_diagram"
      ]
    },
    "aws-pricing": {
      "command": "uvx",
      "args": ["awslabs.aws-pricing-mcp-server@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR",
        "AWS_PROFILE": "default",
        "AWS_REGION": "us-east-1"
      },
      "disabled": false,
      "autoApprove": ["get_pricing_service_codes"]
    }
  }
}
```

## Auto-Approve Tools

Một số MCP tools cần approval mỗi lần chạy. Dùng `autoApprove` để tự động approve:

```json
{
  "mcpServers": {
    "aws-terraform": {
      "autoApprove": [
        "SearchAwsProviderDocs",
        "SearchAwsccProviderDocs"
      ]
    },
    "aws-diagram": {
      "autoApprove": [
        "get_diagram_examples",
        "list_icons",
        "generate_diagram"
      ]
    }
  }
}
```

**Lưu ý:** Chỉ auto-approve tools an toàn (read-only).

## Quản Lý MCP Servers

### List MCP Servers

```
Command Palette → MCP: List Servers
```

Hoặc trong chat:
```
"List MCP servers"
```

### Reconnect Server

```
Command Palette → MCP: Reconnect Server
```

Servers tự động reconnect khi:
- Config thay đổi
- Server bị disconnect

### Disable Server

```json
{
  "mcpServers": {
    "aws-docs": {
      "disabled": true
    }
  }
}
```

### View Server Logs

```
View → Output → Select MCP server
```

## Sử Dụng MCP Servers

### Implicit Usage

Kiro tự động sử dụng MCP servers khi cần:

```
Bạn: "Tạo Lambda function với best practices"
Kiro: *Automatically queries AWS Docs MCP server*
      *Reads Lambda documentation*
      *Generates code with best practices*
```

### Explicit Usage

```
"Use AWS Docs MCP to search for Lambda layers"
"Query AWS API to list my S3 buckets"
"Generate architecture diagram with AWS Diagram MCP"
```

### Testing MCP Tools

```
# Test AWS Docs
"Search AWS documentation for 'Lambda environment variables'"

# Test AWS API
"List Lambda functions in my account"

# Test Terraform
"Search Terraform AWS provider for 'aws_lambda_function'"

# Test Diagram
"Generate simple architecture diagram with Lambda and API Gateway"

# Test Pricing
"Calculate cost for Lambda with 1M requests per month"
```

## Best Practices

### 1. Workspace-Specific Config

```json
// .kiro/settings/mcp.json (commit to Git)
{
  "mcpServers": {
    "aws-terraform": { ... },
    "aws-pricing": { ... }
  }
}
```

**Lợi ích:**
- Team có cùng MCP servers
- Consistent results
- Easy onboarding

### 2. Environment Variables

```json
{
  "mcpServers": {
    "aws-api": {
      "env": {
        "AWS_PROFILE": "dev",  // Use dev profile
        "AWS_REGION": "us-east-1"
      }
    }
  }
}
```

### 3. Auto-Approve Carefully

```json
// ✅ Good: Read-only tools
"autoApprove": ["SearchAwsProviderDocs", "list_icons"]

// ❌ Bad: Destructive tools
"autoApprove": ["delete_resource", "modify_infrastructure"]
```

### 4. Log Level

```json
{
  "env": {
    "FASTMCP_LOG_LEVEL": "ERROR"  // Reduce noise
  }
}
```

Options: `DEBUG`, `INFO`, `WARNING`, `ERROR`

### 5. Disable Unused Servers

```json
{
  "mcpServers": {
    "unused-server": {
      "disabled": true
    }
  }
}
```

Giảm resource usage.

## Troubleshooting

### MCP Server Không Kết Nối

**Kiểm tra uvx:**
```bash
uvx --version
```

**Cài đặt lại uv:**
```bash
pip install --upgrade uv
```

**Test server manually:**
```bash
uvx awslabs.aws-documentation-mcp-server@latest
```

### Server Chạy Chậm

**Giảm log level:**
```json
{
  "env": {
    "FASTMCP_LOG_LEVEL": "ERROR"
  }
}
```

**Disable unused servers:**
```json
{
  "disabled": true
}
```

### AWS Credentials Issues

**Kiểm tra credentials:**
```bash
aws sts get-caller-identity
```

**Set profile:**
```json
{
  "env": {
    "AWS_PROFILE": "your-profile"
  }
}
```

### Server Không Được Gọi

**Kiểm tra:**
1. Server có enabled không?
2. Config có đúng format?
3. Kiro có detect use case không?

**Force usage:**
```
"Use AWS Docs MCP server to search for Lambda"
```

## Advanced Patterns

### Multiple AWS Profiles

```json
{
  "mcpServers": {
    "aws-api-dev": {
      "command": "uvx",
      "args": ["awslabs.aws-api-mcp-server@latest"],
      "env": {
        "AWS_PROFILE": "dev"
      }
    },
    "aws-api-prod": {
      "command": "uvx",
      "args": ["awslabs.aws-api-mcp-server@latest"],
      "env": {
        "AWS_PROFILE": "prod"
      }
    }
  }
}
```

### Custom MCP Server

```json
{
  "mcpServers": {
    "my-custom-server": {
      "command": "node",
      "args": ["/path/to/server.js"],
      "env": {
        "API_KEY": "your-key"
      }
    }
  }
}
```

### Conditional MCP Servers

```json
// Development only
{
  "mcpServers": {
    "dev-tools": {
      "command": "uvx",
      "args": ["dev-mcp-server"],
      "disabled": false  // Set to true in production
    }
  }
}
```

## Tạo Custom MCP Server

### Basic Structure

```typescript
// server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'my-custom-server',
  version: '1.0.0'
});

// Define tools
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'my_tool',
      description: 'Does something useful',
      inputSchema: {
        type: 'object',
        properties: {
          input: { type: 'string' }
        }
      }
    }
  ]
}));

// Handle tool calls
server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'my_tool') {
    // Tool logic here
    return {
      content: [
        {
          type: 'text',
          text: 'Tool result'
        }
      ]
    };
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

## Kết Luận

MCP Servers mở rộng Kiro với:
- 📚 Access to latest documentation
- 🔧 Execute commands và tools
- 🌐 Connect to external services
- 📊 Generate diagrams và reports
- 💰 Calculate costs

**Tips:**
- Setup workspace-specific MCP config
- Auto-approve safe tools
- Test MCP servers trước khi dùng
- Monitor server logs
- Keep servers updated

---

**Chương tiếp theo**: [Dự Án Đầu Tiên](./10-du-an-dau-tien.md)

---

*Bài viết được viết bằng AI 🚀*
