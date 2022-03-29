import { Hyperlink } from '@edx/paragon';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { SSOConfigContext } from './SSOConfigContext';

const ExistingSSOConfigs = ({ configs }) => {
  const { setProviderConfig, setCurrentStep } = useContext(SSOConfigContext);
  return (
    <>
      { configs.map(config => (
        <div key={config.name} className="mx-4 my-4">
          <Hyperlink
            destination="https://abc"
            onClick={e => {
              e.preventDefault();
              setProviderConfig(config);
              setCurrentStep('idp'); // reset to first stepper screen
            }}
          >{config.name}
          </Hyperlink>
        </div>
      ))}
    </>
  );
};

ExistingSSOConfigs.propTypes = {
  configs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default ExistingSSOConfigs;
