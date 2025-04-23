import React, { createContext, useState, useContext, useEffect } from 'react';
import { StoreInfo } from '../services/api';
import useApi from '../hooks/useApi';
import { dbApi } from '../services/api';

interface StoreContextType {
  selectedStoreId: number | null;
  setSelectedStoreId: (storeId: number | null) => void;
  selectedStore: StoreInfo | null;
  stores: StoreInfo[];
  isLoading: boolean;
}

const StoreContext = createContext<StoreContextType>({
  selectedStoreId: null,
  setSelectedStoreId: () => {},
  selectedStore: null,
  stores: [],
  isLoading: false
});

export const useStore = () => useContext(StoreContext);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get selected store from localStorage on initial load
  const storedStoreId = localStorage.getItem('selectedStoreId');
  const initialStoreId = storedStoreId ? parseInt(storedStoreId) : null;
  
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(initialStoreId);
  const { data: stores = [], isLoading } = useApi(() => dbApi.getStores());
  const [selectedStore, setSelectedStore] = useState<StoreInfo | null>(null);
  
  // Update localStorage when store changes
  useEffect(() => {
    if (selectedStoreId === null) {
      localStorage.removeItem('selectedStoreId');
    } else {
      localStorage.setItem('selectedStoreId', selectedStoreId.toString());
    }
  }, [selectedStoreId]);
  
  // Update selectedStore object when stores are loaded or selectedStoreId changes
  useEffect(() => {
    if (stores.length > 0 && selectedStoreId !== null) {
      const store = stores.find(s => s.store_id === selectedStoreId);
      setSelectedStore(store || null);
    } else {
      setSelectedStore(null);
    }
  }, [stores, selectedStoreId]);
  
  // Handle store selection change
  const handleStoreChange = (storeId: number | null) => {
    setSelectedStoreId(storeId);
    // Update document title to reflect selected store
    if (storeId === null) {
      document.title = 'SalesX - All Stores';
    } else {
      const storeName = stores.find(s => s.store_id === storeId)?.store_name || `Store ${storeId}`;
      document.title = `SalesX - ${storeName}`;
    }
  };
  
  return (
    <StoreContext.Provider 
      value={{
        selectedStoreId,
        setSelectedStoreId: handleStoreChange,
        selectedStore,
        stores,
        isLoading
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContext; 