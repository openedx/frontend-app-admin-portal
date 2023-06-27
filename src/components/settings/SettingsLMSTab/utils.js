import isEmpty from 'lodash/isEmpty';

export default function buttonBool(config) {
  let returnVal = true;
  Object.entries(config).forEach(entry => {
    const [key, value] = entry;
    // check whether or not the field is an optional value
    if ((key !== 'displayName' && key !== 'degreedTokenFetchBaseUrl') && !value) {
      returnVal = false;
    }
  });
  return returnVal;
}

export const isExistingConfig = (configs, value, existingInput) => {
  for (let i = 0; i < configs.length; i++) {
    if (configs[i] === value && existingInput === value) {
      return true;
    }
  }
  return false;
};

export const getStatus = (config) => {
  // config.isValid has two arrays of missing and incorrect config fields
  // which are required to resolve in order to complete the configuration
  if (!isEmpty([...config.isValid[0].missing, ...config.isValid[1].incorrect])) {
    return 'Incomplete';
  }
  return config.active ? 'Active' : 'Inactive';
};
