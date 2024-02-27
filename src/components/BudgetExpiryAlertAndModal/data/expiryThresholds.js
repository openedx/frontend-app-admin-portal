import sanitizeHTML from 'sanitize-html';
import parse from 'html-react-parser';

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
      message: `Your Learner Credit plan expires ${date}. Contact support today to renew your plan and keep people learning.`,
    },
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
      message: `Your Learner Credit plan expires ${date}. Contact support today to renew your plan and keep people learning.`,
    },
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
      message: `Your Learner Credit plan expires ${date}. Contact support today to renew your plan and keep people learning.`,
    },
  }),
  30: ({ date }) => ({
    notificationTemplate: {
      title: 'Your Learner Credit plan expires in less than 30 days',
      variant: 'danger',
      message: 'When your plan expires you will lose access to administrative functions and the remaining balance of your plan’s budget(s) will be unusable. Contact support today to renew your plan.',
    },
    modalTemplate: {
      title: 'Your Learner Credit plan expires in less than 30 days',
      message: `Your Learner Credit plan expires ${date}. Contact support today to renew your plan and keep people learning.`,
    },
  }),
  10: ({ date, days, hours }) => ({
    notificationTemplate: {
      title: `Reminder: Your Learner Credit plan expires ${date}`,
      variant: 'danger',
      message: parse(sanitizeHTML(`Your Learner Credit plan expires in <strong>${days} days and ${hours} hours</strong>. Contact support today to renew your plan.`)),
    },
    modalTemplate: {
      title: `Reminder: Your Learner Credit plan expires ${date}`,
      message: `Your Learner Credit plan expires ${date}. Contact support today to renew your plan and keep people learning.`,
    },
  }),
  0: ({ date }) => ({
    notificationTemplate: {},
    modalTemplate: {
      title: 'Your Learner Credit plan has expired',
      message: `Your Learner Credit plan expired on ${date}. You are no longer able to assign courses to learners. Please contact your representative if you have any questions or concerns.`,
    },
  }),
};

export default expiryThresholds;
