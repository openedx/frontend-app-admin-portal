import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  useMediaQuery,
  breakpoints,
  Card,
  Stack,
  Badge,
} from '@openedx/paragon';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { useCourseCardMetadata } from './data';

const BaseCourseCard = ({
  original,
  footerActions: CardFooterActions,
  enterpriseSlug,
  cardClassName,
}) => {
  const isSmall = useMediaQuery({ maxWidth: breakpoints.small.maxWidth });
  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.extraSmall.maxWidth });
  const courseCardMetadata = useCourseCardMetadata({
    course: camelCaseObject(original),
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
    courseEnrollmentInfo,
    execEdEnrollmentInfo,
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
              <div className="h4 mt-2.5 mb-0">{formattedPrice}</div>
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
        </Card.Section>
        <Card.Footer
          orientation={isExtraSmall ? 'horizontal' : 'vertical'}
          textElement={isExecEdCourseType ? execEdEnrollmentInfo : courseEnrollmentInfo}
        >
          {CardFooterActions && <CardFooterActions course={courseCardMetadata} />}
        </Card.Footer>
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
  footerActions: PropTypes.elementType,
  cardClassName: PropTypes.string,
};

export default connect(mapStateToProps)(BaseCourseCard);
