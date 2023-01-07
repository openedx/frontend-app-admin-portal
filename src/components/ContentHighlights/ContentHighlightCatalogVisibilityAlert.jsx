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
          actions={[
            <Button
              onClick={openStepperModal}
              iconBefore={Add}
              block
            >
              {BUTTON_TEXT.catalogVisibility}
            </Button>,
          ]}
        >
          <div className="w-80">
            <Alert.Heading>
              {ALERT_TEXT.HEADER_TEXT.catalogVisibility}
            </Alert.Heading>
            <p>
              {ALERT_TEXT.SUB_TEXT.catalogVisibility}
            </p>
          </div>
        </Alert>
      </Col>
    </Row>
  );
};

export default ContentHighlightCatalogVisibilityAlert;
