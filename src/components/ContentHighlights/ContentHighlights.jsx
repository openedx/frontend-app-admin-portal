import React from 'react';
import ContentHighlightRoutes from './ContentHighlightRoutes';
import Hero from '../Hero';
import useStepperModalState from './data/hooks';

import ContentHighlightContextProvider from './ContentHighlightsContext';

const ContentHighlights = () => {
  const {
    stepperModalState, setIsModalOpen, isModalOpen, setHighlightStepperModal,
  } = useStepperModalState({});
  const value = {
    stepperModalState,
    setIsModalOpen,
    isModalOpen,
    setHighlightStepperModal,
  };
  return (
    <ContentHighlightContextProvider value={value}>
      <Hero title="Highlights" />
      <ContentHighlightRoutes />
    </ContentHighlightContextProvider>
  );
};

export default ContentHighlights;
