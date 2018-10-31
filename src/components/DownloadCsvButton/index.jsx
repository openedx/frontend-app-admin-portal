import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '@edx/paragon';

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
    } = this.props;
    const downloadButtonIconClasses = csvLoading ? ['fa-spinner', 'fa-spin'] : ['fa-download'];
    return (
      <Button
        className={['btn-outline-primary', 'download-btn']}
        disabled={disabled || csvLoading}
        label={
          <React.Fragment>
            <Icon className={['fa', 'mr-2'].concat(downloadButtonIconClasses)} />
            {buttonLabel}
          </React.Fragment>
        }
        onClick={() => fetchCsv(fetchMethod)}
      />
    );
  }
}

DownloadCsvButton.defaultProps = {
  csvLoading: false,
  fetchMethod: () => {},
  disabled: false,
  buttonLabel: 'Download report (CSV)',
};

DownloadCsvButton.propTypes = {
  fetchCsv: PropTypes.func.isRequired,
  fetchMethod: PropTypes.func,
  csvLoading: PropTypes.bool,
  clearCsv: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  buttonLabel: PropTypes.string,
};

export default DownloadCsvButton;
