import { testHighlightSet } from '../../../../data/tests/ContentHighlightsTestData';
import { extractHighlightSetUUID, generateAboutPageUrl, preventUnload } from '../utils';
import { TEST_ENTERPRISE_SLUG } from '../../../../data/tests/constants';
import { ALERT_TEXT } from '../constants';

describe('ContentHighlights utils', () => {
  describe('extractHighlightSetUUID', () => {
    it('returns an array of highlight set UUIDs', () => {
      const highlightSetUUIDs = extractHighlightSetUUID([testHighlightSet]);
      expect(highlightSetUUIDs).toEqual([testHighlightSet.uuid]);
    });
  });

  describe('generateAboutPageUrl', () => {
    it('returns undefined if no contentType but with contentKey', () => {
      const url = generateAboutPageUrl(TEST_ENTERPRISE_SLUG, '', 'edX+DemoX');
      expect(url).toBeUndefined();
    });
    it('returns undefined if no contentKey but with contentType', () => {
      const url = generateAboutPageUrl(TEST_ENTERPRISE_SLUG, 'learnerpathway', '');
      expect(url).toBeUndefined();
    });
  });
  it('should set returnValue of event to the global alert and preventDefault', () => {
    const event = {
      returnValue: null,
      preventDefault: jest.fn(),
    };
    preventUnload(event);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.returnValue).toBe(ALERT_TEXT.GLOBAL_ALERT_TEXT.message);
  });
});
