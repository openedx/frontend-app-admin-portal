import { ReactNode } from 'react';

export interface TourStep {
  target: string;
  placement: 'right' | 'left' | 'top' | 'bottom';
  title?: ReactNode;
  body: ReactNode;
  // flow uuid is needed for the final completion step
  onAdvance?: (advanceEventName: string, flowUuid?: string) => void;
  onEnd?: (endEventName: string, flowUuid?: string) => void;
}

export interface TourFlow {
  [key: string]: TourStep;
}
