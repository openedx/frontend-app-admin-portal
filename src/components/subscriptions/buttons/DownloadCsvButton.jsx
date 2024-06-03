import React, { useContext, useState } from 'react';
import { StatefulButton, Icon, Spinner } from '@openedx/paragon';
import { Download, Check } from '@openedx/paragon/icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { logError } from '@edx/frontend-platform/logging';
import { saveAs } from 'file-saver';
import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';
import LicenseManagerApiService from '../../../data/services/LicenseManagerAPIService';

const DownloadCsvButton = ({ intl }) => {
  const { subscription } = useContext(SubscriptionDetailContext);
  const [buttonState, setButtonState] = useState('default');

  const getCsvFileName = () => {
    const titleNoWhitespace = subscription.title.replace(/\s+/g, '');
    const currentDate = new Date();
    const year = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth() + 1;
    const day = currentDate.getUTCDate();
    return `${titleNoWhitespace}-${year}-${month}-${day}.csv`;
  };

  const handleClick = () => {
    setButtonState('pending');
    LicenseManagerApiService.fetchSubscriptionLicenseDataCsv(subscription.uuid)
      .then(response => {
        // download CSV
        const blob = new Blob([response.data], {
          type: 'text/csv',
        });
        saveAs(blob, getCsvFileName());
        setButtonState('complete');
      })
      .catch(err => {
        setButtonState('default');
        logError(err);
        // TODO: what should the UX be for error here?
      });
  };

  return (
    <StatefulButton
      state={buttonState}
      variant="outline-primary"
      labels={{
        default: intl.formatMessage({
          id: 'admin.portal.download.csv.button.text',
          defaultMessage: 'Download all',
          description: 'Default label for the download CSV button.',
        }),
        pending: intl.formatMessage({
          id: 'admin.portal.download.csv.button.downloading.text',
          defaultMessage: 'Downloading',
          description: 'Label for when CSV download is pending.',
        }),
        complete: intl.formatMessage({
          id: 'admin.portal.download.csv.button.downloaded.text',
          defaultMessage: 'Downloaded',
          description: 'Label for when CSV download is complete.',
        }),
      }}
      icons={{
        default: <Icon src={Download} />,
        pending: <Spinner animation="border" variant="light" size="sm" />,
        complete: <Icon src={Check} />,
      }}
      disabledStates={['pending', 'complete']}
      onClick={handleClick}
    />
  );
};

DownloadCsvButton.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(DownloadCsvButton);
