import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import Cookies from 'universal-cookie';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Modal, MailtoLink } from '@edx/paragon';

import {
  SUBSCRIPTION_DAYS_REMAINING_MODERATE,
  SUBSCRIPTION_DAYS_REMAINING_SEVERE,
  SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
  SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX,
} from '../data/constants';

import { configuration } from '../../../config';
import Img from '../../Img';
import { formatTimestamp } from '../../../utils';
import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';

export const MODAL_DIALOG_CLASS_NAME = 'subscription-expiration';

export function BaseSubscriptionExpirationModal({ enterpriseSlug, enableCodeManagementScreen }) {
  const { subscription: { daysUntilExpiration, expirationDate } } = useContext(SubscriptionDetailContext);

  const renderTitle = () => (
    <small>Renew your subscription</small>
  );

  const renderBody = () => (
    <>
      <p>
        Your current subscription is set to expire in {daysUntilExpiration} days.
        In order to minimize course access disruptions for your learners, make sure your invoice has
        been completed.
      </p>
      <p>
        If you have questions or need help, please contact the edX Customer Success team at
        {' '}
        <MailtoLink to="customersuccess@edx.org">customersuccess@edx.org</MailtoLink>.
      </p>
      <i>
        Access expires on {formatTimestamp({ timestamp: expirationDate })}
      </i>
    </>
  );

  const renderExpiredBody = () => (
    <>
      <Img className="w-25 my-5 mx-auto d-block" src={configuration.LOGO_URL} alt="edX logo" />
      <p>
        Your subscription license expired on {formatTimestamp({ timestamp: expirationDate })}.
        To access your subscription management page contact edX and reactivate your subscription(s).
      </p>
      <p>
        What to do next?
      </p>
      <ul>
        <li>
          To reactivate your subscription(s) please contact the edX Customer Success team at
          {' '}
          <MailtoLink to="customersuccess@edx.org">customersuccess@edx.org</MailtoLink>
        </li>
        <li>
          View your learner progress in the <Link to={`/${enterpriseSlug}/admin/learners`}>learner management page</Link>
        </li>
        {enableCodeManagementScreen
          && (
          <li>
            Manage your codes in the <Link to={`/${enterpriseSlug}/admin/coupons`}>code management page</Link>
          </li>
          )}
      </ul>
    </>
  );

  // If the subscription has already expired, we show a different un-dismissible modal
  const subscriptionExpired = daysUntilExpiration <= 0;
  if (subscriptionExpired) {
    return (
      <Modal
        dialogClassName={`${MODAL_DIALOG_CLASS_NAME} expired`}
        renderHeaderCloseButton={false}
        renderDefaultCloseButton={false}
        title={null}
        body={renderExpiredBody()}
        onClose={() => {}}
        open
      />
    );
  }

  if (daysUntilExpiration > SUBSCRIPTION_DAYS_REMAINING_MODERATE) {
    return null;
  }

  const thresholds = [
    SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
    SUBSCRIPTION_DAYS_REMAINING_SEVERE,
    SUBSCRIPTION_DAYS_REMAINING_MODERATE,
  ];
  // Finds the first expiration threshold (from most severe to least) that the current
  // `daysUntilExpiration` falls into
  const expirationThreshold = thresholds.find(threshold => threshold >= daysUntilExpiration);
  const seenCurrentExpirationModalCookieName = `${SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX}${expirationThreshold}`;
  const cookies = new Cookies();
  const seenCurrentExpirationModal = cookies.get(seenCurrentExpirationModalCookieName);
  // If they have already seen the expiration modal for their current expiration range (as
  // determined by the cookie), don't show them anything
  if (seenCurrentExpirationModal) {
    return null;
  }

  return (
    <Modal
      dialogClassName={MODAL_DIALOG_CLASS_NAME}
      renderHeaderCloseButton={false}
      title={renderTitle()}
      body={renderBody()}
      closeText="Ok"
      // Mark that the user has seen this range's expiration modal when they close it
      onClose={() => {
        cookies.set(
          seenCurrentExpirationModalCookieName,
          true,
          // Cookies without the `sameSite` attribute are rejected if they are missing the `secure`
          // attribute. See
          // https//developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
          { sameSite: 'strict' },
        );
      }}
      open
    />
  );
}

BaseSubscriptionExpirationModal.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  enableCodeManagementScreen: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enableCodeManagementScreen: state.portalConfiguration.enableCodeManagementScreen,
});

const SubscriptionExpirationModal = connect(mapStateToProps)(BaseSubscriptionExpirationModal);
export default SubscriptionExpirationModal;
