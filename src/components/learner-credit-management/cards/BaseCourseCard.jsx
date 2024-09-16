import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Badge, breakpoints, Card, Stack, useMediaQuery,
} from '@openedx/paragon';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { useCourseCardMetadata } from './data';
import AssignmentModalImportantDates from '../assignment-modal/AssignmentModalmportantDates';
import { formatPrice } from '../data';

const BaseCourseCard = ({
  original,
  footerActions: CardFooterActions,
  enterpriseSlug,
  cardClassName,
  courseRun,
}) => {
  const isSmall = useMediaQuery({ maxWidth: breakpoints.small.maxWidth });
  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.extraSmall.maxWidth });
  const courseCardMetadata = useCourseCardMetadata({
    course: camelCaseObject(original),
    courseRun,
    enterpriseSlug,
  });
  const {
    imageSrc,
    altText,
    logoSrc,
    logoAlt,
    title,
    subtitle,
    formattedPrice,
    isExecEdCourseType,
    footerText,
  } = courseCardMetadata;
  return (
    <Card orientation={isSmall ? 'vertical' : 'horizontal'} className={cardClassName}>
      <Card.ImageCap
        src={imageSrc}
        srcAlt={altText}
        logoSrc={logoSrc}
        logoAlt={logoAlt}
      />
      <Card.Body>
        <Card.Header
          title={title}
          subtitle={subtitle}
          actions={(
            <Stack gap={1} className="text-right">
              <div className="h4 mt-2.5 mb-0">{courseRun ? formatPrice(courseRun.contentPrice) : formattedPrice}</div>
              <span className="micro">
                <FormattedMessage
                  id="lcm.budget.detail.page.catalog.tab.course.card.price.per.learner"
                  defaultMessage="Per learner price"
                  description="Price per learner text for course card"
                />
              </span>
            </Stack>
          )}
        />
        <Card.Section>
          <Stack gap={4.5}>
            <div>
              <Badge variant="light">
                {isExecEdCourseType
                  ? (
                    <FormattedMessage
                      id="lcm.budget.detail.page.catalog.tab.course.card.executive.education"
                      defaultMessage="Executive Education"
                      description="Badge text for Executive Education course"
                    />
                  )
                  : (
                    <FormattedMessage
                      id="lcm.budget.detail.page.catalog.tab.course.card.course"
                      defaultMessage="Course"
                      description="Badge text for Course"
                    />
                  )}
              </Badge>
            </div>
            {courseRun && <AssignmentModalImportantDates courseRun={courseRun} />}
          </Stack>
        </Card.Section>
        {CardFooterActions && (
        <Card.Footer
          orientation={isExtraSmall ? 'horizontal' : 'vertical'}
          textElement={footerText}
        >
          <CardFooterActions course={courseCardMetadata} />
        </Card.Footer>
        )}
      </Card.Body>
    </Card>
  );
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

BaseCourseCard.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  original: PropTypes.shape({
    availability: PropTypes.arrayOf(PropTypes.string),
    cardImageUrl: PropTypes.string,
    courseType: PropTypes.string,
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
  courseRun: PropTypes.shape({
    enrollBy: PropTypes.string,
    contentPrice: PropTypes.number,
    start: PropTypes.string,
  }),
  footerActions: PropTypes.elementType,
  cardClassName: PropTypes.string,
};

BaseCourseCard.defaultProps = {
  courseRun: null,
};

export default connect(mapStateToProps)(BaseCourseCard);
