import 'dotenv/config';
import { Client } from '@notionhq/client';
import type {
  DataSourceObjectResponse,
  QueryDataSourceResponse,
} from '@notionhq/client/build/src/api-endpoints';
import fs from 'fs/promises';
import path from 'path';

interface NotionBlock {
  type: string;
  [key: string]: unknown;
}

interface RichText {
  plain_text: string;
  annotations: {
    bold: boolean;
    italic: boolean;
    code: boolean;
    strikethrough: boolean;
  };
  href?: string;
}

interface NotionProperty {
  type: string;
  title?: RichText[];
  rich_text?: RichText[];
  multi_select?: Array<{ name: string }>;
  date?: { start: string };
  checkbox?: boolean;
  files?: Array<{ file?: { url: string }; external?: { url: string }; name: string }>;
}

interface PostData {
  slug: string;
  content: string;
}

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.DATABASE_ID!;

async function getExistingImages(slug: string): Promise<Map<string, string>> {
  const imageDir = path.join(process.cwd(), 'public', 'images', 'posts', slug);
  const existingImages = new Map<string, string>();

  try {
    const files = await fs.readdir(imageDir);
    for (const file of files) {
      const match = file.match(/^(.+)-(400|800|1200)\.webp$/);
      if (match) {
        const imageName = match[1];
        if (!existingImages.has(imageName)) {
          existingImages.set(imageName, `/images/posts/${slug}/${imageName}`);
        }
      }
    }
  } catch {
    // Directory doesn't exist yet
  }

  return existingImages;
}

function getImageNameFromUrl(imageUrl: string): string {
  try {
    const url = new URL(imageUrl);
    const pathname = url.pathname;
    const basename = path.basename(pathname);
    const ext = path.extname(basename);
    return basename.replace(ext, '');
  } catch {
    return '';
  }
}

async function getAllPosts(): Promise<DataSourceObjectResponse[]> {
  const response: QueryDataSourceResponse = await notion.dataSources.query({
    data_source_id: databaseId,
  });
  return response.results as DataSourceObjectResponse[];
}

async function getPageBlocks(pageId: string): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const { results, next_cursor } = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
    });
    blocks.push(...(results as NotionBlock[]));
    if (!next_cursor) {
      hasMore = false;
    } else {
      cursor = next_cursor;
    }
  }

  return blocks;
}

function blockToMarkdown(block: NotionBlock): string {
  const type = block.type;
  const content = block[type] as Record<string, unknown>;

  if (!content) return '';

  switch (type) {
    case 'paragraph':
      return richTextToMarkdown(content.rich_text as RichText[]) + '\n';

    case 'heading_1':
      return '# ' + richTextToMarkdown(content.rich_text as RichText[]) + '\n';

    case 'heading_2':
      return '## ' + richTextToMarkdown(content.rich_text as RichText[]) + '\n';

    case 'heading_3':
      return '### ' + richTextToMarkdown(content.rich_text as RichText[]) + '\n';

    case 'bulleted_list_item':
      return '- ' + richTextToMarkdown(content.rich_text as RichText[]) + '\n';

    case 'numbered_list_item':
      return '1. ' + richTextToMarkdown(content.rich_text as RichText[]) + '\n';

    case 'code': {
      const lang = (content.language as string) || '';
      const code = richTextToMarkdown(content.rich_text as RichText[]);
      return '```' + lang + '\n' + code + '\n```\n';
    }

    case 'quote':
      return '> ' + richTextToMarkdown(content.rich_text as RichText[]) + '\n';

    case 'image': {
      const file = content.file as { url?: string } | undefined;
      const external = content.external as { url?: string } | undefined;
      const imageUrl = file?.url || external?.url;
      if (!imageUrl) return '';
      return `![image](${imageUrl})\n`;
    }

    default:
      return '';
  }
}

function richTextToMarkdown(richTextArray: RichText[]): string {
  if (!richTextArray) return '';

  return richTextArray
    .map((text) => {
      let content = text.plain_text;

      if (text.annotations.bold) content = `**${content}**`;
      if (text.annotations.italic) content = `*${content}*`;
      if (text.annotations.code) content = `\`${content}\``;
      if (text.annotations.strikethrough) content = `~~${content}~~`;
      if (text.href) content = `[${content}](${text.href})`;

      return content;
    })
    .join('');
}

function extractPropertyValue(property: NotionProperty): string | string[] | boolean {
  const type = property.type;

  switch (type) {
    case 'title':
      return richTextToMarkdown(property.title!);
    case 'rich_text':
      return richTextToMarkdown(property.rich_text!);
    case 'multi_select':
      return property.multi_select!.map((item) => item.name);
    case 'date':
      return property.date?.start || '';
    case 'checkbox':
      return property.checkbox || false;
    case 'files': {
      const file = property.files?.[0];
      if (file) {
        return file.file?.url || file.external?.url || '';
      }
      return '';
    }
    default:
      return '';
  }
}

async function convertPageToMarkdown(page: DataSourceObjectResponse): Promise<PostData> {
  const props = page.properties as Record<string, NotionProperty>;

  const title = extractPropertyValue(props.Title) as string;
  const slug = extractPropertyValue(props.Slug) as string;
  const date = extractPropertyValue(props.Date) as string;
  const tags = (extractPropertyValue(props.Tags) || []) as string[];
  const description = (extractPropertyValue(props.Description) || '') as string;
  const published = extractPropertyValue(props.Published) as boolean;
  const coverUrl = (extractPropertyValue(props.Cover) || '') as string;

  const blocks = await getPageBlocks(page.id);
  let body = blocks.map(blockToMarkdown).join('\n');

  // Replace Notion image URLs with local paths if images already exist
  const existingImages = await getExistingImages(slug);
  const imageRegex = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;

  body = body.replace(imageRegex, (match, alt, url) => {
    const imageName = getImageNameFromUrl(url);
    if (imageName && existingImages.has(imageName)) {
      console.log(`  ⊙ Using existing image: ${imageName}`);
      return `![${alt}](${existingImages.get(imageName)}-800.webp)`;
    }
    return match; // Keep original URL for new images
  });

  // Process cover image
  let cover = '';
  if (coverUrl) {
    const coverName = getImageNameFromUrl(coverUrl);
    if (coverName && existingImages.has(coverName)) {
      cover = `${existingImages.get(coverName)}-1200.webp`;
      console.log(`  ⊙ Using existing cover: ${coverName}`);
    } else {
      cover = coverUrl; // Keep original URL for optimization later
    }
  }

  const tagList = tags.map((t) => `'${t}'`).join(', ');
  const frontmatter = `---
title: '${title.replace(/'/g, "''")}'
slug: '${slug}'
date: '${date}'
tags: [${tagList}]
description: '${description.replace(/'/g, "''")}'
published: ${published}
cover: '${cover}'
---

`;

  return {
    slug,
    content: frontmatter + body,
  };
}

async function syncNotion(): Promise<void> {
  console.log('Fetching all posts from Notion...');
  const posts = await getAllPosts();
  console.log(`Found ${posts.length} posts`);

  const contentDir = path.join(process.cwd(), 'src', 'content', 'posts');
  await fs.mkdir(contentDir, { recursive: true });

  for (const post of posts) {
    const { slug, content } = await convertPageToMarkdown(post);
    const filePath = path.join(contentDir, `${slug}.md`);

    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`✓ Synced: ${slug}.md`);
  }

  console.log('Sync completed!');
}

syncNotion().catch(console.error);
