import { CONTENT_TYPE_COURSE, CONTENT_TYPE_PROGRAM } from '../../data/constants/learnerCredit';

const extractUuid = (aggregationKey) => aggregationKey.split(':')[1];

/**
 * Converts and algolia course object, into a course representation usable in this UI
 */
function mapAlgoliaObjectToCourse(algoliaCourseObject, intl, messages) {
  const {
    title: courseTitle,
    partners,
    first_enrollable_paid_seat_price: coursePrice, // todo
    enterprise_catalog_query_titles: courseAssociatedCatalogs,
    full_description: courseDescription,
    original_image_url: bannerImageUrl,
    marketing_url: marketingUrl,
    advertised_course_run: courseRun,
    upcoming_course_runs: upcomingRuns,
    skill_names: skillNames,
  } = algoliaCourseObject;
  const { start: startDate, end: endDate } = courseRun;
  const priceText = coursePrice != null
    ? `$${coursePrice.toString()}`
    : intl.formatMessage(
      messages['catalogSearchResult.table.priceNotAvailable'],
    );
  return {
    contentType: CONTENT_TYPE_COURSE,
    courseTitle,
    courseProvider: partners[0].name,
    coursePrice: priceText,
    courseAssociatedCatalogs,
    courseDescription,
    partnerLogoImageUrl: partners[0].logo_image_url,
    bannerImageUrl,
    marketingUrl,
    startDate,
    endDate,
    upcomingRuns,
    skillNames,
  };
}

/**
 * Converts an algolia exec ed course object, into a course representation usable in this UI
 */
function mapAlgoliaObjectToExecEd(algoliaCourseObject, intl, messages) {
  const {
    title: courseTitle,
    partners,
    entitlements: coursePrice, // todo
    enterprise_catalog_query_titles: courseAssociatedCatalogs,
    full_description: courseDescription,
    original_image_url: bannerImageUrl,
    marketing_url: marketingUrl,
    upcoming_course_runs: upcomingRuns,
    skill_names: skillNames,
    additional_metadata: additionalMetadata,
  } = algoliaCourseObject;
  const { start_date: startDate, end_date: endDate } = additionalMetadata;
  const priceText = coursePrice != null
    ? `$${coursePrice[0].price.toString()}`
    : intl.formatMessage(
      messages['catalogSearchResult.table.priceNotAvailable'],
    );
  return {
    contentType: CONTENT_TYPE_COURSE,
    courseTitle,
    courseProvider: partners[0].name,
    coursePrice: priceText,
    courseAssociatedCatalogs,
    courseDescription,
    partnerLogoImageUrl: partners[0].logo_image_url,
    bannerImageUrl,
    marketingUrl,
    startDate,
    endDate,
    upcomingRuns,
    skillNames,
  };
}

/**
 * Converts an algolia course object, into a course representation usable in this UI
 */
function mapAlgoliaObjectToProgram(algoliaProgramObject) {
  const {
    title,
    partners,
    full_description: programDescription,
    aggregation_key: aggregationKey,
    card_image_url: cardImageUrl,
    banner_image_url: bannerImageUrl,
    enterprise_catalog_query_titles: programAssociatedCatalogs,
    marketing_url: marketingUrl,
    prices: programPrices,
    learning_items: learningItems,
    course_details: courseDetails,
  } = algoliaProgramObject;
  return {
    contentType: CONTENT_TYPE_PROGRAM,
    programUuid: extractUuid(aggregationKey),
    programTitle: title,
    programProvider: partners[0].name,
    programDescription,
    programAssociatedCatalogs,
    partnerLogoImageUrl: partners[0].logo_image_url,
    cardImageUrl,
    marketingUrl,
    programPrices,
    learningItems,
    bannerImageUrl,
    programCourses: courseDetails,
  };
}

export {
  mapAlgoliaObjectToProgram, mapAlgoliaObjectToExecEd, mapAlgoliaObjectToCourse, extractUuid,
};
