import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import https from 'https';
import http from 'http';

const SIZES = [400, 800, 1200];
const QUALITY = 80;

function downloadImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    client.get(url, response => {
      const chunks: Buffer[] = [];

      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

async function optimizeImage(buffer: Buffer, outputPath: string, width: number): Promise<void> {
  await sharp(buffer)
    .resize(width, null, {
      withoutEnlargement: true,
      fit: 'inside',
    })
    .webp({ quality: QUALITY })
    .toFile(outputPath);
}

async function cleanupUnusedImages(
  contentDir: string,
  publicImagesDir: string
): Promise<void> {
  const mdFiles = (await fs.readdir(contentDir)).filter((f) =>
    f.endsWith('.md')
  );
  const activeSlugs = new Set(mdFiles.map((f) => f.replace('.md', '')));

  const usedImages = new Map<string, Set<string>>();

  for (const file of mdFiles) {
    const slug = file.replace('.md', '');
    const content = await fs.readFile(path.join(contentDir, file), 'utf-8');
    // Match any size (400, 800, 1200) to get the base image name
    const imageRefs =
      content.match(/\/images\/posts\/[^/]+\/[^/)]+-(400|800|1200)\.webp/g) ||
      [];

    const imageNames = new Set<string>();
    for (const ref of imageRefs) {
      // Extract just the filename without size suffix
      const match = ref.match(/\/([^/]+)-(400|800|1200)\.webp$/);
      if (match) imageNames.add(match[1]);
    }
    usedImages.set(slug, imageNames);
  }

  let imageDirs: string[] = [];
  try {
    imageDirs = await fs.readdir(publicImagesDir);
  } catch {
    return;
  }

  for (const dir of imageDirs) {
    const dirPath = path.join(publicImagesDir, dir);
    const stat = await fs.stat(dirPath);
    if (!stat.isDirectory()) continue;

    if (!activeSlugs.has(dir)) {
      await fs.rm(dirPath, { recursive: true });
      console.log(`🗑 Deleted unused post folder: ${dir}/`);
      continue;
    }

    const files = await fs.readdir(dirPath);
    const usedInPost = usedImages.get(dir) || new Set();

    for (const file of files) {
      const match = file.match(/^(.+)-(400|800|1200)\.webp$/);
      if (!match) {
        await fs.unlink(path.join(dirPath, file));
        console.log(`🗑 Deleted non-standard file: ${dir}/${file}`);
        continue;
      }

      const imageName = match[1];
      if (!usedInPost.has(imageName)) {
        await fs.unlink(path.join(dirPath, file));
        console.log(`🗑 Deleted unused image: ${dir}/${file}`);
      }
    }

    const remainingFiles = await fs.readdir(dirPath);
    if (remainingFiles.length === 0) {
      await fs.rmdir(dirPath);
      console.log(`🗑 Deleted empty folder: ${dir}/`);
    }
  }
}

async function cleanupDuplicateContent(): Promise<void> {
  const legacyDir = path.join(process.cwd(), 'content', 'posts');
  try {
    await fs.rm(legacyDir, { recursive: true });
    console.log('🗑 Deleted legacy content/posts/ folder');

    const contentDir = path.join(process.cwd(), 'content');
    const remaining = await fs.readdir(contentDir);
    if (remaining.length === 0) {
      await fs.rmdir(contentDir);
      console.log('🗑 Deleted empty content/ folder');
    }
  } catch {
    // Folder doesn't exist, skip
  }
}

async function processMarkdownImages(): Promise<void> {
  const contentDir = path.join(process.cwd(), 'src', 'content', 'posts');
  const publicImagesDir = path.join(process.cwd(), 'public', 'images', 'posts');

  await cleanupDuplicateContent();
  await cleanupUnusedImages(contentDir, publicImagesDir);

  const files = await fs.readdir(contentDir);
  const mdFiles = files.filter((f) => f.endsWith('.md'));

  for (const file of mdFiles) {
    const filePath = path.join(contentDir, file);
    const content = await fs.readFile(filePath, 'utf-8');

    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match: RegExpExecArray | null;
    let updatedContent = content;
    const slug = file.replace('.md', '');

    while ((match = imageRegex.exec(content)) !== null) {
      const [fullMatch, alt, imageUrl] = match;

      if (!imageUrl.startsWith('http')) continue;

      const imageDir = path.join(publicImagesDir, slug);
      await fs.mkdir(imageDir, { recursive: true });

      const imageName = path.basename(new URL(imageUrl).pathname, path.extname(new URL(imageUrl).pathname));

      let alreadyProcessed = true;
      for (const size of SIZES) {
        const outputPath = path.join(imageDir, `${imageName}-${size}.webp`);
        try {
          await fs.access(outputPath);
        } catch {
          alreadyProcessed = false;
          break;
        }
      }

      if (alreadyProcessed) {
        console.log(`⊙ Skipped (already exists): ${slug}/${imageName}`);
        updatedContent = updatedContent.replace(
          fullMatch,
          `![${alt}](/images/posts/${slug}/${imageName}-800.webp)`
        );
        continue;
      }

      console.log(`⬇ Downloading: ${imageUrl}`);
      const imageBuffer = await downloadImage(imageUrl);

      for (const size of SIZES) {
        const outputPath = path.join(imageDir, `${imageName}-${size}.webp`);
        await optimizeImage(imageBuffer, outputPath, size);
        console.log(`✓ Generated: ${imageName}-${size}.webp`);
      }

      updatedContent = updatedContent.replace(
        fullMatch,
        `![${alt}](/images/posts/${slug}/${imageName}-800.webp)`
      );
    }

    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf-8');
      console.log(`✓ Updated: ${file}`);
    }
  }

  console.log('Image optimization completed!');
}

processMarkdownImages().catch(console.error);
