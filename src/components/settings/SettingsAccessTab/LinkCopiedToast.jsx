import React from 'react';
import { Toast } from '@edx/paragon';

function LinkCopiedToast(props) {
  return (
    <Toast {...props}>
      Link copied to clipboard
    </Toast>
  );
}

export default LinkCopiedToast;
