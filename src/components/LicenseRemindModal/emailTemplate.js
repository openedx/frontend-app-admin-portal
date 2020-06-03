const emailTemplate = {
  greeting: 'Your Learning Manager has provided you with a license to give you access to take a course(s) on edX.',
  body: `You may redeem your license for any course(s) that are in your organization's subscription catalog. To redeem, you must [activate your license here](edx.org).
edX Login: {USER_EMAIL}
Expiration Date: {EXPIRATION_DATE}
`,
  closing: 'For any questions, please reach out to your Learning Manager.',
};

export default emailTemplate;
