import React, { FC } from 'react';
import {
  Icon, SelectableBox
} from '@openedx/paragon';
import { CheckCircleOutline } from '@openedx/paragon/icons';

interface StepProps {
  icon: string;
  title: string;
  timeEstimate: string;
  targetId: string;
  onTourSelect: (targetId: string) => void;
}

export const Step: FC<StepProps> = ({
  icon,
  title,
  timeEstimate,
  targetId,
  onTourSelect
}) => (
    <SelectableBox
      className="p-3"
      showActiveBoxState={false}
      style={{"outline": "None"}}
      onClick={() => onTourSelect(targetId)}
    >
      <div className="d-flex align-items-center justify-content-between w-100">
        <div className="d-flex align-items-center">
          <Icon className="mr-3 text-gray-400" src={CheckCircleOutline} />
          <Icon src={icon} className="mr-1" />
          <p className="mb-0">{title}</p>
        </div>
        <span className="text-muted">{timeEstimate}</span>
      </div>
    </SelectableBox>
); 
