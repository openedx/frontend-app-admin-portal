import React, { useReducer, useState, useEffect } from 'react';
import { Card, Badge, Stack } from '@edx/paragon';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';
import {
  setHighlightStepperModal,
} from './data/actions';
import { initialStepperModalState } from './data/reducer';
import ContentHighlightStepper from './HighlightStepper/ContentHighlightStepper';

const ContentHighlightSetCard = ({
  title, highlightUUID, isPublished, enterpriseSlug,
}) => {
  const history = useHistory();
  /* Stepper Draft Logic - Start */
  const [toggleModal, setToggleModal] = useState(false);
  const [stepperModalState] = useReducer(setHighlightStepperModal, initialStepperModalState);
  const badgeData = {
    variant: isPublished ? 'success' : 'warning',
    message: isPublished ? 'Published' : 'Draft',
  };
  const editDraft = () => {
    if (isPublished) {
      // redirect to individual highlighted courses based on uuid
      return history.push(`/${enterpriseSlug}/admin/${ROUTE_NAMES.contentHighlights}/${highlightUUID}`);
    }
    return setToggleModal(true);
  };
  useEffect(() => {
    if (!stepperModalState?.isOpen) {
      setToggleModal(false);
    }
  }, [stepperModalState.isOpen]);
  /* Stepper Draft Logic - End */
  return (
    <Card
      key={title}
      isClickable
      onClick={() => editDraft()}
    >
      <Stack className="justify-content-between p-4" direction="horizontal">
        <Card.Header
          className="p-0"
          title={title}
        />
        <Badge className="align-self-end" variant={badgeData.variant}>
          {badgeData.message}
        </Badge>
      </Stack>
      {!isPublished && <ContentHighlightStepper openModal={toggleModal} />}
    </Card>
  );
};

ContentHighlightSetCard.propTypes = {
  title: PropTypes.string.isRequired,
  highlightUUID: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  isPublished: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(ContentHighlightSetCard);
