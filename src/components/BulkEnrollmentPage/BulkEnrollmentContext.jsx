import React, {
  createContext, useState, useReducer, useMemo,
} from 'react';
import PropTypes from 'prop-types';

import selectedRowsReducer from './data/reducer';

export const BulkEnrollContext = createContext({});

const BulkEnrollContextProvider = ({ children, initialEmailsList }) => {
  const [selectedCourses, coursesDispatch] = useReducer(selectedRowsReducer, []);
  // this format is to make this consistent with the format used by ReviewStep components
  // similar to DataTable row objects, but not exactly
  const formattedEmailsList = initialEmailsList.map(email => ({
    id: email,
    values: {
      userEmail: email,
    },
  }));
  const [selectedEmails, emailsDispatch] = useReducer(selectedRowsReducer, formattedEmailsList);
  const [selectedSubscription, setSelectedSubscription] = useState({});

  const contextValue = useMemo(
    () => ({
      courses: [selectedCourses, coursesDispatch],
      emails: [selectedEmails, emailsDispatch],
      subscription: [selectedSubscription, setSelectedSubscription],
    }),
    [selectedCourses, selectedEmails, selectedSubscription],
  );

  return <BulkEnrollContext.Provider value={contextValue}>{children}</BulkEnrollContext.Provider>;
};

BulkEnrollContextProvider.defaultProps = {
  initialEmailsList: [],
};

BulkEnrollContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initialEmailsList: PropTypes.arrayOf(PropTypes.string),
};

export default BulkEnrollContextProvider;
