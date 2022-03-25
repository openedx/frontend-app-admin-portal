import { logError } from '@edx/frontend-platform/logging';

export function buttonBool(config) {
  let returnVal = true;
  Object.entries(config).forEach(entry => {
    const [key, value] = entry;
    if ((key !== 'displayName' && key !== 'degreedFetchUrl') && !value) {
      returnVal = false;
    }
  });
  return returnVal;
}

export function handleErrors(error) {
  const errorMsg = error.message || error.response?.status <= 300
    ? error.message
    : JSON.stringify(error.response.data);
  logError(errorMsg);
  return errorMsg;
}
