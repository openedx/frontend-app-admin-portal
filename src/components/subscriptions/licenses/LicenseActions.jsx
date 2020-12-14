import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

import ActionButtonWithModal from '../../ActionButtonWithModal';
import { ToastsContext } from '../../Toasts';
import LicenseRemindModal from '../../../containers/LicenseRemindModal';
import LicenseRevokeModal from '../../../containers/LicenseRevokeModal';
import { ACTIVATED, ASSIGNED, TAB_REVOKED_USERS } from '../data/constants';
import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';
import { SubscriptionContext } from '../SubscriptionData';

const LicenseAction = ({ user }) => {
  const { addToast } = useContext(ToastsContext);
  const { forceRefresh } = useContext(SubscriptionContext);
  const {
    activeTab,
    currentPage,
    searchQuery,
    setActiveTab,
    subscription,
  } = useContext(SubscriptionDetailContext);

  const hasNoRevocationsRemaining = subscription?.revocations.remaining <= 0;
  const noActionsAvailable = [{ key: 'no-actions-here', text: '-' }];

  const licenseActions = useMemo(
    () => {
      switch (user.status) {
        case ACTIVATED:
          if (hasNoRevocationsRemaining) {
            return noActionsAvailable;
          }

          return [{
            key: 'revoke-btn',
            text: 'Revoke',
            handleClick: closeModal => (
              <LicenseRevokeModal
                user={user}
                onSuccess={() => {
                  addToast('License successfully revoked');
                  setActiveTab(TAB_REVOKED_USERS);
                  forceRefresh();
                }}
                onClose={() => closeModal()}
                subscriptionPlan={subscription}
                licenseStatus={user.status}
              />
            ),
          }];
        case ASSIGNED:
          return [{
            key: 'remind-btn',
            text: 'Remind',
            handleClick: closeModal => (
              <LicenseRemindModal
                user={user}
                isBulkRemind={false}
                title="Remind User"
                subscriptionUUID={subscription.uuid}
                onSuccess={() => {
                  addToast('Reminder successfully sent');
                  forceRefresh();
                }}
                onClose={() => closeModal()}
              />
            ),
          }, {
            key: 'revoke-btn',
            text: 'Revoke',
            handleClick: closeModal => (
              <LicenseRevokeModal
                user={user}
                onSuccess={() => {
                  addToast('License successfully revoked');
                  setActiveTab(TAB_REVOKED_USERS);
                  forceRefresh();
                }}
                onClose={() => closeModal()}
                subscriptionPlan={subscription}
                licenseStatus={user.status}
              />
            ),
          }];
        default:
          return noActionsAvailable;
      }
    },
    [user, activeTab, searchQuery, currentPage],
  );

  return (
    <div className="license-actions">
      {licenseActions.map(({ handleClick, text, key }) => (
        <React.Fragment key={key}>
          {handleClick ? (
            <ActionButtonWithModal
              buttonLabel={text}
              buttonClassName="btn-sm p-0"
              variant="link"
              renderModal={({ closeModal }) => handleClick(closeModal)}
            />
          ) : (
            text
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

LicenseAction.propTypes = {
  user: PropTypes.shape({
    status: PropTypes.string.isRequired,
  }).isRequired,
};

export default LicenseAction;
