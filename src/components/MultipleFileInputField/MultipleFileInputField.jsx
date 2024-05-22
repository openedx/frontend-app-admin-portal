import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Form, FormControl, IconButton,
} from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';
import classNames from 'classnames';
import { getSizeInBytes, formatBytes } from './utils';
import { MAX_FILES_SIZE, FILE_SIZE_EXCEEDS_ERROR } from './constants';

const MultipleFileInputField = ({
  input,
  label,
  type,
  description,
  disabled,
  required,
  className,
  id,
  meta: { touched, error },
  ...props
}) => {
  const hasError = !!(touched && error);
  const [size, setSize] = useState('0');
  const [filesSizeError, setFilesSizeError] = useState(null);
  const { name: inputName, onChange: inputOnChange, value: inputValues } = input;

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    const totalFilesSize = getSizeInBytes(size) + file.size; // size of already uploaded files and new files
    if (totalFilesSize > MAX_FILES_SIZE) {
      setFilesSizeError(FILE_SIZE_EXCEEDS_ERROR);
    } else {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const { name: fileName, size: fileSize, type: fileType } = file;
        inputOnChange([...inputValues, {
          name: fileName, type: fileType, size: fileSize, contents: new Uint8Array(fileReader.result).toString(),
        }]);
      };
      fileReader.readAsArrayBuffer(file);
    }
  };

  useEffect(() => {
    let sizeOfFiles = 0;
    if (inputValues && inputValues.length > 0) {
      sizeOfFiles = inputValues.reduce((total, file) => total + file.size, 0);
    }
    setSize(formatBytes(sizeOfFiles));
    setFilesSizeError(null);
  }, [inputValues]);

  const handleFileRemoveClick = (index) => {
    inputOnChange(inputValues.filter((e, i) => i !== index));
  };

  return (
    <Form.Group id={id} className={className}>
      <Form.Label>
        {label}
      </Form.Label>
      <span>{size !== '0' ? ` - ${size}` : null}</span>
      <br />
      <Form.Label
        className={classNames(
          'choose-file-btn',
          'btn',
          'btn-link',
          'p-1',
          'm-0',
          'ml-2',
        )}
        htmlFor="multiple-file-input-control"
      >Select files
      </Form.Label>
      <Form.Control
        name={inputName}
        id="multiple-file-input-control"
        type="file"
        value=""
        {...props}
        onChange={handleInputChange}
        style={{ position: 'absolute', width: '0px', height: '0px' }}
      />

      {filesSizeError && <FormControl.Feedback type="invalid">{filesSizeError}</FormControl.Feedback>}
      {hasError && <FormControl.Feedback type="invalid">{error}</FormControl.Feedback>}
      {description && <Form.Text>{description}</Form.Text>}
      {
        inputValues?.map((e, i) => (
          <div className="border rounded p-1 m-1">
            <small>{`${e.name} - ${formatBytes(e.size)}`}</small>
            <IconButton className="mr-2" icon={Close} onClick={() => handleFileRemoveClick(i)} variant="danger" />
          </div>
        ))
      }
    </Form.Group>
  );
};

MultipleFileInputField.defaultProps = {
  disabled: false,
  required: false,
  className: null,
  id: null,
};

MultipleFileInputField.propTypes = {
  // props come from the redux-form Field component
  input: PropTypes.shape({
    onChange: PropTypes.func,
    name: PropTypes.string,
    value: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      size: PropTypes.number,
    })),
  }).isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  type: PropTypes.string.isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string,
  }).isRequired,
  description: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
  id: PropTypes.string,
};

export default MultipleFileInputField;
