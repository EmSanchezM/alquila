import { api } from "@/lib/api";
import { queryOptions } from "@tanstack/react-query";

export const getAllProperties = async () => {
  try {
    const response = await api.properties.$get({});
    
    if (!response.ok) {
      const error = await response.json();
      const message = error instanceof Error ? error.message : "Server error";
      throw new Error(message);
    }
    const { data } = await response.json();

    return data;
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