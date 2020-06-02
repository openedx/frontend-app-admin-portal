const emailTemplate = {
  greeting: 'Your Learning Manager has provided you with an access code to take a course on edX.',
  body: `You may redeem this code for {REDEMPTIONS_REMAINING} course(s).

edX Login: {USER_EMAIL}
Access Code: {CODE}
Expiration Date: {EXPIRATION_DATE}
`,
  closing: `
You can insert the access code at checkout under "coupon code" for applicable courses.

For any questions, please reach out to your Learning Manager.`,
};

export default emailTemplate;
