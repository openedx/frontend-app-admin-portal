import { createContext, useContext } from 'react';

export const AnalyticsFiltersContext = createContext(null);

export const useAnalyticsFilters = () => useContext(AnalyticsFiltersContext);
