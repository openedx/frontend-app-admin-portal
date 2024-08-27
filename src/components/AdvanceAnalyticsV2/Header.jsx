import React from 'react';
import PropTypes from 'prop-types';
import DownloadCSV from './DownloadCSV';

const Header = ({
  title, subtitle, startDate, endDate, isDownloadCSV, activeTab, granularity, calculation, chartType, enterpriseId,
}) => (
  <div className="analytics-header d-flex justify-content-between row">
    <div className="col-8">
      <h2 className="analytics-header-title">{title}</h2>
      {subtitle && <p className="analytics-header-subtitle">{subtitle}</p>}
    </div>
    {isDownloadCSV && (
    <div className="col-3 mr-0">
      <DownloadCSV
        enterpriseId={enterpriseId}
        startDate={startDate}
        endDate={endDate}
        activeTab={activeTab}
        granularity={granularity}
        calculation={calculation}
        chartType={chartType}
      />
    </div>
    )}
  </div>
);

Header.defaultProps = {
  subtitle: undefined,
  isDownloadCSV: false,
  granularity: 'Daily',
  calculation: 'Total',
  chartType: '',
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  isDownloadCSV: PropTypes.bool,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  activeTab: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string.isRequired,
  chartType: PropTypes.string,
  granularity: PropTypes.string,
  calculation: PropTypes.string,
};

export default Header;
