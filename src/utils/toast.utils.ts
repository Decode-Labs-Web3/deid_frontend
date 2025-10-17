import { toast } from "@/hooks/use-toast";

// Toast utility functions using shadcn/ui toast
export const toastError = (message: string) => {
  console.error("Toast Error:", message);
  toast({
    variant: "destructive",
    title: "Error",
    description: message,
  });
};

export const toastSuccess = (message: string, title = "Success") => {
  console.log("Toast Success:", message);
  toast({
    title,
    description: message,
  });
};

export const toastInfo = (message: string, title = "Info") => {
  toast({
    title,
    description: message,
  });
};

export const toastWarning = (message: string, title = "Warning") => {
  toast({
    title,
    description: message,
    variant: "default",
  });
};
