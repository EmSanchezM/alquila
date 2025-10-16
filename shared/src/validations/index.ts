import { z } from "zod";

// Property validation schemas
export const amenitiesSchema = z.array(z.string()).optional();
export const imagesSchema = z.array(z.string()).optional();

export const createPropertySchema = z.object({
  userId: z.string(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string(),
  propertyType: z.string(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  squareMeters: z.string().optional(),
  description: z.string().optional(),
  amenities: amenitiesSchema,
  images: imagesSchema,
});

export const updatePropertySchema = z.object({
  param: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
    propertyType: z.string().optional(),
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    squareMeters: z.string().optional(),
    description: z.string().optional(),
    amenities: amenitiesSchema,
    images: imagesSchema,
  }),
});

export const findAllPropertiesSchema = z.object({
  query: z.object({
    limit: z.string().optional(),
    offset: z.string().optional(),
  }),
});

export const findByIdPropertiesSchema = z.object({
  param: z.object({
    id: z.string(),
  }),
});

// Types
export type CreateProperty = z.infer<typeof createPropertySchema>;
export type UpdateProperty = z.infer<typeof updatePropertySchema>;
export type FindAllProperties = z.infer<typeof findAllPropertiesSchema>;
export type FindByIdProperties = z.infer<typeof findByIdPropertiesSchema>;
export type DeleteProperty = z.infer<typeof findByIdPropertiesSchema>;