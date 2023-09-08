import PropTypes from 'prop-types';

export const dataPropType = PropTypes.shape({
  name: PropTypes.string,
  redirect_uris: PropTypes.string,
  client_id: PropTypes.string,
  client_secret: PropTypes.string,
  api_client_documentation: PropTypes.string,
  updated: PropTypes.bool,
});

export const credentialErrorMessage = 'Something went wrong while '
+ 'generating your credentials. Please try again. '
+ 'If the issue continues, contact Enterprise Customer Support.';
