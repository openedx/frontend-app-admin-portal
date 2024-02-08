/* eslint-disable react/jsx-filename-extension */
import { render, screen } from '@testing-library/react';
import {
  TEST_FLAG,
  ENABLE_TESTING,
  testEnterpriseId,
  sanitizeAndParseHTML,
  STEPPER_STEP_TEXT,
} from '../constants';

const enterpriseId = 'test-enterprise-id';

describe('constants', () => {
  it('should be defined', () => {
    expect(testEnterpriseId).toBeDefined();
  });
  it('ENABLE_TESTING should pass through when the TEST_FLAG = false', () => {
    expect(TEST_FLAG).toBe(false);
    expect(ENABLE_TESTING(enterpriseId)).toBe(enterpriseId);
  });
  it('ENABLE_TESTING should return the testEnterpriseId when passing true parameter', () => {
    expect(ENABLE_TESTING(enterpriseId, true)).toBe(testEnterpriseId);
  });
  it('sanitizeAndParseHTML should return a string', () => {
    const testElement = sanitizeAndParseHTML('<p>&apos;test&apos;</p>');
    render(testElement);
    expect(screen.getByText("'test'")).toBeTruthy();
  });
  it('unprocessed string to fail', () => {
    const testElement = '<p>&apos;test&apos;</p>';
    render(testElement);
    expect(screen.queryByText("'test'")).toBeFalsy();
  });
  it('renders title name in string functions', () => {
    const highlightTitle = 'test-title';

    const TestComponent = ({ children }) => (
      <p>
        {children}
      </p>
    );
    render(
      <TestComponent>
        {STEPPER_STEP_TEXT.SUB_TEXT.selectContent(highlightTitle)}
      </TestComponent>,
    );
    expect(screen.getByText(`items for "${highlightTitle}"`, { exact: false })).toBeTruthy();

    render(
      <TestComponent>
        {STEPPER_STEP_TEXT.SUB_TEXT.confirmContent(highlightTitle)}
      </TestComponent>,
    );
    expect(screen.getByText(STEPPER_STEP_TEXT.SUB_TEXT.confirmContent(highlightTitle))).toBeTruthy();
  });
});
