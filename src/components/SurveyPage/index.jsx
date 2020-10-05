import React, { useEffect } from 'react';

const SurveyPage = () => {
  useEffect(() => {
    const widget = document.createElement('script');
    widget.src = 'https://widget.surveymonkey.com/collect/website/js/tRaiETqnLgj758hTBazgd_2BubSJEoVMSXyhpZ3VDb5_2BknEVoWfJFNQnAE6Sqt_2BFck.js';
    document.body.appendChild(widget);
  }, []);

  return <div id="smcx-sdk" />;
};

export default SurveyPage;
