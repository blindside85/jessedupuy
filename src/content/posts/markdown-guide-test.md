---
title: 'Complete Markdown Guide: A Template for Every Blog Post'
pubDate: 2025-11-08
description: 'A comprehensive example showcasing every Markdown feature available in this blog, including headings, lists, code blocks, quotes, links, images, and more. Use this as a template for writing future posts.'
author: 'Jesse'
image:
  url: 'https://placehold.co/1200x630/2c3e50/ecf0f1?text=Markdown+Guide'
  alt: 'Markdown formatting examples and syntax guide'
tags: ["blogging", "markdown", "tutorial", "meta"]
draft: true
---

This post serves as both a **comprehensive guide** and a **reusable template** for writing blog posts. It demonstrates every Markdown feature available, from basic text formatting to advanced code blocks and tables.

## Text Formatting Basics

You can make text *italic* using single asterisks or _underscores_.

You can make text **bold** using double asterisks or __double underscores__.

You can even combine them for ***bold and italic*** text.

For inline code, wrap text in backticks like `const greeting = "Hello, World!"`.

## Headings Hierarchy

Headings help organize your content. Here's the complete hierarchy:

### This is a Level 3 Heading

Use h3 for major subsections within an h2 section.

#### This is a Level 4 Heading

Use h4 for sub-subsections when you need more granularity.

##### This is a Level 5 Heading

Rarely used, but available when you need deep nesting.

###### This is a Level 6 Heading

The smallest heading level available in Markdown.

## Lists and Organization

### Unordered Lists

Simple bullet points are great for non-sequential information:

