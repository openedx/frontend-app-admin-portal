import sanitizeHTML from 'sanitize-html';
import parse from 'html-react-parser';
import { PLAN_EXPIRY_VARIANTS } from './constants';

const expiryThresholds = {
  120: ({ date }) => ({
    notificationTemplate: {
      title: 'Your Learner Credit plan expires soon',
      variant: 'info',
      message: `Your Learner Credit plan expires ${date}. Contact support today to renew your plan and keep people learning.`,
      dismissible: true,
    },
    modalTemplate: {
      title: 'Your plan expires soon',
      message: parse(sanitizeHTML(`Your Learner Credit plan expires ${date}. Contact support today to renew your plan and keep people learning.`)),
    },
    variant: PLAN_EXPIRY_VARIANTS.expiring,
  }),
  90: ({ date }) => ({
    notificationTemplate: {
      title: 'Reminder: Your Learner Credit plan expires soon',
      variant: 'info',
      message: `Your Learner Credit plan expires ${date}. Contact support today to renew your plan and keep people learning.`,
      dismissible: true,
    },
    modalTemplate: {
      title: 'Reminder: Your plan expires soon',
      message: parse(sanitizeHTML(`Your Learner Credit plan expires ${date}. Contact support today to renew your plan and keep people learning.`)),
    },
    variant: PLAN_EXPIRY_VARIANTS.expiring,
  }),
  60: ({ date }) => ({
    notificationTemplate: {
      title: `Your Learner Credit plan expires ${date}`,
      variant: 'warning',
      message: 'When your Learner Credit plan expires, you will no longer have access to administrative functions and the remaining balance of your budget(s) will be unusable. Contact support today to renew your plan.',
      dismissible: true,
    },
    modalTemplate: {
      title: `Your Learner Credit plan expires ${date}`,
      message: parse(sanitizeHTML(`Your Learner Credit plan expires ${date}. Contact support today to renew your plan and keep people learning.`)),
    },
    variant: PLAN_EXPIRY_VARIANTS.expiring,
  }),
  30: ({ date }) => ({
    notificationTemplate: {
      title: 'Your Learner Credit plan expires in less than 30 days',
      variant: 'danger',
      message: 'When your plan expires you will lose access to administrative functions and the remaining balance of your plan’s budget(s) will be unusable. Contact support today to renew your plan.',
    },
    modalTemplate: {
      title: 'Your Learner Credit plan expires in less than 30 days',
      message: parse(sanitizeHTML(`<p>Your Learner Credit plan expires ${date}. Contact support today to renew your plan and keep people learning.</p>`)),
    },
    variant: PLAN_EXPIRY_VARIANTS.expiring,
  }),
  10: ({ date, days, hours }) => ({
    notificationTemplate: {
      title: `Reminder: Your Learner Credit plan expires ${date}`,
      variant: 'danger',
      message: parse(sanitizeHTML(`Your Learner Credit plan expires in <strong>${days} days and ${hours} hours</strong>. Contact support today to renew your plan.`)),
    },
    modalTemplate: {
      title: `Reminder: Your Learner Credit plan expires ${date}`,
      message: parse(sanitizeHTML(`<p>Your Learner Credit plan expires ${date}. Contact support today to renew your plan and keep people learning.</p>`)),
    },
    variant: PLAN_EXPIRY_VARIANTS.expiring,
  }),
  0: ({ date }) => ({
    notificationTemplate: null,
    modalTemplate: {
      title: 'Your Learner Credit plan has expired',
      message: parse(sanitizeHTML(
        `<p>Your Learner Credit Plan expired on ${date}. You are no longer have access to administrative functions and the remaining balance of your plan's budget(s) are no longer available to spend</p>`
        + '<p>Please contact your representative if you have any questions or concerns.</p>',
      )),
    },
    variant: PLAN_EXPIRY_VARIANTS.expired,
  }),
};

export default expiryThresholds;
