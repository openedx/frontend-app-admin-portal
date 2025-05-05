import React from 'react';
import { connect } from 'react-redux';
import { Collapsible } from '@openedx/paragon';
import Color from 'color';

const FloatingCollapsible = ({ enterpriseBranding }) => {
  // Use the bottom-right-fixed class that's already defined in index.scss
  const collapsibleStyle = enterpriseBranding?.tertiary_color ? {
    backgroundColor: enterpriseBranding.tertiary_color,
    color: enterpriseBranding.tertiary_color && Color(enterpriseBranding.tertiary_color).isDark() ? '#FFFFFF' : '#454545',
  } : {};

  return (
    <div className="bottom-right-fixed">
      <Collapsible
        styling="card"
        title="Product Tours Checklist"
        style={collapsibleStyle}
      >
        <div>Product Tours Checklist</div>
      </Collapsible>
    </div>
  );
};

const mapStateToProps = state => ({
  enterpriseBranding: state.portalConfiguration.enterpriseBranding,
});

export default connect(mapStateToProps)(FloatingCollapsible);
