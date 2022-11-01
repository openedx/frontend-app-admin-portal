import React, { createContext } from 'react';
import PropTypes from 'prop-types';

import useStepperModalState from './data/hooks';

export const ContentHighlightsContext = createContext({});

const ContentHighlightsContextProvider = ({ children }) => {
//   const [stepperModalState, stepperModalDispatch] = useReducer(stepperModalReducer, initialStepperModalState);
  const { stepperModalState, setIsModalOpen, isModalOpen } = useStepperModalState();
  const value = {
    stepperModalState,
    setIsModalOpen,
    isModalOpen,
  };

  return <ContentHighlightsContext.Provider value={value}>{children}</ContentHighlightsContext.Provider>;
};

ContentHighlightsContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ContentHighlightsContextProvider;
