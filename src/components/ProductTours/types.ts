import { ReactNode } from 'react';

export interface TourStep {
  target: string;
  placement: 'right' | 'left' | 'top' | 'bottom';
  title?: ReactNode;
  body: ReactNode;
  onAdvance: () => void;
}

export interface TourFlow {
  [key: string]: TourStep;
}
