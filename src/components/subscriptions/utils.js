const networkResponseHandler = (
  data,
  isLoading,
  error,
  successCallback,
  errorCallback,
  requestStatusCallback,
) => {
  requestStatusCallback(isLoading, !!error);

  if (!isLoading && !error) {
    successCallback(data);
  } else if (!isLoading && error) {
    errorCallback(error);
  }
};

// eslint-disable-next-line import/prefer-default-export
export { networkResponseHandler };
