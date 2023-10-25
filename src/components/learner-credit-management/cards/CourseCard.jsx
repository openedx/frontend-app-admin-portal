/* eslint-disable @typescript-eslint/naming-convention */
// variables taken from algolia not in camelcase
import React from 'react';
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
import { camelCaseObject } from '@edx/frontend-platform';

import { CONTENT_TYPE_COURSE, EXEC_COURSE_TYPE } from '../data';
import { formatPrice, formatDate, getEnrollmentDeadline } from '../data/utils';
import CARD_TEXT from '../constants';
import defaultLogoImg from '../../../static/default-card-header-dark.png';
import defaultCardImg from '../../../static/default-card-header-light.png';

const CourseCard = ({
  original, learningType,
}) => {
  const {
    availability,
    cardImageUrl,
    courseType,
    entitlements,
    firstEnrollablePaidSeatPrice,
    normalizedMetadata,
    partners,
    title,
  } = camelCaseObject(original);

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
    priceText = firstEnrollablePaidSeatPrice != null ? `${formatPrice(firstEnrollablePaidSeatPrice, {minimumFractionDigits: 0})}` : 'N/A';
  } else {
    const [firstEntitlement] = entitlements || [null];
    priceText = firstEntitlement != null ? `${formatPrice(firstEntitlement?.price,{ minimumFractionDigits: 0})}` : 'N/A';
  }

  const imageSrc = cardImageUrl || defaultCardImg;
  const logoSrc = partners[0]?.logoImageUrl || defaultLogoImg;

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
            // TODO: Implementation to follow in ENT-7594
            as={Hyperlink}
            destination="https://enterprise.stage.edx.org"
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
  learningType: PropTypes.string,
  original: PropTypes.shape({
    availability: PropTypes.arrayOf(PropTypes.string),
    cardImageUrl: PropTypes.string,
    courseType: PropTypes.string,
    entitlements: PropTypes.arrayOf(PropTypes.shape()),
    firstEnrollablePaidSeatPrice: PropTypes.number,
    normalizedMetadata: PropTypes.shape(),
    originalImageUrl: PropTypes.string,
    partners: PropTypes.arrayOf(
      PropTypes.shape({
        logoImageUrl: PropTypes.string,
        name: PropTypes.string,
      }),
    ),
    title: PropTypes.string,
  }).isRequired,
};

export default injectIntl(CourseCard);
