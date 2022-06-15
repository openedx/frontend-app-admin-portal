import { renderHook } from '@testing-library/react-hooks/dom';
import useOnMount from '../useOnMount';

describe('useOnMount', () => {
  it('should invoke callback once', () => {
    const mockCallback = jest.fn();
    const hook = renderHook(() => useOnMount(mockCallback));

    const newMockCallback = jest.fn();
    hook.rerender(newMockCallback);
    expect(newMockCallback).not.toHaveBeenCalled();
  });
});
