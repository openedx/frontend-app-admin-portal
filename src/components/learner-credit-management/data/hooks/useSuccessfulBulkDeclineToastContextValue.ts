import { useCallback, useMemo, useState } from 'react';

interface SuccessfulBulkDeclineToastContextValue {
  isSuccessfulBulkDeclineToastOpen: boolean;
  displayToastForBulkDecline: (count: number) => void;
  closeToastForBulkDecline: () => void;
  successfulBulkDeclineToastMessage: string;
}

const generateSuccessDeclineMessage = (requestCount?: number): string => {
  if (requestCount && requestCount > 1) {
    return `Requests declined (${requestCount})`;
  }
  return 'Request declined';
};

const useSuccessfulBulkDeclineToastContextValue = (): SuccessfulBulkDeclineToastContextValue => {
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [requestCount, setRequestCount] = useState<number | undefined>();

  const handleDisplayToast = useCallback((count: number) => {
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
