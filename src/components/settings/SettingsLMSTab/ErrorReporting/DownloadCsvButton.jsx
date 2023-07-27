import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import PropTypes from 'prop-types';

import {
  Toast, StatefulButton, Icon, Spinner, useToggle,
} from '@edx/paragon';
import { Download, Check } from '@edx/paragon/icons';
import { logError } from '@edx/frontend-platform/logging';
import { isStrictlyArray } from './utils';

const DownloadCsvButton = ({ data, testId, fetchData }) => {
  const [buttonState, setButtonState] = useState('pageLoading');

  useEffect(() => {
    if (data && data.length) {
      setButtonState('default');
    }
  }, [data]);

  const getCsvFileName = () => {
    const currentDate = new Date();
    const year = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth() + 1;
    const day = currentDate.getUTCDate();
    return `${year}-${month}-${day}-error-log.csv`;
  };

  const getCsvData = (csvData) => {
    if (isStrictlyArray(csvData)) {
      return null;
    }
    const heading = Object.keys(csvData[0]).join(',');
    const body = csvData.map((j) => Object.values(j).join(',')).join('\n');
    return `${heading}\n${body}`;
  };

  const [isOpen, open, close] = useToggle(false);

  const handleClick = async () => {
    fetchData().then((response) => {
      setButtonState('pending');
      const blob = new Blob([getCsvData(response.data.results)], {
        type: 'text/csv',
      });
      saveAs(blob, getCsvFileName());
      open();
      setButtonState('complete');
    }).catch((err) => {
      logError(err);
    });
  };

  const toastText = 'Downloaded. Note that download is a snapshot in time and does not auto update with new errors.';
  return (
    <>
      { isOpen
     && (
     <Toast onClose={close} show={isOpen}>
       {toastText}
     </Toast>
     )}
      <StatefulButton
        state={buttonState}
        className="download-button"
        data-testid={testId}
        labels={{
          default: 'Download history',
          pending: 'Downloading',
          complete: 'Downloaded',
          pageLoading: 'Download history',
        }}
        icons={{
          default: <Icon src={Download} />,
          pending: <Spinner animation="border" variant="light" size="sm" />,
          complete: <Icon src={Check} />,
          pageLoading: <Icon src={Download} variant="light" />,
        }}
        disabledStates={['pending', 'pageLoading']}
        onClick={handleClick}
      />
    </>
  );
};

DownloadCsvButton.defaultProps = {
  data: null,
  testId: 'download-csv-button',
};

DownloadCsvButton.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      content_id: PropTypes.string,
      content_title: PropTypes.string,
      sync_last_attempted_at: PropTypes.string,
      sync_status: PropTypes.string,
    }),
  ),
  fetchData: PropTypes.func.isRequired,
  testId: PropTypes.string,
};

export default DownloadCsvButton;
