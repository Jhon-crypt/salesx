import React, { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react';
import { StoreInfo } from '../services/api';
import useApi from '../hooks/useApi';
import { dbApi } from '../services/api';

// Define the context shape
interface StoreContextType {
  stores: StoreInfo[];
  selectedStoreId: number | null;
  setSelectedStoreId: (storeId: number | null) => void;
  isLoading: boolean;
  selectedStore: StoreInfo | null;
  clearStoreSelection: () => void;
}

// Create the context with default values
export const StoreContext = createContext<StoreContextType>({
  stores: [],
  selectedStoreId: null,
  setSelectedStoreId: () => {},
  isLoading: true,
  selectedStore: null,
  clearStoreSelection: () => {},
});

// Custom hook for consuming the store context
export const useStoreContext = () => useContext(StoreContext);

interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  // Store selection state
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(() => {
    // Try to load from localStorage on initial render
    const savedStore = localStorage.getItem('selectedStoreId');
    return savedStore ? Number(savedStore) : null;
  });

  // Fetch store list
  const { data: stores = [], isLoading } = useApi(
    () => dbApi.getStores(),
    { deps: [] }
  );

  // Clear store selection
  const clearStoreSelection = useCallback(() => {
    setSelectedStoreId(null);
    localStorage.removeItem('selectedStoreId');
  }, []);

  // Save selection to localStorage when it changes
  useEffect(() => {
    if (selectedStoreId !== null) {
      localStorage.setItem('selectedStoreId', selectedStoreId.toString());
    } else {
      localStorage.removeItem('selectedStoreId');
    }
  }, [selectedStoreId]);

  // Get the currently selected store object
  const selectedStore = useMemo(() => {
    if (selectedStoreId === null) return null;
    return stores.find(store => store.store_id === selectedStoreId) || null;
  }, [stores, selectedStoreId]);

  // Context value
  const contextValue = useMemo(() => ({
    stores,
    selectedStoreId,
    setSelectedStoreId,
    isLoading,
    selectedStore,
    clearStoreSelection,
  }), [
    stores,
    selectedStoreId,
    setSelectedStoreId,
    isLoading,
    selectedStore,
    clearStoreSelection
  ]);

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
}; 