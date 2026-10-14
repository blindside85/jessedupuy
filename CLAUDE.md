# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal website/blog built with Astro 7. The site includes a blog, recommendation pages, and experimental interactive projects. Site URL: https://jessedupuy.me

## Development Commands

```bash
# Start development server
npm run dev
# or
npm start

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### Content Management
- **Blog posts**: Content collections in `src/content/posts/` with frontmatter schema defined in `src/content.config.ts`
  - Schema includes: title, pubDate, description, author, image (optional), tags
  - Posts are rendered via dynamic route at `src/pages/posts/[...slug].astro`
  - RSS feed generated at `src/pages/rss.xml.js`
- **Recommendations**: Data-driven page sourcing from `src/data/recommends.json`
  - Structured as sections with items (icon, name, type, link, description)
  - Rendered on `src/pages/recommends.astro` using the `Recommendation.astro` component

### Routing & Pages
- Standard Astro file-based routing from `src/pages/`
- Dynamic routes:
  - `/posts/[...slug]` - Blog post pages
  - `/tags/[tag]` - Tag archive pages
- Special endpoints:
  - `favicon.ico.ts` - Dynamic favicon generation
  - `manifest.json.ts` - PWA manifest
  - `rss.xml.js` - RSS feed

### Layout System
- `BaseLayout.astro` - Primary layout with header, footer, and main wrapper
  - Automatically prefixes page title with "DEV:" on localhost
- `MarkdownPostLayout.astro` - Layout for blog posts
- `ErrorLayout.astro` - Layout for error pages

### Component Structure
- `BaseHeader.astro` - Site navigation header
- `Footer.astro` - Site footer
- `HtmlHead.astro` - Meta tags and head elements
- `Icons.astro` - SVG icon sprite definitions
- `ThemeIcon.astro` - Dark/light theme toggle with localStorage persistence
- `BodyTop.astro` - Console Easter egg message
- `TagLink.astro` - Blog tag link component
- `Recommendation.astro` - Individual recommendation item display

### Styling
- Global styles in `src/styles/`:
  - `vars.css` - CSS custom properties (color tokens, etc.)
  - `core.css` - Base styles and resets
  - `post.css` - Blog post-specific styles
  - `cal.css` - Calendar experiment styles
- Component styles are scoped within `.astro` files

### Path Aliases
Configured in `tsconfig.json`:
- `@components/*` → `src/components/*`
- `@layouts/*` → `src/layouts/*`
- `@styles/*` → `src/styles/*`
- `@scripts/*` → `src/scripts/*`
- `@data/*` → `src/data/*`
- `@images/*` → `src/images/*`

### Interactive Features
- Theme toggling uses inline script in `ThemeIcon.astro` to avoid FOUC
- Experimental pages in `src/pages/experiments/` use vanilla JS modules from `src/scripts/`
- Console message/Easter egg implemented in `BodyTop.astro`

## Technology Stack
- **Framework**: Astro 7.2.10
- **UI**: Preact components via `@astrojs/preact`
- **Image optimization**: sharp-ico for favicon generation
- **TypeScript**: Strict mode with `astro/tsconfigs/strictest`

## Key Patterns

### Adding a New Blog Post
1. Create `.md` or `.mdx` file in `src/content/posts/`
2. Include required frontmatter matching schema in `src/content.config.ts`
3. Posts automatically appear on blog index and RSS feed

### Adding Recommendations
1. Edit `src/data/recommends.json`
2. Add items to existing sections or create new sections
3. Place icon images in `public/icons/`

### Creating Experiment Pages
1. Add new page in `src/pages/experiments/`
2. Create associated script in `src/scripts/` if interactive
3. Add styles inline or in `src/styles/`


<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:1105d646 -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/core-concepts/sync-concepts.md for details and anti-patterns.

## Agent Context Profiles

The managed Beads block is task-tracking guidance, not permission to override repository, user, or orchestrator instructions.

- **Conservative (default)**: Use `bd` for task tracking. Do not run git commits, git pushes, or Dolt remote sync unless explicitly asked. At handoff, report changed files, validation, and suggested next commands.
- **Minimal**: Keep tool instruction files as pointers to `bd prime`; use the same conservative git policy unless active instructions say otherwise.
- **Team-maintainer**: Only when the repository explicitly opts in, agents may close beads, run quality gates, commit, and push as part of session close. A current "do not commit" or "do not push" instruction still wins.

## Session Completion

This protocol applies when ending a Beads implementation workflow. It is subordinate to explicit user, repository, and orchestrator instructions.

1. **File issues for remaining work** - Create beads for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **Handle git/sync by active profile**:
   ```bash
   # Conservative/minimal/default: report status and proposed commands; wait for approval.
   git status

   # Team-maintainer opt-in only, unless current instructions forbid it:
   git pull --rebase
   git push
   git status
   ```
5. **Hand off** - Summarize changes, validation, issue status, and any blocked sync/commit/push step

**Critical rules:**
- Explicit user or orchestrator instructions override this Beads block.
- Do not commit or push without clear authority from the active profile or the current user request.
- If a required sync or push is blocked, stop and report the exact command and error.
<!-- END BEADS INTEGRATION -->
