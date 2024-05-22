import React, { useContext } from 'react';
import { Badge } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { SubscriptionDetailContext } from '../../subscriptions/SubscriptionDetailContextProvider';
import { SubsidyRequestsContext } from '../../subsidy-requests';
import NewFeatureAlertBrowseAndRequest from '../../NewFeatureAlertBrowseAndRequest';
import { SUPPORTED_SUBSIDY_TYPES } from '../../../data/constants/subsidyRequests';

const LicenseAllocationHeader = () => {
  const {
    subscription,
  } = useContext(SubscriptionDetailContext);
  const { subsidyRequestConfiguration } = useContext(SubsidyRequestsContext);

  // don't show alert if the enterprise already has subsidy requests enabled
  const isBrowseAndRequestFeatureAlertShown = subsidyRequestConfiguration?.subsidyType
    === SUPPORTED_SUBSIDY_TYPES.license && !subsidyRequestConfiguration?.subsidyRequestsEnabled;
  const activatedAndAssigned = (subscription.licenses?.activated ?? 0) + (subscription.licenses?.assigned ?? 0);
  return (
    <>
      {isBrowseAndRequestFeatureAlertShown && <NewFeatureAlertBrowseAndRequest />}
      <div className="ml-4">
        <h4 style={{ display: 'inline-block' }}>
          <FormattedMessage
            id="admin.portal.lpr.embedded.subscription.licenses.header"
            defaultMessage="Licenses:"
            description="Header for the licenses section on the embedded subscription section on lpr page."
          />
        </h4>
        <Badge className="mr-2 ml-2" variant="light">
          <FormattedMessage
            id="admin.portal.lpr.embedded.subscription.licenses.header.unassigned.details"
            defaultMessage="Unassigned: {unassignedCount} of {totalCount} total"
            description="Unassigned licenses details on license header on the embedded subscription section on lpr page."
            values={{
              unassignedCount: subscription.licenses?.unassigned,
              totalCount: subscription.licenses?.total,
            }}
          />
        </Badge>
        <Badge variant="light">
          <FormattedMessage
            id="admin.portal.lpr.embedded.subscription.licenses.header.assigned.details"
            defaultMessage="Activated: {activatedCount} of {activatedAndAssignedCount} assigned"
            description="Assigned licenses details on license header on the embedded subscription section on lpr page."
            values={{
              activatedCount: subscription.licenses?.activated,
              activatedAndAssignedCount: activatedAndAssigned,
            }}
          />
        </Badge>
      </div>
    </>
  );
};

export default LicenseAllocationHeader;
