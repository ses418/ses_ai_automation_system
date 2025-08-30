import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface LoadingContextType {
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
  resetAllLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useGlobalLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useGlobalLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: React.ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [globalLoading, setGlobalLoading] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-reset global loading if it gets stuck
  useEffect(() => {
    if (globalLoading) {
      loadingTimeoutRef.current = setTimeout(() => {
        console.warn('Global loading timed out, auto-resetting');
        setGlobalLoading(false);
      }, 15000); // 15 second timeout
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [globalLoading]);

  // Reset all loading states when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && globalLoading) {
        console.log('Page became visible, resetting stuck loading state');
        setGlobalLoading(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [globalLoading]);

  const resetAllLoading = () => {
    setGlobalLoading(false);
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
  };

  return (
    <LoadingContext.Provider value={{
      globalLoading,
      setGlobalLoading,
      resetAllLoading
    }}>
      {children}
    </LoadingContext.Provider>
  );
};
