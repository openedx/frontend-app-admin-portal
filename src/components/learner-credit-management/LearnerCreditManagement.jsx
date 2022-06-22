import React, {
  useContext, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Badge, Container, Stack } from '@edx/paragon';
import { logError } from '@edx/frontend-platform/logging';

import Hero from '../Hero';
import { EnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';
import { NotFound } from '../NotFoundPage';
import LearnerCreditAllocationTable from './LearnerCreditAllocationTable';
import LearnerCreditAggregateCards from './LearnerCreditAggregateCards';
import OfferDates from './OfferDates';
import OfferNameHeading from './OfferNameHeading';
import { useOfferUtilization } from './data/hooks';

const LearnerCreditManagement = ({ enterpriseUUID }) => {
  const { offers } = useContext(EnterpriseSubsidiesContext);
  const enterpriseOffer = offers[0];

  /**
   * Log error only once when no offer exists.
   */
  useEffect(() => {
    if (offers.length === 0) {
      logError(`"Learner Credit Management" accessed with no enterprise offer configured for enterprise ${enterpriseUUID}.`);
    }
  }, [offers, enterpriseUUID]);

  const { isLoading, offerUtilization } = useOfferUtilization(enterpriseUUID, enterpriseOffer);

  if (!enterpriseOffer) {
    return <NotFound />;
  }

  return (
    <>
      <Helmet>
        <title>Learner Credit Management</title>
      </Helmet>
      <Hero title="Learner Credit Management" />
      <Container className="py-4">
        <OfferNameHeading name={enterpriseOffer.displayName} />
        <div className="d-flex flex-wrap align-items-center mb-4">
          <Stack direction="horizontal" gap={3}>
            {enterpriseOffer.isCurrent ? (
              <Badge variant="primary">Active</Badge>
            ) : (
              <Badge variant="light">Ended</Badge>
            )}
            <OfferDates
              start={enterpriseOffer.startDatetime}
              end={enterpriseOffer.endDatetime}
            />
          </Stack>
        </div>
        <div className="mb-4.5 d-flex flex-wrap mx-n3">
          <LearnerCreditAggregateCards
            isLoading={isLoading}
            totalFunds={offerUtilization?.totalFunds}
            redeemedFunds={offerUtilization?.redeemedFunds}
            remainingFunds={offerUtilization?.remainingFunds}
            percentUtilized={offerUtilization?.percentUtilized}
          />
        </div>
        <div>
          <LearnerCreditAllocationTable
            enterpriseUUID={enterpriseUUID}
            offerId={enterpriseOffer.id}
          />
        </div>
      </Container>
    </>
  );
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
});

LearnerCreditManagement.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(LearnerCreditManagement);
