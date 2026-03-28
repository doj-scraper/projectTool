# Code Editor PWA

A Progressive Web App code editor with multi-file support, syntax highlighting, split view, terminal, and code execution capabilities.

## Features

### Core Editor
- **Multi-file Support** - Create, rename, and delete multiple files with tab navigation
- **Syntax Highlighting** - Support for 14 languages (JavaScript, TypeScript, Python, HTML, CSS, JSON, XML, Markdown, Go, Rust, YAML, SQL, Shell, Ruby)
- **Auto-save** - All changes persist automatically to localStorage
- **Split View** - Side-by-side editing on desktop, stacked on tablet, pane switcher on mobile

### Developer Tools
- **Command Palette** (Ctrl/Cmd+Shift+P) - Fuzzy search across all commands
- **Terminal** (Ctrl/Cmd+`) - Simulated shell with 7 commands
- **Code Execution** - Run JavaScript with console output, preview HTML
- **File Import/Export** - Drag & drop import, download export

### PWA Features
- **Offline Support** - Works offline after first load
- **Installable** - Add to home screen on mobile and desktop
- **Responsive** - Mobile-first design with breakpoints at 768px and 1024px

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Run linting
bun run lint

# Build for production
bun run build
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + Shift + P | Command Palette |
| Ctrl/Cmd + ` | Toggle Terminal |
| Ctrl/Cmd + Enter | Run Code |

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16.1.1 (Canary) |
| Runtime | React 19 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| State | Zustand 5 |
| Editor | CodeMirror 6 |
| Search | Fuzzysort |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with PWA setup
│   └── page.tsx           # Main editor page
├── components/
│   ├── editor/            # Editor components
│   │   ├── code-editor.tsx
│   │   ├── command-palette.tsx
│   │   ├── file-tabs.tsx
│   │   ├── output-panel.tsx
│   │   ├── terminal.tsx
│   │   └── ...
│   └── ui/                # shadcn/ui components
├── hooks/                  # Custom React hooks
├── store/                  # Zustand store
└── lib/                    # Utilities
```

## Browser Support

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome 121+ | ✅ | ✅ |
| Safari 17+ | ✅ | ⚠️ (iOS keyboard issue) |
| Firefox 122+ | ✅ | ✅ |
| Edge 121+ | ✅ | N/A |

## Known Issues

1. **iOS Keyboard Coverage** - Terminal input may be covered by on-screen keyboard
2. **localStorage Limit** - 5MB storage limit may be exceeded with many files
3. **No Delete Confirmation** - File deletion happens immediately

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and design decisions
- [DEBRIEF.md](./DEBRIEF.md) - Engineering analysis and migration planning
- [worklog.md](./worklog.md) - Development timeline and decisions

## License

MIT
