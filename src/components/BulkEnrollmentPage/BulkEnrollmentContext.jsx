import React, { createContext, useState, useReducer } from 'react';
import PropTypes from 'prop-types';

import selectedRowsReducer from './data/reducer';

export const BulkEnrollContext = createContext({});

const BulkEnrollContextProvider = ({ children }) => {
  const [courseTableState, coursesDispatch] = useReducer(selectedRowsReducer, []);
  const [emailTableState, emailsDispatch] = useReducer(selectedRowsReducer, []);
  const [selectedSubscription, setSelectedSubscription] = useState({});
  console.log('COURSE TABLE STATE', courseTableState);
  console.log('EMAIL TABLE STATE', emailTableState);

  const value = {
    courses: [courseTableState, coursesDispatch],
    emails: [emailTableState, emailsDispatch],
    subscription: [selectedSubscription, setSelectedSubscription],
  };

  return <BulkEnrollContext.Provider value={value}>{children}</BulkEnrollContext.Provider>;
};

BulkEnrollContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default BulkEnrollContextProvider;
