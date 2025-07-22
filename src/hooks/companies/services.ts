import { CompanyI } from "@/types";
import axios from "axios";

export const FC_companies = async (params: {
  id?: string;
  name?: string;
  type?: string;
  isActive?: string;
  offset?: string;
  limit?: string;
  city?: string;
}): Promise<CompanyI[]> => {
  const response = await axios.get("/api/companies", {
    params,
  });

  return response.data.data.companies;
};
