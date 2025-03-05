import {
  ReactNode, useReducer,
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
  validatedEmailsState.dispatch = dispatch;
  return (
    <ValidatedEmailsContextObject.Provider value={validatedEmailsState}>
      {children}
    </ValidatedEmailsContextObject.Provider>
  );
};

export default ValidatedEmailsContextProvider;
