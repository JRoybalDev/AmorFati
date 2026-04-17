import { prisma } from '../lib/prisma';
import cloudinary from '../lib/cloudinary';

/**
 * Fix script: re-migrates images that were incorrectly uploaded as file.jpg
 * due to missing public_id. Uses original arcon URLs recovered from migration logs.
 * Run via: npx dotenv -e .env -- tsx src/scripts/migrate-to-cloudinary.ts
 */

const ARCON_BASE = 'https://arcon-api.duckdns.org:7777/content/AmorFati/Posts/Images';

// Original arcon URLs recovered from migration logs, grouped by post ID
const POST_IMAGE_MAP: Record<string, string[]> = {
  'a25eeb84-02a0-47dd-ab18-2933e6a0fd79': [
    'img_1536.jpeg',
    'img_1535.jpeg',
    'img_1533.jpeg',
    'img_1532.jpeg',
  ],
  '2a75b069-c061-43c1-a0f8-1761480f6c3b': [
    'img_1521.jpeg',
    'img_1499.jpeg',
    'img_1495.jpeg',
    'img_1472.jpeg',
    'img_1487.jpeg',
    'img_1467.jpeg',
  ],
  '754fe148-b121-41d7-86a7-c00e8f005d5a': [
    'img_7463.jpeg',
    'img_7465.jpeg',
    'img_7466.jpeg',
    'img_7482.jpeg',
    'img_7492.jpeg',
    'img_2671.jpeg',
  ],
  '2178be72-7829-454b-b0cc-a8cb5319173d': [
    'img_0268.jpeg',
    'img_0269.jpeg',
    'img_0271.jpeg',
    'img_7337.jpeg',
    'img_0293.jpeg',
    'img_0272.jpeg',
    'img_0289.jpeg',
  ],
  '6a17caa7-f33d-460d-9859-ef2cd4eb15c3': [
    'img_7476.jpeg',
    'img_7478.jpeg',
    'img_7481.jpeg',
    'img_7736.jpeg',
    'img_7737.jpeg',
    'img_2655.jpeg',
  ],
};

async function uploadFromUrl(arconUrl: string, postId: string, filename: string): Promise<string> {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

  const response = await fetch(arconUrl);
  if (!response.ok) throw new Error(`HTTP ${response.status} fetching ${arconUrl}`);
  const buffer = Buffer.from(await response.arrayBuffer());

  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `Posts/Images/${postId}`,  // sets the directory
        public_id: nameWithoutExt,          // just the filename, no path
        resource_type: 'image',
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

async function migrate() {
  console.log('--- Starting Fix Migration ---');

  for (const [postId, filenames] of Object.entries(POST_IMAGE_MAP)) {
    console.log(`\nProcessing post ${postId}...`);
    const newImages: string[] = [];

    for (const filename of filenames) {
      const arconUrl = `${ARCON_BASE}/${postId}/${filename}`;
      console.log(`  Migrating: ${arconUrl}`);
      try {
        const cloudinaryUrl = await uploadFromUrl(arconUrl, postId, filename);
        newImages.push(cloudinaryUrl);
        console.log(`  -> Success: ${cloudinaryUrl}`);
      } catch (e) {
        console.error(`  !! Failed: ${arconUrl}:`, e);
        // Fall back to broken Cloudinary URL rather than losing the slot
        newImages.push(`https://res.cloudinary.com/dodv9ywyq/image/upload/Posts/Images/${postId}/file.jpg`);
      }
    }

    await prisma.post.update({
      where: { id: postId },
      data: { images: newImages },
    });
    console.log(`  Post ${postId} updated in database.`);
  }

  console.log('\n--- Fix Migration Finished ---');
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());