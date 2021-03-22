import React, { useContext, useState } from 'react';
import { CSVLink } from 'react-csv';
import { logError } from '@edx/frontend-platform/logging';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';
import LicenseManagerApiService from '../data/service';
import { ALL_USERS } from '../data/constants';
import { configuration } from '../../../config';

const DownloadCsvButton = ({ enterpriseSlug }) => {
  const { subscription } = useContext(SubscriptionDetailContext);
  const [csvData, setCsvData] = useState([]);

  const getCsvFileName = () => {
    const titleNoWhitespace = subscription.title.replace(/\s+/g, '');
    const currentDate = new Date();
    const year = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth() + 1;
    const day = currentDate.getUTCDate();
    return `${titleNoWhitespace}-${year}-${month}-${day}.csv`;
  };

  const getLicenseActivationLink = (activationKey) => (
    `${configuration.ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/licenses/${activationKey}/activate`
  );

  const options = {
    status: ALL_USERS,
  };

  const headers = [
    { label: 'Status', key: 'status' },
    { label: 'User Email', key: 'userEmail' },
    { label: 'Activation Date', key: 'activationDate' },
    { label: 'Last Remind Date', key: 'lastRemindDate' },
    { label: 'License Activation Link', key: 'activationLink' },
  ];

  LicenseManagerApiService.fetchSubscriptionUsers(subscription.uuid, options, 5000)
    .then((response) => {
      const licenseData = response.data.results.map(license => ({
        status: license.status,
        userEmail: license.user_email,
        activationDate: license.activation_date,
        lastRemindDate: license.last_remind_date,
        activationLink: getLicenseActivationLink(license.activation_key),
      }));
      setCsvData(licenseData);
    })
    .catch((err) => {
      logError(err);
      // TODO: what should the UX be for error here?
    });

  return (
    <CSVLink
      className="btn btn-outline-primary"
      data={csvData}
      filename={getCsvFileName()}
      headers={headers}
    >
      Download CSV
    </CSVLink>
  );
};

DownloadCsvButton.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(DownloadCsvButton);
