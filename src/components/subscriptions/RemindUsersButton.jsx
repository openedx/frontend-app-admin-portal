import React from 'react';
import PropTypes from 'prop-types';

import LicenseRemindModal from '../../containers/LicenseRemindModal';
import ActionButtonWithModal from '../ActionButtonWithModal';

const RemindUsersButton = ({
  onSuccess,
  onClose,
  pendingUsersCount,
  isBulkRemind,
  subscriptionUUID,
  fetchSubscriptionDetails,
  fetchSubscriptionUsers,
  currentPage,
  searchQuery,
}) => (
  <ActionButtonWithModal
    buttonLabel={(
      <>
        <i className="fa fa-refresh mr-2" aria-hidden />
        Remind all ({pendingUsersCount})
      </>
    )}
    buttonClassName="p-0"
    variant="link"
    renderModal={({ closeModal }) => (
      <LicenseRemindModal
        pendingUsersCount={pendingUsersCount}
        isBulkRemind={isBulkRemind}
        title="Remind Users"
        subscriptionUUID={subscriptionUUID}
        searchQuery={searchQuery}
        currentPage={currentPage}
        fetchSubscriptionDetails={fetchSubscriptionDetails}
        fetchSubscriptionUsers={fetchSubscriptionUsers}
        onSuccess={onSuccess}
        onClose={() => {
          closeModal();
          if (onClose) {
            onClose();
          }
        }}
      />
    )}
  />
);

RemindUsersButton.propTypes = {
  pendingUsersCount: PropTypes.number,
  isBulkRemind: PropTypes.bool.isRequired,
  searchQuery: PropTypes.string,
  currentPage: PropTypes.number,
  subscriptionUUID: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  fetchSubscriptionDetails: PropTypes.func.isRequired,
  fetchSubscriptionUsers: PropTypes.func.isRequired,
};

RemindUsersButton.defaultProps = {
  onClose: null,
  pendingUsersCount: null,
  searchQuery: null,
  currentPage: null,
};

export default RemindUsersButton;
