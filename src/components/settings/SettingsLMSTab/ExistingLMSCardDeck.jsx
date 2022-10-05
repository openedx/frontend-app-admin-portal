import React, { useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import {
  CardGrid, useToggle,
} from '@edx/paragon';
import ConfigError from '../ConfigError';
import ErrorReportingModal from './ErrorReporting/ErrorReportingModal';
import ExistingCard from './ExistingCard';

const ExistingLMSCardDeck = ({
  configData,
  editExistingConfig,
  enterpriseCustomerUuid,
  onClick,
}) => {
  const [errorIsOpen, openError, closeError] = useToggle(false);
  const [errorReportIsOpen, openReport, closeReport] = useToggle(false);
  const [reportConfig, setReportConfig] = useState();
  const [errorModalText, setErrorModalText] = useState();

  // Map the existing config data to individual cards

  const getStatus = (config) => {
    const INCOMPLETE = 'incomplete';
    const ACTIVE = 'active';
    const INACTIVE = 'inactive';
    if (!isEmpty(config.isValid[0].missing)
        || !isEmpty(config.isValid[1].incorrect)) {
      return INCOMPLETE;
    }

    if (config.active) {
      return ACTIVE;
    }
    return INACTIVE;
  };

  // const listItems = timeSort(configData).map((config) => (
  const listActive = configData.filter(config => getStatus(config) === 'active').map(config => (
    <ExistingCard
      config={config}
      editExistingConfig={editExistingConfig}
      enterpriseCustomerUuid={enterpriseCustomerUuid}
      onClick={onClick}
      openError={openError}
      openReport={openReport}
      setReportConfig={setReportConfig}
      setErrorModalText={setErrorModalText}
      getStatus={getStatus}
    />
  ));
  const listInactive = configData.filter(config => getStatus(config) !== 'active').map(config => (
    <ExistingCard
      config={config}
      editExistingConfig={editExistingConfig}
      enterpriseCustomerUuid={enterpriseCustomerUuid}
      onClick={onClick}
      openError={openError}
      openReport={openReport}
      setReportConfig={setReportConfig}
      setErrorModalText={setErrorModalText}
      getStatus={getStatus}
    />
  ));

  return (
    <span>
      <ConfigError
        isOpen={errorIsOpen}
        close={closeError}
        configTextOverride={errorModalText}
      />
      <ErrorReportingModal
        isOpen={errorReportIsOpen}
        close={closeReport}
        config={reportConfig}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />
      <h4 className="mt-1 mb-4">Active</h4>
      <CardGrid
        className="mr-6"
        columnSizes={{
          xs: 9,
          s: 9,
          m: 9,
          l: 7,
          xl: 7,
        }}
      >{listActive}
      </CardGrid>
      <h4 className="mt-1 mb-4">Inactive</h4>
      <CardGrid
        className="mr-6"
        columnSizes={{
          xs: 9,
          s: 9,
          m: 9,
          l: 7,
          xl: 7,
        }}
      >{listInactive}
      </CardGrid>
    </span>
  );
};

ExistingLMSCardDeck.propTypes = {
  onClick: PropTypes.func.isRequired,
  enterpriseCustomerUuid: PropTypes.string.isRequired,
  configData: PropTypes.arrayOf(
    PropTypes.shape({
      active: PropTypes.bool,
      isValid: PropTypes.arrayOf(
        PropTypes.shape({
          missing: PropTypes.arrayOf(PropTypes.string),
          incorrect: PropTypes.arrayOf(PropTypes.string),
        }),
      ),
      channelCode: PropTypes.string,
      id: PropTypes.number,
      displayName: PropTypes.string,
    }),
  ).isRequired,
  editExistingConfig: PropTypes.func.isRequired,
};

export default ExistingLMSCardDeck;
