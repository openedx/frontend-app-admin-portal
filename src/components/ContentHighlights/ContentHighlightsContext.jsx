import React, { createContext, useMemo } from 'react';
import PropTypes from 'prop-types';

import {
  useStepperModalState,
} from './data/hooks';

export const ContentHighlightsContext = createContext({});

const ContentHighlightsContextProvider = ({ children }) => {
  const { setIsModalOpen, isModalOpen } = useStepperModalState();
  const value = useMemo(() => ({
    setIsModalOpen,
    isModalOpen,
  }), [setIsModalOpen, isModalOpen]);

  return <ContentHighlightsContext.Provider value={value}>{children}</ContentHighlightsContext.Provider>;
};

ContentHighlightsContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ContentHighlightsContextProvider;
