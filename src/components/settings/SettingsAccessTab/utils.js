import { getConfig } from '@edx/frontend-platform/config';

export default function getInviteURL(enterpriseSlug, inviteUUID) {
  return `${getConfig().ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/invite/${inviteUUID}`;
}
