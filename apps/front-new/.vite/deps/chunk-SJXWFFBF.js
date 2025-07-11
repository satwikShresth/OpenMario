import { require_react } from './chunk-JZ6RMLDG.js';
import { __commonJS, __toESM } from './chunk-WOOG5QLI.js';

// ../../node_modules/.deno/use-sync-external-store@1.5.0/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js
var require_use_sync_external_store_shim_development = __commonJS({
   '../../node_modules/.deno/use-sync-external-store@1.5.0/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js'(
      exports,
   ) {
      'use strict';
      (function () {
         function is(x, y) {
            return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
         }
         function useSyncExternalStore$2(subscribe, getSnapshot) {
            didWarnOld18Alpha || void 0 === React.startTransition ||
               (didWarnOld18Alpha = true,
                  console.error(
                     'You are using an outdated, pre-release alpha of React 18 that does not support useSyncExternalStore. The use-sync-external-store shim will not work correctly. Upgrade to a newer pre-release.',
                  ));
            var value = getSnapshot();
            if (!didWarnUncachedGetSnapshot) {
               var cachedValue = getSnapshot();
               objectIs(value, cachedValue) || (console.error(
                  'The result of getSnapshot should be cached to avoid an infinite loop',
               ),
                  didWarnUncachedGetSnapshot = true);
            }
            cachedValue = useState({
               inst: { value, getSnapshot },
            });
            var inst = cachedValue[0].inst, forceUpdate = cachedValue[1];
            useLayoutEffect(
               function () {
                  inst.value = value;
                  inst.getSnapshot = getSnapshot;
                  checkIfSnapshotChanged(inst) && forceUpdate({ inst });
               },
               [subscribe, value, getSnapshot],
            );
            useEffect(
               function () {
                  checkIfSnapshotChanged(inst) && forceUpdate({ inst });
                  return subscribe(function () {
                     checkIfSnapshotChanged(inst) && forceUpdate({ inst });
                  });
               },
               [subscribe],
            );
            useDebugValue(value);
            return value;
         }
         function checkIfSnapshotChanged(inst) {
            var latestGetSnapshot = inst.getSnapshot;
            inst = inst.value;
            try {
               var nextValue = latestGetSnapshot();
               return !objectIs(inst, nextValue);
            } catch (error) {
               return true;
            }
         }
         function useSyncExternalStore$1(subscribe, getSnapshot) {
            return getSnapshot();
         }
         'undefined' !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ &&
            'function' === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart &&
            __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
         var React = require_react(),
            objectIs = 'function' === typeof Object.is ? Object.is : is,
            useState = React.useState,
            useEffect = React.useEffect,
            useLayoutEffect = React.useLayoutEffect,
            useDebugValue = React.useDebugValue,
            didWarnOld18Alpha = false,
            didWarnUncachedGetSnapshot = false,
            shim = 'undefined' === typeof window || 'undefined' === typeof window.document ||
                  'undefined' === typeof window.document.createElement
               ? useSyncExternalStore$1
               : useSyncExternalStore$2;
         exports.useSyncExternalStore = void 0 !== React.useSyncExternalStore
            ? React.useSyncExternalStore
            : shim;
         'undefined' !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ &&
            'function' === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop &&
            __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
      })();
   },
});

// ../../node_modules/.deno/use-sync-external-store@1.5.0/node_modules/use-sync-external-store/shim/index.js
var require_shim = __commonJS({
   '../../node_modules/.deno/use-sync-external-store@1.5.0/node_modules/use-sync-external-store/shim/index.js'(
      exports,
      module,
   ) {
      'use strict';
      if (false) {
         module.exports = null;
      } else {
         module.exports = require_use_sync_external_store_shim_development();
      }
   },
});

