/**
 * One-off seed script for local verification — creates one sample Blog Post
 * and one sample Gallery Photo (with placeholder images) so the frontend
 * build/render pipeline can be tested end-to-end.
 *
 * Run with: node scripts/seed.js  (from the cms/ directory, Strapi stopped)
 */

const path = require('path');
const fs = require('fs');
const { compileStrapi, createStrapi } = require('@strapi/strapi');

const IMG_DIR =
  '/tmp/claude-1000/-home-shahal-Desktop-new-portfolio-multiplepage-portfolio-1-0-0/94b1c4b2-6c31-4b14-ac6d-146ce476a2a7/scratchpad/seed_images';

async function uploadFile(strapi, filePath, name) {
  const stat = fs.statSync(filePath);
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
  const [uploaded] = await strapi.plugin('upload').service('upload').upload({
    data: {},
    files: {
      filepath: filePath,
      originalFilename: name || path.basename(filePath),
      mimetype: mime,
      size: stat.size,
    },
  });
  return uploaded;
}

async function main() {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'error';

  const capturedImage = await uploadFile(
    app,
    path.join(IMG_DIR, 'placeholder-capture.png'),
    'sample-capture.png'
  );
  const additionalImage = await uploadFile(
    app,
    path.join(IMG_DIR, 'placeholder-additional.jpg'),
    'sample-additional.jpg'
  );
  const proImage = await uploadFile(
    app,
    path.join(IMG_DIR, 'hubble-pillars.jpg'),
    'hubble-pillars-of-creation.jpg'
  );

  const galleryEntry = await app.documents('api::gallery-photo.gallery-photo').create({
    data: {
      title: 'Pillars of Creation (placeholder test entry)',
      slug: 'pillars-of-creation-test',
      objectName: 'Eagle Nebula / M16',
      objectType: 'Nebula',
      description:
        'Placeholder seed entry used to verify the CMS-to-frontend pipeline. ' +
        'The "captured" image here is a generic stand-in, not a real astrophotograph — ' +
        'replace it (and this description) with real content once the pipeline is verified. ' +
        'The comparison image is a genuine public-domain Hubble Space Telescope image of the Pillars of Creation.',
      capturedImage: capturedImage.id,
      additionalImages: [additionalImage.id],
      captureDate: '2026-01-01',
      location: 'Placeholder location',
      gearSetup: {
        telescope: 'Placeholder 8" Newtonian',
        camera: 'Placeholder ZWO ASI533MC Pro',
        mount: 'Placeholder EQ6-R Pro',
        filters: 'Placeholder Ha/OIII/SII',
        exposureTotal: '6.5 hours',
        subExposure: '300s x 78 subs',
        isoOrGain: 'Gain 100',
        guiding: 'Placeholder OAG + ASI290MM Mini',
        softwareUsed: 'NINA, PixInsight',
        bortleScale: 'Bortle 4',
      },
      professionalComparison: {
        image: proImage.id,
        sourceLabel: 'Hubble Space Telescope',
        credit: 'NASA, ESA, STScI',
        sourceUrl:
          'https://commons.wikimedia.org/wiki/File:Pillars_of_creation_2014_HST_WFC3-UVIS_full-res_denoised.jpg',
      },
      tags: 'nebula, placeholder, test',
    },
    status: 'published',
  });

  const blogEntry = await app.documents('api::blog-post.blog-post').create({
    data: {
      title: 'Hello World (placeholder test post)',
      slug: 'hello-world-test',
      excerpt: 'Placeholder seed post used to verify the markdown rendering pipeline.',
      content:
        '# Hello World\n\n' +
        'This is a **placeholder** post seeded to verify the Strapi -> Next.js pipeline end to end.\n\n' +
        '## Features exercised\n\n' +
        '- Headings\n- Lists\n- **Bold** and _italic_ text\n- A [link](https://strapi.io)\n\n' +
        '```js\nfunction hello() {\n  console.log("hello from a code block");\n}\n```\n\n' +
        '| Column A | Column B |\n| --- | --- |\n| 1 | 2 |\n',
      author: 'MD Shahadat Hossain Shahal',
      tags: 'placeholder, test',
    },
    status: 'published',
  });

  console.log('Seeded gallery photo:', galleryEntry.documentId);
  console.log('Seeded blog post:', blogEntry.documentId);

  await app.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
