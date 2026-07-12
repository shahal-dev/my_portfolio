import type { Schema, Struct } from '@strapi/strapi';

export interface AstroGearSetup extends Struct.ComponentSchema {
  collectionName: 'components_astro_gear_setups';
  info: {
    displayName: 'Gear Setup';
    icon: 'feather';
  };
  attributes: {
    bortleScale: Schema.Attribute.String;
    camera: Schema.Attribute.String;
    exposureTotal: Schema.Attribute.String;
    filters: Schema.Attribute.String;
    guiding: Schema.Attribute.String;
    isoOrGain: Schema.Attribute.String;
    mount: Schema.Attribute.String;
    softwareUsed: Schema.Attribute.String;
    subExposure: Schema.Attribute.String;
    telescope: Schema.Attribute.String;
  };
}

export interface AstroProfessionalComparison extends Struct.ComponentSchema {
  collectionName: 'components_astro_professional_comparisons';
  info: {
    displayName: 'Professional Comparison';
    icon: 'picture';
  };
  attributes: {
    credit: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    sourceLabel: Schema.Attribute.String & Schema.Attribute.Required;
    sourceUrl: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'astro.gear-setup': AstroGearSetup;
      'astro.professional-comparison': AstroProfessionalComparison;
    }
  }
}
