import classNames from 'classnames';
import { Card, Stack } from '@openedx/paragon';
import isEmpty from 'lodash/isEmpty';

import AddMemberModalSummaryEmptyState from './AddMemberModalSummaryEmptyState';
import AddMemberModalSummaryLearnerList from './AddMemberModalSummaryLearnerList';
import AddMemberModalSummaryErrorState from './AddMemberModalSummaryErrorState';
import AddMemberModalSummaryDuplicate from './AddMemberModalSummaryDuplicate';
import LearnerNotInOrgErrorState from '../LearnerNotInOrgErrorState';
import { useValidatedEmailsContext } from '../data/ValidatedEmailsContext';

const AddMembersModalSummary = () => {
  const {
    isValidInput,
    lowerCasedEmails,
    duplicateEmails,
    emailsNotInOrg,
  } = useValidatedEmailsContext() || {};
  const hasEmailsNotInOrg = emailsNotInOrg.length > 0;
  const renderCard = (contents, showErrorHighlight) => (
    <Stack gap={2.5} className="mb-4">
      <Card
        className={classNames(
          'invite-modal-summary-card rounded-0 shadow-none',
          { invalid: showErrorHighlight && !isValidInput },
        )}
      >
        <Card.Section>
          {contents}
        </Card.Section>
      </Card>
    </Stack>
  );

  const hasLearnerEmails = lowerCasedEmails?.length > 0;
  let cardSections = [];
  if (hasLearnerEmails) {
    cardSections = cardSections.concat(
      renderCard(<AddMemberModalSummaryLearnerList learnerEmails={lowerCasedEmails} />),
    );
  }

  if (!isValidInput) {
    cardSections = cardSections.concat(
      renderCard(<AddMemberModalSummaryErrorState />, true),
    );
  }

  if (hasEmailsNotInOrg) {
    cardSections = cardSections.concat(
      <LearnerNotInOrgErrorState />,
    );
  }

  if (isEmpty(cardSections)) {
    cardSections = cardSections.concat(
      renderCard(<AddMemberModalSummaryEmptyState />),
    );
  }

  let summaryHeading = 'Summary';
  if (hasLearnerEmails) {
    summaryHeading = `${summaryHeading} (${lowerCasedEmails.length})`;
  }
  return (
    <>
      <h5 className="mb-4">{summaryHeading}</h5>
      {cardSections}
      {duplicateEmails?.length > 0 && <AddMemberModalSummaryDuplicate />}
    </>
  );
};

export default AddMembersModalSummary;
