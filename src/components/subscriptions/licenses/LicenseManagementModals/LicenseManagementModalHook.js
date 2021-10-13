import { useEffect, useState } from 'react';

const initialRequestState = {
  loading: false,
  success: false,
  error: undefined,
};

export const useRequestState = (isOpen) => {
  const [requestState, setRequestState] = useState(initialRequestState);

  useEffect(() => {
    setRequestState(initialRequestState);
  }, [isOpen]);

  return [requestState, setRequestState, initialRequestState];
};

export default useRequestState;
