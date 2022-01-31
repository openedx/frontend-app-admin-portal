import React from 'react';
import { Button, CardGrid } from '@edx/paragon';
import LMSCard from './LMSCard';

const SettingsLMSTab = () => (
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
        Help Center
      </Button>
    </div>
    <p>
      Enabling a learning management system for your edX account allows quick
      access to the catalog
    </p>
    <h4 className="mt-4.5 mb-3">New</h4>
    <CardGrid
      columnSizes={{
        xs: 12,
        lg: 6,
        xl: 4,
      }}
    >
      <LMSCard LMStype="SAP" />
      <LMSCard LMStype="Moodle" />
      <LMSCard LMStype="Cornerstone" />
      <LMSCard LMStype="Canvas" />
      <LMSCard LMStype="Degreed" />
      <LMSCard LMStype="Blackboard" />
    </CardGrid>
  </div>
);

export default SettingsLMSTab;
