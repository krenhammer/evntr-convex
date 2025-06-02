import { getAuth } from '~/auth/use-auth-hooks';
import { logger } from '@/utils/logger';

// Get the currently authenticated user
export async function getCurrentUser(request: Request) {
  try {
    // Use getAuth from Clerk to verify the session and get user data
    const auth = await getAuth(request);
    
    if (!auth || !auth.userId) {
      logger.debug('No user ID found in auth response');
      return null;
    }
    
    logger.debug(`User authenticated: ${auth.userId}`);
    
    // Return user object with available information
    return {
      id: auth.userId,
      email: auth.userId, // Using userId as fallback since user object is not accessible
      firstName: "",
      lastName: ""
    };
  } catch (error) {
    logger.error('Error getting current user:', error);
    return null;
  }
}

// Get a user's active organization ID
export async function getActiveOrganizationId(request: Request | string) {
  try {
    // If we receive a Request object, extract the user ID first
    if (typeof request === 'string') {
      return null;
    } else {
      const auth = await getAuth(request);
      return auth.orgId || null;
    }
  } catch (error) {
    logger.error('Error getting active organization:', error);
    return null;
  }
} 