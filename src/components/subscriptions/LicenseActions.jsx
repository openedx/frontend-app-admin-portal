import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

import ActionButtonWithModal from '../ActionButtonWithModal';
import LicenseRemindModal from '../../containers/LicenseRemindModal';
import LicenseRevokeModal from '../../containers/LicenseRevokeModal';
import { StatusContext } from './SubscriptionManagementPage';

import { SubscriptionContext } from './SubscriptionData';

import { ACTIVATED, ASSIGNED } from './constants';

import './styles/LicenseActions.scss';

export default function LicenseAction({ user }) {
  const { setSuccessStatus } = useContext(StatusContext);
  const {
    fetchSubscriptionDetails,
    fetchSubscriptionUsers,
    searchQuery,
    activeTab,
    details,
    currentPage,
  } = useContext(SubscriptionContext);

  const licenseActions = useMemo(
    () => {
      switch (user.status) {
        case ACTIVATED:
          return [{
            key: 'revoke-btn',
            text: 'Revoke',
            handleClick: closeModal => (
              <LicenseRevokeModal
                user={user}
                onSuccess={() => setSuccessStatus({
                  visible: true,
                  message: 'Successfully revoked license',
                })}
                onClose={() => closeModal()}
                fetchSubscriptionDetails={fetchSubscriptionDetails}
                fetchSubscriptionUsers={fetchSubscriptionUsers}
                searchQuery={searchQuery}
                currentPage={currentPage}
                subscriptionUUID={details.uuid}
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
                searchQuery={searchQuery}
                currentPage={currentPage}
                subscriptionUUID={details.uuid}
                onSuccess={() => setSuccessStatus({
                  visible: true,
                  message: 'Successfully sent reminder(s)',
                })}
                onClose={() => {
                  closeModal();
                }}
                fetchSubscriptionDetails={fetchSubscriptionDetails}
                fetchSubscriptionUsers={fetchSubscriptionUsers}
              />
            ),
          }, {
            key: 'revoke-btn',
            text: 'Revoke',
            handleClick: closeModal => (
              <LicenseRevokeModal
                user={user}
                onSuccess={() => setSuccessStatus({
                  visible: true,
                  message: 'Successfully revoked license',
                })}
                onClose={() => closeModal()}
                fetchSubscriptionDetails={fetchSubscriptionDetails}
                fetchSubscriptionUsers={fetchSubscriptionUsers}
                searchQuery={searchQuery}
                currentPage={currentPage}
                subscriptionUUID={details.uuid}
              />
            ),
          }];
        default:
          return [{ key: 'no-actions-here', text: '-' }];
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
              buttonClassName="btn btn-link btn-sm p-0"
              renderModal={({ closeModal }) => (
                handleClick(closeModal)
              )}
            />
          ) : (
            text
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

LicenseAction.propTypes = {
  user: PropTypes.shape({
    status: PropTypes.string.isRequired,
  }).isRequired,
};
