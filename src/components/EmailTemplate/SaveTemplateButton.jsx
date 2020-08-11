import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { StatefulButton, Icon } from '@edx/paragon';
import classNames from 'classnames';

import { EmailTemplateContext } from './EmailTemplateData';


const SUBMIT_STATES = {
  DEFAULT: 'default',
  PENDING: 'pending',
  COMPLETE: 'complete',
};

const SaveTemplateButton = ({ onClick }) => {
  const [submitState, setSubmitState] = useState(SUBMIT_STATES.DEFAULT);
  const { isSaving } = useContext(EmailTemplateContext);

  useEffect(() => {
    setSubmitState((prevState) => {
      if (isSaving) {
        return SUBMIT_STATES.PENDING;
      } else if (prevState === SUBMIT_STATES.PENDING) {
        setTimeout(() => setSubmitState(SUBMIT_STATES.DEFAULT), 2000);
        return SUBMIT_STATES.COMPLETE;
      }
      return SUBMIT_STATES.DEFAULT;
    });
  }, [isSaving]);

  const buttonIconClasses = {
    default: 'btn-outline-primary',
    pending: 'btn-outline-primary',
    complete: 'btn-outline-success',
  };

  return (
    <StatefulButton
      className={classNames(buttonIconClasses[submitState], 'save-template-btn')}
      onClick={onClick}
      state={submitState}
      labels={{
        default: 'Save Template',
        pending: 'Saving Template...',
        complete: 'Template Saved',
      }}
      icons={{
        pending: <Icon className="fa fa-spinner fa-spin" />,
        complete: <Icon className="fa fa-check-circle" />,
      }}
      disabledStates={[SUBMIT_STATES.PENDING]}
    />
  );
};

SaveTemplateButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default SaveTemplateButton;
