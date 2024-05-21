import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Stack,
  Row,
  Col,
  Card,
  Hyperlink,
  Container,
  Skeleton,
} from '@edx/paragon';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';

import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import Hero from '../Hero';
import MultipleBudgetsPicker from './MultipleBudgetsPicker';
import { EnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';

import { configuration } from '../../config';
import { useEnterpriseBudgets } from '../EnterpriseSubsidiesContext/data/hooks';

const MultipleBudgetsPage = ({
  enterpriseUUID,
  enterpriseSlug,
  enableLearnerPortal,
  enterpriseFeatures,
  enablePortalLearnerCreditManagementScreen,
}) => {
  const intl = useIntl();
  const PAGE_TITLE = intl.formatMessage({
    id: 'lcm.page.title',
    defaultMessage: 'Learner Credit Management',
    description: 'Title for the Learner Credit Management page',
  });
  const { isLoading } = useContext(EnterpriseSubsidiesContext);
  const { data: budgetsOverview } = useEnterpriseBudgets({
    enterpriseId: enterpriseUUID,
    enablePortalLearnerCreditManagementScreen,
    isTopDownAssignmentEnabled: enterpriseFeatures.topDownAssignmentRealTimeLcm,
  });
  const {
    budgets = [],
  } = budgetsOverview || {};

  if (isLoading) {
    return (
      <>
        <h1><Skeleton /></h1>
        <Skeleton height={200} count={2} />
        <span className="sr-only">
          <FormattedMessage
            id="lcm.budgets.loading"
            defaultMessage="Loading budgets..."
            description="Loading budgets"
          />
        </span>
      </>
    );
  }

  if (budgets.length === 0) {
    return (
      <Stack>
        <Helmet title={PAGE_TITLE} />
        <Hero title={PAGE_TITLE} />
        <Card>
          <Card.Section className="text-center">
            <Row>
              <Col xs={12} lg={{ span: 8, offset: 2 }}>
                <h3 className="mb-3">
                  <FormattedMessage
                    id="lcm.budgets.no.budgets"
                    defaultMessage="No budgets for your organization"
                    description="No budgets for your organization"
                  />
                </h3>
                <p>
                  <FormattedMessage
                    id="lcm.budgets.no.budgets.description"
                    defaultMessage="We were unable to find any budgets for your organization. Please contact Customer Support if you have questions."
                    description="Description for no budgets found and guidance to contact support."
                  />
                </p>
                <Hyperlink
                  className="btn btn-brand"
                  target="_blank"
                  destination={configuration.ENTERPRISE_SUPPORT_URL}
                >
                  <FormattedMessage
                    id="lcm.budgets.contact.support"
                    defaultMessage="Contact support"
                    description="Contact support text for no budgets found."
                  />
                </Hyperlink>
              </Col>
            </Row>
          </Card.Section>
        </Card>
      </Stack>
    );
  }

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Hero title={PAGE_TITLE} />
      <Container className="py-3" fluid>
        <MultipleBudgetsPicker
          budgets={budgets}
          enterpriseUUID={enterpriseUUID}
          enterpriseSlug={enterpriseSlug}
          enableLearnerPortal={enableLearnerPortal}
        />
      </Container>
    </>
  );
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enableLearnerPortal: state.portalConfiguration.enableLearnerPortal,
  enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
  enablePortalLearnerCreditManagementScreen: state.portalConfiguration.enablePortalLearnerCreditManagementScreen,
});

MultipleBudgetsPage.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  enableLearnerPortal: PropTypes.bool.isRequired,
  enterpriseFeatures: PropTypes.shape({
    topDownAssignmentRealTimeLcm: PropTypes.bool,
  }).isRequired,
  enablePortalLearnerCreditManagementScreen: PropTypes.bool.isRequired,
};

export default connect(mapStateToProps)(MultipleBudgetsPage);
