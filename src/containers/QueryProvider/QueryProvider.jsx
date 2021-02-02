import React, { createContext, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getQueryParamsToSetString, getQueryString } from './hooks/useQueryString';

export const QueryContext = createContext();

const QueryProvider = ({ children }) => {
  const [prefix, setPrefix] = useState('');
  const [excludedParams, setExcludedParams] = useState([]);
  const [queriesToSet, setQueries] = useState({});

  const { push } = useHistory();
  const { pathname, search } = useLocation();

  const currentQuery = getQueryString({ prefix, excludedParams, search });
  const updatedQueriesToSet = getQueryParamsToSetString({
    prefix, excludedParams, search, paramsToSet: queriesToSet,
  });
  console.log("UPDATED QUERIES TO SET", updatedQueriesToSet)

  console.log("SEARCH", search)

  if (updatedQueriesToSet && `?${updatedQueriesToSet}` !== search) {
    push(`${pathname}?${updatedQueriesToSet}`);
  }

  return (
    <QueryContext.Provider value={{
      currentQuery, setQueries, setPrefix, setExcludedParams,
    }}
    >
      {children}
    </QueryContext.Provider>
  );
};

QueryProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default QueryProvider;
