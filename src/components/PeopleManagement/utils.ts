import dayjs from 'dayjs';
import { MAX_INITIAL_LEARNER_EMAILS_DISPLAYED_COUNT } from './constants';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';

/**
 * Formats provided dates for display
 *
 * @param {string} timestamp unformatted date timestamp
 * @returns Formatted date string for display.
 */
export default function formatDates(timestamp) {
  const DATE_FORMAT = 'MMMM DD, YYYY';
  return dayjs(timestamp).format(DATE_FORMAT);
}

/**
 * Determine whether the number of learner emails exceeds a certain
 * threshold, whereby the list of emails should be truncated.
 * @param {Array<String>} learnerEmails List of learner emails.
 * @returns True is learner emails list should be truncated; otherwise, false.
 */
export const hasLearnerEmailsSummaryListTruncation = (learnerEmails) => (
  learnerEmails.length > MAX_INITIAL_LEARNER_EMAILS_DISPLAYED_COUNT
);

export type GroupDetailPageUrlArgs = {
  enterpriseSlug: string,
  groupUuid: string,
};
/**
 *
 * @param GroupDetailPageUrlArgs enterpriseSlug and groupUuid pointing to Group Detail page
 * @returns url to Group Detail page
 */
export const groupDetailPageUrl = ({ enterpriseSlug, groupUuid }: GroupDetailPageUrlArgs) => `/${enterpriseSlug}/admin/${ROUTE_NAMES.peopleManagement}/${groupUuid}`;
