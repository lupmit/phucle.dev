import 'dotenv/config';
import { Client } from '@notionhq/client';
import fs from 'fs/promises';
import path from 'path';

interface ImageMapping {
  blockId: string;
  imageName: string;
  pageId: string;
}

interface CoverMapping {
  pageId: string;
  imageName: string;
}

interface PostMappings {
  images: ImageMapping[];
  cover?: CoverMapping;
}

interface ImageMappings {
  [slug: string]: PostMappings;
}

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const SITE_URL = process.env.SITE_URL || 'https://phucle.dev';

async function reverseSyncImages(): Promise<void> {
  const mappingsPath = path.join(process.cwd(), '.notion-image-mappings.json');

  let mappings: ImageMappings;
  try {
    const content = await fs.readFile(mappingsPath, 'utf-8');
    mappings = JSON.parse(content);
  } catch {
    console.log('No image mappings found. Run sync-notion first.');
    return;
  }

  for (const [slug, postMappings] of Object.entries(mappings)) {
    console.log(`\nProcessing: ${slug}`);

    // Update cover image
    if (postMappings.cover) {
      const { pageId, imageName } = postMappings.cover;
      const externalUrl = `${SITE_URL}/images/posts/${slug}/${imageName}-1200.webp`;

      try {
        await notion.pages.update({
          page_id: pageId,
          cover: {
            type: 'external',
            external: { url: externalUrl },
          },
        });
        console.log(`  ✓ Updated cover: ${imageName}`);
      } catch (error) {
        console.log(`  ✗ Failed cover: ${imageName} - ${(error as Error).message}`);
      }
    }

    // Update inline images
    for (const { blockId, imageName } of postMappings.images) {
      const externalUrl = `${SITE_URL}/images/posts/${slug}/${imageName}-768.webp`;

      try {
        await notion.blocks.update({
          block_id: blockId,
          image: {
            external: { url: externalUrl },
          },
        });
        console.log(`  ✓ Updated: ${imageName}`);
      } catch (error) {
        console.log(`  ✗ Failed: ${imageName} - ${(error as Error).message}`);
      }
    }
  }

  console.log('\nReverse sync completed!');
}

reverseSyncImages().catch(console.error);
