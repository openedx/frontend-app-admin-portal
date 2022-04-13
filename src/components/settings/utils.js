import { logError } from '@edx/frontend-platform/logging';

export default function handleErrors(error) {
  const errorMsg = error.message || error.response?.status <= 300
    ? error.message
    : JSON.stringify(error.response.data);
  logError(errorMsg);
  return errorMsg;
}
