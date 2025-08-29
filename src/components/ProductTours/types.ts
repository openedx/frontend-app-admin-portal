import { ReactNode } from 'react';

export interface TourStep {
  target: string;
  placement: 'right' | 'left' | 'top' | 'bottom';
  title?: ReactNode;
  body: ReactNode;
  onAdvance?: (advanceEventName: string) => void;
  onBack?: (backEventName: string) => void;
  onEnd?: (endEventName: string, flowUuid?: string) => void;
}

export interface TourFlow {
  [key: string]: TourStep;
}
