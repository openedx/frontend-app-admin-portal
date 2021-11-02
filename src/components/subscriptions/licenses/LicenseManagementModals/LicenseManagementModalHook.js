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

export const licenseManagementModalZeroState = {
  isOpen: false,
  users: [],
  allUsersSelected: false,
};

/**
 * Handles basic modal open/close usage and can hold user data
 * @param initialState shape:
 * {
 *  isOpen: bool
 *  users: array
 *  allUsersSelected: bool
 * }
 * @returns [state, setState, zeroState]
 */
export const useLicenseManagementModalState = (initialState = licenseManagementModalZeroState) => {
  const [modalState, setModalState] = useState(initialState);
  return [modalState, setModalState, licenseManagementModalZeroState];
};

export default useRequestState;
