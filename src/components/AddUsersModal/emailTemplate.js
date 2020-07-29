const emailTemplate = {
  greeting: `Your Learning Manager has provided you with a license to give you access to take a course(s) on edX.
`,
  body: `You may redeem your license for any course(s) that are in your organization's subscription catalog. To redeem, you must [activate your license here](edx.org).

{LICENSE_ACTIVATION_LINK}

edX Login: {USER_EMAIL}
Expiration Date: {EXPIRATION_DATE}

You can bookmark the following link to easily access your learning portal in the future: {LEARNER_PORTAL_LINK}
`,
  closing: `
For any questions, please reach out to your Learning Manager.`,
};

export default emailTemplate;
