import PropTypes from 'prop-types';
import {
  ActionRow,
  Badge,
  Card,
  Hyperlink,
} from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform/config';
import { connect } from 'react-redux';
import { createSAMLURLs } from '../../SamlProviderConfiguration/utils';

const SSOConfigCard = ({ config, enterpriseSlug, learnerPortalEnabled }) => {
  const { slug: idpSlug } = config;
  const configuration = getConfig();
  const { testLink } = createSAMLURLs({
    configuration,
    idpSlug,
    enterpriseSlug,
    learnerPortalEnabled,
  });

  return (
    <Card isClickable>
      <Card.Header
        size="sm"
        title={config.name}
        actions={(
          <ActionRow>
            <Hyperlink destination={testLink} target="_blank">Test</Hyperlink>
          </ActionRow>
        )}
      />
      <Card.Section>
        <Badge variant="warning">configured</Badge>{' '}
      </Card.Section>
    </Card>
  );
};

SSOConfigCard.propTypes = {
  config: PropTypes.shape({ name: PropTypes.string, slug: PropTypes.string }).isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  learnerPortalEnabled: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  learnerPortalEnabled: state.portalConfiguration.enableLearnerPortal,
});

export default connect(mapStateToProps)(SSOConfigCard);
