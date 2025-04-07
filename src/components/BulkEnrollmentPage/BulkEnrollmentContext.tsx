import React, {
  createContext, useState, useReducer, useMemo,
} from 'react';
import PropTypes from 'prop-types';

import selectedRowsReducer from './data/reducer';
import type { Action, SelectedRow } from './data/types';

export type Subscription = {
  uuid: string;
  enterpriseCatalogUuid: string;
};

export type BulkEnrollContextValue = {
  courses: [SelectedRow[], React.Dispatch<Action>],
  emails: [SelectedRow[], React.Dispatch<Action>],
  subscription: [Subscription | null, React.Dispatch<React.SetStateAction<Subscription>>],
};

export const BulkEnrollContext = createContext<BulkEnrollContextValue>({
  courses: [[], () => {}],
  emails: [[], () => {}],
  subscription: [null, () => {}],
});

interface BulkEnrollContextProviderProps {
  children: React.ReactNode;
  initialEmailsList?: string[];
}

const BulkEnrollContextProvider: React.FC<BulkEnrollContextProviderProps> = ({ children, initialEmailsList = [] }) => {
  const [selectedCourses, coursesDispatch] = useReducer(selectedRowsReducer, []);
  // this format is to make this consistent with the format used by ReviewStep components
  // similar to DataTable row objects, but not exactly
  const formattedEmailsList: SelectedRow[] = initialEmailsList.map(email => ({
    id: email,
    values: {
      userEmail: email,
    },
  }));
  const [selectedEmails, emailsDispatch] = useReducer(selectedRowsReducer, formattedEmailsList);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription>();

  const contextValue = useMemo(
    () => ({
      courses: [selectedCourses, coursesDispatch],
      emails: [selectedEmails, emailsDispatch],
      subscription: [selectedSubscription, setSelectedSubscription],
    } as BulkEnrollContextValue),
    [selectedCourses, selectedEmails, selectedSubscription],
  );

  return <BulkEnrollContext.Provider value={contextValue}>{children}</BulkEnrollContext.Provider>;
};

BulkEnrollContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initialEmailsList: PropTypes.arrayOf(PropTypes.string.isRequired),
};

export default BulkEnrollContextProvider;
