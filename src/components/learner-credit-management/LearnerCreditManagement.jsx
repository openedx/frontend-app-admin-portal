import React, {
  useContext, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import moment from 'moment';
import {
  Badge,
  Container,
  Stack,
  Skeleton,
} from '@edx/paragon';
import { logError } from '@edx/frontend-platform/logging';

import Hero from '../Hero';
import { EnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';
import { NotFound } from '../NotFoundPage';
import LearnerCreditAllocationTable from './LearnerCreditAllocationTable';
import LearnerCreditAggregateCards from './LearnerCreditAggregateCards';
import OfferDates from './OfferDates';
import OfferNameHeading from './OfferNameHeading';
import { useOfferSummary, useOfferRedemptions } from './data/hooks';
import { DATE_FORMAT } from './data/constants';
import OfferUtilizationAlerts from './OfferUtilizationAlerts';

function LearnerCreditManagement({ enterpriseUUID }) {
  const { offers } = useContext(EnterpriseSubsidiesContext);
  const enterpriseOffer = offers[0];

  const {
    isLoading: isLoadingOfferSummary,
    offerSummary,
  } = useOfferSummary(enterpriseUUID, enterpriseOffer);
  const {
    isLoading: isLoadingOfferRedemptions,
    offerRedemptions,
    fetchOfferRedemptions,
  } = useOfferRedemptions(enterpriseUUID, enterpriseOffer?.id);

  /**
   * Log error only once when no offer exists.
   */
  useEffect(() => {
    if (offers.length === 0) {
      logError(`"Learner Credit Management" accessed with no enterprise offer configured for enterprise ${enterpriseUUID}.`);
    }
  }, [offers, enterpriseUUID]);

  if (!enterpriseOffer) {
    return <NotFound />;
  }

  // The LPR data is synced once per day, and all its data is fresh, meaning we can
  // deduce when the data was last updated based on when any of the offer redemptions
  // records were created.
  const offerDataLastUpdatedTimestamp = offerRedemptions.results[0]?.created;

  return (
    <>
      <Helmet>
        <title>Learner Credit Management</title>
      </Helmet>
      <Hero title="Learner Credit Management" />
      <Container className="py-4">
        <OfferUtilizationAlerts
          className="mb-4.5"
          percentUtilized={offerSummary?.percentUtilized}
          remainingFunds={offerSummary?.remainingFunds}
          enterpriseUUID={enterpriseUUID}
        />
        <OfferNameHeading name={enterpriseOffer.displayName} />
        <div className="d-flex flex-wrap align-items-center mb-5">
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
        <p className="small mb-2">
          {(isLoadingOfferSummary || isLoadingOfferRedemptions) ? (
            <Skeleton width={320} />
          ) : (
            <>
              Data last updated on{' '}
              {moment(offerDataLastUpdatedTimestamp).format(DATE_FORMAT)}
            </>
          )}
        </p>
        <div className="mb-4.5 d-flex flex-wrap mx-n3">
          <LearnerCreditAggregateCards
            isLoading={isLoadingOfferSummary}
            totalFunds={offerSummary?.totalFunds}
            redeemedFunds={offerSummary?.redeemedFunds}
            remainingFunds={offerSummary?.remainingFunds}
            percentUtilized={offerSummary?.percentUtilized}
          />
        </div>
        <div>
          <LearnerCreditAllocationTable
            isLoading={isLoadingOfferRedemptions}
            tableData={offerRedemptions}
            fetchTableData={fetchOfferRedemptions}
            enterpriseUUID={enterpriseUUID}
          />
        </div>
      </Container>
    </>
  );
}

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
});

LearnerCreditManagement.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(LearnerCreditManagement);
