import { useEffect } from 'react';
import { checkAndRotateLogs, initializeLogArchive } from '../utils/logRotationUtil';

/**
 * Hook to check for and perform log rotation during application startup
 * @returns void
 */
export function useLogRotation(): void {
  useEffect(() => {
    // Initialize log archive directory and index
    initializeLogArchive().then(() => {
      console.log('Log archive initialized');
      
      // Check if logs need rotation
      checkAndRotateLogs().then(() => {
        console.log('Log rotation check completed');
      }).catch(error => {
        console.error('Error checking log rotation:', error);
      });
    }).catch(error => {
      console.error('Error initializing log archive:', error);
    });
  }, []);
}
