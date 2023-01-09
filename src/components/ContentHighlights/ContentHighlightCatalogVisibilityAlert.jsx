import {
  Alert, Button, Row, Col,
} from '@edx/paragon';
import { Info, Add } from '@edx/paragon/icons';
import { ALERT_TEXT, BUTTON_TEXT } from './data/constants';
import { useContentHighlightsContext } from './data/hooks';

const ContentHighlightCatalogVisibilityAlert = () => {
  const { openStepperModal } = useContentHighlightsContext();

  return (
    <Row className="mb-4.5">
      <Col xs={12} sm={10} md={9} lg={8}>
        <Alert
          variant="danger"
          icon={Info}
        >
          <div className="d-flex">
            <div style={{ flex: '0 0 80%' }}>
              <Alert.Heading>
                {ALERT_TEXT.HEADER_TEXT.catalogVisibility}
              </Alert.Heading>
              <p>
                {ALERT_TEXT.SUB_TEXT.catalogVisibility}
              </p>
            </div>
            <div className="align-self-center">
              <Button
                onClick={openStepperModal}
                iconBefore={Add}
                block
              >
                {BUTTON_TEXT.catalogVisibility}
              </Button>
            </div>
          </div>
        </Alert>
      </Col>
    </Row>
  );
};

export default ContentHighlightCatalogVisibilityAlert;
