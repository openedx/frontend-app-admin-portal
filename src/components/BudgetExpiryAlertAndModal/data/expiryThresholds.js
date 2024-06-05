import sanitizeHTML from 'sanitize-html';
import parse from 'html-react-parser';
import { PLAN_EXPIRY_VARIANTS } from './constants';

const expiryThresholds = {
  120: ({ intl, date }) => ({
    notificationTemplate: {
      title: intl.formatMessage({
        id: 'adminPortal.leaernerCredit.expiryNotification.title',
        defaultMessage: 'Your Learner Credit plan expires soon',
        description: 'Title for the notification that the Learner Credit plan is expiring soon.',
      }),
      variant: 'info',
      message: intl.formatMessage({
        id: 'adminPortal.leaernerCredit.expiryNotification.message',
        defaultMessage: 'Your Learner Credit plan expires {date}. Contact support today to renew your plan and keep people learning.',
        description: 'Message for the notification that the Learner Credit plan is expiring soon.',
      }, { date }),
      dismissible: true,
    },
    modalTemplate: {
      title: intl.formatMessage({
        id: 'adminPortal.leaernerCredit.expiryModal.title',
        defaultMessage: 'Your plan expires soon',
        description: 'Title for the modal that the Learner Credit plan is expiring soon.',
      }),
      message: parse(sanitizeHTML(intl.formatMessage({
        id: 'adminPortal.leaernerCredit.expiryModal.message',
        defaultMessage: 'Your Learner Credit plan expires {date}. Contact support today to renew your plan and keep people learning.',
        description: 'Message for the modal that the Learner Credit plan is expiring soon.',
      }, { date }))),
    },
    variant: PLAN_EXPIRY_VARIANTS.expiring,
  }),
  90: ({ intl, date }) => ({
    notificationTemplate: {
      title: intl.formatMessage({
        id: 'adminPortal.learnerCredit.expiryReminderNotification.title',
        defaultMessage: 'Reminder: Your Learner Credit plan expires soon',
        description: 'Title for the notification that the Learner Credit plan is expiring soon.',
      }),
      variant: 'info',
      message: intl.formatMessage({
        id: 'adminPortal.learnerCredit.expiryReminderNotification.message',
        defaultMessage: 'Your Learner Credit plan expires {date}. Contact support today to renew your plan and keep people learning.',
        description: 'Message for the notification that the Learner Credit plan is expiring soon.',
      }, { date }),
      dismissible: true,
    },
    modalTemplate: {
      title: intl.formatMessage({
        id: 'adminPortal.learnerCredit.expiryReminderModal.title',
        defaultMessage: 'Reminder: Your plan expires soon',
        description: 'Title for the modal that the Learner Credit plan is expiring soon.',
      }),
      message: parse(sanitizeHTML(intl.formatMessage({
        id: 'adminPortal.learnerCredit.expiryReminderModal.message',
        defaultMessage: 'Your Learner Credit plan expires {date}. Contact support today to renew your plan and keep people learning.',
        description: 'Message for the modal that the Learner Credit plan is expiring soon.',
      }, { date }))),
    },
    variant: PLAN_EXPIRY_VARIANTS.expiring,
  }),
  60: ({ intl, date }) => ({
    notificationTemplate: {
      title: intl.formatMessage({
        id: 'adminPortal.learnerCredit.expiresNotification.title',
        defaultMessage: 'Your Learner Credit plan expires {date}',
        description: 'Title for the notification that the Learner Credit plan is expiring.',
      }, { date }),
      variant: 'warning',
      message: intl.formatMessage({
        id: 'adminPortal.learnerCredit.expiresNotification.message',
        defaultMessage: 'When your Learner Credit plan expires, you will no longer have access to administrative functions and the remaining balance of your budget(s) will be unusable. Contact support today to renew your plan.',
        description: 'Message for the notification that the Learner Credit plan is expiring.',
      }),
      dismissible: true,
    },
    modalTemplate: {
      title: intl.formatMessage({
        id: 'adminPortal.learnerCredit.expiresModal.title',
        defaultMessage: 'Your Learner Credit plan expires {date}',
        description: 'Title for the modal that the Learner Credit plan is expiring.',
      }, { date }),
      message: parse(sanitizeHTML(intl.formatMessage({
        id: 'adminPortal.learnerCredit.expiresModal.message',
        defaultMessage: 'Your Learner Credit plan expires {date}. Contact support today to renew your plan and keep people learning.',
        description: 'Message for the modal that the Learner Credit plan is expiring.',
      }, { date }))),
    },
    variant: PLAN_EXPIRY_VARIANTS.expiring,
  }),
  30: ({ intl, date }) => ({
    notificationTemplate: {
      title: intl.formatMessage({
        id: 'adminPortal.learnerCredit.expiresInThirtyDaysNotification.title',
        defaultMessage: 'Your Learner Credit plan expires in less than 30 days',
        description: 'Title for the notification that the Learner Credit plan is expiring in less than 30 days.',
      }),
      variant: 'danger',
      message: intl.formatMessage({
        id: 'adminPortal.learnerCredit.expiresInThirtyDaysNotification.message',
        defaultMessage: 'When your plan expires you will lose access to administrative functions and the remaining balance of your plan{apostrophe}s budget(s) will be unusable. Contact support today to renew your plan.',
        description: 'Message for the notification that the Learner Credit plan is expiring in less than 30 days.',
      }, { apostrophe: "'" }),
    },
    modalTemplate: {
      title: intl.formatMessage({
        id: 'adminPortal.learnerCredit.expiresInThirtyDaysModal.title',
        defaultMessage: 'Your Learner Credit plan expires in less than 30 days',
        description: 'Title for the modal that the Learner Credit plan is expiring in less than 30 days.',
      }),
      message: parse(sanitizeHTML(
        intl.formatMessage({
          id: 'adminPortal.learnerCredit.expiresInThirtyDaysModal.message',
          defaultMessage: 'Your Learner Credit plan expires {date}. Contact support today to renew your plan and keep people learning.',
          description: 'Message for the modal that the Learner Credit plan is expiring in less than 30 days.',
        }, { date }),
      )),
    },
    variant: PLAN_EXPIRY_VARIANTS.expiring,
  }),
  10: ({
    intl, date, days, hours,
  }) => ({
    notificationTemplate: {
      title: intl.formatMessage({
        id: 'adminPortal.learnerCreditPlan.expiresInTenDaysNotification.title',
        defaultMessage: 'Reminder: Your Learner Credit plan expires {date}',
        description: 'Title for the notification that the Learner Credit plan is expiring.',
      }, { date }),
      variant: 'danger',
      message: parse(sanitizeHTML(intl.formatMessage({
        id: 'adminPortal.learnerCreditPlan.expiresInTenDaysNotification.message',
        defaultMessage: 'Your Learner Credit plan expires in <strong>{days} days and {hours} hours</strong>. Contact support today to renew your plan.',
        description: 'Message for the notification that the Learner Credit plan is expiring.',
      }, { days, hours, strong: (str) => `<strong>${str}</strong>` }))),
    },
    modalTemplate: {
      title: intl.formatMessage({
        id: 'adminPortal.learnerCreditPlan.expiresInTenDaysModal.title',
        defaultMessage: 'Reminder: Your Learner Credit plan expires {date}',
        description: 'Title for the modal that the Learner Credit plan is expiring.',
      }, { date }),
      message: parse(sanitizeHTML(intl.formatMessage({
        id: 'adminPortal.learnerCreditPlan.expiresInTenDaysModal.message',
        defaultMessage: 'Your Learner Credit plan expires {date}. Contact support today to renew your plan and keep people learning.',
        description: 'Message for the modal that the Learner Credit plan is expiring.',
      }, { date }))),
    },
    variant: PLAN_EXPIRY_VARIANTS.expiring,
  }),
  0: ({ intl, date }) => ({
    notificationTemplate: null,
    modalTemplate: {
      title: intl.formatMessage({
        id: 'adminPortal.learnerCreditPlan.expiredModal.title',
        defaultMessage: 'Your Learner Credit plan has expired',
        description: 'Title for the modal that the Learner Credit plan has expired.',
      }),
      message: parse(sanitizeHTML(
        intl.formatMessage({
          id: 'adminPortal.learnerCreditPlan.expiredModal.message',
          defaultMessage: `Your Learner Credit plan expired on {date}. You no longer have access to administrative functions and the remaining balance of your plan{apostrophe}s budget(s) are no longer available to spend.
            Please contact your representative if you have any questions or concerns.`,
          description: 'Message for the modal that the Learner Credit plan has expired.',
        }, { date, apostrophe: "'" }),
      )),
    },
    variant: PLAN_EXPIRY_VARIANTS.expired,
  }),
};

export default expiryThresholds;
