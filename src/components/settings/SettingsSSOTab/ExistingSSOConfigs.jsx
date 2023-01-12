import PropTypes from 'prop-types';
import { useState, useContext } from 'react';
import { connect } from 'react-redux';
import {
  Badge, Card, CardGrid, Dropdown, Icon, IconButton, useToggle,
} from '@edx/paragon';
import {
  Delete, Edit, MoreVert, PlayCircleFilled, RemoveCircle,
} from '@edx/paragon/icons';
import { SSOConfigContext } from './SSOConfigContext';
import ConfigError from '../ConfigError';
import handleErrors from '../utils';
import LmsApiService from '../../../data/services/LmsApiService';
import { errorToggleModalText, errorDeleteConfigModalText, errorDeleteDataModalText } from '../data/constants';

const ExistingSSOConfigs = ({
  configs, refreshBool, setRefreshBool, enterpriseId, providerData,
}) => {
  const [errorIsOpen, openError, closeError] = useToggle(false);
  const [errorModalText, setErrorModalText] = useState();
  const { setProviderConfig, setCurrentStep } = useContext(SSOConfigContext);

  const editExistingConfig = (config) => {
    setProviderConfig(config);
    // reset to first stepper screen
    setCurrentStep('idp');
  };

  const deleteProviderData = async (pdid) => {
    let err;
    try {
      await (LmsApiService.deleteProviderData(pdid, enterpriseId));
    } catch (error) {
      err = handleErrors(error);
    }
    if (err) {
      setErrorModalText(errorDeleteDataModalText);
      openError();
    } else {
      // changing this variable triggers the refresh
      setRefreshBool(!refreshBool);
    }
  };

  const deleteConfig = async (id) => {
    let err;
    try {
      await (LmsApiService.deleteProviderConfig(id, enterpriseId));
    } catch (error) {
      err = handleErrors(error);
    }
    if (err) {
      setErrorModalText(errorDeleteConfigModalText);
      openError();
    } else {
      // changing this variable triggers the refresh
      setRefreshBool(!refreshBool);
    }
  };

  const toggleConfig = async (id, toggle) => {
    const data = new FormData();
    data.append('enabled', toggle);
    data.append('enterprise_customer_uuid', enterpriseId);
    let err;
    try {
      await LmsApiService.updateProviderConfig(data, id);
    } catch (error) {
      err = handleErrors(error);
    }
    if (err) {
      setErrorModalText(errorToggleModalText);
      openError();
    } else {
      // changing this variable triggers the refresh
      setRefreshBool(!refreshBool);
    }
  };

  return (
    <span>
      <ConfigError
        isOpen={errorIsOpen}
        close={closeError}
        configTextOverride={errorModalText}
      />
      <p>
        Enabling single sign-on for your edX account allows quick access to
        your organization’s learning catalog
      </p>
      <h4 className="mt-5 mb-4">Existing configurations</h4>
      <CardGrid
        className="mb-3 mr-3"
        columnSizes={{
          xs: 6,
          s: 5,
          m: 4,
          l: 4,
          xl: 3,
        }}
      >
        {configs.map((config) => (
          <Card
            className="pb-4"
            key={config.name + config.id}
          >
            <Card.Header
              title={(
                <div className="justify-content-center">
                  {config.display_name}
                </div>
                )}
              actions={(
                <Dropdown>
                  <Dropdown.Toggle
                    id="dropdown-toggle-with-iconbutton"
                    data-testid={`existing-sso-config-card-dropdown-${config.id}`}
                    as={IconButton}
                    src={MoreVert}
                    iconAs={Icon}
                    variant="primary"
                    alt="Actions dropdown"
                  />
                  <Dropdown.Menu>
                    {(config.was_valid_at && !config.enabled) && (
                    <Dropdown.Item
                      onClick={() => toggleConfig(config.id, true)}
                    >
                      <PlayCircleFilled /> Enable
                    </Dropdown.Item>
                    )}
                    {(config.was_valid_at && config.enabled) && (
                    <Dropdown.Item
                      onClick={() => toggleConfig(config.id, false)}
                    >
                      <RemoveCircle /> Disable
                    </Dropdown.Item>
                    )}
                    {!config.was_valid_at && (
                    <div className="d-flex">
                      <Dropdown.Item
                        onClick={() => {
                          // loop through provider data and delete each one
                          providerData.forEach((data) => {
                            // double check that we're deleting provider data for the current config
                            if (data.entity_id === config.entity_id) {
                              deleteProviderData(data.id);
                            }
                          });
                          deleteConfig(config.id);
                        }}
                        data-testid="dropdown-delete-item"
                      >
                        <Delete /> Delete
                      </Dropdown.Item>
                    </div>
                    )}
                    <Dropdown.Item
                      onClick={() => editExistingConfig(config)}
                    >
                      <Edit /> Edit
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                )}
              subtitle={(
                <span>
                  {!config.was_valid_at && <Badge variant="secondary">Incomplete</Badge>}
                  {(config.was_valid_at && config.enabled) && (<Badge variant="success">Active</Badge>)}
                  {(config.was_valid_at && !config.enabled) && (<Badge variant="light">Inactive</Badge>)}
                </span>
                )}
            />
          </Card>
        ))}
      </CardGrid>
    </span>
  );
};

ExistingSSOConfigs.propTypes = {
  configs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  providerData: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  refreshBool: PropTypes.bool.isRequired,
  setRefreshBool: PropTypes.func.isRequired,
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(ExistingSSOConfigs);
