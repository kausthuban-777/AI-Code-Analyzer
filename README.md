<h1 align="center">AI Code Analyzer</h1>

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178c6?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js->=20.0.0-339933?logo=node.js)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![Electron](https://img.shields.io/badge/Electron-27-47848f?logo=electron)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

> A cross-platform AI-driven code analysis tool that evaluates your entire codebase for quality, security, test coverage, architecture, and alignment with project objectives.

## About

AI Code Analyzer is an intelligent codebase analysis platform that provides comprehensive feedback across multiple dimensions. It runs analysis in an isolated sandbox environment, eliminating security risks while delivering actionable insights. The tool is available on all major platforms.

**Available on:**
- 🌐 **Web Application** – Analyze code directly in your browser
- 🖥️ **Desktop Application** – Windows native app for offline analysis
- 📱 **Browser Extension** – Quick access from GitHub, GitLab, and code repositories

---

## Features

- ✅ Full-project AI-driven analysis
- ✅ Code quality evaluation
- ✅ Security vulnerability detection
- ✅ Test coverage assessment
- ✅ Architecture review
- ✅ Problem statement alignment validation
- ✅ Multi-language support
- ✅ Structured report generation (PDF, Markdown, JSON)
- ✅ Sandbox execution for safety
- ✅ Real-time feedback

## Prerequisites

Before you begin, ensure you have installed:

- **Node.js** >= 20.0.0 ([Download](https://nodejs.org/))
- **pnpm** >= 9.0.0
  ```bash
  npm install -g pnpm
  ```
- **Git** ([Download](https://git-scm.com/))

### Platform-Specific Requirements

| Platform | Requirement |
|----------|-------------|
| Web App | Modern browser (Chrome, Firefox, Safari, Edge) |
| Desktop | Windows 10+ |
| Extension | Chrome/Edge 90+ or Firefox 88+ |

---

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kausthuban-777/AI-Code-Analyzer.git
   cd AI-Code-Analyzer
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

   This command installs all dependencies for all packages in the workspace (web-app, api, desktop, extension, sandbox, shared, ai).

---

## Building

Build all packages for all platforms:

```bash
pnpm build
```

This runs build scripts for all workspace packages.

### Build Individual Platforms

**Web Application:**
```bash
pnpm --filter "@ai-code-analyzer/web-app" build
```
Output: `packages/web-app/dist/`

**Desktop Application:**
```bash
pnpm --filter "@ai-code-analyzer/desktop" build
```
Output: `packages/desktop/dist/` (compiled app) and installer files

**Browser Extension:**
```bash
pnpm --filter "@ai-code-analyzer/extension" build
```
Output: `packages/extension/dist/`

**API Server:**
```bash
pnpm --filter "@ai-code-analyzer/api" build
```
Output: `packages/api/dist/`

**Sandbox Service:**
```bash
pnpm --filter "@ai-code-analyzer/sandbox" build
```
Output: `packages/sandbox/dist/`

---

## Running the Project

### Web Application

**Development:**
```bash
pnpm --filter "@ai-code-analyzer/web-app" run dev
```
Server starts at `http://localhost:5173`

**Production:**
```bash
pnpm --filter "@ai-code-analyzer/web-app" build
# Serve the dist folder with a static server
```

### Desktop Application

**Development:**
```bash
pnpm --filter "@ai-code-analyzer/desktop" run dev
```

**Production:**
```bash
pnpm --filter "@ai-code-analyzer/desktop" build
# Installer and portable executable in packages/desktop/dist/
```

### Browser Extension

**Development (Chrome/Edge):**
1. Build the extension:
   ```bash
   pnpm --filter "@ai-code-analyzer/extension" build
   ```

2. Open Chrome and go to `chrome://extensions/`

3. Enable "Developer mode" (top-right corner)

4. Click "Load unpacked" and select `packages/extension/dist/`

**Development (Firefox):**
1. Build the extension:
   ```bash
   pnpm --filter "@ai-code-analyzer/extension" build
   ```

2. Open Firefox and go to `about:debugging#/runtime/this-firefox`

3. Click "Load Temporary Add-on" and select `packages/extension/dist/manifest.json`

### API Server

**Development:**
```bash
pnpm --filter "@ai-code-analyzer/api" run dev
```
Server starts at `http://localhost:3000`

**Production:**
```bash
pnpm --filter "@ai-code-analyzer/api" build
pnpm --filter "@ai-code-analyzer/api" start
```

---

## Development

### Run All Services (Development Mode)

```bash
pnpm dev
```

This starts all services in parallel:
- Web app dev server
- API server
- Desktop app
- Other services

### Run Tests

```bash
pnpm test
```

Test all packages:

```bash
pnpm test --recursive
```

Test specific package:

```bash
pnpm --filter "@ai-code-analyzer/api" run test
```

### Linting

Check code quality:

```bash
pnpm lint
```

### Code Formatting

Format all code:

```bash
pnpm format
```

Check formatting without changes:

```bash
pnpm format:check
```

---

## Security

Run security audit:

```bash
pnpm security:audit
```

Run full security check (audit + lint):

```bash
pnpm security:check
```

---

## Project Structure

```
ai-code-analyzer/
├── packages/
│   ├── web-app/          # React web application (Vite)
│   ├── desktop/          # Electron desktop app
│   ├── extension/        # Browser extension (Chrome, Firefox)
│   ├── api/              # Express API server
│   ├── sandbox/          # Isolated execution environment
│   ├── ai/               # AI analysis engine
│   └── shared/           # Shared utilities and types
├── infrastructure/       # Docker and Kubernetes configs
├── docker-compose.yml    # Local development setup
└── tsconfig.json         # Root TypeScript config
```

---

## Docker Support

Build and run with Docker:

```bash
docker-compose up
```

This starts all services in containers for local development.

---

## Technology Stack

- **Language:** TypeScript
- **Frontend:** React 18, Vite
- **Desktop:** Electron 27
- **Backend:** Node.js, Express
- **Database:** Azure Cosmos DB
- **Security:** bcryptjs, jsonwebtoken, helmet, cors
- **Testing:** Vitest
- **Package Manager:** pnpm

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Dependencies not installing | Delete `node_modules` and `pnpm-lock.yaml`, then run `pnpm install` |
| Port already in use | Change port in `.env` or kill process on that port |
| TypeScript errors | Run `pnpm build` to check all compilation errors |
| Extension not loading | Ensure manifest.json is valid and extension is built |

---

## Version Roadmap

### V1.0 - Web App Foundation (Current)
**Focus:** Core AI analysis engine + web interface
**Timeline:** 4-6 weeks

**Features:**
- Full-project codebase upload & analysis
- Code quality scoring with ML-powered detection
- Security vulnerability scanning (OWASP)
- Test coverage analysis & gaps
- Architecture & modularity review
- JSON report generation
- Web dashboard with real-time progress
- Sandbox execution environment

**Implementation:**
- AI pipeline: Code parsing → embedding → multi-dimensional analysis
- Backend API: Node.js with modular service architecture
- Frontend: React dashboard with analysis UI & report viewer
- Database: Store analysis results & metadata
- Docker sandbox: Isolated execution for code evaluation

---

### V1.1 - Web App Enhancement (6-8 weeks after V1.0)
**Focus:** Advanced analysis features + export capabilities

**Features:**
- Problem statement alignment validation (differentiator)
- Algorithm complexity analysis
- File structure & modularity scoring
- Accessibility (WCAG) evaluation
- PDF & Markdown report export
- Detailed issue breakdown with actionable fixes
- Analysis history & trending

**Implementation:**
- Enhanced NLP for problem alignment detection
- Rule-based accessibility scanner
- Report generation engine (puppeteer for PDF)
- Analytics dashboard for metric tracking

---

### V1.2 - API & Integrations (8-10 weeks after V1.0)
**Focus:** Third-party integrations & automation

**Features:**
- RESTful API for programmatic analysis
- GitHub/GitLab repository integration
- Webhook support for CI/CD pipelines
- API authentication & rate limiting
- Batch analysis capability
- Custom analysis configurations

**Implementation:**
- OpenAPI documentation
- GitHub Actions integration
- JWT-based authentication
- Queue system for batch processing

---

### V2.0 - Desktop App Launch (12-16 weeks after V1.0)
**Focus:** Native desktop experience with local analysis

**Features:**
- Windows desktop application (Electron)
- Local project analysis (offline-capable)
- Direct file system integration
- Drag-and-drop project loading
- Native OS notifications
- Project management interface
- Analysis results caching

**Implementation:**
- Electron main/renderer architecture
- Native file dialogs & file watching
- Shared analysis engine with web app
- Local storage for offline analysis
- IPC communication for stability

---

### V2.1 - Desktop Advanced (16-20 weeks after V1.0)
**Focus:** Desktop-specific power features

**Features:**
- Version comparison & trending
- Custom analysis rule templates
- Project workspace management
- Diff analysis (before/after)
- IDE-like code viewer
- Keyboard shortcuts & CLI interface

**Implementation:**
- Delta analysis engine
- Rule DSL for customization
- Terminal/CLI wrapper
- Advanced syntax highlighting

---

### V3.0 - Browser Extension (18-24 weeks after V1.0)
**Focus:** Developer workflow integration

**Features:**
- Chrome/Firefox extension
- GitHub/GitLab inline analysis
- Quick scan mode (changed files only)
- Code snippet analysis
- Inline issue highlighting
- One-click full project analysis
- Context menu integration

**Implementation:**
- Extension manifest & background scripts
- Content script injection
- Lightweight analysis worker
- GitHub API integration
- WebWorker for background analysis

---

### V3.1+ - Advanced Features (Post-Launch)
**Future capabilities for sustained growth**

- **AI-Powered Fixes:** Auto-generate code fixes for detected issues
- **Team Collaboration:** Shared analysis, comments, rule voting
- **Smart Profiles:** Custom analysis profiles for different project types
- **ML Recommendations:** Learning from user feedback to improve suggestions
- **Multi-language Support:** Go, Rust, Python, Java, C# analysis
- **Continuous Monitoring:** Watch repositories for continuous analysis
- **IDE Plugins:** VSCode, JetBrains integration
- **Mobile Dashboard:** Mobile-friendly analysis viewer

---

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "feat: add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a pull request

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Support

For issues, questions, or contributions, please open an [issue](https://github.com/kausthuban-777/AI-Code-Analyzer/issues) on GitHub.
