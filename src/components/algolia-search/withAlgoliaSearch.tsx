import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import useAlgoliaSearch from './useAlgoliaSearch';

const withAlgoliaSearch = (WrappedComponent) => {
  const WithAlgoliaSearch = ({ enterpriseId, enterpriseFeatures, ...rest }) => {
    const algolia = useAlgoliaSearch({
      enterpriseId,
      enterpriseFeatures,
    });
    return <WrappedComponent algolia={algolia} enterpriseId={enterpriseId} {...rest} />;
  };
  WithAlgoliaSearch.propTypes = {
    enterpriseId: PropTypes.string.isRequired,
    enterpriseFeatures: PropTypes.shape({}).isRequired,
  };
  const mapStateToProps = (state) => ({
    enterpriseId: state.portalConfiguration.enterpriseId,
    enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
  });
  return connect(mapStateToProps)(WithAlgoliaSearch);
};

export default withAlgoliaSearch;
