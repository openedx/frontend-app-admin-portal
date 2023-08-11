import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Stack,
  Row,
  Col,
  Card,
  Hyperlink,
} from '@edx/paragon';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import Hero from '../Hero';

import LoadingMessage from '../LoadingMessage';
import MultipleBudgetsPicker from './MultipleBudgetsPicker';
import { EnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';

import { configuration } from '../../config';

const PAGE_TITLE = 'Learner Credit';

const MultipleBudgetsPage = ({
  enterpriseUUID,
  enterpriseSlug,
}) => {
  const { offers, isLoading } = useContext(EnterpriseSubsidiesContext);

  if (isLoading) {
    return <LoadingMessage className="offers" />;
  }

  if (offers.length === 0) {
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
      <MultipleBudgetsPicker
        offers={offers}
        enterpriseUUID={enterpriseUUID}
        enterpriseSlug={enterpriseSlug}
      />
    </>
  );
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

MultipleBudgetsPage.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(MultipleBudgetsPage);
