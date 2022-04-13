import PropTypes from 'prop-types';
import { useState, useContext } from 'react';
import { connect } from 'react-redux';
import {
  Badge, Button, Card, CardGrid, Dropdown, Hyperlink, Icon, IconButton, useToggle,
} from '@edx/paragon';
import {
  Add, Delete, Edit, MoreVert, PlayCircleFilled, RemoveCircle,
} from '@edx/paragon/icons';
import { SSOConfigContext } from './SSOConfigContext';
import ConfigError from '../ConfigError';
import handleErrors from '../utils';
import LmsApiService from '../../../data/services/LmsApiService';

const errorToggleModalText = 'We were unable to toggle your configuration. Please try submitting again or contact support for help.';
const errorDeleteModalText = 'We were unable to delete your configuration. Please try removing again or contact support for help.';

const ExistingSSOConfigs = ({
  configs, refreshBool, setRefreshBool, enterpriseId,
}) => {
  const [errorIsOpen, openError, closeError] = useToggle(false);
  const [errorModalText, setErrorModalText] = useState();
  const { setProviderConfig, setCurrentStep } = useContext(SSOConfigContext);

  const editExistingConfig = (config) => {
    setProviderConfig(config);
    // reset to first stepper screen
    setCurrentStep('idp');
  };

  const deleteConfig = async (id) => {
    let err;
    try {
      await (LmsApiService.deleteProviderConfig(id, enterpriseId));
    } catch (error) {
      err = handleErrors(error);
    }
    if (err) {
      setErrorModalText(errorDeleteModalText);
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
    <>
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
              key={config.backend_name + config.id}
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
                            onClick={() => deleteConfig(config.id)}
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
        <Button
          variant="primary"
          className="mr-6"
          iconBefore={Add}
          size="lg"
          block
        >
          <Hyperlink
            className="button-link"
            destination="https://abc"
            onClick={e => {
              e.preventDefault();
              setProviderConfig();
              setCurrentStep('idp'); // reset to first stepper screen
            }}
          >New configuration
          </Hyperlink>
        </Button>
      </span>
    </>
  );
};

ExistingSSOConfigs.propTypes = {
  configs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  refreshBool: PropTypes.bool.isRequired,
  setRefreshBool: PropTypes.func.isRequired,
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(ExistingSSOConfigs);
