import React, {
  useContext, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import dayjs from 'dayjs';
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
import LearnerCreditDisclaimer from './LearnerCreditDisclaimer';
import OfferDates from './OfferDates';
import OfferNameHeading from './OfferNameHeading';
import { useOfferSummary, useOfferRedemptions } from './data';
import { DATE_FORMAT } from './data/constants';
import OfferUtilizationAlerts from './OfferUtilizationAlerts';

const LearnerCreditManagement = ({ enterpriseUUID }) => {
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
        <OfferNameHeading name={enterpriseOffer.name} />
        <div className="d-flex flex-wrap align-items-center mb-3.5">
          <Stack direction="horizontal" gap={3}>
            {enterpriseOffer.isCurrent ? (
              <Badge variant="primary">Active</Badge>
            ) : (
              <Badge variant="light">Ended</Badge>
            )}
            <OfferDates
              start={enterpriseOffer.start}
              end={enterpriseOffer.end}
            />
          </Stack>
        </div>
        {isLoadingOfferSummary || isLoadingOfferRedemptions ? (
          <Skeleton width={320} />
        ) : (
          <LearnerCreditDisclaimer offerLastUpdated={dayjs(offerDataLastUpdatedTimestamp).format(DATE_FORMAT)} />
        )}
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
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
});

LearnerCreditManagement.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(LearnerCreditManagement);
