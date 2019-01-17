const emailTemplate = `This is a reminder email that your learning manager has provided you with a access code to take a course at edX. You have redeemed this code {REDEEMED_OFFER_COUNT} of times out of {TOTAL_OFFER_COUNT} number of available course redemptions.

edX Login: {USER_EMAIL}
Enrollment URL: {ENROLLMENT_URL}
Access Code: {CODE}
Expiration Date: {EXPIRATION_DATE}

You may go directly to the Enrollment URL to view courses that are available for this code or you can insert the access code at checkout under “coupon code” for applicable courses.

For any questions, please reach out to your Learning Manager.`;

export default emailTemplate;
