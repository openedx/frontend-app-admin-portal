const emailTemplate = {
  subject: 'New edX course assignment',
  greeting: `Your Learning Manager has provided you with an access code to take a course at edX.
`,
  body: `You may redeem this code for {REDEMPTIONS_REMAINING} course(s).

edX Login: {USER_EMAIL}
Access Code: {CODE}
Code Expiration Date: {EXPIRATION_DATE}
`,
  closing: `
  If your organization uses a branded learner portal, this code will be automatically applied to your account and can be redeemed for any available course.
  If your organization does not have a branded learner portal, you can insert the access code at checkout under "coupon code" for applicable courses.

For any questions, please reach out to your Learning Manager.`,
  files: [],
};

export default emailTemplate;
