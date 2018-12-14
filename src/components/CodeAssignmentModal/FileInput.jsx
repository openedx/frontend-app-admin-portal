import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Icon, ValidationMessage, Variant } from '@edx/paragon';

import './FileInput.scss';

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
    const { onFileLoad } = this.props;
    const { result: fileContents } = fileReader;

    if (fileContents) {
      onFileLoad(fileContents);
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
      meta: { error },
    } = this.props;

    return (
      <div className="file-input form-group">
        <label
          className="d-block"
          htmlFor={id}
        >
          {label}
        </label>
        <label
          className="btn btn-outline-primary m-0"
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
        <div className={classNames({ 'is-invalid': error })}>
          <ValidationMessage
            id={`validation-${id}`}
            isValid={!error}
            invalidMessage={error}
            variant={{
              status: Variant.status.DANGER,
            }}
          />
        </div>
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
  onFileLoad: () => {},
};

FileInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  meta: PropTypes.shape({
    error: PropTypes.string,
  }).isRequired,
  accept: PropTypes.string,
  description: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  onFileLoad: PropTypes.func,
};

export default FileInput;
