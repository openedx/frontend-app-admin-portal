import React from 'react';
import { Helmet } from 'react-helmet';
import { Container } from '@openedx/paragon';

import Hero from '../Hero';
import CodeManagementRoutes from './CodeManagementRoutes';

const CodeManagement = () => (
  <>
    <Helmet>
      <title>Code Management</title>
    </Helmet>
    <main role="main">
      <Hero title="Code Management" />
      <Container className="py-3" fluid>
        <CodeManagementRoutes />
      </Container>
    </main>
  </>
);

export default CodeManagement;
