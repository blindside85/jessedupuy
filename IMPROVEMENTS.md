# Website Improvements Checklist

This document tracks recommended improvements for jessedupuy.me based on analysis of performance, accessibility, SEO, developer experience, and code quality.

---

## 🔴 Phase 1: Quick Wins (1-2 hours)

### Critical Fixes

- [x] **Fix CSS Variable Bug** 🐛
  - **File**: `src/styles/vars.css:13`
  - **Issue**: Invalid CSS variable reference
  - **Current**: `--color-light-accent: --color-dark-gray;`
  - **Fix**: `--color-light-accent: var(--color-dark-gray);`
  - **Completed**: Commit 9b84585

### Security

- [x] **Add Security Attributes to External Links**
  - **Files**:
    - `src/components/Footer.astro:35,48,61`
    - `src/components/Recommendation.astro:59`
  - **Fix**: Add `rel="noopener noreferrer"` to all `target="_blank"` links
  - **Example**: `<a href="..." target="_blank" rel="noopener noreferrer">`
  - **Completed**: Commit [hash]

### SEO Quick Fixes

- [ ] **Fix Blog Post Title SEO Issue**
  - **File**: `src/layouts/MarkdownPostLayout.astro:17`
  - **Issue**: "blog:" prefix in `<title>` tag hurts SEO
  - **Fix**: Keep prefix only in `<h1>`, remove from page title

- [ ] **Add Sitemap Generation**
  - **Install**: `npm install @astrojs/sitemap`
  - **File**: `astro.config.mjs`
  - **Add**:
    ```js
    import sitemap from '@astrojs/sitemap';
    export default defineConfig({
      site: 'https://jessedupuy.me',
      integrations: [sitemap()],
    });
    ```

- [ ] **Update robots.txt**
  - **File**: `public/robots.txt`
  - **Add**: `Sitemap: https://jessedupuy.me/sitemap-index.xml`

### Dependency Cleanup

- [ ] **Remove Unused @astrojs/preact**
  - **Command**: `npm uninstall @astrojs/preact`
  - **File**: `package.json:3`
  - **Reason**: Installed but not used anywhere

---

## 🟡 Phase 2: SEO & Social Media (2-3 hours)

### Meta Tags & Social Sharing

- [ ] **Add Open Graph Meta Tags**
  - **File**: `src/components/HtmlHead.astro`
  - **Add**:
    ```astro
    <meta property="og:title" content={title} />
    <meta property="og:description" content={desc} />
    <meta property="og:url" content={Astro.url} />
    <meta property="og:site_name" content="Jesse Dupuy" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://jessedupuy.me/og-image.png" />
    ```

- [ ] **Add Twitter Card Tags**
  - **File**: `src/components/HtmlHead.astro`
  - **Add**:
    ```astro
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={desc} />
    <meta name="twitter:image" content="https://jessedupuy.me/og-image.png" />
    ```

- [ ] **Add Canonical URLs**
  - **File**: `src/components/HtmlHead.astro`
  - **Add**: `<link rel="canonical" href={Astro.url} />`

- [ ] **Add Author Meta Tag**
  - **File**: `src/components/HtmlHead.astro`
  - **Add**: `<meta name="author" content="Jesse Dupuy" />`

### Structured Data (JSON-LD)

- [ ] **Add Person Schema for Homepage**
  - **File**: `src/pages/index.astro`
  - **Docs**: https://schema.org/Person

- [ ] **Add BlogPosting Schema**
  - **File**: `src/layouts/MarkdownPostLayout.astro`
  - **Docs**: https://schema.org/BlogPosting

- [ ] **Add BreadcrumbList Schema**
  - **File**: `src/components/BaseHeader.astro`
  - **Docs**: https://schema.org/BreadcrumbList

### Social Assets

- [ ] **Create OG Image Template**
  - **Create**: `public/og-image.png` (1200x630px)
  - **Tool**: Use Figma, Canva, or og-image generator

---

## 🟢 Phase 3: Accessibility (2-3 hours)

### ARIA & Labels

- [ ] **Add ARIA Label to Theme Toggle**
  - **File**: `src/components/ThemeIcon.astro:1`
  - **Add**: `<button id="themeToggle" aria-label="Toggle dark mode">`

- [ ] **Add Skip Navigation Link**
  - **Files**: `src/layouts/BaseLayout.astro`, `src/layouts/ErrorLayout.astro`
  - **Add at top of `<body>`**:
    ```astro
    <a href="#main" class="skip-link">Skip to main content</a>
    ```
  - **CSS**: Position off-screen, visible on focus

- [ ] **Add ARIA Current to Active Navigation**
  - **File**: `src/components/BaseHeader.astro`
  - **Add**: `aria-current="page"` to active nav items

### Focus Management

