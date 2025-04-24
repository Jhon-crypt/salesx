import { useMemo } from 'react';
import { useStoreContext } from '../contexts/StoreContext';

// Interface to represent objects that have a store ID
interface WithStoreId {
  [key: string]: unknown;
  store_id?: number;
}

/**
 * A hook that filters data by the globally selected store.
 * 
 * @param data The data array to filter
 * @param storeIdField The name of the field in each item that contains the store ID (default: 'store_id')
 * @returns The filtered data array
 */
function useStoreFilter<T extends WithStoreId>(
  data: T[] | null | undefined,
  storeIdField: keyof T = 'store_id' as keyof T
) {
  const { selectedStoreId } = useStoreContext();
  
  return useMemo(() => {
    if (!data) return [];
    if (selectedStoreId === null) return data;
    
    return data.filter(item => {
      const itemStoreId = item[storeIdField];
      return itemStoreId === selectedStoreId;
    });
  }, [data, selectedStoreId, storeIdField]);
}

export default useStoreFilter; 