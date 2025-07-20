import { z } from "zod";

export const amenitiesSchema = z.array(z.string()).optional();
export const imagesSchema = z.array(z.string()).optional();

export const CreatePropertyFormValidation = z.object({
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
});