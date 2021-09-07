const emailTemplate = {
  subject: 'Reminder on edX course assignment',
  greeting: `This is a reminder that your Learning Manager has provided you with an access code to take a course at edX.
`,
  body: `You have redeemed this code {REDEEMED_OFFER_COUNT} time(s) out of {TOTAL_OFFER_COUNT} available course redemptions.

edX Login: {USER_EMAIL}
Access Code: {CODE}
Code Expiration Date: {EXPIRATION_DATE}
`,
  closing: `If your organization uses a branded learner portal, this code will be automatically applied to your account and can be redeemed for any available course.
  If your organization does not have a branded learner portal, you can insert the access code at checkout under "coupon code" for applicable courses.

For any questions, please reach out to your Learning Manager.`,
  files: [],
};

export default emailTemplate;
