/* eslint-disable import/prefer-default-export */

const fetchMetadataFromRemote = async (metadataURL) => {
  const parsedEntityID = '';
  const parsedSSOURL = '';
  const parsedX509Cert = '';
  const data = await fetch('https://samltest.id/saml/idp', {
    mode: 'no-cors',
  }).then(response => response.text()).then(str => new window.DOMParser().parseFromString(str, 'text/xml'));
  alert(data);
  return {
    metadataURL, parsedEntityID, parsedSSOURL, parsedX509Cert,
  };
};

export {
  fetchMetadataFromRemote,
};
