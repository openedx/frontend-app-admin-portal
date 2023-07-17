import React, {
  useState,
} from 'react';
import { ActionRow } from '@edx/paragon';
import ZeroStateCard from './ZeroStateCard';
import SuccessPage from './SuccessPage';
import { HELP_CENTER_API_GUIDE } from '../data/constants';
import HelpCenterButton from './HelpCenterButton';

const SettingsApiCredentialsTab = () => {
  const [displaySuccessPage, setDisplaySuccessPage] = useState(false);
  const handleonClickStateChange = (state) => {
    setDisplaySuccessPage(state);
  };

  return (
    <div>
      <ActionRow>
        <h2 className="py-2">API credentials
        </h2>
        <ActionRow.Spacer />
        <HelpCenterButton url={HELP_CENTER_API_GUIDE}>
          Help Center: EdX Enterprise API Guide
        </HelpCenterButton>
      </ActionRow>
      <div>
        {displaySuccessPage ? (<SuccessPage />) : (<ZeroStateCard onClickStateChange={handleonClickStateChange} />)}
      </div>
      <div />
    </div>
  );
};

export default SettingsApiCredentialsTab;
