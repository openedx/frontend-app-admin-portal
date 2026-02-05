import { useCallback, useMemo, useState } from 'react';

interface SuccessfulBulkApprovalToastContextValue {
  isSuccessfulBulkApprovalToastOpen: boolean;
  displayToastForBulkApproval: (count: number) => void;
  closeToastForBulkApproval: () => void;
  successfulBulkApprovalToastMessage: string;
}

const generateSuccessApprovalMessage = (requestCount?: number): string => {
  if (requestCount && requestCount > 1) {
    return `Requests approved (${requestCount})`;
  }
  return 'Request approved';
};

const useSuccessfulBulkApprovalToastContextValue = (): SuccessfulBulkApprovalToastContextValue => {
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [requestCount, setRequestCount] = useState<number | undefined>();

  const handleDisplayToast = useCallback((count: number) => {
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
