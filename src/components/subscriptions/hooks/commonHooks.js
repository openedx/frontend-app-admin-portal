import { useState } from 'react';

/*
  Error will have the following format.
  {
    key: 'Uniquely identifying key.',
    message: 'Human readable error message.',
    type: 'warning',
  }
*/
export const useErrors = () => {
  const [errors, setErrors] = useState({});

  const addError = (key, message, type = 'error') => {
    setErrors({ ...errors, ...{ [key]: { key, message, type } } });
  };

  const removeError = (key) => {
    const errs = { ...errors };
    delete errs[key];

    setErrors(errs);
  };

  return { errors, addError, removeError };
};

/*
  Status will have the following format.
  {
    key: 'Uniquely identifying key.',
    isLoading: true,  // true if request is in process, false otherwise.
    hasErrors: false,  // true if response errored out, false otherwise.
  }
*/
export const useRequestStatus = () => {
  const [requestStatus, setRequestStatus] = useState({});

  const updateRequestStatus = (key, isLoading, hasErrors = false) => {
    setRequestStatus((prevState => (
      { ...prevState, ...{ [key]: { key, isLoading, hasErrors } } }
    )));
  };

  return { requestStatus, updateRequestStatus };
};
