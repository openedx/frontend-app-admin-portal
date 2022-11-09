import React, { createContext, useMemo } from 'react';
import PropTypes from 'prop-types';

import { useStepperModalState, useStepperDataState } from './data/hooks';

export const ContentHighlightsContext = createContext({});

const ContentHighlightsContextProvider = ({ children }) => {
  const { setIsModalOpen, isModalOpen } = useStepperModalState();
  const { setStepperData, stepperData } = useStepperDataState();
  const value = useMemo(() => ({
    setIsModalOpen,
    isModalOpen,
    setStepperData,
    stepperData,
  }), [setIsModalOpen, isModalOpen, setStepperData, stepperData]);

  return <ContentHighlightsContext.Provider value={value}>{children}</ContentHighlightsContext.Provider>;
};

ContentHighlightsContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ContentHighlightsContextProvider;
