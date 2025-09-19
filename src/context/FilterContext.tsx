"use client";
import { createContext, useContext, useState, Dispatch, SetStateAction } from 'react';

type FilterContextType = {
  filterSelection: string;
  setFilterSelection: Dispatch<SetStateAction<string>>;
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filterSelection, setFilterSelection] = useState('all');

  return (
    <FilterContext.Provider value={{ filterSelection, setFilterSelection }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}
