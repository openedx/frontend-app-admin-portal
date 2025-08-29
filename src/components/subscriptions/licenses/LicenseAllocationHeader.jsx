import React, { useContext } from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';
import { SubsidyRequestsContext } from '../../subsidy-requests';
import NewFeatureAlertBrowseAndRequest from '../../NewFeatureAlertBrowseAndRequest';
import { SUPPORTED_SUBSIDY_TYPES } from '../../../data/constants/subsidyRequests';

const LicenseAllocationHeader = ({ intl }) => {
  const {
    subscription,
  } = useContext(SubscriptionDetailContext);
  const { subsidyRequestConfiguration } = useContext(SubsidyRequestsContext);

  // don't show alert if the enterprise already has subsidy requests enabled
  const isBrowseAndRequestFeatureAlertShown = subsidyRequestConfiguration?.subsidyType
    === SUPPORTED_SUBSIDY_TYPES.license && !subsidyRequestConfiguration?.subsidyRequestsEnabled;

  return (
    <>
      {isBrowseAndRequestFeatureAlertShown && <NewFeatureAlertBrowseAndRequest />}
      <h2 className="mb-2">{intl.formatMessage({
        id: 'admin.portal.license.allocation.header',
        defaultMessage: 'License Allocation',
        description: 'Header for the license allocation section.',
      })}
      </h2>
      <p className="lead">
        {intl.formatMessage({
          id: 'admin.portal.license.allocation.allocated.licenses.count',
          defaultMessage: '{allocated} of {total} licenses allocated',
          description: 'Text for the number of licenses allocated.',
        }, {
          allocated: subscription.licenses?.allocated,
          total: subscription.licenses?.total,
        })}
      </p>
    </>
  );
};

LicenseAllocationHeader.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(LicenseAllocationHeader);
