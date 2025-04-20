import { useState, useEffect } from 'react';

interface UseApiOptions<T> {
  initialData?: T;
  deps?: any[];
  autoFetch?: boolean;
  skipFetch?: boolean;
}

/**
 * Custom hook for handling API calls with loading and error states
 * @param fetchFn - The API function to call
 * @param options - Configuration options
 * @returns An object with data, loading state, error state, and a refetch function
 */
const useApi = <T>(
  fetchFn: () => Promise<T>,
  options: UseApiOptions<T> = {}
) => {
  const { initialData, deps = [], autoFetch = true, skipFetch = false } = options;
  
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(autoFetch && !skipFetch);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (skipFetch) {
      return data as T;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn();
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      console.error('API Error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && !skipFetch) {
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, skipFetch]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
};

export default useApi; 