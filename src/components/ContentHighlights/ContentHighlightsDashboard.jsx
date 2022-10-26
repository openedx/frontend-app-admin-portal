import React from 'react';
import { Helmet } from 'react-helmet';
import ZeroStateHighlights from './ZeroStateHighlights';
import CurrentContentHighlights from './CurrentContentHighlights';
import { TEST_COURSE_HIGHLIHTS_DATA } from './data/constants';

const ContentHighlightsDashboard = () => {
  const hasContentHighlights = TEST_COURSE_HIGHLIHTS_DATA.length > 1;
  // const hasContentHighlights = false;

  if (!hasContentHighlights) {
    return (
      <>
        <Helmet>
          <title>Highlights</title>
        </Helmet>
        <ZeroStateHighlights />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Highlights</title>
      </Helmet>
      <CurrentContentHighlights />
    </>
  );
};
export default ContentHighlightsDashboard;
