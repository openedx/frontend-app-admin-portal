import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Alert } from '@edx/paragon';
import { Error, CheckCircle } from '@edx/paragon/icons';

import Hero from '../Hero';
import AnalyticsCharts from './AnalyticsCharts';

const PAGE_TITLE = 'Analytics';

function AnalyticsPage({ enterpriseId }) {
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
      <Alert
        variant={status.alertType}
        icon={status.alertType === 'success' ? CheckCircle : Error}
        onClose={() => setSuccessStatus({ visible: false })}
        dismissible
      >
        <Alert.Heading>
          {status.title}
        </Alert.Heading>
        {status.message}
      </Alert>
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
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(AnalyticsPage);
