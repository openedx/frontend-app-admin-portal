import { logError } from '@edx/frontend-platform/logging';

export function buttonBool(config) {
  let returnVal = true;
  Object.values(config).forEach(value => {
    if (!value) {
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
