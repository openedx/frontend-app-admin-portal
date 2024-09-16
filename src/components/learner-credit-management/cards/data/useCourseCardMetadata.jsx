import { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import cardFallbackImg from '@edx/brand/paragon/images/card-imagecap-fallback.png';

import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import {
  CARD_TEXT,
  EXEC_ED_COURSE_TYPE,
  formatDate,
  formatPrice,
  getAssignableCourseRuns,
  getEnrollmentDeadline,
  useBudgetId,
  useSubsidyAccessPolicy,
} from '../../data';
import { pluralText } from '../../../../utils';

const { ENROLLMENT } = CARD_TEXT;

const messages = defineMessages({
  courseFooterMessage: {
    id: 'lcm.budget.detail.page.catalog.tab.course.card.footer-text',
    defaultMessage: '({courseRuns}) available {pluralText}',
    description: 'Footer text for a course card result for learner credit management',
  },
});

const useCourseCardMetadata = ({
  course,
  enterpriseSlug,
}) => {
  const intl = useIntl();
  const { config: { ENTERPRISE_LEARNER_PORTAL_URL } } = useContext(AppContext);
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const {
    availability,
    cardImageUrl,
    courseType,
    key,
    normalizedMetadata,
    partners,
    title,
    courseRuns,
  } = course;
  const formattedPrice = (normalizedMetadata.contentPrice || normalizedMetadata.contentPrice === 0) ? formatPrice(normalizedMetadata.contentPrice) : 'N/A';
  const imageSrc = cardImageUrl || cardFallbackImg;

  let logoSrc;
  let logoAlt;
  if (partners.length === 1) {
    logoSrc = partners[0]?.logoImageUrl;
    logoAlt = `${partners[0]?.name}'s logo`;
  }

  const altText = `${title} course image`;
  const formattedAvailability = availability?.length ? availability.join(', ') : null;
  const enrollmentDeadline = getEnrollmentDeadline(normalizedMetadata.enrollByDate);

  let courseEnrollmentInfo = '';
  if (formattedAvailability) {
    courseEnrollmentInfo = `${formattedAvailability} • `;
  }
  courseEnrollmentInfo += `${ENROLLMENT.text} ${enrollmentDeadline}`;
  const execEdEnrollmentInfo = `Starts ${formatDate(normalizedMetadata.startDate)} • ${ENROLLMENT.text} ${enrollmentDeadline}`;

  const isExecEdCourseType = courseType === EXEC_ED_COURSE_TYPE;

  let linkToCourse = `${ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/course/${key}`;
  if (isExecEdCourseType) {
    linkToCourse = `${ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/executive-education-2u/course/${key}`;
  }

  const assignableCourseRuns = getAssignableCourseRuns({
    courseRuns,
    subsidyExpirationDatetime: subsidyAccessPolicy.subsidyExpirationDatetime,
    isLateRedemptionAllowed: subsidyAccessPolicy.isLateRedemptionAllowed,
  });
  const footerText = intl.formatMessage(messages.courseFooterMessage, {
    courseRuns: assignableCourseRuns.length,
    pluralText: pluralText('date', assignableCourseRuns.length),
  });

  return {
    ...course,
    subtitle: partners.map(partner => partner.name).join(', '),
    formattedPrice,
    imageSrc,
    altText,
    logoSrc,
    logoAlt,
    enrollmentDeadline,
    courseEnrollmentInfo,
    execEdEnrollmentInfo,
    linkToCourse,
    isExecEdCourseType,
    footerText,
  };
};

export default useCourseCardMetadata;
