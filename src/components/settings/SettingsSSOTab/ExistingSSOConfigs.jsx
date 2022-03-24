import { Hyperlink } from '@edx/paragon';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { SSOConfigContext } from './SSOConfigContext';

const ExistingSSOConfigs = ({ configs }) => {
  const { setProviderConfig } = useContext(SSOConfigContext);
  // useEffect(() => dispatchSsoState(clearProviderConfig()), []);
  return (
    <>
      { configs.map(config => (
        <div key={config.name} className="mx-4 my-4">
          <Hyperlink
            destination="https://abc"
            onClick={e => {
              e.preventDefault();
              setProviderConfig(config);
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
