import React from 'react';
import PropTypes from 'prop-types';
import { Collapsible } from '@edx/paragon';

const InviteModalMembershipInfo = ({ subsidyAccessPolicy }) => {
  const {
    policyType, spendLimit, subsidyExpirationDatetime,
  } = subsidyAccessPolicy;
  const expiration = new Date(subsidyExpirationDatetime).toLocaleDateString();
  const dynamicListBullets = () => {
    if (policyType === 'PerLearnerEnrollmentCreditAccessPolicy') {
      return (
        <li>
          Member permissions for this budget include browsing this budget&apos;s
          catalog and enroll by spending from this budget&apos;s available balance.
          Member spending is set to first come, first serve: there is no limit on the
          funds any individual member can spend.
        </li>
      );
    } if (spendLimit !== null) {
      return (
        <li>
          Member permissions for this budget include browsing this budget&apos;s catalog and
          enroll by spending from this budget&apos;s available balance. Per member spending is limited to
          ${spendLimit}: after this maximum has been exceeded, members can still browse but no
          longer enroll in courses.
        </li>
      );
    }
    return '';
  };
  return (
    <>
      <h5 className="mb-2 mt-4">How membership works</h5>
      <Collapsible
        styling="basic"
        title="Members are invited"
        defaultOpen
        className="small"
      >
        <ul className="px-3 small">
          <li>Newly invited members are immediately notified by email.</li>
          <li>
            Members must accept their invitation to browse and enroll within 90 days
            by registering for an edX account or logging in. After 90 days, the invitation
            will expire and members that do not accept are automatically purged.
          </li>
          <li>Members receive automated reminder emails during the 90 day acceptance window.</li>
        </ul>
      </Collapsible>
      <Collapsible
        className="small"
        styling="basic"
        title="Members can browse and learn"
      >
        <ul className="px-3 small">
          <li>
            Once their invitation has been accepted, member permissions are automatically applied
            to the member&apos;s Learner Portal experience until the budget expires on {expiration}.
          </li>
          {dynamicListBullets()}
          <li>
            This budget&apos;s catalog and expiration date are visible to members in the Learner Portal. Members cannot
            see this budget&apos;s available balance or any other information related to this budget
            (such as its name or other members associated with it).
          </li>
        </ul>
      </Collapsible>
      <Collapsible className="small" styling="basic" title="Managing members">
        <ul className="px-3 small">
          <li>Members can be removed at any time from this budget&apos;s Members tab.</li>
          <li>
            Removing members immediately strips the associated member permissions away
            from the member&apos;s Learner Portal experience.
          </li>
          <li>Any courses the member previously enrolled in using this budget are not affected by removal.</li>
        </ul>
      </Collapsible>
    </>
  );
};

InviteModalMembershipInfo.propTypes = {
  subsidyAccessPolicy: PropTypes.shape({
    policyType: PropTypes.string.isRequired,
    spendLimit: PropTypes.number,
    subsidyExpirationDatetime: PropTypes.string.isRequired,
  }).isRequired,
};

export default InviteModalMembershipInfo;
