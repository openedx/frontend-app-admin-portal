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

import { CONTENT_TYPE_COURSE, EXEC_COURSE_TYPE } from '../data';
import { formatCurrency, formatDate, getRegistrationDeadline } from '../data/utils';
import CARD_TEXT from '../constants';
import defaultLogoImg from '../../../static/default-card-header-dark.png';
import defaultCardImg from '../../../static/default-card-header-light.png';

const CourseCard = ({
  original, learningType,
}) => {
  const {
    availability,
    card_image_url,
    course_type,
    entitlements,
    first_enrollable_paid_seat_price,
    normalized_metadata,
    partners,
    title,
  } = original;

  const isSmall = useMediaQuery({ maxWidth: breakpoints.small.maxWidth });
  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.extraSmall.maxWidth });

  const {
    BADGE,
    BUTTON_ACTION,
    PRICE,
    REGISTRATION,
  } = CARD_TEXT;

  let rowPrice;
  let priceText;

  if (learningType === CONTENT_TYPE_COURSE) {
    rowPrice = first_enrollable_paid_seat_price;
    priceText = rowPrice != null ? `${formatCurrency(rowPrice)}` : 'N/A';
  } else {
    [rowPrice] = entitlements || [null];
    priceText = rowPrice != null ? `${formatCurrency(rowPrice?.price)}` : 'N/A';
  }

  const imageSrc = card_image_url || defaultCardImg;
  const logoSrc = partners[0]?.logo_image_url || defaultLogoImg;

  const altText = `${title} course image`;

  const formatAvailability = availability?.length ? availability.join(', ') : null;

  const registrationDeadline = getRegistrationDeadline(normalized_metadata?.enroll_by_date);

  let courseRegistrationInfo;
  if (normalized_metadata?.enroll_by_date) {
    courseRegistrationInfo = `${formatAvailability} • ${REGISTRATION.text} ${registrationDeadline}`;
  } else {
    courseRegistrationInfo = formatAvailability;
  }

  let execEdRegistrationInfo;
  if (normalized_metadata?.enroll_by_date) {
    execEdRegistrationInfo = `Starts ${formatDate(normalized_metadata.start_date)} •
    ${REGISTRATION.text} ${registrationDeadline}`;
  } else {
    execEdRegistrationInfo = formatAvailability;
  }

  const isExecEd = course_type === EXEC_COURSE_TYPE;

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
          textElement={isExecEd ? execEdRegistrationInfo : courseRegistrationInfo}
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
  learningType: PropTypes.string.isRequired,
  original: PropTypes.shape({
    availability: PropTypes.string,
    card_image_url: PropTypes.string,
    course_type: PropTypes.string,
    entitlements: PropTypes.arrayOf(PropTypes.shape()),
    first_enrollable_paid_seat_price: PropTypes.number,
    normalized_metadata: PropTypes.shape(),
    original_image_url: PropTypes.string,
    partners: PropTypes.arrayOf(
      PropTypes.shape({
        logo_image_url: PropTypes.string,
        name: PropTypes.string,
      }),
    ),
    title: PropTypes.string,
  }).isRequired,
};

export default injectIntl(CourseCard);
