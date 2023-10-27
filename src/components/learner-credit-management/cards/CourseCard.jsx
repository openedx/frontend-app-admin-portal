/* eslint-disable @typescript-eslint/naming-convention */
// variables taken from algolia not in camelcase
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';

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
import { camelCaseObject } from '@edx/frontend-platform';
import cardFallbackImg from '@edx/brand/paragon/images/card-imagecap-fallback.png';

import { EXEC_COURSE_TYPE } from '../data';
import { formatPrice, formatDate, getEnrollmentDeadline } from '../data/utils';
import CARD_TEXT from '../constants';

const CourseCard = ({
  original, enterpriseSlug,
}) => {
  const {
    availability,
    cardImageUrl,
    courseType,
    key,
    normalizedMetadata,
    partners,
    title,
  } = camelCaseObject(original);

  const { config: { ENTERPRISE_LEARNER_PORTAL_URL } } = useContext(AppContext);
  const isSmall = useMediaQuery({ maxWidth: breakpoints.small.maxWidth });
  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.extraSmall.maxWidth });

  const {
    BADGE,
    BUTTON_ACTION,
    PRICE,
    ENROLLMENT,
  } = CARD_TEXT;

  const price = normalizedMetadata?.contentPrice ? formatPrice(normalizedMetadata.contentPrice, { minimumFractionDigits: 0 }) : 'N/A';

  const imageSrc = cardImageUrl || cardFallbackImg;
  const logoSrc = partners[0]?.logoImageUrl;

  const altText = `${title} course image`;

  const formattedAvailability = availability?.length ? availability.join(', ') : null;

  const enrollmentDeadline = getEnrollmentDeadline(normalizedMetadata?.enrollByDate);

  let courseEnrollmentInfo;
  let execEdEnrollmentInfo;
  if (normalizedMetadata?.enrollByDate) {
    courseEnrollmentInfo = `${formattedAvailability} • ${ENROLLMENT.text} ${enrollmentDeadline}`;
    execEdEnrollmentInfo = `Starts ${formatDate(normalizedMetadata.startDate)} •
    ${ENROLLMENT.text} ${enrollmentDeadline}`;
  } else {
    courseEnrollmentInfo = formattedAvailability;
    execEdEnrollmentInfo = formattedAvailability;
  }

  const isExecEd = courseType === EXEC_COURSE_TYPE;

  const linkToCourse = `${ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/course/${key}`;

  return (
    <Card
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
              <p className="h4 mt-2.5 mb-0">{price}</p>
              <span className="micro">{PRICE.subText}</span>
            </Stack>
          )}
        />
        <Card.Section>
          <Badge variant="light">
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
  original: PropTypes.shape({
    availability: PropTypes.arrayOf(PropTypes.string),
    cardImageUrl: PropTypes.string,
    courseType: PropTypes.string,
    key: PropTypes.string,
    normalizedMetadata: PropTypes.shape(),
    originalImageUrl: PropTypes.string,
    partners: PropTypes.arrayOf(
      PropTypes.shape({
        logoImageUrl: PropTypes.string,
        name: PropTypes.string,
      }),
    ),
    title: PropTypes.string,
    uuid: PropTypes.string,
  }).isRequired,
};

export default injectIntl(CourseCard);
