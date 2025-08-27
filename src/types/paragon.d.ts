import { AlertHeadingProps as OriginalAlertHeadingProps } from '@openedx/paragon';

declare module '@openedx/paragon' {
  // Extend the AlertHeadingProps interface to include className
  export interface AlertHeadingProps extends OriginalAlertHeadingProps {
    className?: string;
  }
}
