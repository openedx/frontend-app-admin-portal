import {
  useCallback, useMemo, useState,
} from 'react';
import { makePlural } from '../../../../utils';

const generateSuccessRemoveMessage = (count) => (`${makePlural(count, 'member')} successfully removed`);

const useSuccessfulRemovalToastContextValue = () => {
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [learnersRemovedCount, setLearnersRemovedCount] = useState(0);

  const successfulRemovalToastMessage = generateSuccessRemoveMessage(learnersRemovedCount);

  const handleDisplayToast = useCallback(({ totalLearnersRemoved }) => {
    setLearnersRemovedCount(totalLearnersRemoved);
    setIsToastOpen(true);
  }, []);

  const handleCloseToast = useCallback(() => {
    setIsToastOpen(false);
  }, []);

  const successfulRemovalToast = useMemo(() => ({
    isSuccessfulRemovalToastOpen: isToastOpen,
    displayToastForRemoval: handleDisplayToast,
    closeToastForRemoval: handleCloseToast,
    totalLearnersRemoved: learnersRemovedCount,
    successfulRemovalToastMessage,
  }), [
    isToastOpen,
    handleDisplayToast,
    handleCloseToast,
    learnersRemovedCount,
    successfulRemovalToastMessage,
  ]);

  return successfulRemovalToast;
};

export default useSuccessfulRemovalToastContextValue;
