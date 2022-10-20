import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

import { DashApp } from 'dash-embedded-component';
import Hero from '../Hero';
import { configuration } from '../../config';

const PAGE_TITLE = 'Plotly Analytics';

// eslint-disable-next-line no-unused-vars
function NewAnalyticsPage({ enterpriseSlug, enterpriseId }) {
  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Hero title={PAGE_TITLE} />
      <h1>Embedded Dash Application</h1>
      <DashApp
        config={{
          url_base_pathname: configuration.PLOTLY_SERVER_URL,
        }}
      />
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
