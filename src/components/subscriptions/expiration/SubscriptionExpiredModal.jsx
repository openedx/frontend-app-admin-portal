import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { ModalDialog, MailtoLink } from '@edx/paragon';

import { configuration } from '../../../config';
import Img from '../../Img';
import { formatTimestamp } from '../../../utils';
import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';

export const EXPIRED_MODAL_TITLE = 'This subscription cohort is expired';

const SubscriptionExpiredModal = ({
  onClose,
  isOpen,
  enableCodeManagementScreen,
  enterpriseSlug,
}) => {
  const { subscription: { expirationDate } } = useContext(SubscriptionDetailContext);

  return (
    <ModalDialog
      title={EXPIRED_MODAL_TITLE}
      onClose={onClose}
      isOpen={isOpen}
      hasCloseButton={false}
    >
      <ModalDialog.Body>
        <Img className="w-25 my-5 mx-auto d-block" src={configuration.LOGO_URL} alt="edX logo" />
        <p>
          This subscription cohort expired on <b>{formatTimestamp({ timestamp: expirationDate })}</b>.
          {' '}
          To make changes to this cohort, contact edX to reactivate your subscription.
        </p>
        <p>What to do next?</p>
        <ul>
          <li>
            To reactivate your subscription, please contact the edX Customer Success team at
            {' '}
            <MailtoLink to="customersuccess@edx.org">customersuccess@edx.org</MailtoLink>
          </li>
          {enableCodeManagementScreen && (
            <li>
              Manage your codes in the <Link to={`/${enterpriseSlug}/admin/coupons`}>code management page</Link>
            </li>
          )}
        </ul>
      </ModalDialog.Body>
    </ModalDialog>
  );
};

SubscriptionExpiredModal.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  enableCodeManagementScreen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
};

SubscriptionExpiredModal.defaultProps = {
  isOpen: false,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enableCodeManagementScreen: state.portalConfiguration.enableCodeManagementScreen,
});

export default connect(mapStateToProps)(SubscriptionExpiredModal);
