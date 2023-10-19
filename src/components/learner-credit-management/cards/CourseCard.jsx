/* eslint-disable @typescript-eslint/naming-convention */
// variables taken from algolia not in camelcase
import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import {
  Badge,
  Button,
  Card,
  Stack,
  Hyperlink,
  useMediaQuery,
  breakpoints,
} from '@edx/paragon';
import { injectIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';

import { CONTENT_TYPE_COURSE, EXEC_COURSE_TYPE } from '../data';
import { formatCurrency, formatDate, getEnrollmentDeadline } from '../data/utils';
import CARD_TEXT from '../constants';
import defaultLogoImg from '../../../static/default-card-header-dark.png';
import defaultCardImg from '../../../static/default-card-header-light.png';

const CourseCard = ({
  enterpriseSlug, learningType, original,
}) => {
  const {
    availability,
    card_image_url,
    content_type,
    course_type,
    entitlements,
    first_enrollable_paid_seat_price,
    key,
    normalized_metadata,
    partners,
    title,
    uuid,
  } = original;

  const { config: { ENTERPRISE_LEARNER_PORTAL_URL } } = useContext(AppContext);
  const isSmall = useMediaQuery({ maxWidth: breakpoints.small.maxWidth });
  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.extraSmall.maxWidth });

  const {
    BADGE,
    BUTTON_ACTION,
    PRICE,
    ENROLLMENT,
  } = CARD_TEXT;

  let priceText;

  if (learningType === CONTENT_TYPE_COURSE) {
    priceText = first_enrollable_paid_seat_price != null ? `${formatCurrency(first_enrollable_paid_seat_price)}` : 'N/A';
  } else {
    const [firstEntitlement] = entitlements || [null];
    priceText = firstEntitlement != null ? `${formatCurrency(firstEntitlement?.price)}` : 'N/A';
  }

  const imageSrc = card_image_url || defaultCardImg;
  const logoSrc = partners[0]?.logo_image_url || defaultLogoImg;

  const altText = `${title} course image`;

  const formatAvailability = availability?.length ? availability.join(', ') : null;

  const enrollmentDeadline = getEnrollmentDeadline(normalized_metadata?.enroll_by_date);

  let courseEnrollmentInfo;
  let execEdEnrollmentInfo;
  if (normalized_metadata?.enroll_by_date) {
    courseEnrollmentInfo = `${formatAvailability} • ${ENROLLMENT.text} ${enrollmentDeadline}`;
    execEdEnrollmentInfo = `Starts ${formatDate(normalized_metadata.start_date)} •
    ${ENROLLMENT.text} ${enrollmentDeadline}`;
  } else {
    courseEnrollmentInfo = formatAvailability;
    execEdEnrollmentInfo = formatAvailability;
  }

  const isExecEd = course_type === EXEC_COURSE_TYPE;

  let linkToCourse;
  if (content_type === 'program') {
    linkToCourse = `${ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/program/${uuid}`;
  } else if (content_type === 'course') {
    linkToCourse = `${ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/course/${key}`;
  } else {
    linkToCourse = `${ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/search/${uuid}`;
  }

  return (
    <Card
      isClickable
      orientation={isSmall ? 'vertical' : 'horizontal'}
    >
      <Card.ImageCap
        src={imageSrc}
        logoSrc={logoSrc}
        srcAlt={altText}
        logoAlt={partners[0]?.name}
      />
      <Card.Body>
        <Card.Header
          title={title}
          className="mb-0 mt-0"
          subtitle={partners[0]?.name}
          actions={(
            <Stack gap={1} className="text-right">
              <p className="h4 mt-2.5 mb-0">{priceText}</p>
              <span className="micro">{PRICE.subText}</span>
            </Stack>
          )}
        />
        <Card.Section>
          <Badge variant="light" className="ml-0">
            {isExecEd ? BADGE.execEd : BADGE.course}
          </Badge>
        </Card.Section>
        <Card.Footer
          orientation={isExtraSmall ? 'horizontal' : 'vertical'}
          textElement={isExecEd ? execEdEnrollmentInfo : courseEnrollmentInfo}
        >
          <Button
            as={Hyperlink}
            data-testid="hyperlink-view-course"
            destination={linkToCourse}
            target="_blank"
            variant="outline-primary"
          >
            {BUTTON_ACTION.viewCourse}
          </Button>
          <Button>{BUTTON_ACTION.assign}</Button>
        </Card.Footer>
      </Card.Body>
    </Card>
  );
};

CourseCard.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  learningType: PropTypes.string.isRequired,
  original: PropTypes.shape({
    availability: PropTypes.string,
    card_image_url: PropTypes.string,
    content_type: PropTypes.string,
    course_type: PropTypes.string,
    entitlements: PropTypes.arrayOf(PropTypes.shape()),
    first_enrollable_paid_seat_price: PropTypes.number,
    key: PropTypes.string,
    normalized_metadata: PropTypes.shape(),
    original_image_url: PropTypes.string,
    partners: PropTypes.arrayOf(
      PropTypes.shape({
        logo_image_url: PropTypes.string,
        name: PropTypes.string,
      }),
    ),
    title: PropTypes.string,
    uuid: PropTypes.string,
  }).isRequired,
};

export default injectIntl(CourseCard);
