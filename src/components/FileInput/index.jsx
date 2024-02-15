import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { clearFields } from 'redux-form';
import { Button, Form, Icon } from '@edx/paragon';
import { Close } from '@edx/paragon/icons';

class FileInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fileName: null,
      hasFocus: false,
    };

    this.fileInputRef = React.createRef();

    this.handleOnChange = this.handleOnChange.bind(this);
  }

  handleFileReaderOnLoad({ fileName, fileReader }) {
    const { result: fileContents } = fileReader;

    if (fileContents) {
      const { input } = this.props;
      input.onChange(fileContents);
      this.setState({
        hasFocus: false,
        fileName,
      });
    }
  }

  handleOnChange() {
    const ref = this.fileInputRef && this.fileInputRef.current;
    const file = ref && ref.files && ref.files[0];

    if (file) {
      const fileReader = new FileReader();

      const { name: fileName } = file;

      fileReader.onload = () => this.handleFileReaderOnLoad({
        fileName,
        fileReader,
      });

      fileReader.readAsText(file);
    }
  }

  render() {
    const { fileName, hasFocus } = this.state;
    const {
      id,
      input,
      label,
      accept,
      description,
      disabled,
      required,
      meta: {
        form,
        dispatch,
        touched,
        error,
      },
    } = this.props;
    const hasError = !!(touched && error);
    return (
      <Form.Group
        className="file-input"
        controlId={id}
        isInvalid={hasError}
      >
        <label className="m-0 mb-1" htmlFor={id}>{label}</label>
        <div
          className={classNames(
            'd-flex',
            'align-items-center',
            'form-control',
            {
              'is-invalid': hasError,
            },
          )}
        >
          <span className="file-name d-inline-block text-truncate">
            {fileName || 'No File Chosen'}
          </span>
          {!fileName ? (
            <>
              <label
                className={classNames(
                  'choose-file-btn',
                  'btn',
                  'btn-link',
                  'p-1',
                  'm-0',
                  'ml-2',
                  {
                    'has-focus': hasFocus,
                  },
                )}
                htmlFor={id}
              >
                Choose a file
              </label>
              <input
                ref={this.fileInputRef}
                id={id}
                value=""
                type="file"
                accept={accept}
                disabled={disabled}
                required={required}
                onChange={this.handleOnChange}
                onFocus={() => {
                  input.onFocus();
                  this.setState({ hasFocus: true });
                }}
                onBlur={() => {
                  input.onBlur();
                  this.setState({ hasFocus: false });
                }}
              />
            </>
          ) : (
            <Button
              variant="link"
              className="remove-file-btn p-1 ml-2"
              onClick={() => {
                dispatch(clearFields(form, false, false, input.name));
                input.onChange(null);
                this.setState({ fileName: null });
              }}
            >
              <Icon src={Close} className="mr-1" />
              Remove
            </Button>
          )}
        </div>
        <Form.Text>{description}</Form.Text>
        {hasError && (
          <Form.Control.Feedback type="invalid">
            {error}
          </Form.Control.Feedback>
        )}
      </Form.Group>

    );
  }
}

FileInput.defaultProps = {
  accept: undefined,
  description: undefined,
  disabled: false,
  required: false,
};

FileInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  meta: PropTypes.shape({
    error: PropTypes.string,
    form: PropTypes.string,
    dispatch: PropTypes.func,
    touched: PropTypes.bool,
  }).isRequired,
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onFocus: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired,
  }).isRequired,
  accept: PropTypes.string,
  description: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
};

export default FileInput;
