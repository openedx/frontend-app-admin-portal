import React, { useEffect, useState, useContext } from 'react';
import { useHistory } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
import ContentHighlightRoutes from './ContentHighlightRoutes';
import Hero from '../Hero';
import ContentHighlightsContextProvider from './ContentHighlightsContext';
import ContentHighlightToast from './ContentHighlightToast';
import { EnterpriseAppContext } from '../EnterpriseApp/EnterpriseAppContextProvider';

const ContentHighlights = () => {
  const history = useHistory();
  const { location } = history;
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
      history.replace({ ...location, state: newState });
    }
    if (locationState?.deletedHighlightSet) {
      setToasts((prevState) => [...prevState, {
        toastText: `"${enterpriseCuration?.toastText}" deleted`,
        uuid: uuidv4(),
      }]);
      const newState = { ...locationState };
      delete newState.deletedHighlightSet;
      history.replace({ ...location, state: newState });
    }
    if (locationState?.addHighlightSet) {
      setToasts((prevState) => [...prevState, {
        toastText: `"${enterpriseCuration?.toastText}" added`,
        uuid: uuidv4(),
      }]);
      const newState = { ...locationState };
      delete newState.addHighlightSet;
      history.replace({ ...location, state: newState });
    }
  }, [enterpriseCuration?.toastText, history, location, locationState]);
  return (
    <ContentHighlightsContextProvider>
      <Hero title="Highlights" />
      <ContentHighlightRoutes />
      {toasts.map(({ toastText, uuid }) => (<ContentHighlightToast toastText={toastText} key={uuid} />))}
    </ContentHighlightsContextProvider>
  );
};

export default ContentHighlights;
