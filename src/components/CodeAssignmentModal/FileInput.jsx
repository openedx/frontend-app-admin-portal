import React from 'react';
import PropTypes from 'prop-types';
import { Icon, ValidationMessage, Variant } from '@edx/paragon';

class FileInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fileName: null,
    };

    this.fileInputRef = React.createRef();

    this.handleOnChange = this.handleOnChange.bind(this);
  }

  handleFileReaderOnLoad(fileReader) {
    const { result: fileContents } = fileReader;

    if (fileContents) {
      const emails = fileContents.split('\n');
      console.log(emails);
    }
  }

  handleOnChange() {
    const ref = this.fileInputRef && this.fileInputRef.current;

    if (ref) {
      const fileReader = new FileReader();

      const file = ref.files[0];
      const { name: fileName } = file;

      fileReader.onload = () => this.handleFileReaderOnLoad(fileReader);
      fileReader.readAsText(file);

      this.setState({
        fileName,
      });
    }
  }

  render() {
    const { fileName } = this.state;
    const {
      id,
      label,
      accept,
      description,
      disabled,
      required,
      meta: { touched, error },
    } = this.props;

    return (
      <div className="form-group">
        <label
          className="d-block"
          htmlFor={id}
        >
          {label}
        </label>
        <label
          className="btn btn-outline-primary"
          htmlFor={id}
        >
          <Icon className={['fa', 'fa-upload', 'mr-2']} />
          {fileName || 'Choose a file'}
        </label>
        <input
          ref={this.fileInputRef}
          className="sr-only"
          id={id}
          type="file"
          accept={accept}
          disabled={disabled}
          required={required}
          onChange={this.handleOnChange}
        />
        <ValidationMessage
          id={`validation-${id}`}
          isValid={!(touched && error)}
          invalidMessage={error}
          variant={{
            status: Variant.status.DANGER,
          }}
        />
        {description && (
          <small className="form-text" id={`description-${id}`}>
            {description}
          </small>
        )}
      </div>
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
    touched: PropTypes.bool.isRequired,
    error: PropTypes.string.isRequired,
  }).isRequired,
  accept: PropTypes.string,
  description: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
};

export default FileInput;
