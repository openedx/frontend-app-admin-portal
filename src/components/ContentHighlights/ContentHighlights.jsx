import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
import ContentHighlightRoutes from './ContentHighlightRoutes';
import Hero from '../Hero';
import ContentHighlightsContextProvider from './ContentHighlightsContext';
import ContentHighlightToast from './ContentHighlightToast';

const ContentHighlights = () => {
  const history = useHistory();
  const { location } = history;
  const { state: locationState } = location;
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    if (locationState?.deletedHighlightSet) {
      setToasts((prevState) => [...prevState, `"${locationState?.toastText}" deleted.`]);
      const newState = { ...locationState };
      delete newState.deletedHighlightSet;
      history.replace({ ...location, state: newState });
    }
    if (locationState?.addHighlightSet) {
      setToasts((prevState) => [...prevState, `"${locationState?.toastText}" added.`]);
      const newState = { ...locationState };
      delete newState.addHighlightSet;
      history.replace({ ...location, state: newState });
    }
  }, [history, location, locationState, toasts]);
  return (
    <ContentHighlightsContextProvider>
      <Hero title="Highlights" />
      <ContentHighlightRoutes />
      {toasts.map((element) => (<ContentHighlightToast toastText={element} key={uuidv4()} />))}
    </ContentHighlightsContextProvider>
  );
};

export default ContentHighlights;
