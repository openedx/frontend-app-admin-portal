import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Item = forwardRef(({ id, children, ...props }, ref) => (
  <div {...props} ref={ref}>{children}</div>
));

Item.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default Item;
