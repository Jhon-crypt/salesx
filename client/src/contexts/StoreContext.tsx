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
    console.log('StoreContext: stores loaded, count:', stores.length);
    console.log('StoreContext: current selectedStoreId:', selectedStoreId);
    
    if (stores.length > 0 && selectedStoreId !== null) {
      const store = stores.find(s => s.store_id === selectedStoreId);
      console.log('StoreContext: found store:', store?.store_name || 'Not Found');
      setSelectedStore(store || null);
      
      // Update document title to reflect selected store
      const storeName = store?.store_name || `Store ${selectedStoreId}`;
      document.title = `SalesX - ${storeName}`;
    } else if (selectedStoreId === null) {
      setSelectedStore(null);
      document.title = 'SalesX - All Stores';
    }
  }, [stores, selectedStoreId]);
  
  // Handle store selection change
  const handleStoreChange = (storeId: number | null) => {
    console.log('Store context changing to store ID:', storeId);
    
    // Set the store ID in state
    setSelectedStoreId(storeId);
    
    // Update localStorage
    if (storeId === null) {
      localStorage.removeItem('selectedStoreId');
    } else {
      localStorage.setItem('selectedStoreId', storeId.toString());
    }
    
    // Find and set the store object if a store ID is selected
    if (storeId !== null && stores.length > 0) {
      const store = stores.find(s => s.store_id === storeId);
      setSelectedStore(store || null);
    } else {
      setSelectedStore(null);
    }
    
    // Update document title to reflect selected store
    if (storeId === null) {
      document.title = 'SalesX - All Stores';
    } else {
      const storeName = stores.find(s => s.store_id === storeId)?.store_name || `Store ${storeId}`;
      document.title = `SalesX - ${storeName}`;
    }
    
    console.log('Store context updated:', storeId, 
      stores.find(s => s.store_id === storeId)?.store_name || 'All Stores');
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