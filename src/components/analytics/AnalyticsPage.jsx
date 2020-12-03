import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

import Hero from '../Hero';
import StatusAlert from '../StatusAlert';
import AnalyticsCharts from './AnalyticsCharts';

const PAGE_TITLE = 'Analytics';

// eslint-disable-next-line no-unused-vars
function AnalyticsPage({ enterpriseSlug, enterpriseId }) {
  const [status, setStatus] = useState({
    visible: false, alertType: '', message: '',
  });

  const setSuccessStatus = ({ visible, message = '' }) => {
    setStatus({
      visible,
      alertType: 'success',
      message,
    });
  };

  const renderStatusMessage = () => (
    status && status.visible && (
      <StatusAlert
        alertType={status.alertType}
        iconClassName={status.iconClassName || `fa ${status.alertType === 'success' ? 'fa-check' : 'fa-times-circle'}`}
        title={status.title}
        message={status.message}
        onClose={() => setSuccessStatus({ visible: false })}
        dismissible
      />
    )
  );

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Hero title={PAGE_TITLE} />
      <div className="col-12 col-lg-9">
        {renderStatusMessage()}
      </div>
      <AnalyticsCharts enterpriseId={enterpriseId} />
    </>
  );
}

AnalyticsPage.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(AnalyticsPage);
