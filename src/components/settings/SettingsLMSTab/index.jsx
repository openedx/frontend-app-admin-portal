import React, { useState } from 'react';
import { Button, CardGrid, Toast } from '@edx/paragon';
import LMSCard from './LMSCard';
import LMSConfigPage from './LMSConfigPage';

export default function SettingsLMSTab() {
  const [config, setConfig] = useState();
  const [show, setShow] = useState(false);

  const configure = (LMStype) => {
    if (!LMStype) {
      setShow(true);
    }
    setConfig(LMStype);
  };

  return (
    <div>
      <div className="d-flex">
        <h2 className="py-2">Learning Management System Configuration</h2>
        <Button
          href="https://business-support.edx.org/hc/en-us/categories/360000368453-Integrations"
          className="ml-auto my-2"
          rel="noopener noreferrer"
          target="_blank"
          variant="outline-primary"
        >
          Need Help?
        </Button>
      </div>
      <p>
        Enabling a learning management system for your edX account allows quick
        access to the catalog
      </p>
      {!config && (
        <span>
          <h4 className="mt-4.5 mb-3">New</h4>

          <CardGrid
            columnSizes={{
              xs: 12,
              lg: 6,
              xl: 4,
            }}
          >
            <LMSCard LMStype="SAP" onClick={configure} />
            <LMSCard LMStype="Moodle" onClick={configure} />
            <LMSCard LMStype="Cornerstone" onClick={configure} />
            <LMSCard LMStype="Canvas" onClick={configure} />
            <LMSCard LMStype="Degreed" onClick={configure} />
            <LMSCard LMStype="Blackboard" onClick={configure} />
          </CardGrid>
        </span>
      )}
      {config && (
      <span>
        <LMSConfigPage LMStype={config} onClick={configure} />
      </span>
      )}
      <Toast
        onClose={() => setShow(false)}
        show={show}
      >
        Configuration was submitted successfully.
      </Toast>
    </div>
  );
}
