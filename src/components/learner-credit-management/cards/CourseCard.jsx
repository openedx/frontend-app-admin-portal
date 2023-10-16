/* eslint-disable @typescript-eslint/naming-convention */
// variables taken from algolia not in camelcase
import React from 'react';
import PropTypes from 'prop-types';

import { camelCaseObject } from '@edx/frontend-platform';
import cardFallbackImg from '@edx/brand/paragon/images/card-imagecap-fallback.png';
import {
  Badge, Button, Card, Hyperlink,
} from '@edx/paragon';
import { EXEC_COURSE_TYPE } from '../data/constants';
import { formatDate } from '../data/utils';

const CourseCard = ({
  onClick, original,
}) => {
  const {
    title,
    cardImageUrl,
    courseType,
    normalizedMetadata,
    partners,
  } = camelCaseObject(original);

  let priceText;
  const altText = `${title} course image`;

  return (
    <Card
      className="course-card"
      onClick={() => onClick(original)}
      orientation="horizontal"
      tabIndex="0"
    >
      <Card.ImageCap
        src={cardImageUrl || cardFallbackImg}
        fallbackSrc={cardFallbackImg}
        logoSrc={partners[0]?.logo_image_url}
        srcAlt={altText}
        logoAlt={partners[0]?.name}
      />
      <div className="card-container">
        <div className="section-1">
          <p className="mb-1 lead font-weight-bold">{title}</p>
          <p>{partners[0]?.name}</p>
          {courseType === EXEC_COURSE_TYPE && (
            <Badge variant="light" className="mb-4">
              Executive Education
            </Badge>
          )}
          {courseType !== EXEC_COURSE_TYPE && (
            <p className="spacer" />
          )}
          <p className={`small ${courseType !== EXEC_COURSE_TYPE ? 'mt-5 mb-0' : ''}`}>
            Starts {formatDate(normalizedMetadata?.start_date)} •
            Learner must register by {formatDate(normalizedMetadata?.enroll_by_date)}
          </p>
        </div>
        <Card.Section className="section-2">
          <p className="lead font-weight-bold mb-0">{priceText}</p>
          <p className="micro mb-5.5">Per learner price</p>
          <Card.Footer orientation="horizontal" className="footer">
            <Button as={Hyperlink} destination="https://edx.org" target="_blank">View course</Button>

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
    cardImageUrl: PropTypes.string,
    partners: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        logo_image_url: PropTypes.string,
      }),
    ),
    normalizedMetadata: PropTypes.shape({
      startDate: PropTypes.string,
      endDate: PropTypes.string,
      enrollByDate: PropTypes.string,
    }),
    courseType: PropTypes.string,
  }).isRequired,
};

export default CourseCard;
