const emailTemplate = {
  greeting: ' This is a reminder that your Learning Manager has provided you with an access code to take a course at edX.',
  body: `You have redeemed this code {REDEEMED_OFFER_COUNT} time(s) out of {TOTAL_OFFER_COUNT} number of available course redemptions.

edX Login: {USER_EMAIL}
Access Code: {CODE}
Expiration Date: {EXPIRATION_DATE}`,
  closing: `You can insert the access code at checkout under "coupon code" for applicable courses.

For any questions, please reach out to your Learning Manager.`,
};

export default emailTemplate;
