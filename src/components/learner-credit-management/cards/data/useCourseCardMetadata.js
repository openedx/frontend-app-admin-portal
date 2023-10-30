import { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import cardFallbackImg from '@edx/brand/paragon/images/card-imagecap-fallback.png';

import CARD_TEXT from '../../constants';
import {
  EXEC_ED_COURSE_TYPE,
  formatDate,
  formatPrice,
  getEnrollmentDeadline,
} from '../../data';

const { ENROLLMENT } = CARD_TEXT;

const useCourseCardMetadata = ({
  course,
  enterpriseSlug,
}) => {
  const { config: { ENTERPRISE_LEARNER_PORTAL_URL } } = useContext(AppContext);
  const {
    availability,
    cardImageUrl,
    courseType,
    key,
    normalizedMetadata,
    partners,
    title,
  } = course;
  const price = normalizedMetadata?.contentPrice ? formatPrice(normalizedMetadata.contentPrice) : 'N/A';
  const imageSrc = cardImageUrl || cardFallbackImg;

  let logoSrc;
  let logoAlt;
  if (partners.length === 1) {
    logoSrc = partners[0]?.logoImageUrl;
    logoAlt = `${partners[0]?.name}'s logo`;
  }

  const altText = `${title} course image`;
  const formattedAvailability = availability?.length ? availability.join(', ') : null;
  const enrollmentDeadline = getEnrollmentDeadline(normalizedMetadata?.enrollByDate);

  let courseEnrollmentInfo = formattedAvailability;
  let execEdEnrollmentInfo = formattedAvailability;
  if (normalizedMetadata?.enrollByDate) {
    courseEnrollmentInfo = `${formattedAvailability} • ${ENROLLMENT.text} ${enrollmentDeadline}`;
    execEdEnrollmentInfo = `Starts ${formatDate(normalizedMetadata.startDate)} •
    ${ENROLLMENT.text} ${enrollmentDeadline}`;
  }

  const isExecEdCourseType = courseType === EXEC_ED_COURSE_TYPE;

  let linkToCourse;
  if (isExecEdCourseType) {
    linkToCourse = `${ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/executive-education-2u/course/${key}`;
  } else {
    linkToCourse = `${ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/course/${key}`;
  }

  return {
    ...course,
    subtitle: partners.map(partner => partner.name).join(', '),
    price,
    imageSrc,
    altText,
    logoSrc,
    logoAlt,
    courseEnrollmentInfo,
    execEdEnrollmentInfo,
    linkToCourse,
    isExecEdCourseType,
  };
};

export default useCourseCardMetadata;
