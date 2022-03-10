import React from 'react';
import PropTypes from 'prop-types';
import { Hyperlink } from '@edx/paragon';
import { HELP_CENTER_SAML_LINK } from '../data/constants';

const SettingsSSOTab = ({ enterpriseId }) => (
  <div>
    <div className="d-flex">
      <h2 className="py-2">SAML Configuration</h2>
      <Hyperlink
        destination={HELP_CENTER_SAML_LINK}
        className="btn btn-outline-primary ml-auto my-2"
        target="_blank"
      >
        Help Center
      </Hyperlink>
    </div>
    <p key={enterpriseId}>
      {' '}
    </p>
  </div>
);

SettingsSSOTab.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

export default SettingsSSOTab;
