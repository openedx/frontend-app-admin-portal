import React from 'react';
import { useParams } from 'react-router';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Hyperlink, Icon, IconButton, Stack,
} from '@openedx/paragon';
import { Person } from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { ROUTE_NAMES } from '../../EnterpriseApp/data/constants';

const MemberDetailsTableCell = ({ row, learnerProfileViewEnabled }) => {
  const { enterpriseSlug, groupUuid } = useParams();
  const hyperlink = `/${enterpriseSlug}/admin/${ROUTE_NAMES.peopleManagement}/${groupUuid}/learner-detail/${row.original.lmsUserId}`;
  let memberDetails;
  let memberDetailIcon = (
    <IconButton
      isActive
      invertColors
      src={Person}
      iconAs={Icon}
      className="border rounded-circle mr-3"
      alt="members detail column icon"
      style={{ opacity: 1, flexShrink: 0 }}
    />
  );
  if (row.original.status === 'removed') {
    memberDetails = (
      <div className="mb-n3">
        <p className="text-danger-500 font-weight-bold text-uppercase x-small mb-0">
          <FormattedMessage
            id="learnerCreditManagement.budgetDetail.membersTab.membersTable.removed.FormerMember"
            defaultMessage="Former member"
            description="Status of the member invitation for a removed member"
          />
        </p>
        <p>{row.original.memberDetails.userEmail}</p>
      </div>
    );
    memberDetailIcon = (
      <IconButton
        disabled
        isActive
        invertColors
        src={Person}
        iconAs={Icon}
        className="border border-gray-400 rounded-circle mr-3"
        alt="members detail column icon"
        style={{ opacity: 0.2, flexShrink: 0 }}
      />
    );
  } else if (row.original.memberDetails.userName) {
    memberDetails = (
      <div className="mb-n3">
        <p className="font-weight-bold mb-0">
          {learnerProfileViewEnabled ? (
            <Hyperlink destination={hyperlink} isInline>
              {row.original.memberDetails.userName}
            </Hyperlink>
          ) : (
            <span>{row.original.memberDetails.userName}</span>
          )}
        </p>
        <p>{row.original.memberDetails.userEmail}</p>
      </div>
    );
  } else {
    memberDetails = (
      <p className="align-middle mb-0">
        {row.original.memberDetails.userEmail}
      </p>
    );
  }
  return (
    <Stack gap={0} direction="horizontal">
      {memberDetailIcon}
      {memberDetails}
    </Stack>
  );
};

MemberDetailsTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      lmsUserId: PropTypes.string.isRequired,
      memberDetails: PropTypes.shape({
        userEmail: PropTypes.string.isRequired,
        userName: PropTypes.string,
      }),
      status: PropTypes.string,
      recentAction: PropTypes.string.isRequired,
      memberEnrollments: PropTypes.string,
    }).isRequired,
  }).isRequired,
  learnerProfileViewEnabled: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  learnerProfileViewEnabled: state.portalConfiguration.enterpriseFeatures?.adminPortalLearnerProfileViewEnabled,
});

export default connect(mapStateToProps)(MemberDetailsTableCell);
