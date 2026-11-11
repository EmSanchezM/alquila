import { z } from "zod";

export const amenitiesSchema = z.array(z.string()).optional();
export const imagesSchema = z.array(z.string()).optional();

// Limits mirror the `properties` table, so invalid values answer 400 instead of failing in Postgres.
const INT4_MAX = 2_147_483_647;
const count = z.number().int().min(0).max(INT4_MAX);
// square_meters is decimal(8, 2).
const squareMeters = z.number().min(0).max(999_999.99).transform(String);

const requiredFields = {
  name: z.string().max(200),
  address: z.string(),
  city: z.string().max(100),
  country: z.string().max(100),
  propertyType: z.string().max(50),
};

// Columns that are nullable in the table: optional, and null clears them.
const nullableFields = {
  state: z.string().max(100).nullable().optional(),
  zipCode: z.string().max(20).nullable().optional(),
  bedrooms: count.nullable().optional(),
  bathrooms: count.nullable().optional(),
  squareMeters: squareMeters.nullable().optional(),
  description: z.string().nullable().optional(),
  amenities: amenitiesSchema,
  images: imagesSchema,
};

export const createPropertySchema = z.object({
  ...requiredFields,
  ...nullableFields,
  isActive: z.boolean().default(true),
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
    ...z.object(requiredFields).partial().shape,
    ...nullableFields,
  }),
});

export type CreateProperty = z.infer<typeof createPropertySchema>;
export type UpdateProperty = z.infer<typeof updatePropertySchema>;
export type FindAllProperties = z.infer<typeof findAllPropertiesSchema>;
export type FindByIdProperties = z.infer<typeof findByIdPropertiesSchema>;
export type DeleteProperty = z.infer<typeof findByIdPropertiesSchema>;

