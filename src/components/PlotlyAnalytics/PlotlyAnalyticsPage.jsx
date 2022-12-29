import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

import Hero from '../Hero';
import StatusAlert from '../StatusAlert';
import PlotlyAnalyticsCharts from './PlotlyAnalyticsCharts';

const PAGE_TITLE = 'Analytics';

const PlotlyAnalyticsPage = ({ enterpriseId }) => {
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
      <PlotlyAnalyticsCharts enterpriseId={enterpriseId} />
    </>
  );
};

PlotlyAnalyticsPage.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(PlotlyAnalyticsPage);
