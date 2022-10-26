import React from 'react';
import PropTypes from 'prop-types';
import {
  Badge, Button, Card, Dropdown, Icon, IconButton, Image, OverlayTrigger, Popover,
} from '@edx/paragon';
import { MoreVert } from '@edx/paragon/icons';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { features } from '../../../config';
import { channelMapping } from '../../../utils';
import handleErrors from '../utils';
import { TOGGLE_SUCCESS_LABEL, DELETE_SUCCESS_LABEL } from '../data/constants';

const errorToggleModalText = 'We were unable to toggle your configuration. Please try submitting again or contact support for help.';
const errorDeleteModalText = 'We were unable to delete your configuration. Please try removing again or contact support for help.';
const INCOMPLETE = 'incomplete';
const ACTIVE = 'active';
const INACTIVE = 'inactive';

function ExistingCard({
  config,
  editExistingConfig,
  enterpriseCustomerUuid,
  onClick,
  openError,
  openReport,
  setReportConfig,
  setErrorModalText,
  getStatus,
}) {
  const isEdxStaff = getAuthenticatedUser().administrator;

  const openModalButton = () => {
    setReportConfig(config);
    openReport();
  };

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
    } else {
      onClick(DELETE_SUCCESS_LABEL);
    }
  };

  const numIncorrectFields = (fields) => {
    const { missing } = fields[0];
    const { incorrect } = fields[1];
    let totalNum = 0;
    if (missing.includes('refresh_token')) {
      totalNum = -1;
    }
    totalNum = totalNum + missing.length + incorrect.length;
    let strongText;
    if (totalNum === 0) {
      return <span>Please <strong>authorize your LMS</strong> to submit this form.</span>;
    }
    if (totalNum === 1) {
      strongText = `${totalNum} field`;
    } else { strongText = `${totalNum} fields`; }
    return <span>Amend <strong>{strongText}</strong> to submit this form.</span>;
  };

  const getCardButton = () => {
    switch (getStatus(config)) {
      case ACTIVE:
        if (isEdxStaff && features.FEATURE_INTEGRATION_REPORTING) {
          return <Button variant="outline-primary" onClick={() => openModalButton(config)}>View sync history</Button>;
        }
        return null;
      case INCOMPLETE:
        return <Button variant="outline-primary" onClick={() => editExistingConfig(config, config.channelCode)}>Configure</Button>;
      case INACTIVE:
        return <Button variant="outline-primary" onClick={() => toggleConfig(config.id, config.channelCode, true)}>Enable</Button>;
      default:
        return null;
    }
  };

  return (
    <Card
      tabIndex="0"
      className="p-3 existing-lms-card"
      key={config.channelCode + config.id}
    >
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
              {getStatus(config) === INACTIVE && (
                // eslint-disable-next-line react/jsx-no-useless-fragment
                <>
                  {isEdxStaff && features.FEATURE_INTEGRATION_REPORTING && (
                  <div className="d-flex">
                    <Dropdown.Item
                      onClick={() => openModalButton(config)}
                      data-testid="dropdown-sync-history-item"
                    >
                      View sync history
                    </Dropdown.Item>
                  </div>
                  )}
                </>
              )}
              {getStatus(config) === ACTIVE && (
              <div className="d-flex">
                <Dropdown.Item
                  onClick={() => toggleConfig(config.id, config.channelCode, false)}
                  data-testid="dropdown-disable-item"
                >
                  Disable
                </Dropdown.Item>
              </div>
              )}
              {getStatus(config) === INCOMPLETE && (
              <div className="d-flex">
                <Dropdown.Item
                  onClick={() => deleteConfig(config.id, config.channelCode)}
                  data-testid="dropdown-delete-item"
                >
                  Delete
                </Dropdown.Item>
              </div>
              )}
              {getStatus(config) !== INCOMPLETE && (
              <div className="d-flex">
                <Dropdown.Item
                  onClick={() => editExistingConfig(config, config.channelCode)}
                >
                  Configure
                </Dropdown.Item>
              </div>
              )}
            </Dropdown.Menu>
          </Dropdown>
      )}
        title={(
          <div className="ml-1 d-flex">
            <Image
              className="lms-icon mr-2"
              src={channelMapping[config.channelCode].icon}
            />
            <div className="lms-card-title-overflow">
              <span>{config.displayName}</span>
            </div>
            <h3 className="ml-2">
              {/* Only incomplete badges will show hover */}
              <OverlayTrigger
                trigger={['hover', 'focus']}
                key={`${config.channelCode + config.id }hover`}
                placement="top"
                overlay={(
                  <Popover className="popover-positioned-top" id="inc-popover">
                    <Popover.Title as="h5">Next Steps</Popover.Title>
                    <Popover.Content>
                      {numIncorrectFields(config.isValid)}
                    </Popover.Content>
                  </Popover>
          )}
              >
                <span>
                  {getStatus(config) === INCOMPLETE && (
                  <Badge variant="light">Incomplete</Badge>
                  )}
                </span>
              </OverlayTrigger>
              {getStatus(config) === INACTIVE && (
              <Badge variant="light">Disabled</Badge>
              )}
            </h3>
          </div>
      )}
      />
      <Card.Footer className="pt-2 pb-2 justify-content-end">
        {getCardButton()}
      </Card.Footer>
    </Card>
  );
}

ExistingCard.propTypes = {
  config: PropTypes.shape({
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
  }).isRequired,
  editExistingConfig: PropTypes.func.isRequired,
  enterpriseCustomerUuid: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  openError: PropTypes.func.isRequired,
  openReport: PropTypes.func.isRequired,
  setReportConfig: PropTypes.func.isRequired,
  setErrorModalText: PropTypes.func.isRequired,
  getStatus: PropTypes.func.isRequired,
};

export default ExistingCard;
