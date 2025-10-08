// Simple toast utility functions
export const toastError = (message: string) => {
  console.error("Toast Error:", message);
  // You can implement a proper toast system here later
  alert(`Error: ${message}`);
};

export const toastSuccess = (message: string) => {
  console.log("Toast Success:", message);
  // You can implement a proper toast system here later
  alert(`Success: ${message}`);
};