- [ ] **Add Custom Focus Styles**
  - **File**: `src/styles/core.css`
  - **Add**:
    ```css
    :focus-visible {
      outline: 2px solid var(--color-dark-accent);
      outline-offset: 2px;
    }
    ```

---

## 🔵 Phase 4: Performance & Images (2-3 hours)

### Image Optimization

- [ ] **Replace img with Astro Image Component in MarkdownPostLayout**
  - **File**: `src/layouts/MarkdownPostLayout.astro:55`
  - **Replace**:
    ```astro
    import { Image } from 'astro:assets';
    <!-- ... -->
    <Image src={frontmatter.image.url} alt={frontmatter.image.alt} />
    ```

- [ ] **Replace img in Recommendation Component**
  - **File**: `src/components/Recommendation.astro:58`
  - **Note**: May need dynamic imports for JSON-sourced images

- [ ] **Add Image Loading Strategies**
  - **Add**: `loading="lazy"` to below-fold images
  - **Add**: `loading="eager"` to hero/above-fold images

- [ ] **Update Content Schema for Image References**
  - **File**: `src/content/config.ts:10-13`
  - **Change**:
    ```typescript
    import { z, defineCollection, image } from "astro:content";

    image: z.object({
      url: image(),
      alt: z.string()
    }).optional(),
    ```

### Build Optimization

- [ ] **Add Build Configuration**
  - **File**: `astro.config.mjs`
  - **Add**:
    ```js
    export default defineConfig({
      site: 'https://jessedupuy.me',
      build: {
        inlineStylesheets: 'auto',
      },
      compressHTML: true,
    });
    ```

- [ ] **Add Preload for Critical Background Images**
  - **File**: `src/components/HtmlHead.astro`
  - **For**: `natural-white.webp` and `natural-black.webp` used in `core.css`

---

## 🟣 Phase 5: Developer Experience (3-4 hours)

### Code Formatting & Linting

- [ ] **Install and Configure Prettier**
  - **Install**: `npm install -D prettier prettier-plugin-astro`
  - **Create**: `.prettierrc`
    ```json
    {
      "semi": true,
      "trailingComma": "es5",
      "singleQuote": false,
      "printWidth": 80,
      "tabWidth": 2,
      "useTabs": false,
      "plugins": ["prettier-plugin-astro"],
      "overrides": [
        {
          "files": "*.astro",
          "options": { "parser": "astro" }
        }
      ]
    }
    ```

- [ ] **Install and Configure ESLint**
  - **Install**: `npm install -D eslint eslint-plugin-astro`
  - **Create**: `.eslintrc.json`
  - **Docs**: https://github.com/ota-meshi/eslint-plugin-astro

- [ ] **Set Up Git Hooks**
  - **Install**: `npm install -D husky lint-staged`
  - **Init**: `npx husky init`
  - **Configure**: lint-staged in `package.json`

### npm Scripts

- [ ] **Expand package.json Scripts**
  - **File**: `package.json:8-13`
  - **Add**:
    ```json
    "scripts": {
      "dev": "astro dev",
      "build": "astro build",
      "preview": "astro preview",
      "lint": "eslint src --ext .js,.ts,.astro",
      "lint:fix": "eslint src --ext .js,.ts,.astro --fix",
      "format": "prettier --write \"src/**/*.{astro,js,ts,css,md}\"",
      "format:check": "prettier --check \"src/**/*.{astro,js,ts,css,md}\"",
      "check": "astro check && tsc --noEmit",
      "clean": "rm -rf dist .astro"
    }
    ```

### Git Configuration

- [ ] **Create .gitattributes**
  - **Create**: `.gitattributes`
    ```
    * text=auto eol=lf
    *.{png,jpg,jpeg,gif,webp,woff,woff2} binary
    ```

- [ ] **Update .gitignore**
  - **File**: `.gitignore`
  - **Add**:
    ```
    # OS
    .DS_Store
    Thumbs.db

    # IDE
    .vscode/
    .idea/
    *.swp
    *.swo

    # Env
    .env
    .env.local
    ```

### VS Code Integration

- [ ] **Create VS Code Settings**
  - **Create**: `.vscode/settings.json`
  - **Add**: Recommended extensions, formatter settings

- [ ] **Create VS Code Extensions Recommendations**
  - **Create**: `.vscode/extensions.json`
  - **Recommend**: Astro, Prettier, ESLint extensions

---

## 🔷 Phase 6: TypeScript & Type Safety (2-3 hours)

### Type Definitions

- [ ] **Create TypeScript Types for Recommendations**
  - **Create**: `src/types/recommendations.ts`
    ```typescript
    export interface RecommendationItem {
      name: string;
      link: string;
      icon?: string;
      type: string;
      description: string;
    }

    export interface RecommendationSection {
      name: string;
      items: RecommendationItem[];
    }
    ```

