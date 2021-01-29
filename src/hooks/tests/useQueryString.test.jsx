import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { MemoryRouter, useLocation } from 'react-router-dom';
import qs from 'query-string';
import {
  excludeKeys, getPrefixedKeys, getQueryString, prefixKeys, setQueryString,
} from '../useQueryString';

const mockPush = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useLocation: jest.fn(),
  useHistory: () => ({
    push: mockPush,
  }),
}));

describe('helper functions', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  describe('getPrefixedKeys', () => {
    it('returns an object with only deprefixed keys', () => {
      const result = getPrefixedKeys(Object.freeze({
        bears__rus: 12,
        bears__rgr8: 'foo',
        someotherkey: [],
        horses__rule: 'winiewuzhere',
      }), 'bears');
      expect(result).toEqual({
        rus: 12,
        rgr8: 'foo',
      });
    });
  });

  describe('excludeKeys', () => {
    it('filters keys out of an object', () => {
      const result = excludeKeys(Object.freeze({
        bears__rus: 12,
        badKey: 'foo',
        someotherkey: [],
        extremelyBadKey: 'winiewuzhere',
      }), ['badKey', 'extremelyBadKey']);
      expect(result).toEqual({
        bears__rus: 12,
        someotherkey: [],
      });
    });
  });

  describe('prefixKeys', () => {
    it('adds a prefix to all keys', () => {
      const result = prefixKeys(Object.freeze({
        rus: 12,
        rgr8: 'foo',
      }), 'bears');
      expect(result).toEqual({
        bears__rus: 12,
        bears__rgr8: 'foo',
      });
    });
  });
});

describe('hooks', () => {
  // eslint-disable-next-line react/prop-types
  const wrapper = ({ children }) => (<MemoryRouter>{children}</MemoryRouter>);
  describe('getQueryString', () => {
    describe('no prefix', () => {
      it('returns the querystring', () => {
        const query = {
          foo: 'bar',
          horse: 'bear',
        };
        useLocation.mockReturnValue({
          search: `?${qs.stringify(query)}`,
        });
        const useQString = getQueryString();
        const { result } = renderHook(() => useQString(), { wrapper });

        expect(result.current).toEqual(query);
      });
      it('excludes params', () => {
        const query = {
          foo: 'bar',
          horse: 'bear',
          excludeMe: 'baz',
        };
        useLocation.mockReturnValue({
          search: `?${qs.stringify(query)}`,
        });
        const useQString = getQueryString({ excludedParams: ['excludeMe'] });
        const { result } = renderHook(() => useQString(), { wrapper });
        expect(result.current).toEqual({
          foo: 'bar',
          horse: 'bear',
        });
      });
    });
    describe('with prefix', () => {
      it('only returns queries with the prefix', () => {
        const query = {
          l__foo: 'bar',
          l__horse: 'bear',
          features: 'baz',
        };
        useLocation.mockReturnValue({
          search: `?${qs.stringify(query)}`,
        });
        const useQString = getQueryString({ prefix: 'l' });
        const { result } = renderHook(() => useQString(), { wrapper });
        expect(result.current).toEqual({
          foo: 'bar',
          horse: 'bear',
        });
      });
      it('excludes params', () => {
        const query = {
          l__foo: 'bar',
          l__horse: 'bear',
          l__excludeMe: 'baz',
        };
        useLocation.mockReturnValue({
          search: `?${qs.stringify(query)}`,
        });
        const useQString = getQueryString({ prefix: 'l', excludedParams: ['excludeMe'] });
        const { result } = renderHook(() => useQString(), { wrapper });
        expect(result.current).toEqual({
          foo: 'bar',
          horse: 'bear',
        });
      });
    });
  });
  describe('setQueryString', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });
    it('sets a querystring', () => {
      useLocation.mockReturnValue({
        url: '/',
        search: '',
      });
      const queries = {
        foo: 'bar',
        zeno: 'cat',
      };
      const setQString = setQueryString();
      renderHook(() => setQString(queries), { wrapper });
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith(`/?${qs.stringify(queries)}`);
    });
    it('sets a prefixed querystring', () => {
      useLocation.mockReturnValue({
        url: '/',
        search: '',
      });
      const queries = {
        foo: 'bar',
        zeno: 'cat',
      };
      const setQString = setQueryString({ prefix: 'horse' });
      renderHook(() => setQString(queries), { wrapper });
      expect(mockPush).toHaveBeenCalledTimes(1);
      const prefixedQueries = {
        horse__foo: queries.foo,
        horse__zeno: queries.zeno,
      };
      expect(mockPush).toHaveBeenCalledWith(`/?${qs.stringify(prefixedQueries)}`);
    });
    it('writes over already set params', () => {
      useLocation.mockReturnValue({
        url: '/',
        search: '?foo=baz&horse=Winnie',
      });
      const queries = {
        foo: 'bar',
        zeno: 'cat',
      };
      const setQString = setQueryString();
      renderHook(() => setQString(queries), { wrapper });
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith(`/?${qs.stringify(queries)}`);
    });
    it('does not overwrite already set params', () => {
      useLocation.mockReturnValue({
        url: '/',
        search: '?foo=baz&horse=Winnie',
      });
      const queries = {
        foo: 'bar',
        zeno: 'cat',
      };
      const setQString = setQueryString({ excludedParams: ['horse'] });
      renderHook(() => setQString(queries), { wrapper });
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/?foo=bar&horse=Winnie&zeno=cat');
    });
    it('ignorese not-prefixed params', () => {
      useLocation.mockReturnValue({
        url: '/',
        search: '?foo=baz&horse=Winnie&horse__zeno=Nico',
      });
      const queries = {
        foo: 'bar',
        zeno: 'cat',
      };
      const setQString = setQueryString({ excludedParams: ['horse'], prefix: 'horse' });
      renderHook(() => setQString(queries), { wrapper });
      expect(mockPush).toHaveBeenCalledTimes(1);
      const mockPushCall = mockPush.mock.calls[0][0];
      expect(mockPushCall).toContain('horse__foo=bar');
      expect(mockPushCall).toContain('horse__zeno=cat');
      expect(mockPushCall).toContain('horse=Winnie');
      expect(mockPushCall).toContain('foo=baz');
      expect(mockPushCall).not.toContain('horse__zeno=Nico');
    });
    it('ignorese prefixed params that are excluded', () => {
      useLocation.mockReturnValue({
        url: '/',
        search: '?foo=baz&horse__horse=Winnie&horse__zeno=Nico',
      });
      const queries = {
        foo: 'bar',
        zeno: 'cat',
        horse: 'Nico',
      };
      const setQString = setQueryString({ excludedParams: ['horse', 'horse__horse'], prefix: 'horse' });
      renderHook(() => setQString(queries), { wrapper });
      expect(mockPush).toHaveBeenCalledTimes(1);
      const mockPushCall = mockPush.mock.calls[0][0];
      expect(mockPushCall).toContain('horse__foo=bar');
      expect(mockPushCall).toContain('horse__zeno=cat');
      expect(mockPushCall).toContain('horse__horse=Winnie');
      expect(mockPushCall).toContain('foo=baz');
      expect(mockPushCall).not.toContain('horse__zeno=Nico');
    });
  });
});
