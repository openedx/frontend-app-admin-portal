import moment from 'moment';
import qs from 'query-string';
import snakeCase from 'lodash/snakeCase';
import isArray from 'lodash/isArray';
import mergeWith from 'lodash/mergeWith';
import isEmail from 'validator/lib/isEmail';
import isEmpty from 'validator/lib/isEmpty';
import isNumeric from 'validator/lib/isNumeric';

import { history } from '@edx/frontend-platform/initialize';
import { features } from './config';

import {
  BLACKBOARD_TYPE, CANVAS_TYPE, CORNERSTONE_TYPE, DEGREED_TYPE, MOODLE_TYPE,
} from './components/settings/data/constants';
import BlackboardIcon from './icons/Blackboard.svg';
import CanvasIcon from './icons/Canvas.svg';
import CornerstoneIcon from './icons/CSOD.png';
import DegreedIcon from './icons/Degreed.png';
import MoodleIcon from './icons/Moodle.png';
import SAPIcon from './icons/SAP.svg';

export function getLMSIcon(LMStype) {
  switch (LMStype) {
    case BLACKBOARD_TYPE:
      return BlackboardIcon;
    case CANVAS_TYPE:
      return CanvasIcon;
    case CORNERSTONE_TYPE:
      return CornerstoneIcon;
    case DEGREED_TYPE:
      return DegreedIcon;
    case MOODLE_TYPE:
      return MoodleIcon;
    default:
      return SAPIcon;
  }
}

const formatTimestamp = ({ timestamp, format = 'MMMM D, YYYY' }) => {
  if (timestamp) {
    return moment(timestamp).format(format);
  }
  return null;
};

const formatPassedTimestamp = (timestamp) => {
  if (timestamp) {
    return formatTimestamp({ timestamp });
  }
  return 'Has not passed';
};

const formatPercentage = ({ decimal, numDecimals = 1 }) => (
  decimal ? `${parseFloat((decimal * 100).toFixed(numDecimals))}%` : '0%'
);

const updateUrl = (queryOptions) => {
  if (!queryOptions) {
    return;
  }
  const currentQuery = qs.parse(window.location.search);

  // Apply any updates passed in over the current query. This requires consumers to explicitly
  // pass in parameters they want to remove, such as resetting the page when sorting, but ensures
  // that we bring forward all other params such as feature flags
  const newQuery = {
    ...currentQuery,
    ...queryOptions,
  };

  // Because we show page 1 by default, theres no reason to set the url to page=1
  if (newQuery.page === 1) {
    newQuery.page = undefined;
  }

  const newQueryString = `?${qs.stringify(newQuery)}`;
  if (newQueryString !== window.location.search) {
    history.push(newQueryString);
  }
};

// Returns an object containing pagination options (page_size, page, ordering) based on the current
// window location's query string, or, if not set in the window location uses defaults values.
const getPageOptionsFromUrl = () => {
  // TODO: this will not support multiple tables paging on a single page. Will need to prefix url
  // params with table id (or some other mechanism) if this becomes a feature requirement
  const defaults = {
    pageSize: 50,
    page: 1,
    ordering: undefined,
    search: undefined,
    search_course: undefined,
    search_start_date: undefined,
  };
  const query = qs.parse(window.location.search);
  return {
    page_size: parseInt(query.page_size, 10) || defaults.pageSize,
    page: parseInt(query.page, 10) || defaults.page,
    ordering: query.ordering || defaults.ordering,
    search: query.search || defaults.search,
    search_course: query.search_course || defaults.search_course,
    search_start_date: query.search_start_date || defaults.search_start_date,
  };
};

const removeTrailingSlash = path => path.replace(/\/$/, '');

const isTriggerKey = ({ triggerKeys, action, key }) => (
  triggerKeys[action].indexOf(key) > -1
);

