# feature-redux-persist

`feature-redux-persist` is a [feature-u](https://feature-u.js.org/) integration point to [redux-persist](https://github.com/rt2zz/redux-persist). It promotes the persistedReducerAspect _(a `feautre-u` plugin)_ that facilitates `redux-persist` integration to your features.

`feature-reduc-persist` relies on [feature-redux](https://github.com/KevinAst/feature-redux) to provide `redux` integration.

_You have to be aware of feature-u philosophy and know about is implementation before reading this documentation_

## Install

**peerDependencies**, you should already have these, because this is our integration point (but just in case):

```bash
yarn add feature-u
yarn add react
yarn add redux
yarn add react-redux
yarn add feature-redux
```

**the main event**:

```bash
yarn add feature-redux-persist
```

## Usage

### Register

Within your mainline, register the **feature-redux** `reducerAspect` (see `**1**` below) and the **feature-redux-persist** `reducerPersistedAspect` (see `**2**`) to feature-u's [launchApp()](https://feature-u.js.org/cur/api.html#launchApp)

**Note** `**3**` : `persistedReducerAspect` has a required config.storage\$ configuration item (see below)

**Note** `**4**` : **ORDER MATTER**, you have to declare `persistedReducerAspect` **before** `reducerAspect` !

**src/app.js**

```js
import {launchApp}                    from 'feature-u';
import {createReducerAspect}          from 'feature-redux'; // **1**
import {createPersistedReducerAspect} from 'feature-redux-persist'; // **2**
import AsyncStorage from '@react-native-community/async-storage'; // for react-native
import features                       from './feature';

export default launchApp({

  const persistedReducerAspect = createPersistedReducerAspect(); // **2**
  persistedReducerAspect.config.storage$ = AsyncStorage; // **3**
  aspects: [
    persistedReducerAspect,                        // **4**
    createReducerAspect(),                         // **1**
    ... other Aspects here
  ],

  features,

  registerRootAppElm(rootAppElm) {
    ReactDOM.render(rootAppElm,
                    getElementById('myAppRoot'));
  }
});
```

### Configure

**config.storage\$**

This configuration is _required_.

You can use every storage in that list: [https://github.com/rt2zz/redux-persist#storage-engines]

### Promote reducers

**/!\\** Before reading, you might take a look to [https://github.com/KevinAst/feature-redux#usage].

In the `state.js`, there is some classic `redux` reducer.

`**5**` : Enhance basic reducer with `persistReducer` decorator from `redux-persist` module.

`**6**` : Wrap to all thing with `slicedReducer` from `feature-redux` module.

Note that you still can use non-persisted reducers with this aspect, you just have to bypass `**5**`.

```js
import { createFeature } from 'feature-u';
import { slicedReducer } from 'feature-redux';
import { persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-community/async-storage';

import fname from './feature-name';
import reducer, from './state';

export default createFeature({
  name: fname,
  enabled: true,

  reducer: slicedReducer( // **6**
    fname,
    persistReducer({ key: fname, storage: AsyncStorage }, reducer) // **5**
  ),

  // ... snip snip (other aspect properties here)
});
```
