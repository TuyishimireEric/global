import { useQuery } from "@tanstack/react-query";
import { FC_getItems } from "./services";

export const usePartItems = (params: {
  partId: string;
  supplierId?: string;
  search?: string;
  status?: string;
  offset?: string;
  limit?: string;
  orderBy?: string;
  barCode?: string;
}) => {
  const {
    partId,
    limit = "20",
    supplierId,
    search,
    status,
    offset,
    orderBy,
  } = params;

  const queryKey = [
    "items",
    partId,
    limit,
    supplierId,
    search,
    status,
    offset,
    orderBy,
  ];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await FC_getItems(params);
      return response;
    },
    enabled: !!partId,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60 * 1, // 1 hours expected
    retry: 1,
  });
};
