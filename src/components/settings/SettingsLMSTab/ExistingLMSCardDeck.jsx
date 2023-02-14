import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  CardGrid, useToggle,
} from '@edx/paragon';
import { getStatus } from './utils';
import ConfigError from '../ConfigError';
import ExistingCard from './ExistingCard';

const ExistingLMSCardDeck = ({
  configData,
  editExistingConfig,
  enterpriseCustomerUuid,
  onClick,
}) => {
  const [errorIsOpen, openError, closeError] = useToggle(false);
  const [errorModalText, setErrorModalText] = useState();

  // Map the existing config data to individual cards
  const listActive = configData.filter(config => getStatus(config) === 'Active').map(config => (
    <ExistingCard
      key={`${config.channelCode}${config.id}`}
      config={config}
      editExistingConfig={editExistingConfig}
      enterpriseCustomerUuid={enterpriseCustomerUuid}
      onClick={onClick}
      openError={openError}
      setErrorModalText={setErrorModalText}
      getStatus={getStatus}
    />
  ));
  const listInactive = configData.filter(config => getStatus(config) !== 'Active').map(config => (
    <ExistingCard
      key={`${config.channelCode}${config.id}`}
      config={config}
      editExistingConfig={editExistingConfig}
      enterpriseCustomerUuid={enterpriseCustomerUuid}
      onClick={onClick}
      openError={openError}
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
      { listActive.length > 0 && (
      <>
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
      </>
      )}
      { listInactive.length > 0 && (
      <>
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
      </>
      )}
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
