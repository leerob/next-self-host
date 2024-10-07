import chalk from 'chalk';
import { promises as fs } from 'fs';
import path from 'path';

const CACHE_DIR = path.resolve('.cache'); // Adjust the cache directory as needed
const TAGS_MANIFEST = path.join(CACHE_DIR, 'tags-manifest.json');

// Initialize cache directory and tags manifest outside the class
(async () => {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    console.log(chalk.blue('🔧 Cache directory initialized'));
  } catch (err) {
    console.error('Failed to initialize cache directory', err);
  }
})();

async function loadTagsManifest() {
  try {
    const data = await fs.readFile(TAGS_MANIFEST, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return { items: {} };
    }
    throw err;
  }
}

async function updateTagsManifest(tag, revalidatedAt) {
  const manifest = await loadTagsManifest();
  manifest.items[tag] = { revalidatedAt };
  await fs.writeFile(TAGS_MANIFEST, JSON.stringify(manifest));
}

class CacheHandler {
  constructor() {
    this.cacheDir = CACHE_DIR;
  }

  getFilePath(key) {
    const sanitizedKey = key.trim();
    const fileName = encodeURIComponent(sanitizedKey);
    return path.join(this.cacheDir, fileName);
  }

  async get(key) {
    const filePath = this.getFilePath(key);

    try {
      const data = await fs.readFile(filePath, 'utf8');
      const entry = JSON.parse(data);
      const { value, lastModified } = entry;

      let cacheTags = entry.tags;

      if (
        (!cacheTags || cacheTags.length === 0) &&
        value.headers &&
        value.headers['x-next-cache-tags']
      ) {
        cacheTags = value.headers['x-next-cache-tags'].split(',');
      }

      const tagsManifest = await loadTagsManifest();

      // Check if any tags have been revalidated after the cache entry
      let isStale = false;
      for (const tag of cacheTags || []) {
        const tagData = tagsManifest.items[tag];
        if (tagData && tagData.revalidatedAt > lastModified) {
          isStale = true;
          console.log(
            chalk.red(
              `♻️ Cache entry for key ${chalk.bold(
                key
              )} is stale due to tag ${chalk.bold(tag)} revalidation`
            )
          );
          break;
        }
      }

      if (isStale) {
        console.log(
          chalk.yellow(
            `⚠️ Cache entry for key ${chalk.bold(
              key
            )} is stale due to stale tags`
          )
        );
        return null;
      }

      console.log(chalk.green(`✅ Cache hit for key: ${chalk.bold(key)}`));
      return {
        lastModified,
        value,
      };
    } catch (err) {
      console.log(chalk.yellow(`⚠️ Cache miss for key: ${chalk.bold(key)}`));
      return null;
    }
  }

  async set(key, data, ctx = {}) {
    let tags = ctx.tags || [];

    if (data && data.headers && data.headers['x-next-cache-tags']) {
      const headerTags = data.headers['x-next-cache-tags'].split(',');
      tags = [...new Set([...tags, ...headerTags])];
    }

    const entry = {
      value: data,
      lastModified: Date.now(),
      tags,
    };

    const filePath = this.getFilePath(key);

    try {
      await fs.writeFile(filePath, JSON.stringify(entry));
      console.log(chalk.cyan(`📥 Set cached data for key: ${chalk.bold(key)}`));
      if (tags.length > 0) {
        console.log(chalk.gray(`   Tags: ${tags.join(', ')}`));
      }
    } catch (err) {
      console.error(`Failed to write cache entry for key ${key}`, err);
    }
  }

  async revalidateTag(tags) {
    const tagsArray = Array.isArray(tags) ? tags : [tags];
    console.log(
      chalk.magenta(`🔄 Revalidating tags: ${chalk.bold(tagsArray.join(', '))}`)
    );

    const now = Date.now();

    for (const tag of tagsArray) {
      await updateTagsManifest(tag, now);
      console.log(
        chalk.blue(
          `   ⏰ Tag ${chalk.bold(tag)} revalidated at ${new Date(
            now
          ).toISOString()}`
        )
      );
    }

    console.log(
      chalk.magenta(
        `✨ Revalidation complete for tags: ${chalk.bold(
          tagsArray.join(', ')
        )}.`
      )
    );
  }
}

export default CacheHandler;
