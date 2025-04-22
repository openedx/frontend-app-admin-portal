import dayjs from 'dayjs';
import { logError } from '@edx/frontend-platform/logging';
import { ASSIGNMENT_TYPES, MAX_INITIAL_LEARNER_EMAILS_DISPLAYED_COUNT } from './constants';
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

export type SubscriptionPageUrlArgs = {
  enterpriseSlug: string,
  uuid: string,
};
/**
 *
 * @param SubscriptionPageUrlArgs enterpriseSlug and uuid pointing to Subscription page
 * @returns url to Subscription page
 */
export const subscriptionPageUrl = ({ enterpriseSlug, uuid }: SubscriptionPageUrlArgs) => `/${enterpriseSlug}/admin/subscriptions/manage-learners/${uuid}`;

export type LearnerCreditPageUrlArgs = {
  enterpriseSlug: string,
  uuid: string,
};
/**
 *
 * @param LearnerCreditPageUrlArgs enterpriseSlug and uuid pointing to Learner Credit page
 * @returns url to Learner Credit page
 */
export const learnerCreditPageUrl = ({ enterpriseSlug, uuid }: LearnerCreditPageUrlArgs) => `/${enterpriseSlug}/admin/learner-credit/${uuid}`;

export type TransformRedeemablePoliciesDataArgs = {
  policies: Array<{
    learnerContentAssignments?: Array<any>;
    subsidyExpirationDate?: string;
    [key: string]: any;
  }>;
};

/**
 * Transforms the redeemable policies data by attaching the subsidy expiration date
 * to each assignment within the policies, if available.
 * @param {TransformRedeemablePoliciesDataArgs} args - Object containing array of
 * policy objects with learner assignments.
 * @returns {Array} - Returns modified policies data with subsidy expiration dates attached to assignments.
 */
export function transformRedeemablePoliciesData({ policies = [] }: TransformRedeemablePoliciesDataArgs): Array<any> {
  return policies.map((policy) => {
    const assignmentsWithSubsidyExpiration = policy.learnerContentAssignments?.map(assignment => ({
      ...assignment,
      policyUuid: policy.uuid,
      subsidyExpirationDate: policy.subsidyExpirationDate,
    }));
    return {
      ...policy,
      policyUuid: policy.uuid,
      learnerContentAssignments: assignmentsWithSubsidyExpiration,
    };
  });
}

/**
 * Takes a flattened array of assignments and returns an object containing
 * lists of assignments for each assignment state.
 */
export function getAssignmentsByState(assignments: any[] = []): any[] {
  const allocatedAssignments: any[] = [];
  const acceptedAssignments: any[] = [];
  const canceledAssignments: any[] = [];
  const expiredAssignments: any[] = [];
  const erroredAssignments: any[] = [];
  const reversedAssignments: any[] = [];
  const assignmentsForDisplay: any[] = [];
  assignments.forEach((assignment) => {
    switch (assignment.state) {
      case ASSIGNMENT_TYPES.ALLOCATED:
        allocatedAssignments.push(assignment);
        break;
      case ASSIGNMENT_TYPES.ACCEPTED:
        acceptedAssignments.push(assignment);
        break;
      case ASSIGNMENT_TYPES.CANCELED:
        canceledAssignments.push(assignment);
        break;
      case ASSIGNMENT_TYPES.EXPIRED:
        expiredAssignments.push(assignment);
        break;
      case ASSIGNMENT_TYPES.ERRORED:
        erroredAssignments.push(assignment);
        break;
      case ASSIGNMENT_TYPES.REVERSED:
        reversedAssignments.push(assignment);
        break;
      default:
        logError(`[getAssignmentsByState] Unsupported state ${assignment.state} for assignment ${assignment.uuid}`);
        break;
    }
  });

  assignmentsForDisplay.push(...allocatedAssignments);
  assignmentsForDisplay.push(...canceledAssignments);
  assignmentsForDisplay.push(...expiredAssignments);

  return assignmentsForDisplay;
}

export const determineAssignmentState = ({ state }) => ({
  isAcceptedAssignment: state === ASSIGNMENT_TYPES.ACCEPTED,
  isAllocatedAssignment: state === ASSIGNMENT_TYPES.ALLOCATED,
  isCanceledAssignment: state === ASSIGNMENT_TYPES.CANCELED,
  isExpiredAssignment: state === ASSIGNMENT_TYPES.EXPIRED,
  isErroredAssignment: state === ASSIGNMENT_TYPES.ERRORED,
  isExpiringAssignment: state === ASSIGNMENT_TYPES.EXPIRING,
});

export interface LearnerContentAssignment {
  contentKey: string;
  parentContentKey?: string;
  isAssignedCourseRun?: boolean;
  earliestPossibleExpiration?: {
    date: string;
  };
  contentTitle?: string;
  contentMetadata?: {
    partners?: Array<{
      name: string;
    }>;
    courseType?: string;
    startDate?: string;
  };
  policyUuid?: string;
}

export interface TransformedAssignment {
  displayName?: string;
  orgName?: string;
  courseType?: string;
  courseKey: string;
  courseRunStatus: string;
  startDate?: string;
  enrollBy?: string;
  policyUuid?: string;
}

export const transformLearnerContentAssignment = (
  learnerContentAssignment: LearnerContentAssignment,
): TransformedAssignment => {
  const {
    contentKey,
    parentContentKey,
    isAssignedCourseRun,
    earliestPossibleExpiration,
  } = learnerContentAssignment;
  const assignmentEnrollByDeadline = earliestPossibleExpiration?.date;

  let courseKey = contentKey;
  if (isAssignedCourseRun) {
    courseKey = parentContentKey || contentKey;
  }
  return {
    displayName: learnerContentAssignment.contentTitle,
    orgName: learnerContentAssignment.contentMetadata?.partners?.[0]?.name,
    courseType: learnerContentAssignment.contentMetadata?.courseType,
    courseKey,
    courseRunStatus: 'assigned',
    startDate: learnerContentAssignment.contentMetadata?.startDate,
    enrollBy: assignmentEnrollByDeadline,
    policyUuid: learnerContentAssignment.policyUuid,
  };
};

/**
 * Transforms a learner assignment into a shape consistent with course enrollments
 *
 * @param {Array} assignments - Array of assignments to be transformed.
 * @returns {Array} - Returns the transformed array of assignments.
 */
export const getTransformedAllocatedAssignments = (
  assignments: LearnerContentAssignment[],
): TransformedAssignment[] => {
  const updatedAssignments = assignments.map(
    (assignment) => transformLearnerContentAssignment(assignment),
  );
  return updatedAssignments;
};

/**
 * Checks if a string is a valid email address
 *
 * @param {string} email - The string to check if it's an email address
 * @returns {boolean} - Returns true if the string is a valid email address, false otherwise
 */
export const isEmail = (email: string): boolean => {
  if (!email) {
    return false;
  }
  return !!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
};
