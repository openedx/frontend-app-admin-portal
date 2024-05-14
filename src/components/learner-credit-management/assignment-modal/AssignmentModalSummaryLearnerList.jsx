import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import {
  Button, Stack, Icon,
} from '@openedx/paragon';
import { Person } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import { MAX_INITIAL_LEARNER_EMAILS_DISPLAYED_COUNT, hasLearnerEmailsSummaryListTruncation } from '../cards/data';

const AssignmentModalSummaryLearnerList = ({
  course,
  learnerEmails,
}) => {
  const [isTruncated, setIsTruncated] = useState(hasLearnerEmailsSummaryListTruncation(learnerEmails));
  const truncatedLearnerEmails = learnerEmails.slice(0, MAX_INITIAL_LEARNER_EMAILS_DISPLAYED_COUNT - 1);
  const displayedLearnerEmails = isTruncated ? truncatedLearnerEmails : learnerEmails;
  const intl = useIntl();
  useEffect(() => {
    setIsTruncated(hasLearnerEmailsSummaryListTruncation(learnerEmails));
  }, [learnerEmails]);

  const expandCollapseMessage = isTruncated
    ? intl.formatMessage({
      id: 'lcm.budget.detail.page.catalog.tab.course.card.show.more',
      defaultMessage: 'Show {count, number} more',
      description: 'Button text to show more learner emails',
    }, { count: learnerEmails.length - MAX_INITIAL_LEARNER_EMAILS_DISPLAYED_COUNT })
    : intl.formatMessage({
      id: 'lcm.budget.detail.page.catalog.tab.course.card.show.less',
      defaultMessage: 'Show less',
      description: 'Button text to show less learner emails',
    });

  return (
    <ul className="list-unstyled mb-0">
      <Stack gap={2.5}>
        {displayedLearnerEmails.map((emailAddress) => (
          <li key={uuidv4()} className="small">
            <div className="d-flex justify-content-between">
              <div style={{ maxWidth: '85%' }}>
                <Stack direction="horizontal" gap={2} className="align-items-center">
                  <Icon size="sm" src={Person} />
                  <div
                    className="text-nowrap overflow-hidden font-weight-bold"
                    style={{ textOverflow: 'ellipsis' }}
                    title={emailAddress}
                    data-hj-suppress
                  >
                    {emailAddress}
                  </div>
                </Stack>
              </div>
              <span className="ml-auto">
                {course.formattedPrice}
              </span>
            </div>
          </li>
        ))}
      </Stack>
      {hasLearnerEmailsSummaryListTruncation(learnerEmails) && (
        <Button
          variant="link"
          size="sm"
          className="mt-2.5"
          onClick={() => setIsTruncated(prevState => !prevState)}
        >
          {expandCollapseMessage}
        </Button>
      )}
    </ul>
  );
};

AssignmentModalSummaryLearnerList.propTypes = {
  course: PropTypes.shape({
    formattedPrice: PropTypes.string.isRequired,
  }).isRequired,
  learnerEmails: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default AssignmentModalSummaryLearnerList;
