import axios from "axios";
import { PartFormData } from "./useCreatePart";

export const createPart = async (partData: PartFormData) => {
  const response = await axios.post("/api/parts", partData);
  return response.data.data;
};
