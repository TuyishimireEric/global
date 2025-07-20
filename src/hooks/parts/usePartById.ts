import { useQuery } from "@tanstack/react-query";
import { getPartById } from "./services";

export const usePartById = (partId: string) => {
  return useQuery({
    queryKey: ["part", partId],
    queryFn: async () => {
      const response = await getPartById(partId);
      return response;
    },
    enabled: !!partId,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60 * 1, // 1 hours expected
    retry: 1,
  });
};
