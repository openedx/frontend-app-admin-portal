import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import {
  Hyperlink, Icon, Stack, Skeleton,
} from '@openedx/paragon';
import { NorthEast } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { subscriptionPageUrl, learnerCreditPageUrl } from '../utils';

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
  const intl = useIntl();

  const policyTypeText = intl.formatMessage({
    id: 'adminPortal.peopleManagement.learnerDetailPage.policyType',
    defaultMessage: plan.policyType === 'AssignedLearnerCreditAccessPolicy' ? 'Assignment' : 'Browse & Enroll',
    description: 'Text indicating the type of learner credit policy',
  });

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
      <p className="small pb-2">{policyTypeText}</p>
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

type LearnerAccessProps = {
  subscriptions: Subscription[];
  creditPlansData: LearnerCreditPlan[];
  isLoading: boolean;
};

const LearnerAccess = ({ subscriptions, creditPlansData, isLoading }: LearnerAccessProps) => {
  const intl = useIntl();
  const accessHeader = intl.formatMessage({
    id: 'adminPortal.peopleManagement.learnerDetailPage.accessHeader',
    defaultMessage: 'Learning Access',
    description: 'Header for learner access information',
  });
  const noSubsidiesMessage = intl.formatMessage({
    id: 'adminPortal.peopleManagement.learnerDetailPage.noSubsidiesMessage',
    defaultMessage: 'This learner has not been invited to any subsidies.',
    description: 'Message displayed when a learner has no subscriptions or credit plans',
  });

  return (
    <div>
      {isLoading ? (
        <Skeleton
          width={400}
          height={200}
        />
      ) : (
        <Stack gap={4}>
          <div className="pt-3">
            <h3 className="pb-3">{accessHeader}</h3>
            <div className="learner-detail-section">
              {subscriptions.length > 0 || creditPlansData?.length > 0 ? (
                <>
                  {subscriptions.length > 0 && (
                    <div>
                      <h5 className="pb-3 ml-3 mb-0">SUBSCRIPTION</h5>
                      {subscriptions.map((subscription) => (
                        <SubsidyLink key={subscription.uuid} subscription={subscription} />
                      ))}
                    </div>
                  )}

                  {creditPlansData?.length > 0 && (
                    <div>
                      <h5 className="pb-3 ml-3 mb-0">LEARNER CREDIT</h5>
                      {creditPlansData.map((plan) => (
                        <LearnerCreditLink key={plan.uuid} plan={plan} />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted pl-3">{noSubsidiesMessage}</p>
              )}
            </div>
          </div>
        </Stack>
      )}
    </div>
  );
};

LearnerAccess.propTypes = {
  subscriptions: PropTypes.arrayOf(PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    subscriptionPlan: PropTypes.shape({
      planType: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    }).isRequired,
  })).isRequired,
  creditPlansData: PropTypes.arrayOf(PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
    policyType: PropTypes.string.isRequired,
    uuid: PropTypes.string.isRequired,
  })).isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default LearnerAccess;
