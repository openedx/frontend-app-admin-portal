import React from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import ZeroStateHighlights from './ZeroState';
import CurrentContentHighlights from './CurrentContentHighlights';
// import { TEST_COURSE_HIGHLIHTS_DATA } from './data/constants';

const ContentHighlightsDashboard = ({ data }) => {
  const hasContentHighlights = data?.length > 0;
  /* uncomment out import and 1 of the following conditions to test behavior */
  // const hasContentHighlights = TEST_COURSE_HIGHLIHTS_DATA.length > 0;
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

ContentHighlightsDashboard.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      uuid: PropTypes.string,
      title: PropTypes.string,
      is_published: PropTypes.bool,
      enterprise_curation: PropTypes.string,
      highlighted_content: PropTypes.arrayOf(
        PropTypes.shape({
          uuid: PropTypes.string,
          content_key: PropTypes.string,
          content_type: PropTypes.string,
          title: PropTypes.string,
          card_image_url: PropTypes.string,
          authoring_organizations: PropTypes.arrayOf(
            PropTypes.shape({
              uuid: PropTypes.string,
              name: PropTypes.string,
              logo_image_urls: PropTypes.string,
            }),
          ),
        }),
      ),
    }),
  ),
};

ContentHighlightsDashboard.defaultProps = {
  data: null,
};

export default ContentHighlightsDashboard;
