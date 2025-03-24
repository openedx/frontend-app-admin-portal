import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Breadcrumb, Card, Icon, Skeleton,
} from '@openedx/paragon';
import { Person } from '@openedx/paragon/icons';

import { ROUTE_NAMES } from '../../EnterpriseApp/data/constants';
import { useEnterpriseGroupUuid } from '../data/hooks';
import { useEnterpriseLearnerData } from './data/hooks';
import LearnerDetailGroupMemberships from './LearnerDetailGroupMemberships';

const LearnerDetailPage = ({ enterpriseUUID }) => {
  const { enterpriseSlug, groupUuid, learnerId } = useParams();
  const { data: enterpriseGroup } = useEnterpriseGroupUuid(groupUuid);

  const { isLoading, learnerData } = useEnterpriseLearnerData(enterpriseUUID, learnerId);

  const activeLabel = () => {
    if (!isLoading && !learnerData?.name) {
      return learnerData?.email;
    }
    return learnerData?.name;
  };

  const intl = useIntl();
  const links = useMemo(() => {
    const baseLinks = [{
      label: intl.formatMessage({
        id: 'adminPortal.peopleManagement.learnerDetailPage.breadcrumb.peopleManagement',
        defaultMessage: 'People Management',
        description: 'Breadcrumb label to go back to People Management page',
      }),
      to: `/${enterpriseSlug}/admin/${ROUTE_NAMES.peopleManagement}`,
    }];
    if (groupUuid) {
      baseLinks.push({
        label: intl.formatMessage({
          id: 'adminPortal.peopleManagement.learnerDetailPage.breadcrumb.groupName',
          defaultMessage: `${enterpriseGroup?.name}`,
          description: 'Breadcrumb label to go back to group detail page',
        }),
        to: `/${enterpriseSlug}/admin/${ROUTE_NAMES.peopleManagement}/${groupUuid}`,
      });
    }
    return baseLinks;
  }, [intl, enterpriseSlug, groupUuid, enterpriseGroup]);
  return (
    <div className="pt-4 pl-4 mb-3">
      <Breadcrumb
        ariaLabel="Learner detail page breadcrumb navigation"
        links={links}
        linkAs={Link}
        activeLabel={`${activeLabel()}`}
      />
      {isLoading ? (
        <Skeleton
          width={400}
          height={200}
        />
      ) : (
        <Card className="learner-detail-card">
          <Icon src={Person} className="learner-detail-icon" />
          <Card.Section className="text-center">
            <h2>{learnerData?.name}</h2>
            <p className="mb-1 small">{learnerData?.email}</p>
            <p className="mb-1 small">Joined on {learnerData?.joinedOrg}</p>
          </Card.Section>
        </Card>
      )}
      <LearnerDetailGroupMemberships enterpriseUuid={enterpriseUUID} lmsUserId={learnerId} />
    </div>
  );
};

LearnerDetailPage.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(LearnerDetailPage);
