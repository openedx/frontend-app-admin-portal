import moment from 'moment';
import camelCase from 'lodash/camelCase';
import snakeCase from 'lodash/snakeCase';
import isArray from 'lodash/isArray';
import mergeWith from 'lodash/mergeWith';
import isEmail from 'validator/lib/isEmail';
import isEmpty from 'validator/lib/isEmpty';
import isNumeric from 'validator/lib/isNumeric';

import { history } from '@edx/frontend-platform/initialize';
import { features } from './config';

import {
  BLACKBOARD_TYPE, CANVAS_TYPE, CORNERSTONE_TYPE, DEGREED_TYPE, DEGREED2_TYPE, MOODLE_TYPE, SAP_TYPE,
} from './components/settings/data/constants';
import BlackboardIcon from './icons/Blackboard.svg';
import CanvasIcon from './icons/Canvas.svg';
import CornerstoneIcon from './icons/CSOD.png';
import DegreedIcon from './icons/Degreed.png';
import MoodleIcon from './icons/Moodle.png';
import SAPIcon from './icons/SAP.svg';

import LmsApiService from './data/services/LmsApiService';

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
  const newQueryParams = new URLSearchParams(window.location.search);
  // Apply any updates passed in over the current query. This requires consumers to explicitly
  // pass in parameters they want to remove, such as resetting the page when sorting, but ensures
  // that we bring forward all other params such as feature flags
  Object.entries(queryOptions).forEach(([key, value]) => {
    if (key === 'page' && value === 1) {
      // Because we show page 1 by default, theres no reason to set the url to page=1
      newQueryParams.delete('page');
      return;
    }
    if (!value) {
      newQueryParams.delete(key);
      return;
    }
    newQueryParams.set(key, value);
  });

  const newQueryString = `?${newQueryParams.toString()}`;
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
  };
  const query = new URLSearchParams(window.location.search);
  const pageOptions = {
    page_size: parseInt(query.get('page_size'), 10) || defaults.pageSize,
    page: parseInt(query.get('page'), 10) || defaults.page,
  };
  if (query.has('ordering')) {
    pageOptions.ordering = query.get('ordering');
  }
  if (query.has('search')) {
    pageOptions.search = query.get('search');
  }
  if (query.has('search_course')) {
    pageOptions.search_course = query.get('search_course');
  }
  if (query.has('search_start_date')) {
    pageOptions.search_start_date = query.get('search_start_date');
  }
  return pageOptions;
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

const camelCaseDict = (data) => {
  const transformedData = {};
  [...Object.entries(data)]
    .forEach(entry => {
      [, transformedData[camelCase(entry[0])]] = entry;
    });
  return transformedData;
};

const camelCaseDictArray = (data) => {
  const transformedData = [];
  data.forEach(config => {
    transformedData.push(camelCaseDict(config));
  });
  return transformedData;
};

const snakeCaseDict = (data) => {
  const transformedData = {};
  [...Object.entries(data)]
    .forEach(entry => {
      [, transformedData[snakeCase(entry[0])]] = entry;
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

function urlValidation(urlString) {
  let url;
  try {
    url = new URL(urlString);
  } catch (_) {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
}

const normalizeFileUpload = (value) => value && value.split(/\r\n|\n/);

const channelMapping = {
  [BLACKBOARD_TYPE]: {
    displayName: 'Blackboard',
    icon: BlackboardIcon,
    update: LmsApiService.updateBlackboardConfig,
    delete: LmsApiService.deleteBlackboardConfig,
  },
  [CANVAS_TYPE]: {
    displayName: 'Canvas',
    icon: CanvasIcon,
    update: LmsApiService.updateCanvasConfig,
    delete: LmsApiService.deleteCanvasConfig,
  },
  [CORNERSTONE_TYPE]: {
    displayName: 'Cornerstone',
    icon: CornerstoneIcon,
    update: LmsApiService.updateCornerstoneConfig,
    delete: LmsApiService.deleteCornerstoneConfig,
  },
  [MOODLE_TYPE]: {
    displayName: 'Moodle',
    icon: MoodleIcon,
    update: LmsApiService.updateMoodleConfig,
    delete: LmsApiService.deleteMoodleConfig,
  },
  [SAP_TYPE]: {
    displayName: 'SAP',
    icon: SAPIcon,
    update: LmsApiService.updateSuccessFactorsConfig,
    delete: LmsApiService.deleteSuccessFactorsConfig,
  },
  [DEGREED2_TYPE]: {
    displayName: 'Degreed',
    icon: DegreedIcon,
    update: LmsApiService.updateDegreed2Config,
    delete: LmsApiService.deleteDegreed2Config,
  },
  [DEGREED_TYPE]: {
    displayName: 'Degreed',
    icon: DegreedIcon,
    update: LmsApiService.updateDegreedConfig,
    delete: LmsApiService.deleteDegreedConfig,
  },
};

const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1);

export {
  camelCaseDict,
  camelCaseDictArray,
  channelMapping,
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
  urlValidation,
  normalizeFileUpload,
  capitalizeFirstLetter,
};
