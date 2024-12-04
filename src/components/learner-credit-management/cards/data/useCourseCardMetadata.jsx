import { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import cardFallbackImg from '@edx/brand/paragon/images/card-imagecap-fallback.png';

import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import {
  EMPTY_CONTENT_PRICE_VALUE,
  EXEC_ED_COURSE_TYPE,
  formatPrice,
  getAssignableCourseRuns,
  getEnrollmentDeadline,
  useBudgetId,
  useCatalogContainsContentItemsMultipleQueries,
  useSubsidyAccessPolicy,
} from '../../data';
import { pluralText } from '../../../../utils';
import { ENTERPRISE_RESTRICTION_TYPE } from '../../data/constants';

const messages = defineMessages({
  courseFooterMessage: {
    id: 'lcm.budget.detail.page.catalog.tab.course.card.footer-text',
    defaultMessage: '({numCourseRuns}) available {pluralText}',
    description: 'Footer text for a course card result for learner credit management',
  },
});

const getContentPriceDisplay = ({ courseRuns }) => {
  const flatContentPrice = courseRuns.flatMap(run => run.contentPrice || EMPTY_CONTENT_PRICE_VALUE);
  // Find the max and min prices
  if (!flatContentPrice.length) {
    return formatPrice(EMPTY_CONTENT_PRICE_VALUE);
  }
  const maxPrice = Math.max(...flatContentPrice);
  const minPrice = Math.min(...flatContentPrice);
  // Heuristic for displaying the price as a range or a singular price based on runs
  if (maxPrice !== minPrice) {
    return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
  }
  return formatPrice(flatContentPrice[0]);
};

const useCourseCardMetadata = ({
  course,
  enterpriseSlug,
}) => {
  const intl = useIntl();
  const { config: { ENTERPRISE_LEARNER_PORTAL_URL } } = useContext(AppContext);
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const {
    cardImageUrl,
    courseType,
    key,
    normalizedMetadata,
    partners,
    title,
    courseRuns,
  } = course;
  const {
    dataByContentKey: catalogContainsRestrictedRunsData,
    isLoading: isLoadingCatalogContainsRestrictedRuns,
  } = useCatalogContainsContentItemsMultipleQueries(
    subsidyAccessPolicy.catalogUuid,
    courseRuns?.filter(
      // Pass only restricted runs.
      run => run.restrictionType === ENTERPRISE_RESTRICTION_TYPE,
    ).map(
      run => run.key,
    ),
  );

  const assignableCourseRuns = getAssignableCourseRuns({
    courseRuns,
    subsidyExpirationDatetime: subsidyAccessPolicy.subsidyExpirationDatetime,
    isLateRedemptionAllowed: subsidyAccessPolicy.isLateRedemptionAllowed,
    catalogContainsRestrictedRunsData,
  });

  // Extracts the content price from assignable course runs
  const formattedPrice = getContentPriceDisplay({ courseRuns: assignableCourseRuns });
  const imageSrc = cardImageUrl || cardFallbackImg;

  let logoSrc;
  let logoAlt;
  if (partners.length === 1) {
    logoSrc = partners[0]?.logoImageUrl;
    logoAlt = `${partners[0]?.name}'s logo`;
  }

  const altText = `${title} course image`;
  const enrollmentDeadline = getEnrollmentDeadline(normalizedMetadata.enrollByDate);

  const isExecEdCourseType = courseType === EXEC_ED_COURSE_TYPE;

  let linkToCourse = `${ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/course/${key}`;
  if (isExecEdCourseType) {
    linkToCourse = `${ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/executive-education-2u/course/${key}`;
  }

  const footerText = intl.formatMessage(messages.courseFooterMessage, {
    numCourseRuns: assignableCourseRuns.length,
    pluralText: pluralText('date', assignableCourseRuns.length),
  });

  return {
    ...course,
    subtitle: partners.map(partner => partner.name).join(', '),
    formattedPrice,
    imageSrc,
    altText,
    logoSrc,
    logoAlt,
    enrollmentDeadline,
    linkToCourse,
    isExecEdCourseType,
    footerText,
    isLoadingCatalogContainsRestrictedRuns,
  };
};

export default useCourseCardMetadata;
