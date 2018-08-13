import React from 'react';

import configuration from '../../config';

class LoginRedirect extends React.Component {
  componentDidMount(){
    window.location = configuration.LMS_BASE_URL + '/login?next=https%3A%2F%2Ftygra.sandbox.edx.org';
  }
  render(){
    return (<section>Logging in...</section>);
  }
}

export default LoginRedirect;
