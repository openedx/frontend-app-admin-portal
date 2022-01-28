import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Image } from '@edx/paragon';
import {
  BLACKBOARD_ICON,
  CANVAS_ICON,
  CORNERSTONE_ICON,
  DEGREED_ICON,
  MOODLE_ICON,
  SAP_ICON,
} from './constants';

function getLMSIcon(LMStype) {
  switch (LMStype) {
    case 'Blackboard':
      return BLACKBOARD_ICON;
    case 'Canvas':
      return CANVAS_ICON;
    case 'Cornerstone':
      return CORNERSTONE_ICON;
    case 'Degreed':
      return DEGREED_ICON;
    case 'Moodle':
      return MOODLE_ICON;
    default:
      return SAP_ICON;
  }
}

const LMSCard = ({ LMStype }) => (
  <Card style={{ width: '26rem' }}>
    <Card.Body>
      <h3>
        <Image className="lms-icon" src={getLMSIcon(LMStype)} />
        <span className="ml-2">{LMStype}</span>
      </h3>
      <p className="my-3">Click &quot;Configure&quot; to get started</p>
      <Button className="float-right" disabled>Configure</Button>
    </Card.Body>
  </Card>
);

LMSCard.propTypes = {
  LMStype: PropTypes.string.isRequired,
};
export default LMSCard;
