import React from 'react';
import { createAspect } from 'feature-u';
import { persistStore, persistReducer } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

export function createPersistedReducerAspect(name = 'persistedreducer') {
  return createAspect({
    name,
    genesis,
    validateFeatureContent,
    assembleFeatureContent,
    assembleAspectResources,
    injectRootAppElm,
    config: {
      storage$: null,
    },
  });
}

// To save reference to the feature-redux aspect
let reducerAspect;

function genesis() {
  if (!this.config.storage$) {
    return `
    You must configure a storage for redux-persist

    In case of react (web) usage :
    import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
    [...]
    persistedReducerAspect.config.storage$ = storage

    In case of react-native (mobile) usage :
    import AsyncStorage from '@react-native-community/async-storage';
    [...]
    persistedReducerAspect.config.storage$ = AsyncStorage
    `;
  }
  return null;
}

function validateFeatureContent() {}
function assembleFeatureContent() {}

function assembleAspectResources(fassets, aspects) {
  reducerAspect = aspects.filter(el => el.name === 'reducer').shift();

  if (!reducerAspect) {
    throw new Error(
      'You must configure feature-redux in order to make feature-redux-persist work'
    );
  }

  try {
    reducerAspect.getReduxStore();
    throw new Error(
      'You must declare feature-redux **AFTER** feature-redux-persisted'
    );
  } catch (e) {
    // The feature-redux don't execute assembleAspectResources yet, this is fine.
  }

  // Inject persistReducer in the feature-redux appReducer
  reducerAspect.appReducer = persistReducer(
    { key: 'root', storage: this.config.storage$, whitelist: [] },
    reducerAspect.appReducer
  );
}

function injectRootAppElm(fassets, curRootAppElm) {
  const persistor = persistStore(reducerAspect.getReduxStore());

  return (
    <PersistGate loading={null} persistor={persistor}>
      {curRootAppElm}
    </PersistGate>
  );
}
