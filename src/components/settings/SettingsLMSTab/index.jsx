import React, { useState } from 'react';
import { Hyperlink, CardGrid, Toast } from '@edx/paragon';
import LMSCard from './LMSCard';
import LMSConfigPage from './LMSConfigPage';
import {
  BLACKBOARD_TYPE,
  CANVAS_TYPE,
  CORNERSTONE_TYPE,
  DEGREED_TYPE,
  HELP_CENTER_LINK,
  MOODLE_TYPE,
  SAP_TYPE,
  SUCCESS_LABEL,
} from '../data/constants';

export default function SettingsLMSTab() {
  const [config, setConfig] = useState();
  const [showToast, setShowToast] = useState(false);

  const onClick = (input) => {
    if (input === SUCCESS_LABEL) {
      setShowToast(true);
      setConfig('');
    } else {
      setConfig(input);
    }
  };

  return (
    <div>
      <div className="d-flex">
        <h2 className="py-2">Learning Management System Configuration</h2>
        <Hyperlink
          destination={HELP_CENTER_LINK}
          className="btn btn-outline-primary ml-auto my-2"
          target="_blank"
        >
          Help Center
        </Hyperlink>
      </div>
      <p>
        Enabling a learning management system for your edX account allows quick
        access to the catalog
      </p>
      {!config && (
        <span>
          <h4 className="mt-5">New configurations</h4>
          <p className="mb-4">Click on a card to start a new configuration</p>

          <CardGrid
            columnSizes={{
              xs: 6,
              s: 5,
              m: 4,
              l: 4,
              xl: 3,
            }}
          >
            <LMSCard LMSType={SAP_TYPE} onClick={onClick} />
            <LMSCard LMSType={MOODLE_TYPE} onClick={onClick} />
            <LMSCard LMSType={CORNERSTONE_TYPE} onClick={onClick} />
            <LMSCard LMSType={CANVAS_TYPE} onClick={onClick} />
            <LMSCard LMSType={DEGREED_TYPE} onClick={onClick} />
            <LMSCard LMSType={BLACKBOARD_TYPE} onClick={onClick} />
          </CardGrid>
        </span>
      )}
      {config && (
        <span>
          <LMSConfigPage LMSType={config} onClick={onClick} />
        </span>
      )}
      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
      >
        Configuration was submitted successfully.
      </Toast>
    </div>
  );
}