// Validation functions
const isRequired = (value = '') => (isEmpty(value) ? 'This field is required.' : undefined);
const isValidEmail = (value = '') => (!isEmail(value) ? 'Must be a valid email address.' : undefined);
const isValidNumber = (value = '') => (!isEmpty(value) && !isNumeric(value, { no_symbols: true }) ? 'Must be a valid number.' : undefined);
const maxLength = max => value => (value && value.length > max ? 'Must be 512 characters or less' : undefined);
const maxLength512 = maxLength(512);

/** camelCase <--> snake_case functions
 * Because responses from django come as snake_cased JSON, its best
 * to transform them into camelCase for use within components. Try
 * to avoid passing snake_cased objects or arrays as props, and transform
 * them ahead of time.
 */
const modifyObjectKeys = (object, modify) => {
  // If the passed in object is not an object, return it.
  if (
    object === undefined
    || object === null
    || (typeof object !== 'object' && !Array.isArray(object))
  ) {
    return object;
  }

  if (Array.isArray(object)) {
    return object.map(value => modifyObjectKeys(value, modify));
  }

  // Otherwise, process all its keys.
  const result = {};
  Object.entries(object).forEach(([key, value]) => {
    result[modify(key)] = modifyObjectKeys(value, modify);
  });
  return result;
};

const snakeCaseDict = (data) => {
  const transformedData = {};
  [...data.entries()]
    .forEach(entry => {
      transformedData[snakeCase(entry[0])] = snakeCase(entry[1]);
    });
  return transformedData;
};

const snakeCaseFormData = (formData) => {
  const transformedData = new FormData();
  [...formData.entries()]
    .forEach(entry => (
      transformedData.append(snakeCase(entry[0]), entry[1])
    ));
  return transformedData;
};

const transformTemplate = (emailType, template) => ({
  [emailType]: {
    'email-template-subject': template.email_subject,
    'email-template-greeting': template.email_greeting,
    'email-template-body': template.email_body,
    'email-template-closing': template.email_closing,
    ...(features.FILE_ATTACHMENT && { 'email-template-files': template.email_files }),
    'template-name-select': template.name,
    'email-address': template.email_address,
    'template-id': template.id,
  },
});

const updateTemplateEmailAddress = (state, emailAddress) => {
  state.default.assign['email-address'] = emailAddress; // eslint-disable-line no-param-reassign
  state.assign['email-address'] = emailAddress; // eslint-disable-line no-param-reassign
};

const updateAllTemplates = (template, state) => {
  const { allTemplates } = state;
  const templateId = template.id;
  const index = allTemplates.findIndex(item => item.id === templateId);
  if (index >= 0) {
    allTemplates[index] = template;
  } else {
    allTemplates.push(template);
  }
  return allTemplates;
};

const mergeErrors = (object, other) => {
  const customizer = (objValue, srcValue) => {
    if (isArray(objValue)) {
      return objValue.concat(srcValue);
    }

    return undefined;
  };

  return mergeWith(object, other, customizer);
};

const getSubscriptionContactText = (contactEmail) => {
  let contactText = 'To learn more about your unlimited subscription and edX, contact your edX administrator';
  if (contactEmail) {
    contactText = `${contactText} at ${contactEmail}`;
  }
  return `${contactText}.`;
};

function truncateString(str, maxStrLength = 10) {
  if (str.length <= maxStrLength) {
    return str;
  }
  return `${str.slice(0, maxStrLength)}...`;
}

const normalizeFileUpload = (value) => value && value.split(/\r\n|\n/);

export {
  formatPercentage,
  formatPassedTimestamp,
  formatTimestamp,
  removeTrailingSlash,
  updateUrl,
  getPageOptionsFromUrl,
  isTriggerKey,
  isRequired,
  isValidEmail,
  isValidNumber,
  modifyObjectKeys,
  snakeCaseDict,
  snakeCaseFormData,
  maxLength512,
  transformTemplate,
  updateTemplateEmailAddress,
  updateAllTemplates,
  mergeErrors,
  getSubscriptionContactText,
  truncateString,
  normalizeFileUpload,
};