- [ ] **Remove `any` Types from recommends.astro**
  - **File**: `src/pages/recommends.astro:43,47`
  - **Import**: Type from `src/types/recommendations.ts`

- [ ] **Add Props Interfaces to Components**
  - **Files**: All `.astro` components
  - **Example**:
    ```astro
    ---
    interface Props {
      title: string;
      desc: string;
    }
    const { title, desc } = Astro.props;
    ---
    ```

### Affected Components
- [ ] `src/components/HtmlHead.astro`
- [ ] `src/components/Recommendation.astro`
- [ ] `src/layouts/BaseLayout.astro`
- [ ] `src/layouts/MarkdownPostLayout.astro`
- [ ] `src/layouts/ErrorLayout.astro`

---

## 🌟 Phase 7: Content Features (4-6 hours)

### Draft Support

- [ ] **Add Draft Field to Content Schema**
  - **File**: `src/content/config.ts`
  - **Add**: `draft: z.boolean().default(false)`

- [ ] **Filter Drafts in Production**
  - **Files**: `src/pages/blog.astro`, `src/pages/posts/[...slug].astro`
  - **Add**:
    ```astro
    const posts = await getCollection("posts", ({ data }) => {
      return import.meta.env.PROD ? !data.draft : true;
    });
    ```

### Blog Enhancements

- [ ] **Add Reading Time Calculation**
  - **Create**: `src/utils/readingTime.ts`
  - **Use**: Display in post layout and blog listing

- [ ] **Add Post Excerpts to Blog Listing**
  - **File**: `src/pages/blog.astro`
  - **Show**: `post.data.description` or auto-generated excerpt

- [ ] **Implement Related Posts**
  - **File**: `src/layouts/MarkdownPostLayout.astro`
  - **Logic**: Find posts with matching tags

- [ ] **Enhance RSS Feed**
  - **File**: `src/pages/rss.xml.js`
  - **Add**: Full post content instead of just description

### Search

- [ ] **Add Search Functionality**
  - **Option 1**: Pagefind (static, no JS required)
  - **Option 2**: Fuse.js (client-side)
  - **Docs**: https://pagefind.app/

---

## 🎨 Phase 8: Code Quality & Refactoring (3-4 hours)

### Component Refactoring

- [ ] **Refactor Duplicate Layout Code**
  - **Files**: `src/layouts/BaseLayout.astro`, `src/layouts/ErrorLayout.astro`
  - **Create**: Shared base layout to reduce duplication

- [ ] **Standardize Prop Passing**
  - **All Components**: Use object shorthand consistently
  - **Prefer**: `{title}` over `title={title}`

- [ ] **Extract Hardcoded Strings**
  - **Create**: `src/constants.ts` or `src/config.ts`
  - **Move**: Site name, social links, etc.

### CSS Improvements

- [ ] **Create Spacing Scale**
  - **File**: `src/styles/vars.css`
  - **Add**:
    ```css
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    ```

- [ ] **Replace Magic Numbers with Variables**
  - **Files**: All CSS files
  - **Replace**: Hardcoded spacing with CSS variables

---

## 🚀 Phase 9: Optional Enhancements

### Analytics & Monitoring

- [ ] **Add Privacy-Friendly Analytics**
  - **Options**: Plausible, Fathom, Umami, or Simple Analytics
  - **Self-hosted**: Consider Umami for full control

- [ ] **Add Web Vitals Tracking**
  - **Install**: `web-vitals` package
  - **Track**: CLS, FID, LCP, FCP, TTFB

### Testing

- [ ] **Set Up Component Tests**
  - **Install**: Vitest
  - **Test**: Component rendering, props handling

- [ ] **Set Up E2E Tests**
  - **Install**: Playwright
  - **Test**: Critical user flows

### Security

- [ ] **Add Content Security Policy**
  - **File**: `astro.config.mjs` or middleware
  - **Docs**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP

### Documentation

- [ ] **Create CHANGELOG.md**
  - **Track**: Version changes and updates

---

## 📝 Notes

### Known Intentional Choices
- Console logging in `BodyTop.astro` (Easter egg) - Consider environment check if desired

### Future Considerations
- Comments system (Giscus, utterances)
- Newsletter integration
- Dark/light mode preference detection improvements
- PWA enhancements (service worker, offline support)

---

## Progress Tracking

**Last Updated**: [Date]

**Phases Completed**: 0/9

**Quick Stats**:
- [ ] Phase 1: Quick Wins (0/6)
- [ ] Phase 2: SEO & Social (0/10)
- [ ] Phase 3: Accessibility (0/4)
- [ ] Phase 4: Performance (0/6)
- [ ] Phase 5: Dev Experience (0/8)
- [ ] Phase 6: TypeScript (0/5+)
- [ ] Phase 7: Content Features (0/8)
- [ ] Phase 8: Code Quality (0/5)
- [ ] Phase 9: Optional (0/5)
