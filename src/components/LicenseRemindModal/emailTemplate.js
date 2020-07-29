const emailTemplate = {
  greeting: 'Your Learning Manager has provided you with a license to give you access to take a course(s) on edX.',
  body: `You have been assigned a license to an edX Enterprise Subscription. edX offers high-quality online courses from the world's best universities and institutions. After activating your license, you'll have instant access to enroll in a wide-array of courses.

Activate your license and begin your learning journey: {LICENSE_ACTIVATION_LINK}

edX Login: {USER_EMAIL}
Expiration Date: {EXPIRATION_DATE}

You can bookmark the following link to easily access your learning portal in the future: {LEARNER_PORTAL_LINK}
`,
  closing: 'For any questions, please reach out to your Learning Manager.',
};

export default emailTemplate;
