import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import ContentHighlightRoutes from './ContentHighlightRoutes';
import Hero from '../Hero';
import ContentHighlightsContextProvider from './ContentHighlightsContext';
import ContentHighlightToast from './ContentHighlightToast';

const ContentHighlights = () => {
  const history = useHistory();
  const { location } = history;
  const { state: locationState } = location;
  const [toast, setToast] = useState([]);
  useEffect(() => {
    if (locationState?.deletedHighlightSet) {
      setToast((prevState) => [...prevState, `"${locationState?.toastText}" deleted.`]);
      const newState = { ...locationState };
      delete newState.deletedHighlightSet;
      history.replace({ ...location, state: newState });
    }
    if (locationState?.addHighlightSet) {
      setToast((prevState) => [...prevState, `"${locationState?.toastText}" added.`]);
      const newState = { ...locationState };
      delete newState.addHighlightSet;
      history.replace({ ...location, state: newState });
    }
  }, [history, location, locationState, toast]);
  return (
    <ContentHighlightsContextProvider>
      <Hero title="Highlights" />
      <ContentHighlightRoutes />
      {toast.map((element) => (<ContentHighlightToast toastText={element} />))}
    </ContentHighlightsContextProvider>
  );
};

export default ContentHighlights;
