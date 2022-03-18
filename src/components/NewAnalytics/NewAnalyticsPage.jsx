import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

import Hero from '../Hero';

const PAGE_TITLE = 'New Analytics';

// eslint-disable-next-line no-unused-vars
function NewAnalyticsPage({ enterpriseSlug, enterpriseId }) {
  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Hero title={PAGE_TITLE} />
      <iframe name="frame-id" src="https://dashdemo.sandbox.edx.org/" title="New Analytics" width="100%" height="100%" />
    </>
  );
}

NewAnalyticsPage.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(NewAnalyticsPage);
