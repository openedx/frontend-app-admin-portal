import React from 'react';
import PropTypes from 'prop-types';
import { Card, Image, Stack } from '@edx/paragon';
import { channelMapping } from '../../../utils';

function LMSCard({ LMSType, onClick, disabled }) {
  return (
    <Card
      isClickable={!disabled}
      className={`pb-4 ${disabled ? 'opacity-50' : ''}`}
      onClick={() => !disabled && onClick(LMSType)}
    >
      <Card.Header
        title={(
          <Stack direction="horizontal" gap={2} className="justify-content-center">
            <Image className="lms-icon" src={channelMapping[LMSType].icon} />
            <span>{channelMapping[LMSType].displayName}</span>
          </Stack>
      )}
      />
    </Card>
  );
}

LMSCard.propTypes = {
  LMSType: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
};
export default LMSCard;
