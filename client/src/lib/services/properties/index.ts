import { queryOptions } from "@tanstack/react-query";
import type { Property } from "shared";

import { crudClient, retryServerErrors } from "@/lib/services/api-client";

/** Body accepted by POST and PUT /api/properties. Nullable columns are cleared with null. */
export interface PropertyInput {
  name: string;
  address: string;
  city: string;
  country: string;
  propertyType: string;
  state: string | null;
  zipCode: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  squareMeters: number | null;
  description: string | null;
}

const properties = crudClient<Property, PropertyInput>("/properties");

export const getAllProperties = properties.getAll;
export const getProperty = properties.get;
export const createProperty = properties.create;
export const updateProperty = properties.update;
export const deleteProperty = properties.remove;

export const propertiesQueryKey = ["properties"] as const;

export const getAllPropertiesQueryOptions = queryOptions({
  queryKey: propertiesQueryKey,
  queryFn: getAllProperties,
  staleTime: 1000 * 60 * 5,
  retry: retryServerErrors,
});

export const getPropertyQueryOptions = (id: string) =>
  queryOptions({
    queryKey: [...propertiesQueryKey, id],
    queryFn: () => getProperty(id),
    retry: retryServerErrors,
  });
