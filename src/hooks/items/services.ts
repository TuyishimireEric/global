import axios from "axios";

export const FC_getItems = async (params: {
  partId: string;
  supplierId?: string;
  search?: string;
  status?: string;
  offset?: string;
  limit?: string;
  orderBy?: string;
  barCode?: string;
}) => {
  const response = await axios.get("/api/parts/items", {
    params,
  });

  return response.data.data;
};
