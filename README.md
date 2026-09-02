# jessedupuy.me

> My personal website and blog - built with Astro, optimized for performance, and designed for simplicity.

**🌐 Live Site**: [jessedupuy.me](https://jessedupuy.me)

---

## 📋 About

This is the source code for my personal website featuring a blog, project recommendations, and experimental interactive pages. The site is built with modern web technologies and follows best practices for performance, accessibility, and SEO.

## ✨ Features

- 📝 **Blog** with Markdown support and syntax highlighting
- 🎨 **Dark/Light theme** toggle with localStorage persistence
- 📱 **Fully responsive** design
- ♿ **Accessible** with WCAG compliance
- ⚡ **Blazing fast** with perfect Lighthouse scores
- 🔍 **SEO optimized** with structured data
- 📊 **Interactive experiments** (Calendar of Life, Time Tracker)
- 🏷️ **Tag-based** content organization
- 📰 **RSS feed** for blog updates
- 🎯 **Draft post support** for work-in-progress content

## 🛠️ Tech Stack

- **Framework**: [Astro](https://astro.build) 5.7+
- **UI Components**: Preact
- **Styling**: Vanilla CSS with custom properties
- **Syntax Highlighting**: [Shiki](https://shiki.style/)
- **Content**: Markdown with frontmatter
- **Build**: Static site generation (SSG)
- **Deployment**: [Your hosting platform]

## 🚀 Performance

All pages achieve perfect 100/100 scores across all Lighthouse categories:

- ⚡ **Performance**: 100/100
- ♿ **Accessibility**: 100/100
- 🎯 **Best Practices**: 100/100
- 🔍 **SEO**: 100/100

**Core Web Vitals**:
- FCP: ~860ms
- LCP: ~950ms
- CLS: 0.000
- TBT: 0ms

## 📦 Project Structure

```
jessedupuy/
├── public/              # Static assets (icons, images)
├── src/
│   ├── components/      # Reusable UI components
│   ├── content/         # Blog posts and content collections
│   │   └── posts/       # Blog post markdown files
│   ├── data/            # JSON data files (recommendations)
│   ├── images/          # Optimized images
│   ├── layouts/         # Page layouts
│   ├── pages/           # Route pages (file-based routing)
│   │   ├── experiments/ # Interactive experiments
│   │   ├── posts/       # Dynamic blog post routes
│   │   └── tags/        # Tag archive pages
│   ├── scripts/         # Client-side JavaScript
│   └── styles/          # Global CSS
├── astro.config.mjs     # Astro configuration
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## 🎨 Blog Features

The blog supports rich Markdown with enhanced styling:

- **Code blocks** with syntax highlighting (JavaScript, Python, CSS, Bash, etc.)
- **Callout boxes** for tips, warnings, and notes
- **Tables** with zebra striping and responsive design
- **Task lists** with custom checkbox styling
- **Definition lists** for glossaries
- **Blockquotes** with accent styling
- **Hero images** with responsive breakout design
- **Draft posts** that are hidden in production

See the [markdown-guide-test.md](src/content/posts/markdown-guide-test.md) template for all available features.

## 🏃 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/blindside85/jessedupuy.git
cd jessedupuy

# Install dependencies
npm install

# Start development server
npm run dev
# or
npm start
```

Visit `http://localhost:4321` to see the site locally.

### Available Commands

```bash
npm run dev       # Start dev server (localhost:4321)
npm run build     # Build for production
npm run preview   # Preview production build
```

## 📝 Writing Blog Posts

Create a new post in `src/content/posts/`:

```markdown
---
title: 'Your Post Title'
pubDate: 2025-11-08
description: 'SEO-friendly description'
author: 'Jesse'
tags: ["tag1", "tag2"]
draft: false  # Set to true to hide in production
image:
  url: 'https://example.com/image.jpg'
  alt: 'Image description'
---

Your content here...
```

Posts automatically appear in:
- Writing listing (`/writing`)
- Tag archives (`/tags/[tag]`)
- RSS feed (`/rss.xml`)
- Sitemap

### Posts with images

For a post that includes screenshots or other local images, use a folder instead of a single file, with the post itself named `index.md` and images alongside it:

```
src/content/posts/
  my-post/
    index.md
    screenshot.png
```

Reference the image with a relative path in the markdown body — Astro automatically optimizes it (resizing, format conversion, `width`/`height`, lazy loading):

```markdown
![A description of the screenshot](./screenshot.png)
```

The folder name becomes the post's URL slug (`my-post/index.md` → `/posts/my-post/`), same as a flat `my-post.md` would.

### Writing in Obsidian

Blog posts live in `src/content/posts/`, which is symlinked into a dedicated Obsidian vault at `~/Documents/jessedupuy-blog` (the `posts` folder inside that vault is the symlink). The vault has `useMarkdownLinks` enabled so pasted images use standard `![](./image.png)` syntax instead of Obsidian's `![[wikilink]]` embeds, and new attachments save into the same folder as the note they're pasted into — matching the co-located image convention above.

To publish: open the vault, write the post inside `posts/` (as a folder if it has images, per above), set `draft: false` when ready, then commit and push via the [Obsidian Git](https://github.com/denolehov/obsidian-git) plugin's "Commit and push" command. Pushing to `main` auto-deploys.

## 🎯 Recent Updates

### v1.2.0 - Blog Template & Enhanced Styling
- Comprehensive blog post template with all Markdown features
- Enhanced hero image styling with responsive breakout
- Styled code blocks with Shiki integration
- Callout boxes (tip, warning, note)
- Beautiful table, task list, and definition list styling
- Draft post support

### v1.1.0 - Performance & Accessibility
- Perfect 100/100 Lighthouse scores achieved
- Comprehensive accessibility improvements
- Performance optimizations
- JSON-LD structured data
- Skip links and ARIA labels

### v1.0.0 - Initial Release
- Astro 5 migration
- Blog with Markdown support
- Dark/light theme toggle
- Responsive design
- Interactive experiments

See [Releases](https://github.com/blindside85/jessedupuy/releases) for full changelog.

## 🤝 Contributing

This is a personal project, but if you notice any bugs or have suggestions, feel free to open an issue!

## 📄 License

Copyright © 2026 Jesse Dupuy. All rights reserved.

---

**Built with** ❤️ **and** ☕ **by Jesse Dupuy**
