import React, { createContext, useState } from 'react';
import PropTypes from 'prop-types';

export const BulkEnrollContext = createContext({});

const BulkEnrollContextProvider = ({ children }) => {
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState({});

  const value = {
    courses: [selectedCourses, setSelectedCourses],
    emails: [selectedEmails, setSelectedEmails],
    subscription: [selectedSubscription, setSelectedSubscription],
  };

  return <BulkEnrollContext.Provider value={value}>{children}</BulkEnrollContext.Provider>;
};

BulkEnrollContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default BulkEnrollContextProvider;
