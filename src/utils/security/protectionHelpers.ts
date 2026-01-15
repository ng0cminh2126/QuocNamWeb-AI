/**
 * Protection helper utilities
 * Common functions used across security features
 */

/**
 * Check if element is editable (input, textarea, contenteditable)
 * @param element - HTML element to check
 * @returns true if element is editable
 */
export function isEditableElement(element: HTMLElement): boolean {
  const tagName = element.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    element.contentEditable === "true"
  );
}

/**
 * Check if current user is whitelisted
 * @param userEmail - User's email address
 * @param whitelist - Array of whitelisted emails
 * @returns true if user is whitelisted
 */
export function isUserWhitelisted(
  userEmail: string | null,
  whitelist: string[]
): boolean {
  if (!userEmail) return false;
  return whitelist
    .map((e) => e.toLowerCase())
    .includes(userEmail.toLowerCase());
}

/**
 * Get file extension from filename
 * @param filename - File name with extension
 * @returns lowercase file extension without dot
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

/**
 * Check if file type should be protected
 * @param filename - File name to check
 * @param protectedTypes - Array of protected file extensions
 * @returns true if file type should be protected
 */
export function isProtectedFileType(
  filename: string,
  protectedTypes: string[]
): boolean {
  const extension = getFileExtension(filename);
  return protectedTypes.includes(extension);
}
