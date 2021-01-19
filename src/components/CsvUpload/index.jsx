import React from 'react';
import PropTypes from 'prop-types';
import { Input } from '@edx/paragon';

class CsvUpload extends React.Component {
  constructor(props) {
    super(props);
    this.handleFilePicked = this.handleFilePicked.bind(this);
  }

  updateValue(value) {
    // We don't need the actual encoding as part of the field value
    const base64Value = value.split(',')[1];
    this.props.input.onChange(base64Value);
    return base64Value;
  }

  handleFilePicked(event) {
    const reader = new FileReader();
    const file = event.target.files[0];

    reader.onload = () => {
      this.updateValue(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  }

  render() {
    const {
      className,
      id,
      label,
    } = this.props;

    return (
      <>
        <label htmlFor={id} className={className}>{label}</label>
        <Input
          id={id}
          className="p-2 border w-100"
          type="file"
          accept="text/csv"
          onChange={this.handleFilePicked}
        />
      </>
    );
  }
}

CsvUpload.propTypes = {
  className: PropTypes.string,
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  input: PropTypes.shape({
    value: PropTypes.string,
    onChange: PropTypes.func,
  }),
};

CsvUpload.defaultProps = {
  className: 'w-100 p-0',
  input: {},
};

export default CsvUpload;
