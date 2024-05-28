import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Hyperlink,
} from '@openedx/paragon';
import { connect } from 'react-redux';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import LoadingMessage from '../LoadingMessage';
import { SubscriptionContext } from './SubscriptionData';
import SubscriptionExpiration from './expiration/SubscriptionExpiration';
import MultipleSubscriptionsPicker from './MultipleSubscriptionPicker';
import {
  DEFAULT_LEAD_TEXT,
} from './data/constants';
import { sortSubscriptionsByStatus } from './data/utils';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import { configuration } from '../../config';

const MultipleSubscriptionsPage = ({
  enterpriseSlug,
  redirectPage,
  leadText,
  createActions,
}) => {
  const { loading, data } = useContext(SubscriptionContext);
  const subscriptions = data.results;

  if (loading) {
    return <LoadingMessage className="subscriptions" />;
  }

  if (subscriptions.length === 0) {
    return (
      <Card>
        <Card.Section className="text-center">
          <Row>
            <Col xs={12} lg={{ span: 8, offset: 2 }}>
              <h3 className="mb-3">
                <FormattedMessage
                  id="admin.portal.multiple.subscriptions.page.no.plans.heading"
                  defaultMessage="No subscription plans for your organization"
                  description="Heading for the message when no subscription plans are found."
                />
              </h3>
              <p>
                <FormattedMessage
                  id="admin.portal.multiple.subscriptions.page.no.plans.body"
                  defaultMessage="We were unable to find any active subscription plans for your organization. Please contact Customer Support if you have questions."
                  description="Body text for the message when no subscription plans are found."
                />
              </p>
              <Hyperlink
                className="btn btn-brand"
                target="_blank"
                destination={configuration.ENTERPRISE_SUPPORT_URL}
              >
                <FormattedMessage
                  id="admin.portal.multiple.subscriptions.page.contact.support.button"
                  defaultMessage="Contact support"
                  description="Label for the 'Contact support' button when no subscription plans are found."
                />
              </Hyperlink>
            </Col>
          </Row>
        </Card.Section>
      </Card>
    );
  }

  if (subscriptions.length === 1) {
    return (
      <Navigate to={`/${enterpriseSlug}/admin/${redirectPage}/${subscriptions[0].uuid}`} replace />
    );
  }

  const sortedSubscriptions = sortSubscriptionsByStatus(subscriptions);

  return (
    <>
      <SubscriptionExpiration />
      <MultipleSubscriptionsPicker
        enterpriseSlug={enterpriseSlug}
        leadText={leadText}
        subscriptions={sortedSubscriptions}
        redirectPage={redirectPage}
        createActions={createActions}
      />
    </>
  );
};

MultipleSubscriptionsPage.defaultProps = {
  redirectPage: `${ROUTE_NAMES.subscriptionManagement}`,
  leadText: DEFAULT_LEAD_TEXT,
  createActions: null,
};

MultipleSubscriptionsPage.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  redirectPage: PropTypes.string,
  leadText: PropTypes.string,
  createActions: PropTypes.func,
};

const mapStateToProps = (state) => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(MultipleSubscriptionsPage);
