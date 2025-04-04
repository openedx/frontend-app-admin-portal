import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import {
  Hyperlink, Icon, Stack,
} from '@openedx/paragon';
import { NorthEast } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { subscriptionPageUrl, learnerCreditPageUrl } from '../utils';

interface SubscriptionPlan {
  planType: string;
  title: string;
  uuid: string;
}

interface Subscription {
  subscriptionPlan: SubscriptionPlan;
  uuid: string;
}

interface LearnerCreditPlan {
  displayName: string;
  active: boolean;
  policyType: string;
  uuid: string;
}

type SubsidyLinkProps = {
  subscription: Subscription;
};

const SubsidyLink = ({ subscription }: SubsidyLinkProps) => {
  const { enterpriseSlug } = useParams() as { enterpriseSlug: string };
  const { subscriptionPlan: { planType, title, uuid } } = subscription;
  const subscriptionUrl = subscriptionPageUrl({ enterpriseSlug, uuid });

  return (
    <div className="pl-3">
      <div className="d-flex align-items-center">
        <Hyperlink
          className="font-weight-bold pb-2 text-truncate d-flex align-items-center"
          style={{ maxWidth: '90%' }}
          destination={subscriptionUrl}
          target="_blank"
          showLaunchIcon={false}
        >
          <span className="text-truncate">{title}</span>
          <Icon
            id="SampleIcon"
            size="xs"
            src={NorthEast}
            screenReaderText="Visit subscription page"
            className="ml-1 mb-1"
          />
        </Hyperlink>
      </div>
      <p className="small pb-2">{planType}</p>
    </div>
  );
};

SubsidyLink.propTypes = {
  subscription: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    subscriptionPlan: PropTypes.shape({
      planType: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      uuid: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

type LearnerCreditLinkProps = {
  plan: LearnerCreditPlan;
};

const LearnerCreditLink = ({ plan }: LearnerCreditLinkProps) => {
  const { displayName, uuid } = plan;
  const { enterpriseSlug } = useParams() as { enterpriseSlug: string };
  const learnerCreditUrl = learnerCreditPageUrl({ enterpriseSlug, uuid });

  return (
    <div className="pl-3">
      <div className="d-flex align-items-center">
        <Hyperlink
          className="font-weight-bold pb-2 text-truncate d-flex align-items-center"
          style={{ maxWidth: '90%' }}
          destination={learnerCreditUrl}
          target="_blank"
          showLaunchIcon={false}
        >
          <span className="text-truncate">{displayName}</span>
          <Icon
            id="SampleIcon"
            size="xs"
            src={NorthEast}
            screenReaderText="Visit credit plan page"
            className="ml-1 mb-1"
          />
        </Hyperlink>
      </div>
      <p className="small pb-2">{plan.policyType === 'AssignedLearnerCreditAccessPolicy' ? 'Assignment' : 'Browse & Enroll'}</p>
    </div>
  );
};

LearnerCreditLink.propTypes = {
  plan: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
    policyType: PropTypes.string.isRequired,
    uuid: PropTypes.string.isRequired,
  }).isRequired,
};

interface LearnerAccessProps {
  profileData: {
    subscriptions: Subscription[];
  };
  creditPlansData: LearnerCreditPlan[];
}

const LearnerAccess = ({ profileData, creditPlansData }: LearnerAccessProps) => {
  const intl = useIntl();
  const accessHeader = intl.formatMessage({
    id: 'adminPortal.peopleManagement.learnerDetailPage.accessHeader',
    defaultMessage: 'Access',
    description: 'Header for learner access information',
  });
  return (
    <Stack gap={4}>
      <div className="pt-3">
        <h3 className="pb-3">{accessHeader}</h3>
        <div className="learner-detail-section">
          {profileData?.subscriptions.length > 0 && (
            <>
              <h5 className="pb-3 ml-3 mb-0">SUBSCRIPTION</h5>
              {profileData?.subscriptions.map((subscription) => (
                <SubsidyLink key={subscription.uuid} subscription={subscription} />
              ))}
            </>
          )}

          {creditPlansData?.length > 0 && (
            <>
              <h5 className="pb-3 ml-3 mb-0">LEARNER CREDIT</h5>
              {creditPlansData.map((plan) => (
                <LearnerCreditLink key={plan.uuid} plan={plan} />
              ))}
            </>
          )}
        </div>
      </div>
    </Stack>
  );
};

LearnerAccess.propTypes = {
  profileData: PropTypes.shape({
    subscriptions: PropTypes.arrayOf(PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      subscriptionPlan: PropTypes.shape({
        planType: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
      }).isRequired,
    })).isRequired,
  }).isRequired,
  creditPlansData: PropTypes.arrayOf(PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
    policyType: PropTypes.string.isRequired,
    uuid: PropTypes.string.isRequired,
  })).isRequired,
};

export default LearnerAccess;

// 21:1  error  Trailing spaces not allowed  no-trailing-spaces
// 60:5  error  Missing semicolon            @typescript-eslint/semi
