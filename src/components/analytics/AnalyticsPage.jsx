import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

import Hero from '../Hero';
import AnalyticsCharts from './AnalyticsCharts';

const PAGE_TITLE = 'Analytics';

function AnalyticsPage({ enterpriseId }) {
  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Hero title={PAGE_TITLE} />
      <AnalyticsCharts enterpriseId={enterpriseId} />
    </>
  );
}

AnalyticsPage.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(AnalyticsPage);
