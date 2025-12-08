import { useCallback, useMemo, useState } from 'react';

const generateSuccessDeclineMessage = (requestCount) => {
  if (requestCount > 1) {
    return `Requests declined (${requestCount})`;
  }
  return 'Request declined';
};

const useSuccessfulBulkDeclineToastContextValue = () => {
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [requestCount, setRequestCount] = useState();

  const handleDisplayToast = useCallback((count) => {
    setIsToastOpen(true);
    setRequestCount(count);
  }, []);

  const handleCloseToast = useCallback(() => {
    setIsToastOpen(false);
  }, []);

  const successfulBulkDeclineToastMessage = generateSuccessDeclineMessage(requestCount);

  const successfulBulkDeclineToastContextValue = useMemo(() => ({
    isSuccessfulBulkDeclineToastOpen: isToastOpen,
    displayToastForBulkDecline: handleDisplayToast,
    closeToastForBulkDecline: handleCloseToast,
    successfulBulkDeclineToastMessage,
  }), [
    isToastOpen,
    handleDisplayToast,
    handleCloseToast,
    successfulBulkDeclineToastMessage,
  ]);
  return successfulBulkDeclineToastContextValue;
};

export default useSuccessfulBulkDeclineToastContextValue;
