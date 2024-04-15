import { MailtoLink } from '@edx/paragon';
import { PLAN_EXPIRY_VARIANTS } from './constants';

const expiryThresholds = {
  120: ({ date }) => ({
    notificationTemplate: {
      title: 'Your Learner Credit plan expires soon',
      variant: 'info',
      message: ({ contactEmail }) => (
        <p>
          Your Learner Credit plan expires ${date}. Contact
          {contactEmail ? <MailtoLink to={contactEmail}>support</MailtoLink> : 'support'} today
          to renew your plan and keep people learning.
        </p>
      ),
      dismissible: true,
    },
    modalTemplate: {
      title: 'Your plan expires soon',
      message: () => (
        <p>
          Your Learner Credit plan expires {date}. Contact support today to
          renew your plan and keep people learning.
        </p>
      ),
    },
    variant: PLAN_EXPIRY_VARIANTS.expiring,
  }),
  90: ({ date }) => ({
    notificationTemplate: {
      title: 'Reminder: Your Learner Credit plan expires soon',
      variant: 'info',
      message: () => (
        <p>
          Your Learner Credit plan expires {date}. Contact support today
          to renew your plan and keep people learning.
        </p>
      ),
      dismissible: true,
    },
    modalTemplate: {
      title: 'Reminder: Your plan expires soon',
      message: () => (
        <p>
          Your Learner Credit plan expires {date}. Contact support today to
          renew your plan and keep people learning.
        </p>
      ),
    },
    variant: PLAN_EXPIRY_VARIANTS.expiring,
  }),
  60: ({ date }) => ({
    notificationTemplate: {
      title: `Your Learner Credit plan expires ${date}`,
      variant: 'warning',
      message: () => (
        <p>
          When your Learner Credit plan expires, you will no longer have access to administrative
          functions and the remaining balance of your budget(s) will be unusable. Contact support
          today to renew your plan.
        </p>
      ),
      dismissible: true,
    },
    modalTemplate: {
      title: `Your Learner Credit plan expires ${date}`,
      message: () => (
        <p>
          Your Learner Credit plan expires {date}. Contact support
          today to renew your plan and keep people learning.
        </p>
      ),
    },
    variant: PLAN_EXPIRY_VARIANTS.expiring,
  }),
  30: ({ date }) => ({
    notificationTemplate: {
      title: 'Your Learner Credit plan expires in less than 30 days',
      variant: 'danger',
      message: () => (
        <p>
          When your plan expires you will lose access to administrative functions and the remaining
          balance of your plan&apos;s budget(s) will be unusable. Contact support today to renew your plan.
        </p>
      ),
    },
    modalTemplate: {
      title: 'Your Learner Credit plan expires in less than 30 days',
      message: () => (
        <p>
          Your Learner Credit plan expires {date}. Contact support today
          to renew your plan and keep people learning.
        </p>
      ),
    },
    variant: PLAN_EXPIRY_VARIANTS.expiring,
  }),
  10: ({ date, days, hours }) => ({
    notificationTemplate: {
      title: `Reminder: Your Learner Credit plan expires ${date}`,
      variant: 'danger',
      message: () => (
        <p>
          Your Learner Credit plan expires in <strong>{days} days and {hours} hours</strong>. Contact
          support today to renew your plan.
        </p>
      ),
    },
    modalTemplate: {
      title: `Reminder: Your Learner Credit plan expires ${date}`,
      message: () => (
        <p>
          Your Learner Credit plan expires {date}. Contact support today to
          renew your plan and keep people learning.
        </p>
      ),
    },
    variant: PLAN_EXPIRY_VARIANTS.expiring,
  }),
  0: ({ date }) => ({
    notificationTemplate: null,
    modalTemplate: {
      title: 'Your Learner Credit plan has expired',
      message: () => (
        <>
          <p>
            Your Learner Credit Plan expired on {date}. You are no longer have
            access to administrative functions and the remaining balance of your
            plan&apos;s budget(s) are no longer available to spend
          </p>
          <p>Please contact support if you have any questions or concerns.</p>
        </>
      ),
    },
    variant: PLAN_EXPIRY_VARIANTS.expired,
  }),
};

export default expiryThresholds;
