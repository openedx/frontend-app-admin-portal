import React from 'react';
import PropTypes from 'prop-types';
import qs from 'query-string';
import { Redirect } from 'react-router-dom';
import { Container, Row, Col } from '@edx/paragon';

import LoadingMessage from '../LoadingMessage';

const AdminRegisterPage = (props) => {
  const {
    match: { params },
    isAuthenticated,
  } = props;
  const { enterpriseSlug } = params;

  if (isAuthenticated) {
    return <Redirect to={`/${enterpriseSlug}/admin/learners`} />;
  }

  const options = {
    enterprise_slug: enterpriseSlug,
    next: global.location,
  };
  const proxyLoginUrl = `${process.env.LMS_BASE_URL}/enterprise/proxy-login/?${qs.stringify(options)}`;
  global.location.href = proxyLoginUrl;

  return (
    <Container fluid>
      <Row className="my-3">
        <Col>
          <LoadingMessage className="admin-register" />
        </Col>
      </Row>
    </Container>
  );
};

AdminRegisterPage.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      enterpriseSlug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default AdminRegisterPage;
