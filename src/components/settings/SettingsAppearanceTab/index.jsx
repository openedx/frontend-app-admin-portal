import React from 'react';
import PropTypes from 'prop-types';

export default function SettingsAppearanceTab({
  enterpriseId,
}) {
  return (
    <div>AM I YELLING INTO A VOID {enterpriseId}</div>
  );
}

SettingsAppearanceTab.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};
