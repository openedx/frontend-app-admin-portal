import React, { useContext } from 'react';
import {
  Card, Badge, Button, Dropdown, IconButton, Icon, Tooltip, OverlayTrigger,
} from '@openedx/paragon';
import PropTypes from 'prop-types';
import {
  Key, KeyOff, MoreVert,
} from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { SSOConfigContext } from './SSOConfigContext';
import LmsApiService from '../../../data/services/LmsApiService';

const NewSSOConfigCard = ({
  config,
  setLoading,
  setRefreshBool,
  refreshBool,
  setUpdateError,
  setIsStepperOpen,
}) => {
  const VALIDATED = config.validated_at;
  const ENABLED = config.active;
  const CONFIGURED = config.configured_at && (config.submitted_at < config.configured_at) && (
    !config.errored_at || (config.errored_at && config.configured_at > config.errored_at)
  );
  const SUBMITTED = config.submitted_at && (
    !config.errored_at || (config.errored_at && config.submitted_at > config.errored_at)
  );
  const ERRORED = config.errored_at;
  const TIMED_OUT = SUBMITTED && !CONFIGURED && !config.is_pending_configuration;

  const { setProviderConfig } = useContext(SSOConfigContext);
  const intl = useIntl();

  const onConfigureClick = (selectedConfig) => {
    setProviderConfig(selectedConfig);
    setIsStepperOpen(true);
  };

  const convertToReadableDate = (date) => {
    const dateObj = new Date(date);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  };

  const onDeleteClick = (deletedConfig) => {
    setLoading(true);
    LmsApiService.deleteEnterpriseSsoOrchestrationRecord(deletedConfig.uuid).then(() => {
      setRefreshBool(!refreshBool);
    }).catch(() => {
      setUpdateError({ config: config.uuid, action: 'delete' });
      setLoading(false);
    });
  };

  const onDisableClick = (disabledConfig) => {
    setLoading(true);
    LmsApiService.updateEnterpriseSsoOrchestrationRecord({ active: false }, disabledConfig.uuid).then(() => {
      setRefreshBool(!refreshBool);
    }).catch(() => {
      setUpdateError({ config: config.uuid, action: 'disable' });
      setLoading(false);
    });
  };

  const onEnableClick = (enabledConfig) => {
    setLoading(true);
    LmsApiService.updateEnterpriseSsoOrchestrationRecord({ active: true }, enabledConfig.uuid).then(() => {
      setRefreshBool(!refreshBool);
    }).catch(() => {
      setUpdateError({ config: config.uuid, action: 'enable' });
      setLoading(false);
    });
  };

  const renderKeyOffIcon = (dataTestId) => (
    <KeyOff
      className="bg-danger-500 rounded-circle text-white mr-2 p-1"
      data-testid={dataTestId}
    />
  );

  const renderCardStatusIcon = () => (
    <>
      {VALIDATED && ENABLED && CONFIGURED && (
        <OverlayTrigger
          id="tooltip-enabled"
          placement="top"
          overlay={(
            <Tooltip id="enabled-tooltip" variant="light">
              <FormattedMessage
                id="adminPortal.settings.sso.enabled.tooltip"
                defaultMessage="The integration is verified and working"
                description="Tooltip message for enabled SSO configuration"
              />
            </Tooltip>
          )}
        >
          <Key
            className="bg-success-500 rounded-circle text-white mr-2 p-1"
            data-testid="existing-sso-config-card-enabled-icon"
          />
        </OverlayTrigger>
      )}
      {!VALIDATED && CONFIGURED && (
        <OverlayTrigger
          id="tooltip-not-validated"
          placement="top"
          overlay={(
            <Tooltip id="not-validated-tooltip" variant="light">
              <FormattedMessage
                id="adminPortal.settings.sso.notValidated.tooltip"
                defaultMessage="This integration has not been validated. Please follow the testing instructions to validate your integration."
                description="Tooltip message for not validated SSO configuration"
              />
            </Tooltip>
          )}
        >
          {renderKeyOffIcon('existing-sso-config-card-off-not-validated-icon')}
        </OverlayTrigger>
      )}
      {(!ENABLED || !CONFIGURED) && VALIDATED && (
        <>
          {renderKeyOffIcon('existing-sso-config-card-off-icon')}
        </>
      )}
    </>
  );

  const renderCardBadge = () => (
    <>
      {(!VALIDATED && SUBMITTED) && (
        <Badge
          className="ml-4 p-2 font-weight-light"
          variant="light"
          data-testid="existing-sso-config-card-badge-in-progress"
        >
          <FormattedMessage
            id="adminPortal.settings.sso.inProgress"
            defaultMessage="In-progress"
            description="Badge for in-progress SSO configuration"
          />
        </Badge>
      )}
      {VALIDATED && CONFIGURED && !ENABLED && (
        <Badge
          className="ml-4 p-2 font-weight-light"
          variant="light"
          data-testid="existing-sso-config-card-badge-disabled"
        >
          <FormattedMessage
            id="adminPortal.settings.sso.disabled"
            defaultMessage="Disabled"
            description="Badge for disabled SSO configuration"
          />
        </Badge>
      )}
    </>
  );

  const renderCardButton = () => (
    <>
      {((!VALIDATED && CONFIGURED) || ((TIMED_OUT) || (ERRORED))) && (
        <Button
          className="float-right"
          onClick={() => onConfigureClick(config)}
          variant="outline-primary"
          data-testid="existing-sso-config-card-configure-button"
        >
          <FormattedMessage
            id="adminPortal.settings.sso.configure.button"
            defaultMessage="Configure"
            description="Button to configure SSO configuration"
          />
        </Button>
      )}
      {VALIDATED && CONFIGURED && !ENABLED && (
        <Button
          className="float-right"
          onClick={() => onEnableClick(config)}
          variant="outline-primary"
          data-testid="existing-sso-config-card-enable-button"
        >
          <FormattedMessage
            id="adminPortal.settings.sso.enable"
            defaultMessage="Enable"
            description="Button to enable SSO configuration"
          />
        </Button>
      )}
    </>
  );

  return (
    <Card
      key={config.display_name + config.uuid}
      className={`pb-5 ${config.active ? '' : 'mb-4'}`}
    >
      <Card.Header
        title={(
          <div className="ml-3">
            {renderCardStatusIcon()}
            {config.display_name}
            {renderCardBadge()}
            {renderCardButton()}
          </div>
        )}
        subtitle={(
          <div className="ml-3 mt-2.5">
            <FormattedMessage
              id="adminPortal.settings.sso.lastModified"
              defaultMessage="Last modified {date}"
              description="Last modified date for SSO configuration"
              values={{ date: convertToReadableDate(config.modified) }}
            />
          </div>
        )}
        actions={((!SUBMITTED || CONFIGURED) || (ERRORED || TIMED_OUT)) && (
          <Dropdown className="mt-3">
            <Dropdown.Toggle
              id="dropdown-toggle-with-iconbutton"
              data-testid="existing-sso-config-card-dropdown"
              as={IconButton}
              src={MoreVert}
              iconAs={Icon}
              variant="primary"
              alt={intl.formatMessage({
                id: 'adminPortal.settings.sso.actionsDropdown',
                defaultMessage: 'Actions dropdown',
                description: 'Alt text for actions dropdown',

              })}
            />
            <Dropdown.Menu>
              {VALIDATED && (
                <Dropdown.Item
                  data-testid="existing-sso-config-configure-dropdown"
                  onClick={() => onConfigureClick(config)}
                >
                  <FormattedMessage
                    id="adminPortal.settings.sso.configure.dropdownItem"
                    defaultMessage="Configure"
                    description="Dropdown item to configure SSO configuration"
                  />
                </Dropdown.Item>
              )}
              {((!ENABLED || !VALIDATED) || (ERRORED || TIMED_OUT)) && (
                <Dropdown.Item
                  data-testid="existing-sso-config-delete-dropdown"
                  onClick={() => onDeleteClick(config)}
                >
                  <FormattedMessage
                    id="adminPortal.settings.sso.delete"
                    defaultMessage="Delete"
                    description="Dropdown item to delete SSO configuration"
                  />
                </Dropdown.Item>
              )}
              {ENABLED && VALIDATED && (
                <Dropdown.Item
                  data-testid="existing-sso-config-disable-dropdown"
                  onClick={() => onDisableClick(config)}
                >
                  <FormattedMessage
                    id="adminPortal.settings.sso.disable"
                    defaultMessage="Disable"
                    description="Dropdown item to disable SSO configuration"
                  />
                </Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown>
        )}
      />
    </Card>
  );
};

NewSSOConfigCard.propTypes = {
  config: PropTypes.shape({
    uuid: PropTypes.string,
    display_name: PropTypes.string,
    active: PropTypes.bool,
    modified: PropTypes.string,
    validated_at: PropTypes.string,
    configured_at: PropTypes.string,
    submitted_at: PropTypes.string,
    errored_at: PropTypes.string,
    is_pending_configuration: PropTypes.bool,
  }).isRequired,
  setLoading: PropTypes.func.isRequired,
  setRefreshBool: PropTypes.func.isRequired,
  refreshBool: PropTypes.bool.isRequired,
  setUpdateError: PropTypes.func.isRequired,
  setIsStepperOpen: PropTypes.func.isRequired,
};

export default NewSSOConfigCard;
