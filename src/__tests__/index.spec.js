import React from 'react';
import { createReducerAspect } from 'feature-redux';
import configureMockStore from 'redux-mock-store';
import { createPersistedReducerAspect } from '..';

describe('createPersistedReducerAspect', () => {
  it('should create a aspect instance', () => {
    const aspect = createPersistedReducerAspect();
    expect(typeof aspect).toBe('object');
    expect(aspect.name).toBe('unused_persistedreducer');

    expect(aspect).toMatchObject(
      expect.objectContaining({
        assembleAspectResources: expect.any(Function),
        assembleFeatureContent: expect.any(Function),
        config: expect.any(Object),
        expandFeatureContent: undefined,
        genesis: expect.any(Function),
        initialRootAppElm: undefined,
        injectRootAppElm: expect.any(Function),
        name: expect.any(String),
        validateFeatureContent: expect.any(Function),
      })
    );
  });
});

describe('genesis', () => {
  it('should fail with no config set', () => {
    const aspect = createPersistedReducerAspect();

    expect(aspect.genesis()).toMatch(
      /You must configure a storage for redux-persist/
    );
  });

  it('should be OK with config set', () => {
    // dummy object, this will fail in real usage when configuring redux-persist
    const aspect = createPersistedReducerAspect({});
    expect(aspect.genesis()).toBeNull();
  });
});

describe('assembleAspectResources', () => {
  it('should fail', () => {
    const aspect = createPersistedReducerAspect({});

    expect(() => aspect.assembleAspectResources({}, [])).toThrow(
      'You must configure feature-redux in order to make feature-redux-persist work'
    );
  });

  it('should success', () => {
    const aspect = createPersistedReducerAspect({});

    const reducerAspect = createReducerAspect();
    const aspects = [reducerAspect];
    expect(() => aspect.assembleAspectResources({}, aspects)).not.toThrow(
      'You must configure feature-redux in order to make feature-redux-persist work'
    );

    // reducerAspect is not initialized with the classic process,
    // the existance of this function confirm that assembleAspectResources is working
    // undefined will be returned in the oposite case.
    expect(typeof reducerAspect.appReducer).toBe('function');
  });
});

describe('injectRootAppElm', () => {
  it('should return a PersistGate react element', () => {
    const aspect = createPersistedReducerAspect({});

    const reducerAspect = createReducerAspect();
    const aspects = [reducerAspect];
    aspect.assembleAspectResources({}, aspects);

    reducerAspect.appStore = configureMockStore([])({});

    expect(
      aspect.injectRootAppElm({}, React.createElement('br'))
    ).toMatchSnapshot();
  });
});
