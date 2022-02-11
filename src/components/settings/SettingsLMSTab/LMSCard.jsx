import React from 'react';
import PropTypes from 'prop-types';
import { Card, Image } from '@edx/paragon';
import { getLMSIcon } from '../../../utils';

const LMSCard = ({ LMSType, onClick }) => (
  <Card isClickable className="p-2.5" style={{ width: '22rem' }} onClick={() => onClick(LMSType)}>
    <Card.Body>
      <h3 className="text-center">
        <Image className="lms-icon" src={getLMSIcon(LMSType)} />
        <span className="ml-2">{LMSType}</span>
      </h3>
    </Card.Body>
  </Card>
);

LMSCard.propTypes = {
  LMSType: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
export default LMSCard;
