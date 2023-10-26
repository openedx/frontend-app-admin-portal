import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Hyperlink } from '@edx/paragon';

import { configuration } from '../../config';
import EmailAddressTableCell from './EmailAddressTableCell';

const AssignmentDetailsTableCell = ({ row, enterpriseSlug }) => {
  const { ENTERPRISE_LEARNER_PORTAL_URL } = configuration;
  return (
    <>
      <EmailAddressTableCell
        tableId="assigned"
        userEmail={row.original.learnerEmail}
        contentAssignmentUUID={row.original.uuid}
      />
      <div>
        <Hyperlink
          className="x-small"
          destination={`${ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/course/${row.original.contentKey}`}
          target="_blank"
          showLaunchIcon={false}
          isInline
        >
          {row.original.contentTitle}
        </Hyperlink>
      </div>
    </>
  );
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

AssignmentDetailsTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      learnerEmail: PropTypes.string.isRequired,
      contentKey: PropTypes.string.isRequired,
      contentTitle: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  enterpriseSlug: PropTypes.string,
};

export default connect(mapStateToProps)(AssignmentDetailsTableCell);
