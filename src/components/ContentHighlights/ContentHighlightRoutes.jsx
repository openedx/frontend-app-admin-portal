import React from 'react';
import { Route } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import ContentHighlightSet from './ContentHighlightSet';
import ContentHighlightsDashboard from './ContentHighlightsDashboard';

const ContentHighlightRoutes = ({ enterpriseSlug }) => {
  const baseContentHighlightPath = `/${enterpriseSlug}/admin/${ROUTE_NAMES.contentHighlights}`;
  return (
    <>
      <Route
        path={baseContentHighlightPath}
        component={ContentHighlightsDashboard}
        exact
      />
      <Route
        path={`${baseContentHighlightPath}/:highlightSetUUID/`}
        component={ContentHighlightSet}
        exact
      />
    </>
  );
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

ContentHighlightRoutes.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(ContentHighlightRoutes);
