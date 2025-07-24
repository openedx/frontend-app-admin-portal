import React, { FC } from 'react';
import {
  Icon, SelectableBox,
} from '@openedx/paragon';
import { CheckCircle, CheckCircleOutline } from '@openedx/paragon/icons';

interface StepProps {
  completed?: boolean,
  icon: React.ComponentType;
  targetId: string;
  timeEstimate: number;
  title: string;
  onTourSelect?: (targetId: string) => void;
}

export const Step: FC<StepProps> = ({
  completed,
  icon,
  targetId,
  timeEstimate,
  title,
  onTourSelect,
}) => (
  <SelectableBox
    className="p-3"
    showActiveBoxState={false}
    style={{ outline: 'None' }}
    onClick={() => onTourSelect?.(targetId)}
  >
    <div className="d-flex align-items-center justify-content-between w-100">
      <div className="d-flex align-items-center">
        {completed ? (
          <Icon className="mr-3" src={CheckCircle} />
        ) : (
          <Icon className="mr-3 text-gray-400" src={CheckCircleOutline} />
        )}
        <Icon src={icon} className="mr-1" />
        <p className="mb-0 small font-weight-bold">{title}</p>
      </div>
      <span className="text-muted small">({timeEstimate} min)</span>
    </div>
  </SelectableBox>
);
