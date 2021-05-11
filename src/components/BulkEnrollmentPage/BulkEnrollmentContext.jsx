import React, { createContext, useState, useReducer } from 'react';
import PropTypes from 'prop-types';

import selectedRowsReducer from './data/reducer';

export const BulkEnrollContext = createContext({});

const BulkEnrollContextProvider = ({ children }) => {
  const [selectedCourses, coursesDispatch] = useReducer(selectedRowsReducer, []);
  const [selectedEmails, emailsDispatch] = useReducer(selectedRowsReducer, []);
  const [selectedSubscription, setSelectedSubscription] = useState({});

  const value = {
    courses: [selectedCourses, coursesDispatch],
    emails: [selectedEmails, emailsDispatch],
    subscription: [selectedSubscription, setSelectedSubscription],
  };

  return <BulkEnrollContext.Provider value={value}>{children}</BulkEnrollContext.Provider>;
};

BulkEnrollContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default BulkEnrollContextProvider;
