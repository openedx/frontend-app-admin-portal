import React from 'react';
import { Helmet } from 'react-helmet';
import { Container } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import Hero from '../Hero';
import CodeManagementRoutes from './CodeManagementRoutes';

const CodeManagement = () => {
  const intl = useIntl();
  const pageTitle = intl.formatMessage({
    id: 'admin.portal.code.management.page.title',
    defaultMessage: 'Code Management',
    description: 'Title for the Code Management page.',
  });

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <main role="main">
        <Hero title={pageTitle} />
        <Container className="py-3" fluid>
          <CodeManagementRoutes />
        </Container>
      </main>
    </>
  );
};

export default CodeManagement;
