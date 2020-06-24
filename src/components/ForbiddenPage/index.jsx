import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';

import H1 from '../../components/H1';
import { features } from '../../config';

const ForbiddenPage = ({ enterpriseSlug }) => (
  <main role="main">
    <div className="container-fluid mt-3">
      <Helmet>
        <title>Access Denied</title>
      </Helmet>
      <div className="text-center py-5">
        <H1>403</H1>
        <p className="lead">You do not have access to this page.</p>
        {features.SUPPORT &&
        <p>
          For assistance, click to contact the
          {' '}
          <Link to={`/${enterpriseSlug}/admin/support`}>edX Customer Success team.</Link>.
        </p>}
      </div>
    </div>
  </main>
);

ForbiddenPage.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(ForbiddenPage);
