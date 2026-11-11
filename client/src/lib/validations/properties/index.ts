import { z } from "zod";
import type { Property } from "shared";

import type { PropertyInput } from "@/lib/services/properties";

export const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "room", label: "Room" },
  { value: "studio", label: "Studio" },
  { value: "commercial", label: "Commercial" },
  { value: "land", label: "Land" },
];

const wholeNumber = z.string().trim().regex(/^\d*$/, "Enter a whole number").refine((v) => v === "" || Number(v) <= 2_147_483_647, "Number is too large");

// Form values are strings, as typed in the inputs. Limits mirror the server schema
// and the `properties` table.
export const PropertyFormValidation = z.object({
  name: z.string().trim().min(1, "Enter a name").max(200, "Use 200 characters or fewer"),
  propertyType: z.string().min(1, "Select a type").max(50),
  address: z.string().trim().min(1, "Enter an address"),
  city: z.string().trim().min(1, "Enter a city").max(100, "Use 100 characters or fewer"),
  state: z.string().trim().max(100, "Use 100 characters or fewer"),
  zipCode: z.string().trim().max(20, "Use 20 characters or fewer"),
  country: z.string().trim().min(1, "Enter a country").max(100, "Use 100 characters or fewer"),
  bedrooms: wholeNumber,
  bathrooms: wholeNumber,
  squareMeters: z
    .string()
    .trim()
    .regex(/^(\d+(\.\d{1,2})?)?$/, "Enter a number with up to 2 decimals")
    .refine((v) => v === "" || Number(v) <= 999_999.99, "Use a value up to 999999.99"),
  description: z.string(),
});

export type PropertyFormValues = z.infer<typeof PropertyFormValidation>;

export const emptyPropertyForm: PropertyFormValues = {
  name: "",
  propertyType: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  bedrooms: "",
  bathrooms: "",
  squareMeters: "",
  description: "",
};

const text = (value: string | null) => value ?? "";
const number = (value: number | string | null) => (value === null ? "" : String(Number(value)));

export function toPropertyForm(property: Property): PropertyFormValues {
  return {
    name: property.name,
    propertyType: property.propertyType,
    address: property.address,
    city: property.city,
    state: text(property.state),
    zipCode: text(property.zipCode),
    country: property.country,
    bedrooms: number(property.bedrooms),
    bathrooms: number(property.bathrooms),
    squareMeters: number(property.squareMeters),
    description: text(property.description),
  };
}

/** Blank optional fields become null, so editing can clear them. */
export function toPropertyInput(values: PropertyFormValues): PropertyInput {
  const orNull = (value: string) => (value.trim() === "" ? null : value.trim());
  const numberOrNull = (value: string) => (value.trim() === "" ? null : Number(value));

  return {
    name: values.name.trim(),
    propertyType: values.propertyType,
    address: values.address.trim(),
    city: values.city.trim(),
    state: orNull(values.state),
    zipCode: orNull(values.zipCode),
    country: values.country.trim(),
    bedrooms: numberOrNull(values.bedrooms),
    bathrooms: numberOrNull(values.bathrooms),
    squareMeters: numberOrNull(values.squareMeters),
    description: values.description.trim() === "" ? null : values.description,
  };
}
