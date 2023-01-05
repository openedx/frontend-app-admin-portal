import isEmpty from 'lodash/isEmpty';

export default function buttonBool(config) {
  let returnVal = true;
  Object.entries(config).forEach(entry => {
    const [key, value] = entry;
    // check whether or not the field is an optional value
    if ((key !== 'displayName' && key !== 'degreedFetchUrl') && !value) {
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
  // config.isValid has two arrays (missing and incorrect) which details which specific
  // fields are needed for the user to complete the configuration
  if (!isEmpty([...config.isValid[0].missing, ...config.isValid[1].incorrect])) {
    return 'Incomplete';
  }
  return config.active ? 'Active' : 'Inactive';
};
