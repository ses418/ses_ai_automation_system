import { useState, useEffect, useRef } from 'react';

interface UseLoadingStateOptions {
  timeout?: number; // Timeout in milliseconds
  autoReset?: boolean; // Whether to auto-reset loading state
  resetDelay?: number; // Delay before auto-reset
}

export const useLoadingState = (options: UseLoadingStateOptions = {}) => {
  const { timeout = 10000, autoReset = true, resetDelay = 3000 } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Auto-reset loading state if it takes too long
  useEffect(() => {
    if (isLoading && autoReset) {
      timeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          console.warn('Loading state timed out, auto-resetting');
          setIsLoading(false);
          setError('Loading timed out. Please try again.');
        }
      }, timeout);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, timeout, autoReset]);

  // Auto-reset error state after delay
  useEffect(() => {
    if (error && autoReset) {
      const errorTimeout = setTimeout(() => {
        if (isMountedRef.current) {
          setError(null);
        }
      }, resetDelay);

      return () => clearTimeout(errorTimeout);
    }
  }, [error, resetDelay, autoReset]);

  const startLoading = () => {
    if (isMountedRef.current) {
      setIsLoading(true);
      setError(null);
    }
  };

  const stopLoading = () => {
    if (isMountedRef.current) {
      setIsLoading(false);
    }
  };

  const setErrorState = (errorMessage: string) => {
    if (isMountedRef.current) {
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const reset = () => {
    if (isMountedRef.current) {
      setIsLoading(false);
      setError(null);
    }
  };

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setErrorState,
    reset
  };
};
