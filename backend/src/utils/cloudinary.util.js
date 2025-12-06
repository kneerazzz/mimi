// cloudinary.util.js
import cloudinary from 'cloudinary';
import { ApiError } from './apiError.js';

const normalizeFolderPath = (folderPath) => {
  return folderPath.replace(/^\/+|\/+$/g, '').trim();
};

const getTemplatesForSeeding = async (folderPath) => {
  if (!folderPath) throw new ApiError(400, "Cloudinary folder path is required.");

  const normalized = normalizeFolderPath(folderPath);

  try {
    let allResources = [];
    let nextCursor = null;
    let page = 0;

    do {
      page++;

      console.log(
        `Cloudinary Search: fetching page ${page} for folder "${normalized}" next_cursor=${nextCursor}`
      );

      const res = await cloudinary.v2.search
        .expression(`folder:${normalized}`)
        .sort_by('public_id', 'asc')
        .max_results(500)
        .next_cursor(nextCursor)     // ⬅️ THIS is how pagination actually works
        .execute();

      if (!res || !res.resources) break;

      allResources.push(...res.resources);

      nextCursor = res.next_cursor || null;

    } while (nextCursor);

    if (allResources.length === 0) {
      console.warn(`No assets found in Cloudinary folder: "${normalized}"`);
      return [];
    }

    const templateData = allResources.map(asset => ({
      templateId: asset.public_id.replace(`${normalized}/`, ''),
      public_id: asset.public_id,
      imageUrl: asset.secure_url || asset.url,
      name: asset.public_id.split('/').pop().replace(/[-_]/g, ' '),
      emotionTags: asset.tags || []
    }));

    console.log(`Retrieved ${templateData.length} assets from "${normalized}".`);
    return templateData;

  } catch (err) {
    console.error("Cloudinary list error:", err);
    throw new ApiError(500, `Failed to list resources: ${err.message}`);
  }
};

export { getTemplatesForSeeding };
