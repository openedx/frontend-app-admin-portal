export const displayCode = (code) => `Code: ${code}`;
export const displayEmail = (email) => `Email: ${email}`;
export const displaySelectedCodes = (numSelectedCodes) => `Selected codes: ${numSelectedCodes}`;

export function appendUserCodeDetails(assignedEmail, assignedCode, assignments) {
  assignments.push({
    user: {
      email: assignedEmail,
    },
    code: assignedCode,
  });
  return assignments;
}
