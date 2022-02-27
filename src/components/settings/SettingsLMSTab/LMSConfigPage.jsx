import React from 'react';
import PropTypes from 'prop-types';
import { Image } from '@edx/paragon';
import { connect } from 'react-redux';
import { channelMapping } from '../../../utils';

import {
  BLACKBOARD_TYPE,
  CANVAS_TYPE,
  CORNERSTONE_TYPE,
  DEGREED_TYPE,
  DEGREED2_TYPE,
  MOODLE_TYPE,
  SAP_TYPE,
} from '../data/constants';
import BlackboardConfig from './LMSConfigs/BlackboardConfig';
import CanvasConfig from './LMSConfigs/CanvasConfig';
import CornerstoneConfig from './LMSConfigs/CornerstoneConfig';
import DegreedConfig from './LMSConfigs/DegreedConfig';
import Degreed2Config from './LMSConfigs/Degreed2Config';
import MoodleConfig from './LMSConfigs/MoodleConfig';
import SAPConfig from './LMSConfigs/SAPConfig';

const LMSConfigPage = ({
  LMSType,
  onClick,
  enterpriseCustomerUuid,
  existingConfigFormData,
}) => (
  <span>
    <h3 className="mt-4.5 mb-3.5">
      <Image className="lms-icon" src={channelMapping[LMSType].icon} />
      <span className="ml-2">Connect {channelMapping[LMSType].displayName}</span>
    </h3>
    {LMSType === BLACKBOARD_TYPE && (
      <BlackboardConfig
        enterpriseCustomerUuid={enterpriseCustomerUuid}
        onClick={onClick}
        existingData={existingConfigFormData}
      />
    )}
    {LMSType === CANVAS_TYPE && (
      <CanvasConfig
        enterpriseCustomerUuid={enterpriseCustomerUuid}
        onClick={onClick}
        existingData={existingConfigFormData}
      />
    )}
    {LMSType === CORNERSTONE_TYPE && (
      <CornerstoneConfig
        enterpriseCustomerUuid={enterpriseCustomerUuid}
        onClick={onClick}
        existingData={existingConfigFormData}
      />
    )}
    {LMSType === DEGREED2_TYPE && (
      <Degreed2Config
        enterpriseCustomerUuid={enterpriseCustomerUuid}
        onClick={onClick}
        existingData={existingConfigFormData}
      />
    )}
    {LMSType === DEGREED_TYPE && (
      <DegreedConfig
        enterpriseCustomerUuid={enterpriseCustomerUuid}
        onClick={onClick}
        existingData={existingConfigFormData}
      />
    )}
    {LMSType === MOODLE_TYPE && (
      <MoodleConfig
        enterpriseCustomerUuid={enterpriseCustomerUuid}
        onClick={onClick}
        existingData={existingConfigFormData}
      />
    )}
    {LMSType === SAP_TYPE && (
      <SAPConfig
        enterpriseCustomerUuid={enterpriseCustomerUuid}
        onClick={onClick}
        existingData={existingConfigFormData}
      />
    )}
  </span>
);

const mapStateToProps = (state) => ({
  enterpriseCustomerUuid: state.portalConfiguration.enterpriseId,
});

LMSConfigPage.propTypes = {
  enterpriseCustomerUuid: PropTypes.string.isRequired,
  LMSType: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  existingConfigFormData: PropTypes.shape({}).isRequired,
};

export default connect(mapStateToProps)(LMSConfigPage);
