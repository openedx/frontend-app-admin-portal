import React, { useState } from 'react';
import {
  Collapsible,
  Form,
  Container,
  Row,
  Col,
  DataTable,
  StatefulButton,
  Button,

} from '@edx/paragon';

// WIP Fake Data
const loadingLinks = false;
const FAKE_TABLE_DATA = [{
  link: 'some link',
  linkStatus: 'activated',
  dateCreated: '1/2/3',
  usage: '10/11',
},
{
  link: 'some link',
  linkStatus: 'deactivated',
  dateCreated: '1/2/3',
  usage: '10/11',
},
];

const SettingsAccessLinkManagement = () => {
  const [isExpanded, setExpanded] = useState(true);

  const handleCopyLink = () => {
    // Handle Copy link to clipboard
    // console.log('handleCopyLink', rowData);
  };

  const handleDeactivateLink = () => {
    // Handle deactivate link
    // console.log('handleDeactivateLink', rowData);
  };

  const handleGenerateLink = () => {
    // Handle generate link
    // console.log('handleGenerateLink');
  };

  const generateLinkButtonProps = {
    labels: {
      default: 'Generate Link',
      pending: 'Generating Link...',
      complete: 'Link Generated',
      error: 'Error',
    },
    state: 'default',
    variant: 'primary',
    onClick: handleGenerateLink,
  };

  return (
    <Container fluid className="pl-0">
      <Row className="flex-row-reverse">
        <Col md="auto">
          <Form.Switch>Enable</Form.Switch>
        </Col>
      </Row>
      <Row>
        <Col>
          <Collapsible
            open={isExpanded}
            onToggle={isOpen => setExpanded(isOpen)}
            styling="card"
            title={<p><strong>Access via Link</strong></p>}
          >
            <p>Generate a link to share with your learners. </p>

            <DataTable
              data={FAKE_TABLE_DATA}
              itemCount={FAKE_TABLE_DATA.length}
              // eslint-disable-next-line no-unused-vars
              tableActions={(i) => <StatefulButton {...generateLinkButtonProps} />}
              columns={[
                {
                  Header: 'Link',
                  accessor: 'link',
                },
                {
                  Header: 'Status',
                  accessor: 'linkStatus',
                },
                {
                  Header: 'Date created',
                  accessor: 'dateCreated',
                },
                {
                  Header: 'Usage',
                  accessor: 'usage',
                },
              ]}
              additionalColumns={[
                {
                  id: 'action',
                  Header: '',
                  /* eslint-disable react/prop-types */
                  Cell: ({ row }) => {
                    if (row.original.linkStatus === 'activated') {
                      return (
                        <div className="d-flex flex-row-reverse">
                          <Button onClick={() => handleCopyLink(row)} variant="link">Copy</Button>
                          <Button onClick={() => handleDeactivateLink(row)} variant="link">Deactivate</Button>
                        </div>
                      );
                    }
                    return null;
                  },
                  /* eslint-enable */
                },
              ]}
            >
              <DataTable.TableControlBar />
              <DataTable.Table />
              <DataTable.EmptyTable content={loadingLinks ? 'Loading...' : 'Generate a link'} />
            </DataTable>
          </Collapsible>
        </Col>
      </Row>
    </Container>
  );
};

export default SettingsAccessLinkManagement;
