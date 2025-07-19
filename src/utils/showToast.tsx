import { toast } from "react-hot-toast";

type ToastType = "success" | "error";

const showToast = (message: string, type: ToastType): void => {
  if (type === "success") {
    toast.success(message);
  } else if (type === "error") {
    toast.error(message);
  }
};
export default showToast;
