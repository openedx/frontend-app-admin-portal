import { useMemo, useState } from 'react';
import { createContext } from 'use-context-selector';
import { SearchClient } from 'algoliasearch/lite';

import { withAlgoliaSearch, type UseAlgoliaSearchResult } from '../algolia-search';

export type StepperModalState = {
  isOpen: boolean;
  highlightTitle: string | null;
  titleStepValidationError: string | null;
  currentSelectedRowIds: Record<string, boolean>;
};

export type ContentHighlightsAlgoliaContextValue = {
  searchClient: SearchClient | null;
  securedAlgoliaApiKey: string | null;
  isLoading: boolean;
};

export type ContentHighlightsContextValue = [
  {
    stepperModal: StepperModalState;
    contentHighlights: unknown[];
    algolia: ContentHighlightsAlgoliaContextValue;
  },
  React.Dispatch<React.SetStateAction<{
    stepperModal: StepperModalState;
    contentHighlights: unknown[];
    algolia: ContentHighlightsAlgoliaContextValue;
  }>>,
];

interface ContentHighlightsContextProviderProps {
  children: React.ReactNode;
  algolia: UseAlgoliaSearchResult;
}

const initialState = {
  stepperModal: {
    isOpen: false,
    highlightTitle: null,
    titleStepValidationError: null,
    currentSelectedRowIds: {},
  },
  contentHighlights: [],
  algolia: {
    searchClient: null,
    securedAlgoliaApiKey: null,
    isLoading: false,
  },
};

const initialContextValue: ContentHighlightsContextValue = [
  initialState,
  () => {},
];

export const ContentHighlightsContext = createContext<ContentHighlightsContextValue>(initialContextValue);

const ContentHighlightsContextProvider = ({ children, algolia }: ContentHighlightsContextProviderProps) => {
  const [state, setState] = useState(initialState);
  const contextValue: ContentHighlightsContextValue = useMemo(() => [
    {
      ...state,
      algolia: {
        searchClient: algolia.searchClient,
        securedAlgoliaApiKey: algolia.securedAlgoliaApiKey || null,
        isLoading: algolia.isLoading,
      },
    },
    setState,
  ], [state, algolia.searchClient, algolia.securedAlgoliaApiKey, algolia.isLoading]);

  return (
    <ContentHighlightsContext.Provider value={contextValue}>
      {children}
    </ContentHighlightsContext.Provider>
  );
};

export default withAlgoliaSearch(ContentHighlightsContextProvider);
