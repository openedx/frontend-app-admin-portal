import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Modal, MailtoLink } from '@edx/paragon';
import Cookies from 'universal-cookie';

import { SubscriptionContext } from './SubscriptionData';
import {
  SUBSCRIPTION_EXPIRATION_FIRST_THRESHOLD,
  SUBSCRIPTION_EXPIRATION_SECOND_THRESHOLD,
  SUBSCRIPTION_EXPIRATION_THIRD_THRESHOLD,
  SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX,
} from './constants';

import Img from '../../components/Img';
import edxLogo from '../../images/edx-logo.png';
import { formatTimestamp } from '../../utils';


function SubscriptionExpirationModal({ enterpriseSlug }) {
  const { details } = useContext(SubscriptionContext);
  const { daysUntilExpiration, expirationDate } = details;

  const renderTitle = () => (
    <small>Renew your subscription</small>
  );

  const renderBody = () => (
    <React.Fragment>
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
    </React.Fragment>
  );

  const renderExpiredBody = () => (
    <React.Fragment>
      <Img className="w-25 my-5 mx-auto d-block" src={edxLogo} alt="edX logo" />
      <p>
        Your subscription license expired on {formatTimestamp({ timestamp: expirationDate })}.
        To access your subscription management page contact edX and reactivate your subscriptions.
      </p>
      <p>
        What to do next?
      </p>
      <ul>
        <li>
          To reactivate your subscriptions please cotact the edX Customer Success team at
          {' '}
          <MailtoLink to="customersuccess@edx.org">customersuccess@edx.org</MailtoLink>
        </li>
        <li>
          View your learner progress in the <Link to={`/${enterpriseSlug}/admin/learners`}>learner management page</Link>
        </li>
        <li>
          Manage your codes in the <Link to={`/${enterpriseSlug}/admin/coupons`}>code management page</Link>
        </li>
      </ul>
    </React.Fragment>
  );

  // If the subscription has already expired, we show a different un-dismissible modal
  const subscriptionExpired = daysUntilExpiration <= 0;
  if (subscriptionExpired) {
    return (
      <Modal
        renderHeaderCloseButton={false}
        renderDefaultCloseButton={false}
        title={null}
        body={renderExpiredBody()}
        open
      />
    );
  }

  if (daysUntilExpiration > SUBSCRIPTION_EXPIRATION_FIRST_THRESHOLD) {
    return null;
  }

  let expirationThreshold = SUBSCRIPTION_EXPIRATION_FIRST_THRESHOLD;
  if (details.daysUntilExpiration <= SUBSCRIPTION_EXPIRATION_SECOND_THRESHOLD) {
    expirationThreshold = SUBSCRIPTION_EXPIRATION_SECOND_THRESHOLD;
  }
  if (daysUntilExpiration <= SUBSCRIPTION_EXPIRATION_THIRD_THRESHOLD) {
    expirationThreshold = SUBSCRIPTION_EXPIRATION_THIRD_THRESHOLD;
  }
  const seenCurrentExpirationModalCookieName = `${SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX}${expirationThreshold}`;
  const cookies = new Cookies();
  const seenCurrentExpirationModal = cookies.get(seenCurrentExpirationModalCookieName);
  // If they have already seen the expiration modal for their current threshold (as deterrmined by
  // the cookie), don't show them anything
  if (seenCurrentExpirationModal) {
    return null;
  }

  return (
    <Modal
      renderHeaderCloseButton={false}
      title={renderTitle()}
      body={renderBody()}
      closeText="Ok"
      // Mark that the user has seen this threshold's expiration modal when they close it
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

SubscriptionExpirationModal.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(SubscriptionExpirationModal);
