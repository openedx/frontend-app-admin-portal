import React, { useContext, useState } from 'react';
import { Icon, StatefulButton } from '@edx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { saveAs } from 'file-saver';
import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';
import LicenseManagerApiService from '../data/service';

const DownloadCsvButton = () => {
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

  return (
    <StatefulButton
      state={buttonState}
      variant="outline-primary"
      labels={{
        default: 'Download CSV',
        pending: 'Downloading',
        complete: 'Downloaded',
      }}
      icons={{
        default: <Icon className="fa fa-download" />,
        pending: <Icon className="fa fa-spinner fa-spin" />,
        complete: <Icon className="fa fa-check" />,
      }}
      disabledStates={['pending']}
      onClick={() => {
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
      }}
    />
  );
};

export default DownloadCsvButton;
