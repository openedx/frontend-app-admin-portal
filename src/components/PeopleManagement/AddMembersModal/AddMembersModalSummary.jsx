import classNames from 'classnames';
import { Card, Stack } from '@openedx/paragon';
import { isEmpty } from 'lodash-es';

import AddMemberModalSummaryEmptyState from './AddMemberModalSummaryEmptyState';
import AddMemberModalSummaryLearnerList from './AddMemberModalSummaryLearnerList';
import AddMemberModalSummaryErrorState from './AddMemberModalSummaryErrorState';
import AddMemberModalSummaryDuplicate from './AddMemberModalSummaryDuplicate';
import { useValidatedEmailsContext } from '../data/ValidatedEmailsContext';

const AddMembersModalSummary = () => {
  const {
    isValidInput,
    lowerCasedEmails,
    duplicateEmails,
  } = useValidatedEmailsContext() || {};
  const renderCard = (contents, idx, showErrorHighlight) => (
    <Stack gap={2.5} className="mb-4" key={idx}>
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

  let idx = 0;
  const hasLearnerEmails = lowerCasedEmails?.length > 0;
  let cardSections = [];
  if (hasLearnerEmails) {
    cardSections = cardSections.concat(
      renderCard(<AddMemberModalSummaryLearnerList learnerEmails={lowerCasedEmails} />, ++idx),
    );
  }

  if (!isValidInput) {
    cardSections = cardSections.concat(
      renderCard(<AddMemberModalSummaryErrorState />, ++idx, true),
    );
  }

  if (isEmpty(cardSections)) {
    cardSections = cardSections.concat(
      renderCard(<AddMemberModalSummaryEmptyState />, ++idx),
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
