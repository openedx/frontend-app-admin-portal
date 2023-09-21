import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'catalogSearchResults.table.courseName': {
    id: 'catalogSearchResults.table.courseName',
    defaultMessage: 'Course name',
    description: 'Table column title for course names',
  },
  'catalogSearchResults.table.partner': {
    id: 'catalogSearchResults.table.partner',
    defaultMessage: 'Partner',
    description:
      'The partner institution providing/authoring the course (ie Harvard, MIT, etc.)',
  },
  'catalogSearchResults.table.price': {
    id: 'catalogSearchResults.table.price',
    defaultMessage: 'A la carte course price',
    description:
      'Table column A La Carte price for the course - optional column',
  },
  'catalogSearchResults.table.availability': {
    id: 'catalogSearchResults.table.availability',
    defaultMessage: 'Course Availability',
    description:
      'Table column form course availability dates - optional column',
  },
  'catalogSearchResults.table.catalogs': {
    id: 'catalogSearchResults.table.catalogs',
    defaultMessage: 'Associated catalogs',
    description: 'Table column title for associated subscription catalogs',
  },
  'catalogSearchResults.table.priceNotAvailable': {
    id: 'catalogSearchResults.table.priceNotAvailable',
    defaultMessage: 'Not Available',
    description:
      'When a course price is not available, notify learners that there is no data available to display.',
  },
  'catalogSearchResults.table.programName': {
    id: 'catalogSearchResults.table.programName',
    defaultMessage: 'Program Name',
    description: 'Table column title for course names',
  },
  'catalogSearchResults.table.numCourses': {
    id: 'catalogSearchResults.table.numCourses',
    defaultMessage: 'Number of Courses',
    description: 'Table column for number of courses associated with program',
  },
  'catalogSearchResults.table.programType': {
    id: 'catalogSearchResults.table.programType',
    defaultMessage: 'Program Type',
    description: 'Table column for the type of program.',
  },
  'catalogSearchResults.aLaCarteBadge': {
    id: 'catalogSearchResults.aLaCarteBadge',
    defaultMessage: 'A la carte',
    description: 'Badge text for the `A La Carte` catalog badge.',
  },
  'catalogSearchResults.businessBadge': {
    id: 'catalogSearchResults.businessBadge',
    defaultMessage: 'Business',
    description: 'Badge text for the `Business` catalog badge.',
  },
  'catalogSearchResults.popularCourses': {
    id: 'catalogSearchResults.popularCourses',
    defaultMessage: 'Popular Courses',
    description: 'Popular Courses table header.',
  },
});

export default messages;
