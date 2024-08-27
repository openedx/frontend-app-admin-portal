import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { logError } from '@edx/frontend-platform/logging';
import {
  Toast, StatefulButton, Icon, Spinner, useToggle,
} from '@openedx/paragon';
import { Download, Check, Close } from '@openedx/paragon/icons';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';
import simulateURL from './data/utils';

const DownloadCSV = ({
  startDate, endDate, chartType, activeTab, granularity, calculation, enterpriseId,
}) => {
  const [buttonState, setButtonState] = useState('default');
  const [isOpen, open, close] = useToggle(false);
  const intl = useIntl();

  const getFileName = (contentDisposition) => {
    let filename = `${activeTab} from (${startDate}-${endDate}).csv`; // Default filename

    // Extract the filename from the content-disposition header if it exists
    if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
      const matches = /filename="([^"]+)"/.exec(contentDisposition);
      if (matches != null && matches[1]) {
        [, filename] = matches;
      }
    }
    return filename;
  };

  const downloadCsv = () => {
    setButtonState('pending');
    const chartUrl = simulateURL(activeTab, chartType);
    EnterpriseDataApiService.fetchPlotlyChartsCSV(enterpriseId, chartUrl, {
      start_date: startDate,
      end_date: endDate,
      granularity,
      calculation,
      chart_type: chartType,
      response_type: 'csv',
    }).then((response) => {
      const contentDisposition = response.headers['content-disposition'];
      const filename = getFileName(contentDisposition);

      const blob = new Blob([response.data], { type: 'text/csv' });
      saveAs(blob, filename);
      open();
      setButtonState('complete');
    }).catch((error) => {
      setButtonState('error');
      logError(error);
    });
  };

  const toastText = intl.formatMessage({
    id: 'adminPortal.LPRV2.downloadCSV.toast',
    defaultMessage: 'CSV Downloaded',
    description: 'Toast message for the download button in the LPR V2 page.',
  });
  return (
    <div className="d-flex justify-content-end">
      { isOpen
     && (
     <Toast onClose={close} show={isOpen}>
       {toastText}
     </Toast>
     )}
      <StatefulButton
        state={buttonState}
        variant={buttonState === 'error' ? 'danger' : 'primary'}
        data-testid="plotly-charts-download-csv-button"
        labels={{
          default: intl.formatMessage({
            id: 'adminPortal.LPRV2.downloadCSV.button.default',
            defaultMessage: 'Download CSV',
            description: 'Label for the download button in the module activity report page.',
          }),
          pending: intl.formatMessage({
            id: 'adminPortal.LPRV2.downloadCSV.button.pending',
            defaultMessage: 'Downloading CSV',
            description: 'Label for the download button in the module activity report page when the download is in progress.',
          }),
          complete: intl.formatMessage({
            id: 'adminPortal.LPRV2.downloadCSV.button.complete',
            defaultMessage: 'CSV Downloaded',
            description: 'Label for the download button in the module activity report page when the download is complete.',
          }),
          error: intl.formatMessage({
            id: 'adminPortal.LPRV2.downloadCSV.button.error',
            defaultMessage: 'Error',
            description: 'Label for the download button in the module activity report page when the download fails.',
          }),
        }}
        icons={{
          default: <Icon src={Download} />,
          pending: <Spinner animation="border" variant="light" size="sm" />,
          complete: <Icon src={Check} />,
          error: <Icon src={Close} variant="light" size="sm" />,
        }}
        disabledStates={['pending']}
        onClick={downloadCsv}
      />
    </div>
  );
};

DownloadCSV.propTypes = {
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  chartType: PropTypes.string.isRequired,
  activeTab: PropTypes.string.isRequired,
  granularity: PropTypes.string.isRequired,
  calculation: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string.isRequired,
};

export default DownloadCSV;