- First item in the list
- Second item in the list
- Third item with some **bold text**
- Fourth item with a [link to Google](https://google.com)

### Ordered Lists

Use numbered lists for sequential steps or ranked items:

1. First step in the process
2. Second step in the process
3. Third step in the process
4. Fourth step completes the workflow

### Nested Lists

You can nest lists for complex hierarchies:

- Parent item one
  - Child item 1.1
  - Child item 1.2
    - Grandchild item 1.2.1
    - Grandchild item 1.2.2
  - Child item 1.3
- Parent item two
  - Child item 2.1
  - Child item 2.2

### Mixed List Types

You can even mix ordered and unordered lists:

1. First ordered item
   - Unordered sub-item
   - Another unordered sub-item
2. Second ordered item
   - More nested content
     1. Now ordered again
     2. Second nested ordered item
3. Third ordered item

## Links and References

### Basic Links

You can create [inline links](https://jessedupuy.me) to any URL.

You can also create [links with title attributes](https://jessedupuy.me "Jesse's Website") that show on hover.

### Reference-Style Links

Sometimes [reference-style links][1] are cleaner, especially when you use the same link [multiple times][1] in a document.

[1]: https://jessedupuy.me "Jesse's Website"

### URLs and Email

Raw URLs get automatically linked: https://jessedupuy.me

Email addresses too: jesse@example.com

## Code Examples

### Inline Code

When discussing code inline, use backticks: `const x = 42` or `npm install`.

### Code Blocks with Syntax Highlighting

JavaScript example:

```javascript
// Function to calculate fibonacci numbers
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log(`The 10th Fibonacci number is: ${result}`);
```

Python example:

```python
# Class definition in Python
class BlogPost:
    def __init__(self, title, author):
        self.title = title
        self.author = author

    def publish(self):
        print(f"Publishing '{self.title}' by {self.author}")

post = BlogPost("Markdown Guide", "Jesse")
post.publish()
```

CSS example:

```css
/* Custom styling for dark mode */
html[data-theme="dark"] {
  background-color: var(--color-near-black);
  color: var(--color-light-gray);
}

.post-content {
  max-width: 70ch;
  margin: 0 auto;
  padding: 2rem;
}
```

Shell/Bash example:

```bash
# Build and deploy commands
npm run build
npm run preview

# Git workflow
git add .
git commit -m "feat: add new blog post"
git push origin main
```

HTML example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Example Page</title>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>This is an example.</p>
</body>
</html>
```

JSON example:

```json
{
  "name": "jessedupuy.me",
  "version": "1.0.0",
  "description": "Personal blog built with Astro",
  "tags": ["blog", "astro", "markdown"]
}
```

### Plain Code Blocks

Sometimes you don't need syntax highlighting:

```
Just plain text
No syntax highlighting
  Preserves spacing and indentation
    Very useful for ASCII art or output
```

## Blockquotes

### Simple Quotes

Use blockquotes for citations or emphasis:

> This is a simple blockquote. It can span multiple lines and will be formatted as a continuous quoted block of text.

### Multi-Paragraph Quotes

> This is the first paragraph of a longer quote.
>
> This is the second paragraph. Notice the `>` on the empty line between paragraphs.

### Nested Blockquotes

> This is a top-level quote.
>
>> This is a nested quote within the quote.
>>
>>> You can even nest multiple levels if needed.

### Quotes with Other Elements

> **A quote can contain formatting**
>
> - Including lists
> - With multiple items
>
> And even `inline code` or **bold text**.

## Horizontal Rules

You can create section dividers with horizontal rules:

---

Above this is a horizontal rule made with three dashes.

***

Above this is one made with three asterisks.

___

Above this is one made with three underscores. They all render the same way.

## Images

### Basic Image Syntax

![Example placeholder image](https://placehold.co/600x400/3498db/ffffff?text=Example+Image)

### Image with Title Attribute

![Another example](https://placehold.co/600x400/e74c3c/ffffff?text=Another+Example "This text appears on hover")

## Tables

Tables are great for structured data:

| Feature | Supported | Notes |
|---------|-----------|-------|
| Headers | ✅ Yes | H1-H6 available |
| Lists | ✅ Yes | Ordered and unordered |
| Code Blocks | ✅ Yes | With syntax highlighting |
| Tables | ✅ Yes | Like this one! |
| Images | ✅ Yes | Local and remote |
| Links | ✅ Yes | Internal and external |

### Table Alignment

You can align columns in tables:

| Left Aligned | Center Aligned | Right Aligned |
|:-------------|:--------------:|--------------:|
| Left | Center | Right |
| Text | Text | Text |
| 10 | 100 | 1000 |

## Task Lists

You can create interactive checkboxes (if supported):

- [x] Completed task
- [x] Another completed task
- [ ] Incomplete task
- [ ] Another incomplete task
  - [ ] Nested incomplete task
  - [x] Nested completed task

## Special Characters and Escaping

If you need to display Markdown syntax literally, escape it with backslashes:

- Asterisks: \*not italic\*
- Underscores: \_not italic\_
- Backticks: \`not code\`
- Brackets: \[not a link\]

## Definition Lists

Definition lists are great for glossaries, terminology, or key-value pairs:

<dl>
<dt>Markdown</dt>
<dd>A lightweight markup language with plain text formatting syntax.</dd>

<dt>Astro</dt>
<dd>A modern static site generator that delivers fast, content-focused websites.</dd>

<dt>CSS Variables</dt>
<dd>Custom properties that can be reused throughout your stylesheets, making it easier to maintain consistent theming.</dd>

<dt>Responsive Design</dt>
<dd>An approach to web design that makes web pages render well on different devices and screen sizes.</dd>
</dl>

## HTML in Markdown

You can include raw HTML when Markdown isn't enough:

<div style="padding: 1rem; background: #f0f0f0; border-left: 4px solid #3498db;">
  <strong>Note:</strong> This is raw HTML embedded in Markdown. Use sparingly for special formatting needs.
</div>

<details>
<summary>Click to expand for more information</summary>

This content is hidden by default and reveals when clicked. Great for FAQs or supplementary information.

</details>

## Practical Examples

### Tutorial Section

Here's how you might structure a tutorial:

1. **Install dependencies**
   ```bash
   npm install astro
   ```

2. **Create a new file**

   Create `src/pages/index.astro` with this content:

   ```astro
   ---
   const greeting = "Hello, World!";
   ---
   <h1>{greeting}</h1>
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **View in browser**

   Navigate to `http://localhost:4321`

### Callout Boxes / Tips

You can create styled callout boxes for tips, warnings, and notes:

<blockquote data-callout="tip">
<strong>Pro Tip:</strong> Use semantic HTML headings for better SEO and accessibility. Don't skip heading levels (e.g., don't jump from h2 to h4).
</blockquote>

<blockquote data-callout="warning">
<strong>Warning:</strong> Be careful with inline HTML in Markdown. It can break in some rendering engines.
</blockquote>

<blockquote data-callout="note">
<strong>Note:</strong> This blog uses the CommonMark specification for Markdown rendering.
</blockquote>

**How to use:**

```html
<blockquote data-callout="tip">
<strong>Pro Tip:</strong> Your tip text here.
</blockquote>

<blockquote data-callout="warning">
<strong>Warning:</strong> Your warning text here.
</blockquote>

<blockquote data-callout="note">
<strong>Note:</strong> Your note text here.
</blockquote>
```

## Keyboard and Technical Notation

Use the `<kbd>` tag for keyboard shortcuts: <kbd>Ctrl</kbd> + <kbd>C</kbd> to copy.

Use the `<code>` tag for inline technical terms: The <code>Array.map()</code> method creates a new array.

## Conclusion

This comprehensive guide demonstrates every Markdown feature available in this blog. Bookmark this post as a reference when writing new content!

### Quick Reference Checklist

When writing a new post, remember to:

- [ ] Add a descriptive title
- [ ] Set the publication date
- [ ] Write a compelling description (for SEO)
- [ ] Add your author name
- [ ] Include relevant tags (3-5 recommended)
- [ ] Add a featured image (optional but recommended)
- [ ] Use proper heading hierarchy
- [ ] Include code examples where relevant
- [ ] Proofread before publishing

---

**Tags used in this post:** blogging, markdown, tutorial, meta

**Publication date:** November 8, 2025

**Author:** Jesse
