import { logError } from '@edx/frontend-platform/logging';

export const handleErrors = (error) => {
  const errorMsg = error.message || error.response?.status === 500
    ? error.message : JSON.stringify(error.response.data);
  logError(errorMsg);
  return errorMsg;
};

/**
   * Validates this form. If the form is invalid, it will return the fields
   * that were invalid. Otherwise, it will return an empty object.
   * @param {FormData} formData
   * @param {[String]} requiredFields
   */
export const validateLmsConfigForm = (formData, requiredFields) => {
  const invalidFields = requiredFields
    .filter(field => !formData.get(field))
    .reduce((prevFields, currField) => ({ ...prevFields, [currField]: true }), {});
  return invalidFields;
};
