import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Image } from '@edx/paragon';
import { getLMSIcon } from '../../../utils';

const cardText = 'Click "Configure" to get started';

const LMSCard = ({ LMStype, onClick }) => (
  <Card style={{ width: '26rem' }}>
    <Card.Body>
      <h3>
        <Image className="lms-icon" src={getLMSIcon(LMStype)} />
        <span className="ml-2">{LMStype}</span>
      </h3>
      <p className="my-3">{cardText}</p>
      <Button onClick={() => onClick(LMStype)} className="float-right">Configure</Button>
    </Card.Body>
  </Card>
);

LMSCard.propTypes = {
  LMStype: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
export default LMSCard;
