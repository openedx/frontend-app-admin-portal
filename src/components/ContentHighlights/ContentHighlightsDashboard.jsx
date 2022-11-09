import React from 'react';
import PropTypes from 'prop-types';
import { Container } from '@edx/paragon';
import ZeroStateHighlights from './ZeroState';
import CurrentContentHighlights from './CurrentContentHighlights';
import ContentHighlightHelmet from './ContentHighlightHelmet';
// import { TEST_COURSE_HIGHLIGHTS_DATA } from './data/constants';

const ContentHighlightsDashboard = ({ highlightSets }) => {
  const hasContentHighlights = highlightSets?.length > 0;
  /* uncomment out import and 1 of the following conditions to test behavior */
  // const hasContentHighlights = TEST_COURSE_HIGHLIGHTS_DATA.length > 0;
  // const hasContentHighlights = false;
  if (!hasContentHighlights) {
    return (
      <Container fluid className="mt-5">
        <ContentHighlightHelmet title="Highlights" />
        <ZeroStateHighlights />
      </Container>
    );
  }

  return (
    <Container fluid className="mt-5">
      <ContentHighlightHelmet title="Highlights" />
      <CurrentContentHighlights />
    </Container>
  );
};

ContentHighlightsDashboard.propTypes = {
  highlightSets: PropTypes.arrayOf(
    PropTypes.shape({
      uuid: PropTypes.string,
      title: PropTypes.string,
      isPublished: PropTypes.bool,
      enterpriseCuration: PropTypes.string,
      highlightedContent: PropTypes.arrayOf(
        PropTypes.shape({
          uuid: PropTypes.string,
          contentKey: PropTypes.string,
          contentType: PropTypes.string,
          title: PropTypes.string,
          cardImageUrl: PropTypes.string,
          authoringOrganizations: PropTypes.arrayOf(
            PropTypes.shape({
              uuid: PropTypes.string,
              name: PropTypes.string,
              logoImageUrl: PropTypes.string,
            }),
          ),
        }),
      ),
    }),
  ),
};

ContentHighlightsDashboard.defaultProps = {
  highlightSets: null,
};

export default ContentHighlightsDashboard;
