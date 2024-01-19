import React from 'react';
import PropTypes from 'prop-types';
import { useCurrentSettingsTab } from '../data/hooks';

const MockSettingsTabs = ({ match }) => {
  const tab = useCurrentSettingsTab();

  return (
    <>
      <p>{match.path}</p>
      <p>{tab}</p>
    </>
  );
};

MockSettingsTabs.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }).isRequired,
};

export default MockSettingsTabs;
