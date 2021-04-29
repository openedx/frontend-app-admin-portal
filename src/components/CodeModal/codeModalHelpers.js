import { logError } from '@edx/frontend-platform/logging';
import { SubmissionError } from 'redux-form';
import LmsApiService from '../../data/services/LmsApiService';

export const displayCode = (code) => `Code: ${code}`;
export const displayEmail = (email) => `Email: ${email}`;
export const displaySelectedCodes = (numSelectedCodes) => `Selected codes: ${numSelectedCodes}`;

export function getCleanedUsers(assignedEmail, assignedCode, usersResponse, assignments) {
  const user = usersResponse.find(userResponse => userResponse.email === assignedEmail);
  assignments.push({
    user: {
      email: assignedEmail,
      lms_user_id: user ? user.id : undefined,
      username: user ? user.username : undefined,
    },
    code: assignedCode,
  });
  return assignments;
}

export async function getUserDetails(remindCodeEmails) {
  try {
    const response = await LmsApiService.fetchUserDetailsFromEmail({ emails: remindCodeEmails });
    return response.data;
  } catch (error) {
    logError(error);
    throw new SubmissionError({ _error: error });
  }
}
