import { formatBytes, getSizeInBytes } from './utils';

const formatBytesTestData = [[100, '100 Bytes'], [1024, '1 KB'], [1048576, '1 MB'], [1200000, '1.14 MB'], [4550000, '4.34 MB']];
const getSizeInBytesTestData = [['1KB', 1024], ['1 MB', 1048576], ['100 Bytes', 100], ['276 KB', 282624], ['1.2 MB', 1258291.2]];
describe('MultipleFileInputField:formatBytes', () => {
  formatBytesTestData.forEach((value) => {
    it(`tests formatBytes with: ${value[0]}`, () => {
      expect(formatBytes(value[0])).toEqual(value[1]);
    });
  });
});
describe('MultipleFileInputField:getSizeInBytes', () => {
  getSizeInBytesTestData.forEach((value) => {
    it(`tests formatBytes with: ${value[0]}`, () => {
      expect(getSizeInBytes(value[0])).toEqual(value[1]);
    });
  });
});
