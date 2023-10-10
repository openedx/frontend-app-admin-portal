/* eslint-disable @typescript-eslint/naming-convention */
// variables taken from algolia not in camelcase
import React from 'react';
import PropTypes from 'prop-types';

import {
  Badge, Button, Card, Icon,
} from '@edx/paragon';
import { Launch } from '@edx/paragon/icons';
import { EXEC_COURSE_TYPE } from '../../../data/constants/learnerCredit';
import defaultCardHeader from '../../../static/default-card-header-light.png';
import { formatDate } from '../utils';

const CourseCard = ({
  onClick, original,
}) => {
  const {
    title,
    card_image_url,
    course_type,
    normalized_metadata,
    partners,
  } = original;

  let priceText;

  const imageSrc = card_image_url || defaultCardHeader;
  const altText = `${title} course image`;

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
        logoSrc={partners[0]?.logo_image_url}
        srcAlt={altText}
        logoAlt={partners[0]?.name}
      />
      <div className="card-container">
        <div className="section-1">
          <p className="mb-1 lead font-weight-bold">{title}</p>
          <p>{partners[0]?.name}</p>
          {course_type === EXEC_COURSE_TYPE && (
            <Badge variant="light" className="mb-4">
              Executive Education
            </Badge>
          )}
          {course_type !== EXEC_COURSE_TYPE && (
            <p className="spacer" />
          )}
          <p className={`small ${course_type !== EXEC_COURSE_TYPE ? 'mt-5 mb-0' : ''}`}>
            Starts {formatDate(normalized_metadata?.start_date)} •
            Learner must register by {formatDate(normalized_metadata?.enroll_by_date)}
          </p>
        </div>
        <Card.Section className="section-2">
          <p className="lead font-weight-bold mb-0">{priceText}</p>
          <p className="x-small mb-5.5">Per learner price</p>
          <Card.Footer orientation="horizontal" className="footer">
            <Button variant="outline-primary">View course<Icon className="ml-1" src={Launch} /></Button>
            <Button>Assign</Button>
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
  onClick: PropTypes.func,
  original: PropTypes.shape({
    title: PropTypes.string,
    card_image_url: PropTypes.string,
    partners: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        logo_image_url: PropTypes.string,
      }),
    ),
    normalized_metadata: PropTypes.shape(),
    course_type: PropTypes.string,
  }).isRequired,
};

export default CourseCard;
