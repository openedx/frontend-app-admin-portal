import { Link, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Breadcrumb } from '@openedx/paragon';

import { ROUTE_NAMES } from '../../EnterpriseApp/data/constants';
import { useEnterpriseGroupUuid } from '../data/hooks';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LearnerDetailPage = ({ learnerId }) => {
  const { enterpriseSlug, groupUuid } = useParams();
  const { data: enterpriseGroup } = useEnterpriseGroupUuid(groupUuid);
  const intl = useIntl();
  const links = [{
    label: intl.formatMessage({
      id: 'adminPortal.peopleManagement.learnerDetailPage.breadcrumb.peopleManagement',
      defaultMessage: 'People Management',
      description: 'Breadcrumb label to go back to People Management page',
    }),
    to: `/${enterpriseSlug}/admin/${ROUTE_NAMES.peopleManagement}`,
  }];
  if (groupUuid) {
    links.push({
      label: intl.formatMessage({
        id: 'adminPortal.peopleManagement.learnerDetailPage.breadcrumb.groupName',
        defaultMessage: `${enterpriseGroup.name}`,
        description: 'Breadcrumb label to go back to People Management page',
      }),
      to: `/${enterpriseSlug}/admin/${ROUTE_NAMES.peopleManagement}/${groupUuid}`,
    });
  }
  return (
    <div className="pt-4 pl-4">
      <Breadcrumb
        ariaLabel="Learner detail page breadcrumb navigation"
        links={links}
        linkAs={Link}
        activeLabel="Art Donaldson"
      />
    </div>
  );
};

LearnerDetailPage.propTypes = {
  learnerId: PropTypes.string.isRequired,
};

export default LearnerDetailPage;
