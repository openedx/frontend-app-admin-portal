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
      match,
      disabled,
    } = this.props;
    const { params: { slug } } = match;
    const downloadButtonIconClasses = csvLoading ? ['fa-spinner', 'fa-spin'] : ['fa-download'];
    return (
      <Button
        className={['btn-outline-primary', 'download-btn']}
        disabled={disabled || csvLoading}
        label={
          <span>
            <Icon className={['fa', 'mr-2'].concat(downloadButtonIconClasses)} />
            Download {slug ? 'current' : 'full'} report (CSV)
          </span>
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
};

DownloadCsvButton.propTypes = {
  fetchCsv: PropTypes.func.isRequired,
  fetchMethod: PropTypes.func,
  csvLoading: PropTypes.bool,
  clearCsv: PropTypes.func.isRequired,
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
    params: PropTypes.shape({
      slug: PropTypes.string,
    }).isRequired,
  }).isRequired,
  disabled: PropTypes.bool,
};

export default DownloadCsvButton;
