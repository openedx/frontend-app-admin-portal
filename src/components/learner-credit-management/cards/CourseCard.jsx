/* eslint-disable @typescript-eslint/naming-convention */
// variables taken from algolia not in camelcase
import React from 'react';
import PropTypes from 'prop-types';

import {
  Badge,
  Button,
  Card,
  Icon,
} from '@edx/paragon';
import { injectIntl } from '@edx/frontend-platform/i18n';
import { Launch } from '@edx/paragon/icons';

import { CONTENT_TYPE_COURSE, EXEC_COURSE_TYPE } from '../../../data/constants/learnerCredit';
import { formatCurrency, formatDate } from '../utils';
import CARD_TEXT from '../constants';
import defaultCardHeader from '../../../static/default-card-header-light.png';

const CourseCard = ({
  onClick, original, learningType,
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

  const imageSrc = card_image_url || defaultCardHeader;
  const logoSrc = partners[0]?.logo_image_url || defaultCardHeader;

  const altText = `${title} course image`;

  const execEdRegistrationInfo = `Starts ${formatDate(normalized_metadata.start_date)} •
  ${REGISTRATION.text} ${formatDate(normalized_metadata.enroll_by_date)}`;

  const courseRegistrationInfo = `${availability} • ${REGISTRATION.text} ${formatDate(normalized_metadata.enroll_by_date)}`;
  const isExecEd = course_type === EXEC_COURSE_TYPE;

  // TODO: Implementations to follow
  const handleViewCourse = () => {};
  const handleAssign = () => {};

  return (
    <Card
      isClickable
      className="course-card"
      tabIndex="0"
      onClick={() => onClick(original)}
      orientation="horizontal"
    >
      <Card.ImageCap
        src={imageSrc}
        logoSrc={logoSrc}
        srcAlt={altText}
        logoAlt={partners[0]?.name}
      />
      <div className="card-container">
        <div className="section-1 mb-1">
          <p className="mb-1 lead font-weight-bold">{title}</p>
          <p>{partners[0].name}</p>
          {isExecEd ? (
            <Badge variant="light" className="mb-4 ml-0">
              {BADGE.execEd}
            </Badge>
          ) : (
            <Badge variant="light" className="mb-4 ml-0">
              {BADGE.course}
            </Badge>
          )}
          {course_type !== EXEC_COURSE_TYPE && (
            <p className="spacer" />
          )}
          <p className="small mt-5">
            {isExecEd ? execEdRegistrationInfo : courseRegistrationInfo}
          </p>
        </div>
        <Card.Section className="section-2">
          <p className="lead font-weight-bold mb-0">{priceText}</p>
          <p className="x-small mb-5.5">{PRICE.subText}</p>
          <Card.Footer orientation="horizontal" className="footer">
            <Button onClick={handleViewCourse} variant="outline-primary">{BUTTON_ACTION.viewCourse}<Icon className="ml-1" src={Launch} /></Button>
            <Button onClick={handleAssign}>{BUTTON_ACTION.assign}</Button>
          </Card.Footer>
        </Card.Section>
      </div>
    </Card>
  );
};

CourseCard.defaultProps = {
  onClick: () => {},
};

CourseCard.propTypes = {
  learningType: PropTypes.string.isRequired,
  onClick: PropTypes.func,
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
