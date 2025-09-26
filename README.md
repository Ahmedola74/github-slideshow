# Ahmed Adel — Creative Portfolio

A dark, futuristic portfolio experience for Ahmed Adel featuring deep-blue glassmorphism, responsive layouts, and an internal no-code dashboard. Projects are stored in a single JSON data source and rendered automatically across the home page, works hub, category views, and project detail template.

## Features

- **Immersive landing page** with hero profile, featured carousel, tool stack, and a bento grid of disciplines.
- **Works hub** with category, client, year, and text filters plus lazy-rendered project cards.
- **Dedicated category pages** for Branding, Social Media, UI/UX, Videos, Presentations, and Layouting.
- **Project detail template** with media galleries (images + videos), narrative blocks, share actions, and prev/next navigation.
- **Contact page** with WhatsApp + email CTAs and a lightweight mailto form.
- **Private admin dashboard** (`/admin`) to add, edit, reorder, and publish projects with media gallery management, tag chips, import/export, and reset-to-seed options.
- **Local-first data flow** — dashboard changes persist in `localStorage` and can be exported as JSON to update the static data file.

## Getting Started

1. Install dependencies (optional for local development):
   ```bash
   npm install
   ```
2. Serve the site locally with any static server. For example:
   ```bash
   npx http-server . -c-1
   ```
3. Open `http://localhost:8080/` (or the port from your server).

## Managing Content

1. Visit `/admin/` and unlock with the passphrase `blue-nebula-9090`.
2. Create or edit projects using the form. Mark a media item as the cover to control thumbnails.
3. Toggle **Featured** to surface a project in the home carousel. Toggle **Published** to hide or show it across the site.
4. Use **Export JSON** to download your dataset. Replace `assets/data/projects.json` with the exported contents to deploy changes.
5. **Import JSON** lets you load a previously exported dataset into local storage for further editing.

## Project Structure

```
assets/
  css/styles.css          # Global styles and theme tokens
  data/projects.json      # Seed data consumed across the site
  images/                 # Glassmorphism-ready SVG placeholders
  js/
    admin.js              # No-code dashboard logic
    category.js           # Category listing renderer
    contact.js            # Contact page interactions
    home.js               # Landing page components
    nav.js                # Shared navigation + utilities
    projects.js           # Data layer for loading/persisting projects
    project.js            # Project detail renderer
    utils.js              # Helpers and constants
works/                    # Works hub, categories, and project detail template
admin/                    # Admin dashboard entry point
contact/                  # Contact page
index.html                # Landing page
```

## Deployment Notes

- The site is static and works with GitHub Pages or any static host.
- Dashboard edits are stored in the browser; export/import the JSON file for persistent updates in version control.
- External video placeholders use openly licensed sample clips — replace them with production assets as needed.

---
Designed with deep navy gradients, neon accents, and glass panels to match Ahmed Adel’s futuristic brand voice.
