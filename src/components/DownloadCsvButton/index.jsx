import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '@edx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

class DownloadCsvButton extends React.Component {
  componentWillUnmount() {
    this.props.clearCsv();
  }

  render() {
    const {
      fetchMethod,
      fetchCsv,
      csvLoading,
      disabled,
      buttonLabel,
      enterpriseId,
      id,
    } = this.props;
    const downloadButtonIconClasses = csvLoading ? ['fa-spinner', 'fa-spin'] : ['fa-download'];
    return (
      <Button
        variant="outline-primary"
        className="download-btn d-sm-inline float-md-right"
        disabled={disabled || csvLoading}
        onClick={() => {
          fetchCsv(fetchMethod);
          sendEnterpriseTrackEvent(enterpriseId, 'edx.ui.enterprise.admin_portal.download_csv.clicked', {
            csvId: id,
          });
        }}
      >
        <>
          <Icon className={`fa mr-2 ${downloadButtonIconClasses.join(' ')}`} />
          {buttonLabel}
        </>
      </Button>
    );
  }
}

DownloadCsvButton.defaultProps = {
  csvLoading: false,
  fetchMethod: () => {},
  disabled: false,
  buttonLabel: 'Download full report (CSV)',
};

DownloadCsvButton.propTypes = {
  fetchCsv: PropTypes.func.isRequired,
  fetchMethod: PropTypes.func,
  csvLoading: PropTypes.bool,
  clearCsv: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  buttonLabel: PropTypes.string,
  enterpriseId: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

export default DownloadCsvButton;
