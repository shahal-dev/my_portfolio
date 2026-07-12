import type { Core } from '@strapi/strapi';

// Content types (and the actions on them) that the public role should be
// able to read. Runs on every boot and only creates permissions that don't
// already exist, so a fresh clone with an empty DB self-configures without
// any manual admin-UI click-through.
const PUBLIC_PERMISSIONS: Record<string, string[]> = {
  'api::blog-post.blog-post': ['find', 'findOne'],
  'api::gallery-photo.gallery-photo': ['find', 'findOne'],
};

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (!publicRole) return;

    for (const [uid, actions] of Object.entries(PUBLIC_PERMISSIONS)) {
      for (const action of actions) {
        const actionId = `${uid}.${action}`;
        const existing = await strapi
          .query('plugin::users-permissions.permission')
          .findOne({ where: { action: actionId, role: publicRole.id } });

        if (!existing) {
          await strapi.query('plugin::users-permissions.permission').create({
            data: { action: actionId, role: publicRole.id },
          });
        }
      }
    }
  },
};
