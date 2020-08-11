import React from 'react';
import PropTypes from 'prop-types';

import AddUsersModal from '../../containers/AddUsersModal';
import ActionButtonWithModal from '../ActionButtonWithModal';
import { SubscriptionConsumer } from './SubscriptionData';
import EmailTemplateData from '../EmailTemplate/EmailTemplateData';

const AddUsersButton = ({
  onSuccess,
  onClose,
}) => (
  <ActionButtonWithModal
    buttonLabel="Add Users"
    buttonClassName="add-btn btn btn-primary float-md-right"
    renderModal={({ closeModal }) => (
      <SubscriptionConsumer>
        {({
          enterpriseCustomer,
          overview,
          details,
        }) => (
          <EmailTemplateData enterpriseCustomer={enterpriseCustomer} templateType="assign">
            <AddUsersModal
              title="Add Users"
              availableSubscriptionCount={overview.unassigned}
              subscriptionUUID={details.uuid}
              enableReinitialize
              onSuccess={onSuccess}
              onClose={() => {
                closeModal();
                if (onClose) {
                  onClose();
                }
              }}
            />
          </EmailTemplateData>
        )}
      </SubscriptionConsumer>
    )}
  />
);

AddUsersButton.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

AddUsersButton.defaultProps = {
  onClose: null,
};

export default AddUsersButton;
