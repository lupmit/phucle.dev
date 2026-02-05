# phucle.dev

Personal tech blog built with a fully static architecture using Notion as CMS.

## Architecture

```
Notion (CMS)
  ↓
GitHub Actions (CI)
  - Sync content from Notion
  - Download & optimize images (400, 800, 1200px WebP)
  - Generate Markdown + frontmatter
  ↓
GitHub Repository (public)
  ↓
Cloudflare Pages (CDN static)
  ↓
User
```

## Tech Stack

- **Astro** - Static site generator
- **Tailwind CSS** - Styling
- **Notion API** - Content management
- **Sharp** - Image processing
- **GitHub Actions** - CI/CD
- **Cloudflare Pages** - Hosting & CDN

## Setup

### 1. Clone repository

```bash
git clone <your-repo-url>
cd phucle.dev
yarn install --ignore-engines
```

### 2. Configure Notion

1. Create Notion Integration at: https://www.notion.so/my-integrations
2. Get `NOTION_TOKEN`
3. Create database with these fields:
   - Title (Title)
   - Slug (Text)
   - Published (Checkbox)
   - Date (Date)
   - Tags (Multi-select)
   - Description (Text)
4. Share database with integration
5. Get `DATABASE_ID` from database URL

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in the values:

- `NOTION_TOKEN`
- `DATABASE_ID`

### 4. Setup GitHub Secrets

Go to repository Settings > Secrets and variables > Actions, add:

- `NOTION_TOKEN`
- `DATABASE_ID`

## Usage

### Development

```bash
yarn dev
```

### Build

```bash
yarn build
```

### Preview

```bash
yarn preview
```

### Sync content from Notion (manual)

```bash
yarn sync
yarn optimize
```

## GitHub Actions

Workflow runs automatically:

- Manual trigger (workflow_dispatch)
- Every 3 hours (cron schedule)

Only commits when content changes detected.

## Image Convention

All images are optimized at build time:

- 400px (mobile)
- 800px (content)
- 1200px (hero)
- Format: WebP, quality 80

HTML output uses `srcset` for browser to select appropriate size.

## Deploy to Cloudflare Pages

1. Connect repository to Cloudflare Pages
2. Build command: `yarn build`
3. Output directory: `dist`
4. Every push to main branch triggers auto deploy

## Features

- **100% static** - No database, no backend, no runtime image processing
- **CDN global** - Cloudflare Pages with unlimited bandwidth
- **SEO optimized** - Meta tags, sitemap, semantic HTML
- **Performance** - WebP images with srcset, lazy loading
- **Zero cost** - GitHub Actions free for public repos, Cloudflare Pages free tier

## License

MIT
