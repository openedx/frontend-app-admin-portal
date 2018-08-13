import React from 'react';

import configuration from '../../config';

class LogoutRedirect extends React.Component {
  componentDidMount(){
    window.location = configuration.LMS_BASE_URL + '/logout?next=https%3A%2F%2Ftygra.sandbox.edx.org';
  }
  render(){
    return (<section>Logging out...</section>);
  }
}

export default LogoutRedirect;
