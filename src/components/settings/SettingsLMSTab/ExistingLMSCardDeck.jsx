import React, { useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import {
  Badge, Card, CardGrid, Dropdown, Icon, IconButton, Image, useToggle,
} from '@edx/paragon';
import {
  Delete, Edit, MoreVert, PlayCircleFilled, RemoveCircle,
} from '@edx/paragon/icons';
import { channelMapping } from '../../../utils';
import { handleErrors } from './utils';
import { TOGGLE_SUCCESS_LABEL, DELETE_SUCCESS_LABEL } from '../data/constants';
import ConfigError from './ConfigError';

const errorToggleModalText = 'We were unable to toggle your config. Please try submitting again later or contact support for help.';
const errorDeleteModalText = 'We were unable to delete your config. Please try removing again later or contact support for help.';
const TOGGLE_ACTION = 'toggle';
const DELETE_ACTION = 'delete';

const ExistingLMSCardDeck = ({
  configData,
  editExistingConfig,
  enterpriseCustomerUuid,
  onClick,
}) => {
  const [errorIsOpen, openError, closeError] = useToggle(false);
  const [erroredConfig, setErroredConfig] = useState();
  const [errorCardActionType, setErrorCardActionType] = useState();
  const [errorModalText, setErrorModalText] = useState();

  const toggleConfig = async (id, channelType, toggle) => {
    const configOptions = {
      active: toggle,
      enterprise_customer: enterpriseCustomerUuid,
    };
    let err;
    try {
      await channelMapping[channelType].update(configOptions, id);
    } catch (error) {
      err = handleErrors(error);
    }
    if (err) {
      setErrorModalText(errorToggleModalText);
      openError();
      setErroredConfig({ id, channelType, toggle });
      setErrorCardActionType(TOGGLE_ACTION);
    } else {
      onClick(TOGGLE_SUCCESS_LABEL);
    }
  };

  const deleteConfig = async (id, channelType) => {
    let err;
    try {
      await channelMapping[channelType].delete(id);
    } catch (error) {
      err = handleErrors(error);
    }
    if (err) {
      setErrorModalText(errorDeleteModalText);
      openError();
      setErroredConfig({ id, channelType });
      setErrorCardActionType(DELETE_ACTION);
    } else {
      onClick(DELETE_SUCCESS_LABEL);
    }
  };

  // Map the existing config data to individual cards
  const listItems = configData.map((config) => (
    <Card isClickable tabIndex="0" className="p-2.5 existing-lms-card-width" key={config.channelCode + config.id}>
      <Card.Header
        className="lms-card-content"
        actions={(
          <Dropdown>
            <Dropdown.Toggle
              id="dropdown-toggle-with-iconbutton"
              data-testid={`existing-lms-config-card-dropdown-${config.id}`}
              as={IconButton}
              src={MoreVert}
              iconAs={Icon}
              variant="primary"
              alt="Actions dropdown"
            />
            <Dropdown.Menu>
              {isEmpty(config.isValid.missing) && !config.active && (
                <div className="d-flex">
                  <Dropdown.Item
                    onClick={() => toggleConfig(config.id, config.channelCode, true)}
                    data-testid="dropdown-enable-item"
                  >
                    <PlayCircleFilled /> Enable
                  </Dropdown.Item>
                </div>
              )}
              {isEmpty(config.isValid.missing) && config.active && (
                <div className="d-flex">
                  <Dropdown.Item
                    onClick={() => toggleConfig(config.id, config.channelCode, false)}
                    data-testid="dropdown-disable-item"
                  >
                    <RemoveCircle /> Disable
                  </Dropdown.Item>
                </div>
              )}
              {!isEmpty(config.isValid.missing) && !config.active && (
                <div className="d-flex">
                  <Dropdown.Item
                    onClick={() => deleteConfig(config.id, config.channelCode)}
                    data-testid="dropdown-delete-item"
                  >
                    <Delete /> Delete
                  </Dropdown.Item>
                </div>
              )}
              <Dropdown.Item
                onClick={() => editExistingConfig(config, config.channelCode)}
              >
                <Edit /> Edit
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}
        title={(
          <div className="ml-1 d-flex">
            <Image className="lms-icon mr-2" src={channelMapping[config.channelCode].icon} />
            <div className="lms-card-title-overflow">
              <span>
                {config.displayName}
              </span>
            </div>
          </div>
        )}
      />
      <Card.Body>
        <h3 className="mb-6 mt-4 ml-4">
          {!isEmpty(config.isValid.missing) && (
            <Badge variant="secondary">Incomplete</Badge>
          )}
          {isEmpty(config.isValid.missing) && config.active && (
            <Badge variant="success">Active</Badge>
          )}
          {isEmpty(config.isValid.missing) && !config.active && (
            <Badge variant="light">Inactive</Badge>
          )}
        </h3>
      </Card.Body>
    </Card>
  ));

  return (
    <span>
      <ConfigError
        isOpen={errorIsOpen}
        close={closeError}
        configTextOverride={errorModalText}
        submit={() => {
          if (errorCardActionType === DELETE_ACTION) {
            deleteConfig(erroredConfig.id, erroredConfig.channelType);
          } else if (errorCardActionType === TOGGLE_ACTION) {
            toggleConfig(erroredConfig.id, erroredConfig.channelType, erroredConfig.toggle);
          }
        }}
      />
      <CardGrid
        className="mr-6"
        columnSizes={{
          xs: 7,
          s: 7,
          m: 6,
          l: 5,
          xl: 4,
        }}
      >
        { listItems }
      </CardGrid>
    </span>
  );
};

ExistingLMSCardDeck.propTypes = {
  onClick: PropTypes.func.isRequired,
  enterpriseCustomerUuid: PropTypes.string.isRequired,
  configData: PropTypes.arrayOf(PropTypes.shape({
    active: PropTypes.bool,
    isValid: PropTypes.shape({
      missing: PropTypes.arrayOf(PropTypes.string),
    }),
    channelCode: PropTypes.string,
    id: PropTypes.number,
    displayName: PropTypes.string,
  })).isRequired,
  editExistingConfig: PropTypes.func.isRequired,
};

export default ExistingLMSCardDeck;
