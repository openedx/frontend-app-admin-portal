import React, { useEffect } from 'react';

import { configuration } from '../../config';

function SurveyPage() {
  useEffect(() => {
    const widget = document.createElement('script');
    widget.src = configuration.SURVEY_MONKEY_URL;
    document.body.appendChild(widget);
  }, []);

  return <div id="smcx-sdk" />;
}

export default SurveyPage;
