import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import ContentHighlightRoutes from './ContentHighlightRoutes';
import Hero from '../Hero';
import ContentHighlightsContextProvider from './ContentHighlightsContext';
import ContentHighlightToast from './ContentHighlightToast';
import { EnterpriseAppContext } from '../EnterpriseApp/EnterpriseAppContextProvider';
import { withLocation } from '../../hoc';

const ContentHighlights = ({ location }) => {
  const navigate = useNavigate();
  const { state: locationState } = location;
  const [toasts, setToasts] = useState([]);
  const { enterpriseCuration: { enterpriseCuration } } = useContext(EnterpriseAppContext);
  useEffect(() => {
    if (locationState?.highlightToast) {
      setToasts((prevState) => [...prevState, {
        toastText: enterpriseCuration?.toastText,
        uuid: uuidv4(),
      }]);
      const newState = { ...locationState };
      delete newState.highlightToast;
      navigate(location.pathname, { ...location, state: newState, replace: true });
    }
    if (locationState?.archiveCourses) {
      setToasts((prevState) => [...prevState, {
        toastText: 'Archived courses deleted',
        uuid: uuidv4(),
      }]);
      const newState = { ...locationState };
      delete newState.archiveCourses;
      navigate(location.pathname, { ...location, state: newState, replace: true });
    }
    if (locationState?.deletedHighlightSet) {
      setToasts((prevState) => [...prevState, {
        toastText: `"${enterpriseCuration?.toastText}" deleted`,
        uuid: uuidv4(),
      }]);
      const newState = { ...locationState };
      delete newState.deletedHighlightSet;
      navigate(location.pathname, { ...location, state: newState, replace: true });
    }
    if (locationState?.addHighlightSet) {
      setToasts((prevState) => [...prevState, {
        toastText: `"${enterpriseCuration?.toastText}" added`,
        uuid: uuidv4(),
      }]);
      const newState = { ...locationState };
      delete newState.addHighlightSet;
      navigate(location.pathname, { ...location, state: newState, replace: true });
    }
  }, [enterpriseCuration?.toastText, navigate, location, locationState]);
  return (
    <ContentHighlightsContextProvider>
      <Hero title="Highlights" />
      <ContentHighlightRoutes />
      {toasts.map(({ toastText, uuid }) => (<ContentHighlightToast toastText={toastText} key={uuid} />))}
    </ContentHighlightsContextProvider>
  );
};

ContentHighlights.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string,
    state: PropTypes.shape({
      addHighlightSet: PropTypes.bool,
      deletedHighlightSet: PropTypes.bool,
      archiveCourses: PropTypes.bool,
      highlightToast: PropTypes.bool,
    }),
  }),
};

export default withLocation(ContentHighlights);
