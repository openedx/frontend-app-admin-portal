import React from 'react';
import ZeroStateHighlights from './ZeroStateHighlights';
import CurrentContentHighlights from './CurrentContentHighlights';
import { TEST_COURSE_HIGHLIHTS_DATA } from './data/constants';
import ContentHighlightHelmet from './ContentHighlightHelmet';

const ContentHighlightsDashboard = () => {
  const hasContentHighlights = TEST_COURSE_HIGHLIHTS_DATA.length > 1;
  // const hasContentHighlights = false;

  if (!hasContentHighlights) {
    return (
      <>
        <ContentHighlightHelmet title="Highlights" />
        <ZeroStateHighlights />
      </>
    );
  }

  return (
    <>
      <ContentHighlightHelmet title="Highlights" />
      <CurrentContentHighlights />
    </>
  );
};
export default ContentHighlightsDashboard;
