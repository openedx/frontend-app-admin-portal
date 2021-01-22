import React from 'react';
import { mount } from 'enzyme';
import CsvUpload from './index';

describe('<CsvUpload />', () => {
  const csvFile = new File(['email', '\n', 'test@test.com'], 'test.csv');
  const base64csv = 'ZW1haWwKdGVzdEB0ZXN0LmNvbQ==';

  it('calls the onchange event method', () => {
    const handleFilePickedSpy = jest.spyOn(CsvUpload.prototype, 'handleFilePicked');
    const readAsDataURLSpy = jest.spyOn(FileReader.prototype, 'readAsDataURL');
    const id = 'TestId';
    const event = {
      target: {
        files: [csvFile],
      },
    };
    const wrapper = mount(
      <CsvUpload
        id={id}
        label="TestLabel"
      />,
    );
    wrapper.find(`input#${id}`).simulate('change', event);
    expect(handleFilePickedSpy).toHaveBeenCalled();
    expect(readAsDataURLSpy).toHaveBeenCalledWith(csvFile);
  });

  it('creates a base64 file without data url declaration', () => {
    const wrapper = mount(
      <CsvUpload
        id="TestId"
        label="TestLabel"
        input={{
          value: 'TestValue',
          onChange: () => {},
        }}
      />,
    );

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(csvFile);
      reader.onload = () => {
        resolve(reader.result);
      };
    }).then((result) => {
      expect(wrapper.instance().updateValue(result)).toBe(base64csv);
    });
  });
});
