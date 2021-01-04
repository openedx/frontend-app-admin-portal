import { getSubscriptionContactText } from '../../utils';

const emailTemplate = {
  greeting: "We noticed you haven't had a chance to start learning on edX!  It’s easy to get started and browse the course catalog.",
  body: `{ENTERPRISE_NAME} partnered with edX to give everyone access to high-quality online courses. Start your subscription and browse courses in nearly every subject including Data Analytics, Digital Media, Business & Leadership, Communications, Computer Science and so much more. Courses are taught by experts from the world’s leading universities and corporations.

Start learning: {LICENSE_ACTIVATION_LINK}
  `,
  closing: getSubscriptionContactText,
};

export default emailTemplate;
