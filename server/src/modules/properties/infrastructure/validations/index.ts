import { z } from "zod";

export const amenitiesSchema = z.array(z.string()).optional();
export const imagesSchema = z.array(z.string()).optional();

export const createPropertySchema = z.object({
  userId: z.string(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  country: z.string(),
  propertyType: z.string(),
  bedrooms: z.number(),
  bathrooms: z.number(),
  squareMeters: z.number(),
  description: z.string(),
  amenities: amenitiesSchema,
  images: imagesSchema,
  isActive: z.boolean(),
});

export const findAllPropertiesSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  sort: z.object({
    field: z.string().optional(),
    order: z.string().optional(),
  }).optional(),
});

export const findByIdPropertiesSchema = z.object({
  id: z.string(),
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
    squareMeters: z.number().optional(),
    description: z.string().optional(),
    amenities: amenitiesSchema.optional(),
    images: imagesSchema.optional(),
    isActive: z.boolean().optional(),
  }),
});

export type CreateProperty = z.infer<typeof createPropertySchema>;
export type UpdateProperty = z.infer<typeof updatePropertySchema>;
export type FindAllProperties = z.infer<typeof findAllPropertiesSchema>;
export type FindByIdProperties = z.infer<typeof findByIdPropertiesSchema>;
export type DeleteProperty = z.infer<typeof findByIdPropertiesSchema>;

