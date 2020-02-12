import React from 'react';
import { createAspect } from 'feature-u';
import { persistStore, persistReducer } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

// Internal: storage configuration
let storage = null;

// Internal: save reference to the feature-redux aspect
let reducerAspect;

export function createPersistedReducerAspect(storage$) {
  storage = storage$;

  return createAspect({
    name: 'unused_persistedreducer',
    genesis,
    assembleAspectResources,
    injectRootAppElm,
  });
}

function genesis() {
  if (!storage) {
    return `
    You must configure a storage for redux-persist

    In case of react (web) usage :
    import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
    [...]
    persistedReducerAspect(storage)

    In case of react-native (mobile) usage :
    import AsyncStorage from '@react-native-community/async-storage';
    [...]
    persistedReducerAspect(AsyncStorage)
    `;
  }
  return null;
}

function assembleAspectResources(fassets, aspects) {
  reducerAspect = aspects
    .filter(el => typeof el.getReduxStore === 'function')
    .shift();

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
    { key: 'root', storage: storage, whitelist: [] },
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
