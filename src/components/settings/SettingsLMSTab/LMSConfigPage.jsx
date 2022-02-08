import React from 'react';
import PropTypes from 'prop-types';
import { Image } from '@edx/paragon';
import { connect } from 'react-redux';
import { logError } from '@edx/frontend-platform/logging';
import { getLMSIcon } from '../../../utils';

import {
  BLACKBOARD_TYPE,
  CANVAS_TYPE,
  CORNERSTONE_TYPE,
  DEGREED_TYPE,
  MOODLE_TYPE,
  SAP_TYPE,
} from '../data/constants';
import BlackboardConfig from './LMSConfigs/BlackboardConfig';
import CanvasConfig from './LMSConfigs/CanvasConfig';
import CornerstoneConfig from './LMSConfigs/CornerstoneConfig';
import DegreedConfig from './LMSConfigs/DegreedConfig';
import MoodleConfig from './LMSConfigs/MoodleConfig';
import SAPConfig from './LMSConfigs/SAPConfig';

export function buttonText(config) {
  let text = 'Submit';
  Object.values(config).forEach(value => {
    if (!value) { text = 'Save Draft'; }
  });
  return text;
}

export function handleErrors(error) {
  const errorMsg = error.message || error.response?.status === 500
    ? error.message
    : JSON.stringify(error.response.data);
  logError(errorMsg);
  return errorMsg;
}

const LMSConfigPage = ({ LMStype, onClick, enterpriseId }) => (
  <span>
    <h3 className="mt-4.5 mb-3.5">
      <Image className="lms-icon" src={getLMSIcon(LMStype)} />
      <span className="ml-2">Connect {LMStype}</span>
    </h3>
    {LMStype === BLACKBOARD_TYPE && (
    <BlackboardConfig id={enterpriseId} onClick={() => onClick('')} />
    )}
    {LMStype === CANVAS_TYPE && (
    <CanvasConfig id={enterpriseId} onClick={() => onClick('')} />
    )}
    {LMStype === CORNERSTONE_TYPE && (
    <CornerstoneConfig id={enterpriseId} onClick={() => onClick('')} />
    )}
    {LMStype === DEGREED_TYPE && (
    <DegreedConfig id={enterpriseId} onClick={() => onClick('')} />
    )}
    {LMStype === MOODLE_TYPE && (
    <MoodleConfig id={enterpriseId} onClick={() => onClick('')} />
    )}
    {LMStype === SAP_TYPE && (
    <SAPConfig id={enterpriseId} onClick={() => onClick('')} />
    )}
  </span>
);

const mapStateToProps = (state) => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

LMSConfigPage.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  LMStype: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default connect(mapStateToProps)(LMSConfigPage);
