import React from 'react';
import { Helmet } from 'react-helmet';
import Proptypes from 'prop-types';

function ContentHighlightHelmet({ title }) {
  return (
    <Helmet>
      <title>{title}</title>
    </Helmet>
  );
}

ContentHighlightHelmet.propTypes = {
  title: Proptypes.string.isRequired,
};

export default ContentHighlightHelmet;
