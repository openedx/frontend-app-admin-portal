import React, { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import {
  Toast, StatefulButton, Icon, Spinner, useToggle,
} from '@openedx/paragon';
import { Download, Check, Close } from '@openedx/paragon/icons';

const DownloadCSVButton = ({
  jsonData, csvFileName,
}) => {
  const [buttonState, setButtonState] = useState('disabled');
  const [isToastShowing, showToast, hideToast] = useToggle(false);
  const intl = useIntl();

  useEffect(() => {
    if (jsonData.length > 0) {
      setButtonState('default');
    }
  }, [jsonData]);

  const jsonToCSV = (json) => {
    const fields = Object.keys(json[0]);
    const replacer = (key, value) => (value === null ? '' : value);
    const csv = json.map(
      (row) => fields.map(
        (fieldName) => JSON.stringify(row[fieldName], replacer),
      ).join(','),
    );
    csv.unshift(fields.join(',')); // add header column
    return csv.join('\r\n');
  };

  const downloadCsv = () => {
    setButtonState('pending');
    const csv = jsonToCSV(jsonData);
    const blob = new Blob([csv], { type: 'text/csv' });
    saveAs(blob, csvFileName);
    showToast();
    setButtonState('complete');
  };

  const toastText = intl.formatMessage({
    id: 'adminPortal.LPRV2.downloadCSV.toast',
    defaultMessage: 'CSV Downloaded',
    description: 'Toast message for the download button in the LPR V2 page.',
  });
  return (
    <div className="d-flex justify-content-end">
      { isToastShowing
     && (
     <Toast onClose={hideToast} show={showToast}>
       {toastText}
     </Toast>
     )}
      <StatefulButton
        state={buttonState}
        variant={buttonState === 'error' ? 'danger' : 'primary'}
        data-testid="plotly-charts-download-csv-button"
        disabledStates={['disabled', 'pending']}
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
        onClick={downloadCsv}
      />
    </div>
  );
};

DownloadCSVButton.propTypes = {
  jsonData: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  csvFileName: PropTypes.string.isRequired,
};

export default DownloadCSVButton;
