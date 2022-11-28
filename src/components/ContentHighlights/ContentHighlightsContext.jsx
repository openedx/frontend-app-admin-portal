import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { createContext } from 'use-context-selector';

export const ContentHighlightsContext = createContext(null);

const ContentHighlightsContextProvider = ({ children }) => {
  const contextValue = useState({
    stepperModal: {
      isOpen: false,
      highlightTitle: null,
      titleStepValidationError: null,
      currentSelectedRowIds: {},
    },
    contentHighlights: [],
  });

  return <ContentHighlightsContext.Provider value={contextValue}>{children}</ContentHighlightsContext.Provider>;
};

ContentHighlightsContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ContentHighlightsContextProvider;
