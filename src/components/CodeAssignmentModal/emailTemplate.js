const emailTemplate = `Your learning manager has provided you with a new access code to take a course at edX. You may redeem this code for {{REDEMPTIONS_REMAINING}} # of courses.

edX Login: {{USER_EMAIL}}
Enrollment URL: {{ENROLLMENT_URL}}
Access Code: {{CODE}}
Expiration Date: {{EXPIRATION_DATE}}

You may go directly to the Enrollment URL to view courses that are available for this code or you can insert the access code at checkout under “coupon code” for applicable courses.

For any questions, please reach out to your Learning Manager.
`;

export default emailTemplate;
