export const actionMessages = {
  saved: "Record saved successfully.",
  updated: "Changes updated successfully.",
  deleted: (label = "Record") => `${label} removed successfully.`,
  deleteTitle: (label = "this item") => `Delete ${label}?`,
  deleteMessage: "This action cannot be undone.",
  saveFailed: "Could not save changes. Please try again.",
  loadFailed: "Something went wrong. Please try again.",
};
