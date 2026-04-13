// eslint-disable-next-line import/no-extraneous-dependencies
import { toHaveNoViolations } from 'jest-axe';

// Register jest-axe's toHaveNoViolations matcher.
// This file must run in setupFilesAfterEnv (not setupFiles) because
// `expect` is only available after Jest's test environment is initialized.
expect.extend(toHaveNoViolations);
