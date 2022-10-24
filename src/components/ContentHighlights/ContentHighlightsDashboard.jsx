import React from 'react';
import ZeroStateHighlights from './ZeroStateHighlights';
import CurrentContentHighlights from './CurrentContentHighlights';
import { TEST_COURSE_HIGHLIHTS_DATA } from './data/constants';

const ContentHighlightsDashboard = () => {
  const hasContentHighlights = TEST_COURSE_HIGHLIHTS_DATA.length > 1;
  // const hasContentHighlights = false;
  return (
    <>
      {!hasContentHighlights && (
      <ZeroStateHighlights />
      )}
      {hasContentHighlights && (
      <CurrentContentHighlights />
      )}
    </>
  );
};
export default ContentHighlightsDashboard;
