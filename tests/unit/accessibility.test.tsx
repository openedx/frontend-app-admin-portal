/**
 * Accessibility unit test examples using jest-axe.
 *
 * These tests demonstrate the pattern to follow when adding accessibility
 * assertions to component tests. Co-locate a11y assertions with existing
 * component tests rather than keeping them only here.
 *
 * Sourced from apps/accessibility-skills/tests/unit/ in the xpert-labs
 * repository. Update when upstream examples change.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { accessibilitySettings } from '../accessibility-settings';

// ---------------------------------------------------------------------------
// Pattern 1: Basic component render
// ---------------------------------------------------------------------------

/**
 * Example: assert a component has no WCAG AA violations.
 *
 * Copy this pattern into your own component test files:
 *
 *   it('has no accessibility violations', async () => {
 *     const { container } = render(<MyComponent />);
 *     const results = await axe(container, accessibilitySettings);
 *     expect(results).toHaveNoViolations();
 *   });
 */
describe('Accessibility test pattern examples', () => {
  it('passes for a simple accessible button', async () => {
    const { container } = render(
      <button type="button">Save changes</button>,
    );
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('passes for an accessible form field with label', async () => {
    const { container } = render(
      <form>
        <label htmlFor="enterprise-name">Enterprise name</label>
        <input id="enterprise-name" type="text" />
      </form>,
    );
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('passes for an accessible image', async () => {
    const { container } = render(
      <img src="logo.png" alt="Acme Corp company logo" />,
    );
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('passes for a data table with headers', async () => {
    const { container } = render(
      <table>
        <caption>Enrolled learners by course</caption>
        <thead>
          <tr>
            <th scope="col">Course</th>
            <th scope="col">Enrolled</th>
            <th scope="col">Completed</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Intro to Python</td>
            <td>120</td>
            <td>88</td>
          </tr>
        </tbody>
      </table>,
    );
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });
});
