import React from 'react';
import { Link } from 'react-router-dom';

class LinkWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.linkRef = null;
  }

  focus() {
    if (this.linkRef) {
      this.linkRef.focus();
    }
  }

  render() {
    return (
      <Link
        innerRef={(node) => { this.linkRef = node; }}
        {...this.props}
      />
    );
  }
}

export default LinkWrapper;
