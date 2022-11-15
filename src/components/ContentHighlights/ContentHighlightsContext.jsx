import React, { createContext, useReducer, useMemo } from 'react';
import PropTypes from 'prop-types';

import {
  contentHighlightsReducer,
  initialContentHighlightsState,
} from './data/reducer';

export const ContentHighlightsContext = createContext({});

const ContentHighlightsContextProvider = ({ children }) => {
  const [
    contentHighlightsState,
    dispatch,
  ] = useReducer(contentHighlightsReducer, initialContentHighlightsState);

  const value = useMemo(() => ({
    ...contentHighlightsState,
    dispatch,
  }), [contentHighlightsState]);

  return <ContentHighlightsContext.Provider value={value}>{children}</ContentHighlightsContext.Provider>;
};

ContentHighlightsContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ContentHighlightsContextProvider;