// ../../node_modules/.deno/use-sync-external-store@1.5.0/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.development.js
var require_with_selector_development = __commonJS({
   '../../node_modules/.deno/use-sync-external-store@1.5.0/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.development.js'(
      exports,
   ) {
      'use strict';
      (function () {
         function is(x, y) {
            return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
         }
         'undefined' !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ &&
            'function' === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart &&
            __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
         var React = require_react(),
            shim = require_shim(),
            objectIs = 'function' === typeof Object.is ? Object.is : is,
            useSyncExternalStore = shim.useSyncExternalStore,
            useRef = React.useRef,
            useEffect = React.useEffect,
            useMemo = React.useMemo,
            useDebugValue = React.useDebugValue;
         exports.useSyncExternalStoreWithSelector = function (
            subscribe,
            getSnapshot,
            getServerSnapshot,
            selector,
            isEqual,
         ) {
            var instRef = useRef(null);
            if (null === instRef.current) {
               var inst = { hasValue: false, value: null };
               instRef.current = inst;
            } else inst = instRef.current;
            instRef = useMemo(
               function () {
                  function memoizedSelector(nextSnapshot) {
                     if (!hasMemo) {
                        hasMemo = true;
                        memoizedSnapshot = nextSnapshot;
                        nextSnapshot = selector(nextSnapshot);
                        if (void 0 !== isEqual && inst.hasValue) {
                           var currentSelection = inst.value;
                           if (isEqual(currentSelection, nextSnapshot)) {
                              return memoizedSelection = currentSelection;
                           }
                        }
                        return memoizedSelection = nextSnapshot;
                     }
                     currentSelection = memoizedSelection;
                     if (objectIs(memoizedSnapshot, nextSnapshot)) {
                        return currentSelection;
                     }
                     var nextSelection = selector(nextSnapshot);
                     if (void 0 !== isEqual && isEqual(currentSelection, nextSelection)) {
                        return memoizedSnapshot = nextSnapshot, currentSelection;
                     }
                     memoizedSnapshot = nextSnapshot;
                     return memoizedSelection = nextSelection;
                  }
                  var hasMemo = false,
                     memoizedSnapshot,
                     memoizedSelection,
                     maybeGetServerSnapshot = void 0 === getServerSnapshot
                        ? null
                        : getServerSnapshot;
                  return [
                     function () {
                        return memoizedSelector(getSnapshot());
                     },
                     null === maybeGetServerSnapshot ? void 0 : function () {
                        return memoizedSelector(maybeGetServerSnapshot());
                     },
                  ];
               },
               [getSnapshot, getServerSnapshot, selector, isEqual],
            );
            var value = useSyncExternalStore(subscribe, instRef[0], instRef[1]);
            useEffect(
               function () {
                  inst.hasValue = true;
                  inst.value = value;
               },
               [value],
            );
            useDebugValue(value);
            return value;
         };
         'undefined' !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ &&
            'function' === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop &&
            __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
      })();
   },
});

// ../../node_modules/.deno/use-sync-external-store@1.5.0/node_modules/use-sync-external-store/shim/with-selector.js
var require_with_selector = __commonJS({
   '../../node_modules/.deno/use-sync-external-store@1.5.0/node_modules/use-sync-external-store/shim/with-selector.js'(
      exports,
      module,
   ) {
      'use strict';
      if (false) {
         module.exports = null;
      } else {
         module.exports = require_with_selector_development();
      }
   },
});

// ../../node_modules/.deno/@tanstack+react-store@0.7.3/node_modules/@tanstack/react-store/dist/esm/index.js
var import_with_selector = __toESM(require_with_selector());
function useStore(store, selector = (d) => d) {
   const slice = (0, import_with_selector.useSyncExternalStoreWithSelector)(
      store.subscribe,
      () => store.state,
      () => store.state,
      selector,
      shallow,
   );
   return slice;
}
function shallow(objA, objB) {
   if (Object.is(objA, objB)) {
      return true;
   }
   if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
      return false;
   }
   if (objA instanceof Map && objB instanceof Map) {
      if (objA.size !== objB.size) return false;
      for (const [k, v] of objA) {
         if (!objB.has(k) || !Object.is(v, objB.get(k))) return false;
      }
      return true;
   }
   if (objA instanceof Set && objB instanceof Set) {
      if (objA.size !== objB.size) return false;
      for (const v of objA) {
         if (!objB.has(v)) return false;
      }
      return true;
   }
   if (objA instanceof Date && objB instanceof Date) {
      if (objA.getTime() !== objB.getTime()) return false;
      return true;
   }
   const keysA = Object.keys(objA);
   if (keysA.length !== Object.keys(objB).length) {
      return false;
   }
   for (let i = 0; i < keysA.length; i++) {
      if (
         !Object.prototype.hasOwnProperty.call(objB, keysA[i]) ||
         !Object.is(objA[keysA[i]], objB[keysA[i]])
      ) {
         return false;
      }
   }
   return true;
}

export { useStore };
/*! Bundled license information:

use-sync-external-store/cjs/use-sync-external-store-shim.development.js:
  (**
   * @license React
   * use-sync-external-store-shim.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.development.js:
  (**
   * @license React
   * use-sync-external-store-shim/with-selector.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
//# sourceMappingURL=chunk-SJXWFFBF.js.map
