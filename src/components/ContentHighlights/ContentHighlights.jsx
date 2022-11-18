import React from 'react';
import ContentHighlightRoutes from './ContentHighlightRoutes';
import Hero from '../Hero';

import ContentHighlightsContextProvider from './ContentHighlightsContext';

function ContentHighlights() {
  return (
    <ContentHighlightsContextProvider>
      <Hero title="Highlights" />
      <ContentHighlightRoutes />
    </ContentHighlightsContextProvider>
  );
}

export default ContentHighlights;
