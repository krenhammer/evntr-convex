/**
 * Clerk authentication client utilities
 */

// Function to get the session cookie from Clerk
export function getSessionCookie(): string | null {
  // Clerk handles cookies automatically in most cases
  // This is a placeholder for compatibility with the apiClient
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('__session='))
    ?.split('=')[1] || null;
}

// Function to refresh the Clerk session
export async function refreshSession(): Promise<boolean> {
  try {
    // In a real implementation, you might need to call Clerk's session refresh mechanism
    // For most Clerk implementations this isn't necessary as Clerk handles token refresh automatically
    // This is a compatibility layer for the existing apiClient
    
    // Return true to indicate successful refresh (in actual implementation would depend on Clerk)
    return true;
  } catch (error) {
    console.error('Failed to refresh session:', error);
    return false;
  }
} 