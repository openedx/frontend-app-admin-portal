import {
  ReactNode, useMemo, useReducer,
} from 'react';
import { ValidatedEmailsReducer, ValidatedEmailsReducerType } from './reducer';
import { initialContext, ValidatedEmailsContext, ValidatedEmailsContextObject } from './ValidatedEmailsContext';

export type ValidatedEmailContextProps = {
  children: ReactNode;
  initialContextOverride: Partial<ValidatedEmailsContext>
};

// Context wrapper for all validated email components
const ValidatedEmailsContextProvider = ({
  children, initialContextOverride = {},
}: ValidatedEmailContextProps) => {
  const [validatedEmailsState, dispatch] = useReducer<ValidatedEmailsReducerType>(
    ValidatedEmailsReducer,
    { ...initialContext, ...initialContextOverride },
  );
  const value = useMemo(() => ({
    ...validatedEmailsState,
    dispatch,
  }), [dispatch, validatedEmailsState]);
  return (
    <ValidatedEmailsContextObject.Provider value={value}>
      {children}
    </ValidatedEmailsContextObject.Provider>
  );
};

export default ValidatedEmailsContextProvider;
