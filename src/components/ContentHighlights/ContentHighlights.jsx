import React from 'react';
import ContentHighlightRoutes from './ContentHighlightRoutes';
import Hero from '../Hero';
import useStepperModalState from './data/hooks';

import ContentHighlightsContextProvider from './ContentHighlightsContext';

const ContentHighlights = () => {
  const {
    setIsModalOpen, isModalOpen,
  } = useStepperModalState({});
  const value = {
    setIsModalOpen,
    isModalOpen,
  };
  return (
    <ContentHighlightsContextProvider value={value}>
      <Hero title="Highlights" />
      <ContentHighlightRoutes />
    </ContentHighlightsContextProvider>
  );
};

export default ContentHighlights;
