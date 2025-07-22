import { useQuery } from "@tanstack/react-query";
import { FC_companies } from "./services";

export const useCompanies = (params: {
  id?: string;
  name?: string;
  type?: string;
  isActive?: string;
  offset?: string;
  limit?: string;
  city?: string;
}) => {
  const { id, name, type, isActive, offset, limit, city } = params;

  const queryKey = ["companies", id, name, type, isActive, offset, limit, city];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await FC_companies(params);
      return response;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60 * 1,
    retry: 1,
  });
};
