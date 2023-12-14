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
} from '@openedx/paragon';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';

import Hero from '../Hero';
import MultipleBudgetsPicker from './MultipleBudgetsPicker';
import { EnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';

import { configuration } from '../../config';

const PAGE_TITLE = 'Learner Credit Management';

const MultipleBudgetsPage = ({
  enterpriseUUID,
  enterpriseSlug,
  enableLearnerPortal,
}) => {
  const { budgets, isLoading } = useContext(EnterpriseSubsidiesContext);

  if (isLoading) {
    return (
      <>
        <h1><Skeleton /></h1>
        <Skeleton height={200} count={2} />
        <span className="sr-only">Loading budgets...</span>
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
                <h3 className="mb-3">No budgets for your organization</h3>
                <p>
                  We were unable to find any budgets for your organization. Please contact
                  Customer Support if you have questions.
                </p>
                <Hyperlink
                  className="btn btn-brand"
                  target="_blank"
                  destination={configuration.ENTERPRISE_SUPPORT_URL}
                >
                  Contact support
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
});

MultipleBudgetsPage.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  enableLearnerPortal: PropTypes.bool.isRequired,
};

export default connect(mapStateToProps)(MultipleBudgetsPage);
