import { useCallback, useMemo, useState } from 'react';

const generateSuccessApprovalMessage = (requestCount) => {
  if (requestCount > 1) {
    return `Requests approved (${requestCount})`;
  }
  return 'Request approved';
};

const useSuccessfulBulkApprovalToastContextValue = () => {
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [requestCount, setRequestCount] = useState();

  const handleDisplayToast = useCallback((count) => {
    setIsToastOpen(true);
    setRequestCount(count);
  }, []);

  const handleCloseToast = useCallback(() => {
    setIsToastOpen(false);
  }, []);

  const successfulBulkApprovalToastMessage = generateSuccessApprovalMessage(requestCount);

  const successfulBulkApprovalToastContextValue = useMemo(() => ({
    isSuccessfulBulkApprovalToastOpen: isToastOpen,
    displayToastForBulkApproval: handleDisplayToast,
    closeToastForBulkApproval: handleCloseToast,
    successfulBulkApprovalToastMessage,
  }), [
    isToastOpen,
    handleDisplayToast,
    handleCloseToast,
    successfulBulkApprovalToastMessage,
  ]);
  return successfulBulkApprovalToastContextValue;
};

export default useSuccessfulBulkApprovalToastContextValue;
