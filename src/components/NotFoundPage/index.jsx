import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { GlobalContext } from '../GlobalContextProvider';

export const NotFound = () => (
  <>
    <Helmet>
      <title>Page Not Found</title>
    </Helmet>
    <div className="text-center py-5">
      <h1>404</h1>
      <p className="lead">
        <FormattedMessage
          id="admin.portal.not.found.page.message"
          defaultMessage="Oops, sorry we can't find that page!"
          description="The message displayed on the 404 page"
        />
      </p>
      <p>
        <FormattedMessage
          id="admin.portal.not.found.page.message2"
          defaultMessage="Either something went wrong or the page doesn't exist anymore."
          description="The message displayed on the 404 page"
        />
      </p>
    </div>
  </>
);

const NotFoundPage = () => {
  const { minHeight } = useContext(GlobalContext);

  return (
    <main role="main">
      <div className="container-fluid" style={{ minHeight }}>
        <NotFound />
      </div>
    </main>
  );
};

export default NotFoundPage;
