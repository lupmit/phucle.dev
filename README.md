# phucle.dev

Personal tech blog built with a fully static architecture using Notion as CMS.

## Architecture

```
Notion (CMS)
  ↓
GitHub Actions (CI)
  - Sync content from Notion (every 3h)
  - Download & optimize images (400, 800, 1200px WebP)
  - Generate Markdown + frontmatter
  ↓
GitHub Repository (public)
  ↓
Cloudflare Pages (CDN static)
  ↓
User

GitHub Actions (Reverse Sync - 12h AM)
  - Update Notion with optimized image URLs
  ↓
Notion (lighter images for writing experience)
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
npm install
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
   - Cover (Files & media)
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

Create environment `phucle.dev` with same secrets for workflows.

## Scripts

| Script                 | Description                       |
| ---------------------- | --------------------------------- |
| `npm run dev`          | Start development server          |
| `npm run build`        | Build for production              |
| `npm run preview`      | Preview production build          |
| `npm run sync`         | Sync content from Notion          |
| `npm run optimize`     | Download & optimize images        |
| `npm run reverse-sync` | Update Notion with optimized URLs |
| `npm run lint`         | Run ESLint                        |
| `npm run format`       | Format code with Prettier         |

### Typical workflow

```bash
# Development
npm run sync        # Get content from Notion
npm run optimize    # Process images
npm run dev         # Start dev server

# After deploy (optional - improves Notion editing experience)
npm run reverse-sync
```

## GitHub Actions

### sync.yml

- **Trigger**: Manual or every 3 hours
- **Flow**: Sync → Optimize → Format → Commit & Push
- Only commits when content changes detected

### reverse-sync.yml

- **Trigger**: Manual or daily at 12:00 AM (Vietnam time)
- **Flow**: Sync → Update Notion with deployed image URLs
- Improves Notion editing experience with lighter images

## Image Pipeline

1. **Sync**: Get image URLs from Notion
2. **Optimize**: Download, resize (400/800/1200px), convert to WebP
3. **Store**: Save to `public/images/posts/{slug}/`
4. **Update MD**: Replace URLs with local paths
5. **Reverse sync** (optional): Update Notion with deployed URLs

### Image naming

```
{image-name}-400.webp  # Mobile
{image-name}-800.webp  # Content (inline images)
{image-name}-1200.webp # Hero (cover images, OG)
```

HTML uses `srcset` for browser to select appropriate size.

## Deploy to Cloudflare Pages

1. Connect repository to Cloudflare Pages
2. Build command: `npm run build`
3. Output directory: `dist`
4. Every push to main branch triggers auto deploy

## Features

- **100% static** - No database, no backend, no runtime image processing
- **CDN global** - Cloudflare Pages with unlimited bandwidth
- **SEO optimized** - Meta tags, sitemap, semantic HTML, OG images
- **Performance** - WebP images with srcset, lazy loading
- **Zero cost** - GitHub Actions free for public repos, Cloudflare Pages free tier
- **Bidirectional sync** - Notion ↔ Website image optimization

## License

MIT
