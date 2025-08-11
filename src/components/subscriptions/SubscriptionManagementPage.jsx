import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Container } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import Hero from '../Hero';
import SubscriptionData from './SubscriptionData';
import SubscriptionRoutes from './SubscriptionRoutes';

const SubscriptionManagementPage = ({
  enterpriseId,
}) => {
  const intl = useIntl();
  const PAGE_TITLE = intl.formatMessage({
    id: 'admin.portal.subscription.management.page.title',
    defaultMessage: 'Subscription Management',
    description: 'Title for the subscription management page.',
  });

  return (
    <SubscriptionData enterpriseId={enterpriseId}>
      <Helmet title={PAGE_TITLE} />
      <Hero title={PAGE_TITLE} />
      <main role="main" className="manage-subscription">
        <Container id="subscription-plans-list" className="py-3" fluid>
          <SubscriptionRoutes />
        </Container>
      </main>
    </SubscriptionData>
  );
};

SubscriptionManagementPage.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(SubscriptionManagementPage);
