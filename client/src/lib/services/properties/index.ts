import { queryOptions } from "@tanstack/react-query";
import type { Property } from "shared";

// Extended property type for frontend display
export interface PropertyWithDetails extends Property {
  status?: "occupied" | "vacant" | "maintenance";
  monthlyRent?: number;
  tenant?: string | null;
}

export const getAllProperties = async (): Promise<PropertyWithDetails[]> => {
  try {
    // Use fetch directly for now until we fix the typing issue
    const response = await fetch("/api/properties");

    if (!response.ok) {
      throw new Error("Failed to fetch properties");
    }

    const result: { success: boolean; data: Property[] } = await response.json();
    console.log({ result });
    return result.data || [];
  } catch (error) {
    console.error('Failed to fetch properties:', error);
    throw error;
  }
}

export const getAllPropertiesQueryOptions = queryOptions({
  queryKey: ["get-all-properties"],
  queryFn: getAllProperties,
  staleTime: 1000 * 60 * 5,
});