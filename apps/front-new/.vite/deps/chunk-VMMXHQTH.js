import {
  Store,
  batch
} from "./chunk-PKKGSRSG.js";

// ../../node_modules/.deno/tiny-invariant@1.3.3/node_modules/tiny-invariant/dist/esm/tiny-invariant.js
var isProduction = false;
var prefix = "Invariant failed";
function invariant(condition, message) {
  if (condition) {
    return;
  }
  if (isProduction) {
    throw new Error(prefix);
  }
  var provided = typeof message === "function" ? message() : message;
  var value = provided ? "".concat(prefix, ": ").concat(provided) : prefix;
  throw new Error(value);
}

// ../../node_modules/.deno/@tanstack+history@1.121.34/node_modules/@tanstack/history/dist/esm/index.js
var stateIndexKey = "__TSR_index";
var popStateEvent = "popstate";
var beforeUnloadEvent = "beforeunload";
function createHistory(opts) {
  let location = opts.getLocation();
  const subscribers = /* @__PURE__ */ new Set();
  const notify = (action) => {
    location = opts.getLocation();
    subscribers.forEach((subscriber) => subscriber({ location, action }));
  };
  const handleIndexChange = (action) => {
    if (opts.notifyOnIndexChange ?? true) notify(action);
    else location = opts.getLocation();
  };
  const tryNavigation = async ({
    task,
    navigateOpts,
    ...actionInfo
  }) => {
    var _a, _b;
    const ignoreBlocker = (navigateOpts == null ? void 0 : navigateOpts.ignoreBlocker) ?? false;
    if (ignoreBlocker) {
      task();
      return;
    }
    const blockers = ((_a = opts.getBlockers) == null ? void 0 : _a.call(opts)) ?? [];
    const isPushOrReplace = actionInfo.type === "PUSH" || actionInfo.type === "REPLACE";
    if (typeof document !== "undefined" && blockers.length && isPushOrReplace) {
      for (const blocker of blockers) {
        const nextLocation = parseHref(actionInfo.path, actionInfo.state);
        const isBlocked = await blocker.blockerFn({
          currentLocation: location,
          nextLocation,
          action: actionInfo.type
        });
        if (isBlocked) {
          (_b = opts.onBlocked) == null ? void 0 : _b.call(opts);
          return;
        }
      }
    }
    task();
  };
  return {
    get location() {
      return location;
    },
    get length() {
      return opts.getLength();
    },
    subscribers,
    subscribe: (cb) => {
      subscribers.add(cb);
      return () => {
        subscribers.delete(cb);
      };
    },
    push: (path, state, navigateOpts) => {
      const currentIndex = location.state[stateIndexKey];
      state = assignKeyAndIndex(currentIndex + 1, state);
      tryNavigation({
        task: () => {
          opts.pushState(path, state);
          notify({ type: "PUSH" });
        },
        navigateOpts,
        type: "PUSH",
        path,
        state
      });
    },
    replace: (path, state, navigateOpts) => {
      const currentIndex = location.state[stateIndexKey];
      state = assignKeyAndIndex(currentIndex, state);
      tryNavigation({
        task: () => {
          opts.replaceState(path, state);
          notify({ type: "REPLACE" });
        },
        navigateOpts,
        type: "REPLACE",
        path,
        state
      });
    },
    go: (index, navigateOpts) => {
      tryNavigation({
        task: () => {
          opts.go(index);
          handleIndexChange({ type: "GO", index });
        },
        navigateOpts,
        type: "GO"
      });
    },
    back: (navigateOpts) => {
      tryNavigation({
        task: () => {
          opts.back((navigateOpts == null ? void 0 : navigateOpts.ignoreBlocker) ?? false);
          handleIndexChange({ type: "BACK" });
        },
        navigateOpts,
        type: "BACK"
      });
    },
    forward: (navigateOpts) => {
      tryNavigation({
        task: () => {
          opts.forward((navigateOpts == null ? void 0 : navigateOpts.ignoreBlocker) ?? false);
          handleIndexChange({ type: "FORWARD" });
        },
        navigateOpts,
        type: "FORWARD"
      });
    },
    canGoBack: () => location.state[stateIndexKey] !== 0,
    createHref: (str) => opts.createHref(str),
    block: (blocker) => {
      var _a;
      if (!opts.setBlockers) return () => {
      };
      const blockers = ((_a = opts.getBlockers) == null ? void 0 : _a.call(opts)) ?? [];
      opts.setBlockers([...blockers, blocker]);
      return () => {
        var _a2, _b;
        const blockers2 = ((_a2 = opts.getBlockers) == null ? void 0 : _a2.call(opts)) ?? [];
        (_b = opts.setBlockers) == null ? void 0 : _b.call(opts, blockers2.filter((b) => b !== blocker));
      };
    },
    flush: () => {
      var _a;
      return (_a = opts.flush) == null ? void 0 : _a.call(opts);
    },
    destroy: () => {
      var _a;
      return (_a = opts.destroy) == null ? void 0 : _a.call(opts);
    },
    notify
  };
}
function assignKeyAndIndex(index, state) {
  if (!state) {
    state = {};
  }
  const key = createRandomKey();
  return {
    ...state,
    key,
    // TODO: Remove in v2 - use __TSR_key instead
    __TSR_key: key,
    [stateIndexKey]: index
  };
}
function createBrowserHistory(opts) {
  var _a, _b;
  const win = (opts == null ? void 0 : opts.window) ?? (typeof document !== "undefined" ? window : void 0);
  const originalPushState = win.history.pushState;
  const originalReplaceState = win.history.replaceState;
  let blockers = [];
  const _getBlockers = () => blockers;
  const _setBlockers = (newBlockers) => blockers = newBlockers;
  const createHref = (opts == null ? void 0 : opts.createHref) ?? ((path) => path);
  const parseLocation = (opts == null ? void 0 : opts.parseLocation) ?? (() => parseHref(
    `${win.location.pathname}${win.location.search}${win.location.hash}`,
    win.history.state
  ));
  if (!((_a = win.history.state) == null ? void 0 : _a.__TSR_key) && !((_b = win.history.state) == null ? void 0 : _b.key)) {
    const addedKey = createRandomKey();
    win.history.replaceState(
      {
        [stateIndexKey]: 0,
        key: addedKey,
        // TODO: Remove in v2 - use __TSR_key instead
        __TSR_key: addedKey
      },
      ""
    );
  }
  let currentLocation = parseLocation();
  let rollbackLocation;
  let nextPopIsGo = false;
  let ignoreNextPop = false;
  let skipBlockerNextPop = false;
  let ignoreNextBeforeUnload = false;
  const getLocation = () => currentLocation;
  let next;
  let scheduled;
  const flush = () => {
    if (!next) {
      return;
    }
    history._ignoreSubscribers = true;
    (next.isPush ? win.history.pushState : win.history.replaceState)(
      next.state,
      "",
      next.href
    );
    history._ignoreSubscribers = false;
    next = void 0;
    scheduled = void 0;
    rollbackLocation = void 0;
  };
  const queueHistoryAction = (type, destHref, state) => {
    const href = createHref(destHref);
    if (!scheduled) {
      rollbackLocation = currentLocation;
    }
    currentLocation = parseHref(destHref, state);
    next = {
      href,
      state,
      isPush: (next == null ? void 0 : next.isPush) || type === "push"
    };
    if (!scheduled) {
      scheduled = Promise.resolve().then(() => flush());
    }
  };
  const onPushPop = (type) => {
    currentLocation = parseLocation();
    history.notify({ type });
  };
  const onPushPopEvent = async () => {
    if (ignoreNextPop) {
      ignoreNextPop = false;
      return;
    }
    const nextLocation = parseLocation();
    const delta = nextLocation.state[stateIndexKey] - currentLocation.state[stateIndexKey];
    const isForward = delta === 1;
    const isBack = delta === -1;
    const isGo = !isForward && !isBack || nextPopIsGo;
    nextPopIsGo = false;
    const action = isGo ? "GO" : isBack ? "BACK" : "FORWARD";
    const notify = isGo ? {
      type: "GO",
      index: delta
    } : {
      type: isBack ? "BACK" : "FORWARD"
    };
    if (skipBlockerNextPop) {
      skipBlockerNextPop = false;
    } else {
      const blockers2 = _getBlockers();
      if (typeof document !== "undefined" && blockers2.length) {
        for (const blocker of blockers2) {
          const isBlocked = await blocker.blockerFn({
            currentLocation,
            nextLocation,
            action
          });
          if (isBlocked) {
            ignoreNextPop = true;
            win.history.go(1);
            history.notify(notify);
            return;
          }
        }
      }
    }
    currentLocation = parseLocation();
    history.notify(notify);
  };
  const onBeforeUnload = (e) => {
    if (ignoreNextBeforeUnload) {
      ignoreNextBeforeUnload = false;
      return;
    }
    let shouldBlock = false;
    const blockers2 = _getBlockers();
    if (typeof document !== "undefined" && blockers2.length) {
      for (const blocker of blockers2) {
        const shouldHaveBeforeUnload = blocker.enableBeforeUnload ?? true;
        if (shouldHaveBeforeUnload === true) {
          shouldBlock = true;
          break;
        }
        if (typeof shouldHaveBeforeUnload === "function" && shouldHaveBeforeUnload() === true) {
          shouldBlock = true;
          break;
        }
      }
    }
    if (shouldBlock) {
      e.preventDefault();
      return e.returnValue = "";
    }
    return;
  };
  const history = createHistory({
    getLocation,
    getLength: () => win.history.length,
    pushState: (href, state) => queueHistoryAction("push", href, state),
    replaceState: (href, state) => queueHistoryAction("replace", href, state),
    back: (ignoreBlocker) => {
      if (ignoreBlocker) skipBlockerNextPop = true;
      ignoreNextBeforeUnload = true;
      return win.history.back();
    },
    forward: (ignoreBlocker) => {
      if (ignoreBlocker) skipBlockerNextPop = true;
      ignoreNextBeforeUnload = true;
      win.history.forward();
    },
    go: (n) => {
      nextPopIsGo = true;
      win.history.go(n);
    },
    createHref: (href) => createHref(href),
    flush,
    destroy: () => {
      win.history.pushState = originalPushState;
      win.history.replaceState = originalReplaceState;
      win.removeEventListener(beforeUnloadEvent, onBeforeUnload, {
        capture: true
      });
      win.removeEventListener(popStateEvent, onPushPopEvent);
    },
    onBlocked: () => {
      if (rollbackLocation && currentLocation !== rollbackLocation) {
        currentLocation = rollbackLocation;
      }
    },
    getBlockers: _getBlockers,
    setBlockers: _setBlockers,
    notifyOnIndexChange: false
  });
  win.addEventListener(beforeUnloadEvent, onBeforeUnload, { capture: true });
  win.addEventListener(popStateEvent, onPushPopEvent);
  win.history.pushState = function(...args) {
    const res = originalPushState.apply(win.history, args);
    if (!history._ignoreSubscribers) onPushPop("PUSH");
    return res;
  };
  win.history.replaceState = function(...args) {
    const res = originalReplaceState.apply(win.history, args);
    if (!history._ignoreSubscribers) onPushPop("REPLACE");
    return res;
  };
  return history;
}
function createHashHistory(opts) {
  const win = (opts == null ? void 0 : opts.window) ?? (typeof document !== "undefined" ? window : void 0);
  return createBrowserHistory({
    window: win,
    parseLocation: () => {
      const hashSplit = win.location.hash.split("#").slice(1);
      const pathPart = hashSplit[0] ?? "/";
      const searchPart = win.location.search;
      const hashEntries = hashSplit.slice(1);
      const hashPart = hashEntries.length === 0 ? "" : `#${hashEntries.join("#")}`;
      const hashHref = `${pathPart}${searchPart}${hashPart}`;
      return parseHref(hashHref, win.history.state);
    },
    createHref: (href) => `${win.location.pathname}${win.location.search}#${href}`
  });
}
function createMemoryHistory(opts = {
  initialEntries: ["/"]
}) {
  const entries = opts.initialEntries;
  let index = opts.initialIndex ? Math.min(Math.max(opts.initialIndex, 0), entries.length - 1) : entries.length - 1;
  const states = entries.map(
    (_entry, index2) => assignKeyAndIndex(index2, void 0)
  );
  const getLocation = () => parseHref(entries[index], states[index]);
  return createHistory({
    getLocation,
    getLength: () => entries.length,
    pushState: (path, state) => {
      if (index < entries.length - 1) {
        entries.splice(index + 1);
        states.splice(index + 1);
      }
      states.push(state);
      entries.push(path);
      index = Math.max(entries.length - 1, 0);
    },
    replaceState: (path, state) => {
      states[index] = state;
      entries[index] = path;
    },
    back: () => {
      index = Math.max(index - 1, 0);
    },
    forward: () => {
      index = Math.min(index + 1, entries.length - 1);
    },
    go: (n) => {
      index = Math.min(Math.max(index + n, 0), entries.length - 1);
    },
    createHref: (path) => path
  });
}
function parseHref(href, state) {
  const hashIndex = href.indexOf("#");
  const searchIndex = href.indexOf("?");
  const addedKey = createRandomKey();
  return {
    href,
    pathname: href.substring(
      0,
      hashIndex > 0 ? searchIndex > 0 ? Math.min(hashIndex, searchIndex) : hashIndex : searchIndex > 0 ? searchIndex : href.length
    ),
    hash: hashIndex > -1 ? href.substring(hashIndex) : "",
    search: searchIndex > -1 ? href.slice(searchIndex, hashIndex === -1 ? void 0 : hashIndex) : "",
    state: state || { [stateIndexKey]: 0, key: addedKey, __TSR_key: addedKey }
  };
}
function createRandomKey() {
  return (Math.random() + 1).toString(36).substring(7);
}

// ../../node_modules/.deno/@tanstack+router-core@1.125.4/node_modules/@tanstack/router-core/dist/esm/utils.js
function last(arr) {
  return arr[arr.length - 1];
}
function isFunction(d) {
  return typeof d === "function";
}
function functionalUpdate(updater, previous) {
  if (isFunction(updater)) {
    return updater(previous);
  }
  return updater;
}
function pick(parent, keys) {
  return keys.reduce((obj, key) => {
    obj[key] = parent[key];
    return obj;
  }, {});
}
function replaceEqualDeep(prev, _next) {
  if (prev === _next) {
    return prev;
  }
  const next = _next;
  const array = isPlainArray(prev) && isPlainArray(next);
  if (array || isSimplePlainObject(prev) && isSimplePlainObject(next)) {
    const prevItems = array ? prev : Object.keys(prev).concat(
      Object.getOwnPropertySymbols(prev)
    );
    const prevSize = prevItems.length;
    const nextItems = array ? next : Object.keys(next).concat(
      Object.getOwnPropertySymbols(next)
    );
    const nextSize = nextItems.length;
    const copy = array ? [] : {};
    let equalItems = 0;
    for (let i = 0; i < nextSize; i++) {
      const key = array ? i : nextItems[i];
      if ((!array && prevItems.includes(key) || array) && prev[key] === void 0 && next[key] === void 0) {
        copy[key] = void 0;
        equalItems++;
      } else {
        copy[key] = replaceEqualDeep(prev[key], next[key]);
        if (copy[key] === prev[key] && prev[key] !== void 0) {
          equalItems++;
        }
      }
    }
    return prevSize === nextSize && equalItems === prevSize ? prev : copy;
  }
  return next;
}
function isSimplePlainObject(o) {
  return (
    // all the checks from isPlainObject are more likely to hit so we perform them first
    isPlainObject(o) && Object.getOwnPropertyNames(o).length === Object.keys(o).length
  );
}
function isPlainObject(o) {
  if (!hasObjectPrototype(o)) {
    return false;
  }
  const ctor = o.constructor;
  if (typeof ctor === "undefined") {
    return true;
  }
  const prot = ctor.prototype;
  if (!hasObjectPrototype(prot)) {
    return false;
  }
  if (!prot.hasOwnProperty("isPrototypeOf")) {
    return false;
  }
  return true;
}
function hasObjectPrototype(o) {
  return Object.prototype.toString.call(o) === "[object Object]";
}
function isPlainArray(value) {
  return Array.isArray(value) && value.length === Object.keys(value).length;
}
function getObjectKeys(obj, ignoreUndefined) {
  let keys = Object.keys(obj);
  if (ignoreUndefined) {
    keys = keys.filter((key) => obj[key] !== void 0);
  }
  return keys;
}
function deepEqual(a, b, opts) {
  if (a === b) {
    return true;
  }
  if (typeof a !== typeof b) {
    return false;
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const ignoreUndefined = (opts == null ? void 0 : opts.ignoreUndefined) ?? true;
    const aKeys = getObjectKeys(a, ignoreUndefined);
    const bKeys = getObjectKeys(b, ignoreUndefined);
    if (!(opts == null ? void 0 : opts.partial) && aKeys.length !== bKeys.length) {
      return false;
    }
    return bKeys.every((key) => deepEqual(a[key], b[key], opts));
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    return !a.some((item, index) => !deepEqual(item, b[index], opts));
  }
  return false;
}
function createControlledPromise(onResolve) {
  let resolveLoadPromise;
  let rejectLoadPromise;
  const controlledPromise = new Promise((resolve, reject) => {
    resolveLoadPromise = resolve;
    rejectLoadPromise = reject;
  });
  controlledPromise.status = "pending";
  controlledPromise.resolve = (value) => {
    controlledPromise.status = "resolved";
    controlledPromise.value = value;
    resolveLoadPromise(value);
    onResolve == null ? void 0 : onResolve(value);
  };
  controlledPromise.reject = (e) => {
    controlledPromise.status = "rejected";
    rejectLoadPromise(e);
  };
  return controlledPromise;
}
function escapeJSON(jsonString) {
  return jsonString.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, '\\"');
}
function shallow(objA, objB) {
  if (Object.is(objA, objB)) {
    return true;
  }
  if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
    return false;
  }
  const keysA = Object.keys(objA);
  if (keysA.length !== Object.keys(objB).length) {
    return false;
  }
  for (const item of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, item) || !Object.is(objA[item], objB[item])) {
      return false;
    }
  }
  return true;
}
function isModuleNotFoundError(error) {
  if (typeof (error == null ? void 0 : error.message) !== "string") return false;
  return error.message.startsWith("Failed to fetch dynamically imported module") || error.message.startsWith("error loading dynamically imported module") || error.message.startsWith("Importing a module script failed");
}

// ../../node_modules/.deno/@tanstack+router-core@1.125.4/node_modules/@tanstack/router-core/dist/esm/path.js
function joinPaths(paths) {
  return cleanPath(
    paths.filter((val) => {
      return val !== void 0;
    }).join("/")
  );
}
function cleanPath(path) {
  return path.replace(/\/{2,}/g, "/");
}
function trimPathLeft(path) {
  return path === "/" ? path : path.replace(/^\/{1,}/, "");
}
function trimPathRight(path) {
  return path === "/" ? path : path.replace(/\/{1,}$/, "");
}
function trimPath(path) {
  return trimPathRight(trimPathLeft(path));
}
function removeTrailingSlash(value, basepath) {
  if ((value == null ? void 0 : value.endsWith("/")) && value !== "/" && value !== `${basepath}/`) {
    return value.slice(0, -1);
  }
  return value;
}
function exactPathTest(pathName1, pathName2, basepath) {
  return removeTrailingSlash(pathName1, basepath) === removeTrailingSlash(pathName2, basepath);
}
function resolvePath({
  basepath,
  base,
  to,
  trailingSlash = "never",
  caseSensitive
}) {
  var _a, _b;
  base = removeBasepath(basepath, base, caseSensitive);
  to = removeBasepath(basepath, to, caseSensitive);
  let baseSegments = parsePathname(base);
  const toSegments = parsePathname(to);
  if (baseSegments.length > 1 && ((_a = last(baseSegments)) == null ? void 0 : _a.value) === "/") {
    baseSegments.pop();
  }
  toSegments.forEach((toSegment, index) => {
    if (toSegment.value === "/") {
      if (!index) {
        baseSegments = [toSegment];
      } else if (index === toSegments.length - 1) {
        baseSegments.push(toSegment);
      } else ;
    } else if (toSegment.value === "..") {
      baseSegments.pop();
    } else if (toSegment.value === ".") ;
    else {
      baseSegments.push(toSegment);
    }
  });
  if (baseSegments.length > 1) {
    if (((_b = last(baseSegments)) == null ? void 0 : _b.value) === "/") {
      if (trailingSlash === "never") {
        baseSegments.pop();
      }
    } else if (trailingSlash === "always") {
      baseSegments.push({ type: "pathname", value: "/" });
    }
  }
  const segmentValues = baseSegments.map((segment) => {
    if (segment.type === "param") {
      const param = segment.value.substring(1);
      if (segment.prefixSegment && segment.suffixSegment) {
        return `${segment.prefixSegment}{$${param}}${segment.suffixSegment}`;
      } else if (segment.prefixSegment) {
        return `${segment.prefixSegment}{$${param}}`;
      } else if (segment.suffixSegment) {
        return `{$${param}}${segment.suffixSegment}`;
      }
    }
    if (segment.type === "wildcard") {
      if (segment.prefixSegment && segment.suffixSegment) {
        return `${segment.prefixSegment}{$}${segment.suffixSegment}`;
      } else if (segment.prefixSegment) {
        return `${segment.prefixSegment}{$}`;
      } else if (segment.suffixSegment) {
        return `{$}${segment.suffixSegment}`;
      }
    }
    return segment.value;
  });
  const joined = joinPaths([basepath, ...segmentValues]);
  return cleanPath(joined);
}
var PARAM_RE = /^\$.{1,}$/;
var PARAM_W_CURLY_BRACES_RE = /^(.*?)\{(\$[a-zA-Z_$][a-zA-Z0-9_$]*)\}(.*)$/;
var WILDCARD_RE = /^\$$/;
var WILDCARD_W_CURLY_BRACES_RE = /^(.*?)\{\$\}(.*)$/;
function parsePathname(pathname) {
  if (!pathname) {
    return [];
  }
  pathname = cleanPath(pathname);
  const segments = [];
  if (pathname.slice(0, 1) === "/") {
    pathname = pathname.substring(1);
    segments.push({
      type: "pathname",
      value: "/"
    });
  }
  if (!pathname) {
    return segments;
  }
  const split = pathname.split("/").filter(Boolean);
  segments.push(
    ...split.map((part) => {
      const wildcardBracesMatch = part.match(WILDCARD_W_CURLY_BRACES_RE);
      if (wildcardBracesMatch) {
        const prefix2 = wildcardBracesMatch[1];
        const suffix = wildcardBracesMatch[2];
        return {
          type: "wildcard",
          value: "$",
          prefixSegment: prefix2 || void 0,
          suffixSegment: suffix || void 0
        };
      }
      const paramBracesMatch = part.match(PARAM_W_CURLY_BRACES_RE);
      if (paramBracesMatch) {
        const prefix2 = paramBracesMatch[1];
        const paramName = paramBracesMatch[2];
        const suffix = paramBracesMatch[3];
        return {
          type: "param",
          value: "" + paramName,
          prefixSegment: prefix2 || void 0,
          suffixSegment: suffix || void 0
        };
      }
      if (PARAM_RE.test(part)) {
        const paramName = part.substring(1);
        return {
          type: "param",
          value: "$" + paramName,
          prefixSegment: void 0,
          suffixSegment: void 0
        };
      }
      if (WILDCARD_RE.test(part)) {
        return {
          type: "wildcard",
          value: "$",
          prefixSegment: void 0,
          suffixSegment: void 0
        };
      }
      return {
        type: "pathname",
        value: part.includes("%25") ? part.split("%25").map((segment) => decodeURI(segment)).join("%25") : decodeURI(part)
      };
    })
  );
  if (pathname.slice(-1) === "/") {
    pathname = pathname.substring(1);
    segments.push({
      type: "pathname",
      value: "/"
    });
  }
  return segments;
}
function interpolatePath({
  path,
  params,
  leaveWildcards,
  leaveParams,
  decodeCharMap
}) {
  const interpolatedPathSegments = parsePathname(path);
  function encodeParam(key) {
    const value = params[key];
    const isValueString = typeof value === "string";
    if (["*", "_splat"].includes(key)) {
      return isValueString ? encodeURI(value) : value;
    } else {
      return isValueString ? encodePathParam(value, decodeCharMap) : value;
    }
  }
  let isMissingParams = false;
  const usedParams = {};
  const interpolatedPath = joinPaths(
    interpolatedPathSegments.map((segment) => {
      if (segment.type === "wildcard") {
        usedParams._splat = params._splat;
        const segmentPrefix = segment.prefixSegment || "";
        const segmentSuffix = segment.suffixSegment || "";
        if (!("_splat" in params)) {
          isMissingParams = true;
          if (leaveWildcards) {
            return `${segmentPrefix}${segment.value}${segmentSuffix}`;
          }
          if (segmentPrefix || segmentSuffix) {
            return `${segmentPrefix}${segmentSuffix}`;
          }
          return void 0;
        }
        const value = encodeParam("_splat");
        if (leaveWildcards) {
          return `${segmentPrefix}${segment.value}${value ?? ""}${segmentSuffix}`;
        }
        return `${segmentPrefix}${value}${segmentSuffix}`;
      }
      if (segment.type === "param") {
        const key = segment.value.substring(1);
        if (!isMissingParams && !(key in params)) {
          isMissingParams = true;
        }
        usedParams[key] = params[key];
        const segmentPrefix = segment.prefixSegment || "";
        const segmentSuffix = segment.suffixSegment || "";
        if (leaveParams) {
          const value = encodeParam(segment.value);
          return `${segmentPrefix}${segment.value}${value ?? ""}${segmentSuffix}`;
        }
        return `${segmentPrefix}${encodeParam(key) ?? "undefined"}${segmentSuffix}`;
      }
      return segment.value;
    })
  );
  return { usedParams, interpolatedPath, isMissingParams };
}
function encodePathParam(value, decodeCharMap) {
  let encoded = encodeURIComponent(value);
  if (decodeCharMap) {
    for (const [encodedChar, char] of decodeCharMap) {
      encoded = encoded.replaceAll(encodedChar, char);
    }
  }
  return encoded;
}
function matchPathname(basepath, currentPathname, matchLocation) {
  const pathParams = matchByPath(basepath, currentPathname, matchLocation);
  if (matchLocation.to && !pathParams) {
    return;
  }
  return pathParams ?? {};
}
function removeBasepath(basepath, pathname, caseSensitive = false) {
  const normalizedBasepath = caseSensitive ? basepath : basepath.toLowerCase();
  const normalizedPathname = caseSensitive ? pathname : pathname.toLowerCase();
  switch (true) {
    // default behaviour is to serve app from the root - pathname
    // left untouched
    case normalizedBasepath === "/":
      return pathname;
    // shortcut for removing the basepath if it matches the pathname
    case normalizedPathname === normalizedBasepath:
      return "";
    // in case pathname is shorter than basepath - there is
    // nothing to remove
    case pathname.length < basepath.length:
      return pathname;
    // avoid matching partial segments - strict equality handled
    // earlier, otherwise, basepath separated from pathname with
    // separator, therefore lack of separator means partial
    // segment match (`/app` should not match `/application`)
    case normalizedPathname[normalizedBasepath.length] !== "/":
      return pathname;
    // remove the basepath from the pathname if it starts with it
    case normalizedPathname.startsWith(normalizedBasepath):
      return pathname.slice(basepath.length);
    // otherwise, return the pathname as is
    default:
      return pathname;
  }
}
function matchByPath(basepath, from, matchLocation) {
  if (basepath !== "/" && !from.startsWith(basepath)) {
    return void 0;
  }
  from = removeBasepath(basepath, from, matchLocation.caseSensitive);
  const to = removeBasepath(
    basepath,
    `${matchLocation.to ?? "$"}`,
    matchLocation.caseSensitive
  );
  const baseSegments = parsePathname(from);
  const routeSegments = parsePathname(to);
  if (!from.startsWith("/")) {
    baseSegments.unshift({
      type: "pathname",
      value: "/"
    });
  }
  if (!to.startsWith("/")) {
    routeSegments.unshift({
      type: "pathname",
      value: "/"
    });
  }
  const params = {};
  const isMatch2 = (() => {
    var _a;
    for (let i = 0; i < Math.max(baseSegments.length, routeSegments.length); i++) {
      const baseSegment = baseSegments[i];
      const routeSegment = routeSegments[i];
      const isLastBaseSegment = i >= baseSegments.length - 1;
      const isLastRouteSegment = i >= routeSegments.length - 1;
      if (routeSegment) {
        if (routeSegment.type === "wildcard") {
          const remainingBaseSegments = baseSegments.slice(i);
          let _splat;
          if (routeSegment.prefixSegment || routeSegment.suffixSegment) {
            if (!baseSegment) return false;
            const prefix2 = routeSegment.prefixSegment || "";
            const suffix = routeSegment.suffixSegment || "";
            const baseValue = baseSegment.value;
            if ("prefixSegment" in routeSegment) {
              if (!baseValue.startsWith(prefix2)) {
                return false;
              }
            }
            if ("suffixSegment" in routeSegment) {
              if (!((_a = baseSegments[baseSegments.length - 1]) == null ? void 0 : _a.value.endsWith(suffix))) {
                return false;
              }
            }
            let rejoinedSplat = decodeURI(
              joinPaths(remainingBaseSegments.map((d) => d.value))
            );
            if (prefix2 && rejoinedSplat.startsWith(prefix2)) {
              rejoinedSplat = rejoinedSplat.slice(prefix2.length);
            }
            if (suffix && rejoinedSplat.endsWith(suffix)) {
              rejoinedSplat = rejoinedSplat.slice(
                0,
                rejoinedSplat.length - suffix.length
              );
            }
            _splat = rejoinedSplat;
          } else {
            _splat = decodeURI(
              joinPaths(remainingBaseSegments.map((d) => d.value))
            );
          }
          params["*"] = _splat;
          params["_splat"] = _splat;
          return true;
        }
        if (routeSegment.type === "pathname") {
          if (routeSegment.value === "/" && !(baseSegment == null ? void 0 : baseSegment.value)) {
            return true;
          }
          if (baseSegment) {
            if (matchLocation.caseSensitive) {
              if (routeSegment.value !== baseSegment.value) {
                return false;
              }
            } else if (routeSegment.value.toLowerCase() !== baseSegment.value.toLowerCase()) {
              return false;
            }
          }
        }
        if (!baseSegment) {
          return false;
        }
        if (routeSegment.type === "param") {
          if (baseSegment.value === "/") {
            return false;
          }
          let _paramValue;
          if (routeSegment.prefixSegment || routeSegment.suffixSegment) {
            const prefix2 = routeSegment.prefixSegment || "";
            const suffix = routeSegment.suffixSegment || "";
            const baseValue = baseSegment.value;
            if (prefix2 && !baseValue.startsWith(prefix2)) {
              return false;
            }
            if (suffix && !baseValue.endsWith(suffix)) {
              return false;
            }
            let paramValue = baseValue;
            if (prefix2 && paramValue.startsWith(prefix2)) {
              paramValue = paramValue.slice(prefix2.length);
            }
            if (suffix && paramValue.endsWith(suffix)) {
              paramValue = paramValue.slice(
                0,
                paramValue.length - suffix.length
              );
            }
            _paramValue = decodeURIComponent(paramValue);
          } else {
            _paramValue = decodeURIComponent(baseSegment.value);
          }
          params[routeSegment.value.substring(1)] = _paramValue;
        }
      }
      if (!isLastBaseSegment && isLastRouteSegment) {
        params["**"] = joinPaths(baseSegments.slice(i + 1).map((d) => d.value));
        return !!matchLocation.fuzzy && (routeSegment == null ? void 0 : routeSegment.value) !== "/";
      }
    }
    return true;
  })();
  return isMatch2 ? params : void 0;
}

// ../../node_modules/.deno/@tanstack+router-core@1.125.4/node_modules/@tanstack/router-core/dist/esm/not-found.js
function notFound(options = {}) {
  options.isNotFound = true;
  if (options.throw) throw options;
  return options;
}
function isNotFound(obj) {
  return !!(obj == null ? void 0 : obj.isNotFound);
}

// ../../node_modules/.deno/@tanstack+router-core@1.125.4/node_modules/@tanstack/router-core/dist/esm/qss.js
function encode(obj, pfx) {
  const normalizedObject = Object.entries(obj).flatMap(([key, value]) => {
    if (Array.isArray(value)) {
      return value.map((v) => [key, String(v)]);
    } else {
      return [[key, String(value)]];
    }
  });
  const searchParams = new URLSearchParams(normalizedObject);
  return (pfx || "") + searchParams.toString();
}
function toValue(str) {
  if (!str) return "";
  if (str === "false") return false;
  if (str === "true") return true;
  return +str * 0 === 0 && +str + "" === str ? +str : str;
}
function decode(str, pfx) {
  const searchParamsPart = pfx ? str.slice(pfx.length) : str;
  const searchParams = new URLSearchParams(searchParamsPart);
  const entries = [...searchParams.entries()];
  return entries.reduce((acc, [key, value]) => {
    const previousValue = acc[key];
    if (previousValue == null) {
      acc[key] = toValue(value);
    } else {
      acc[key] = Array.isArray(previousValue) ? [...previousValue, toValue(value)] : [previousValue, toValue(value)];
    }
    return acc;
  }, {});
}

// ../../node_modules/.deno/@tanstack+router-core@1.125.4/node_modules/@tanstack/router-core/dist/esm/searchParams.js
var defaultParseSearch = parseSearchWith(JSON.parse);
var defaultStringifySearch = stringifySearchWith(
  JSON.stringify,
  JSON.parse
);
function parseSearchWith(parser) {
  return (searchStr) => {
    if (searchStr.substring(0, 1) === "?") {
      searchStr = searchStr.substring(1);
    }
    const query = decode(searchStr);
    for (const key in query) {
      const value = query[key];
      if (typeof value === "string") {
        try {
          query[key] = parser(value);
        } catch (err) {
        }
      }
    }
    return query;
  };
}
function stringifySearchWith(stringify, parser) {
  function stringifyValue(val) {
    if (typeof val === "object" && val !== null) {
      try {
        return stringify(val);
      } catch (err) {
      }
    } else if (typeof val === "string" && typeof parser === "function") {
      try {
        parser(val);
        return stringify(val);
      } catch (err) {
      }
    }
    return val;
  }
  return (search) => {
    search = { ...search };
    Object.keys(search).forEach((key) => {
      const val = search[key];
      if (typeof val === "undefined" || val === void 0) {
        delete search[key];
      } else {
        search[key] = stringifyValue(val);
      }
    });
    const searchStr = encode(search).toString();
    return searchStr ? `?${searchStr}` : "";
  };
}

// ../../node_modules/.deno/@tanstack+router-core@1.125.4/node_modules/@tanstack/router-core/dist/esm/root.js
var rootRouteId = "__root__";

// ../../node_modules/.deno/@tanstack+router-core@1.125.4/node_modules/@tanstack/router-core/dist/esm/redirect.js
function redirect(opts) {
  opts.statusCode = opts.statusCode || opts.code || 307;
  if (!opts.reloadDocument) {
    try {
      new URL(`${opts.href}`);
      opts.reloadDocument = true;
    } catch {
    }
  }
  const headers = new Headers(opts.headers || {});
  if (opts.href && headers.get("Location") === null) {
    headers.set("Location", opts.href);
  }
  const response = new Response(null, {
    status: opts.statusCode,
    headers
  });
  response.options = opts;
  if (opts.throw) {
    throw response;
  }
  return response;
}
function isRedirect(obj) {
  return obj instanceof Response && !!obj.options;
}

// ../../node_modules/.deno/@tanstack+router-core@1.125.4/node_modules/@tanstack/router-core/dist/esm/scroll-restoration.js
function getSafeSessionStorage() {
  try {
    if (typeof window !== "undefined" && typeof window.sessionStorage === "object") {
      return window.sessionStorage;
    }
  } catch {
    return void 0;
  }
  return void 0;
}
var storageKey = "tsr-scroll-restoration-v1_3";
var throttle = (fn, wait) => {
  let timeout;
  return (...args) => {
    if (!timeout) {
      timeout = setTimeout(() => {
        fn(...args);
        timeout = null;
      }, wait);
    }
  };
};
function createScrollRestorationCache() {
  const safeSessionStorage = getSafeSessionStorage();
  if (!safeSessionStorage) {
    return void 0;
  }
  const persistedState = safeSessionStorage.getItem(storageKey);
  let state = persistedState ? JSON.parse(persistedState) : {};
  return {
    state,
    // This setter is simply to make sure that we set the sessionStorage right
    // after the state is updated. It doesn't necessarily need to be a functional
    // update.
    set: (updater) => (state = functionalUpdate(updater, state) || state, safeSessionStorage.setItem(storageKey, JSON.stringify(state)))
  };
}
var scrollRestorationCache = createScrollRestorationCache();
var defaultGetScrollRestorationKey = (location) => {
  return location.state.__TSR_key || location.href;
};
function getCssSelector(el) {
  const path = [];
  let parent;
  while (parent = el.parentNode) {
    path.unshift(
      `${el.tagName}:nth-child(${[].indexOf.call(parent.children, el) + 1})`
    );
    el = parent;
  }
  return `${path.join(" > ")}`.toLowerCase();
}
var ignoreScroll = false;
function restoreScroll(storageKey2, key, behavior, shouldScrollRestoration, scrollToTopSelectors) {
  var _a;
  let byKey;
  try {
    byKey = JSON.parse(sessionStorage.getItem(storageKey2) || "{}");
  } catch (error) {
    console.error(error);
    return;
  }
  const resolvedKey = key || ((_a = window.history.state) == null ? void 0 : _a.key);
  const elementEntries = byKey[resolvedKey];
  ignoreScroll = true;
  (() => {
    if (shouldScrollRestoration && elementEntries) {
      for (const elementSelector in elementEntries) {
        const entry = elementEntries[elementSelector];
        if (elementSelector === "window") {
          window.scrollTo({
            top: entry.scrollY,
            left: entry.scrollX,
            behavior
          });
        } else if (elementSelector) {
          const element = document.querySelector(elementSelector);
          if (element) {
            element.scrollLeft = entry.scrollX;
            element.scrollTop = entry.scrollY;
          }
        }
      }
      return;
    }
    const hash = window.location.hash.split("#")[1];
    if (hash) {
      const hashScrollIntoViewOptions = (window.history.state || {}).__hashScrollIntoViewOptions ?? true;
      if (hashScrollIntoViewOptions) {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView(hashScrollIntoViewOptions);
        }
      }
      return;
    }
    [
      "window",
      ...(scrollToTopSelectors == null ? void 0 : scrollToTopSelectors.filter((d) => d !== "window")) ?? []
    ].forEach((selector) => {
      const element = selector === "window" ? window : typeof selector === "function" ? selector() : document.querySelector(selector);
      if (element) {
        element.scrollTo({
          top: 0,
          left: 0,
          behavior
        });
      }
    });
  })();
  ignoreScroll = false;
}
function setupScrollRestoration(router, force) {
  if (scrollRestorationCache === void 0) {
    return;
  }
  const shouldScrollRestoration = force ?? router.options.scrollRestoration ?? false;
  if (shouldScrollRestoration) {
    router.isScrollRestoring = true;
  }
  if (typeof document === "undefined" || router.isScrollRestorationSetup) {
    return;
  }
  router.isScrollRestorationSetup = true;
  ignoreScroll = false;
  const getKey = router.options.getScrollRestorationKey || defaultGetScrollRestorationKey;
  window.history.scrollRestoration = "manual";
  const onScroll = (event) => {
    if (ignoreScroll || !router.isScrollRestoring) {
      return;
    }
    let elementSelector = "";
    if (event.target === document || event.target === window) {
      elementSelector = "window";
    } else {
      const attrId = event.target.getAttribute(
        "data-scroll-restoration-id"
      );
      if (attrId) {
        elementSelector = `[data-scroll-restoration-id="${attrId}"]`;
      } else {
        elementSelector = getCssSelector(event.target);
      }
    }
    const restoreKey = getKey(router.state.location);
    scrollRestorationCache.set((state) => {
      const keyEntry = state[restoreKey] = state[restoreKey] || {};
      const elementEntry = keyEntry[elementSelector] = keyEntry[elementSelector] || {};
      if (elementSelector === "window") {
        elementEntry.scrollX = window.scrollX || 0;
        elementEntry.scrollY = window.scrollY || 0;
      } else if (elementSelector) {
        const element = document.querySelector(elementSelector);
        if (element) {
          elementEntry.scrollX = element.scrollLeft || 0;
          elementEntry.scrollY = element.scrollTop || 0;
        }
      }
      return state;
    });
  };
  if (typeof document !== "undefined") {
    document.addEventListener("scroll", throttle(onScroll, 100), true);
  }
  router.subscribe("onRendered", (event) => {
    const cacheKey = getKey(event.toLocation);
    if (!router.resetNextScroll) {
      router.resetNextScroll = true;
      return;
    }
    restoreScroll(
      storageKey,
      cacheKey,
      router.options.scrollRestorationBehavior || void 0,
      router.isScrollRestoring || void 0,
      router.options.scrollToTopSelectors || void 0
    );
    if (router.isScrollRestoring) {
      scrollRestorationCache.set((state) => {
        state[cacheKey] = state[cacheKey] || {};
        return state;
      });
    }
  });
}
function handleHashScroll(router) {
  if (typeof document !== "undefined" && document.querySelector) {
    const hashScrollIntoViewOptions = router.state.location.state.__hashScrollIntoViewOptions ?? true;
    if (hashScrollIntoViewOptions && router.state.location.hash !== "") {
      const el = document.getElementById(router.state.location.hash);
      if (el) {
        el.scrollIntoView(hashScrollIntoViewOptions);
      }
    }
  }
}

// ../../node_modules/.deno/@tanstack+router-core@1.125.4/node_modules/@tanstack/router-core/dist/esm/router.js
function defaultSerializeError(err) {
  if (err instanceof Error) {
    const obj = {
      name: err.name,
      message: err.message
    };
    if (true) {
      obj.stack = err.stack;
    }
    return obj;
  }
  return {
    data: err
  };
}
function getLocationChangeInfo(routerState) {
  const fromLocation = routerState.resolvedLocation;
  const toLocation = routerState.location;
  const pathChanged = (fromLocation == null ? void 0 : fromLocation.pathname) !== toLocation.pathname;
  const hrefChanged = (fromLocation == null ? void 0 : fromLocation.href) !== toLocation.href;
  const hashChanged = (fromLocation == null ? void 0 : fromLocation.hash) !== toLocation.hash;
  return { fromLocation, toLocation, pathChanged, hrefChanged, hashChanged };
}
var RouterCore = class {
  /**
   * @deprecated Use the `createRouter` function instead
   */
  constructor(options) {
    this.tempLocationKey = `${Math.round(
      Math.random() * 1e7
    )}`;
    this.resetNextScroll = true;
    this.shouldViewTransition = void 0;
    this.isViewTransitionTypesSupported = void 0;
    this.subscribers = /* @__PURE__ */ new Set();
    this.isScrollRestoring = false;
    this.isScrollRestorationSetup = false;
    this.startTransition = (fn) => fn();
    this.isShell = false;
    this.update = (newOptions) => {
      var _a;
      if (newOptions.notFoundRoute) {
        console.warn(
          "The notFoundRoute API is deprecated and will be removed in the next major version. See https://tanstack.com/router/v1/docs/framework/react/guide/not-found-errors#migrating-from-notfoundroute for more info."
        );
      }
      const previousOptions = this.options;
      this.options = {
        ...this.options,
        ...newOptions
      };
      this.isServer = this.options.isServer ?? typeof document === "undefined";
      this.pathParamsDecodeCharMap = this.options.pathParamsAllowedCharacters ? new Map(
        this.options.pathParamsAllowedCharacters.map((char) => [
          encodeURIComponent(char),
          char
        ])
      ) : void 0;
      if (!this.basepath || newOptions.basepath && newOptions.basepath !== previousOptions.basepath) {
        if (newOptions.basepath === void 0 || newOptions.basepath === "" || newOptions.basepath === "/") {
          this.basepath = "/";
        } else {
          this.basepath = `/${trimPath(newOptions.basepath)}`;
        }
      }
      if (!this.history || this.options.history && this.options.history !== this.history) {
        this.history = this.options.history ?? (this.isServer ? createMemoryHistory({
          initialEntries: [this.basepath || "/"]
        }) : createBrowserHistory());
        this.latestLocation = this.parseLocation();
      }
      if (this.options.routeTree !== this.routeTree) {
        this.routeTree = this.options.routeTree;
        this.buildRouteTree();
      }
      if (!this.__store) {
        this.__store = new Store(getInitialRouterState(this.latestLocation), {
          onUpdate: () => {
            this.__store.state = {
              ...this.state,
              cachedMatches: this.state.cachedMatches.filter(
                (d) => !["redirected"].includes(d.status)
              )
            };
          }
        });
        setupScrollRestoration(this);
      }
      if (typeof window !== "undefined" && "CSS" in window && typeof ((_a = window.CSS) == null ? void 0 : _a.supports) === "function") {
        this.isViewTransitionTypesSupported = window.CSS.supports(
          "selector(:active-view-transition-type(a)"
        );
      }
      if (this.latestLocation.search.__TSS_SHELL) {
        this.isShell = true;
      }
    };
    this.buildRouteTree = () => {
      const { routesById, routesByPath, flatRoutes } = processRouteTree({
        routeTree: this.routeTree,
        initRoute: (route, i) => {
          route.init({
            originalIndex: i
          });
        }
      });
      this.routesById = routesById;
      this.routesByPath = routesByPath;
      this.flatRoutes = flatRoutes;
      const notFoundRoute = this.options.notFoundRoute;
      if (notFoundRoute) {
        notFoundRoute.init({
          originalIndex: 99999999999
        });
        this.routesById[notFoundRoute.id] = notFoundRoute;
      }
    };
    this.subscribe = (eventType, fn) => {
      const listener = {
        eventType,
        fn
      };
      this.subscribers.add(listener);
      return () => {
        this.subscribers.delete(listener);
      };
    };
    this.emit = (routerEvent) => {
      this.subscribers.forEach((listener) => {
        if (listener.eventType === routerEvent.type) {
          listener.fn(routerEvent);
        }
      });
    };
    this.parseLocation = (previousLocation, locationToParse) => {
      const parse = ({
        pathname,
        search,
        hash,
        state
      }) => {
        const parsedSearch = this.options.parseSearch(search);
        const searchStr = this.options.stringifySearch(parsedSearch);
        return {
          pathname,
          searchStr,
          search: replaceEqualDeep(previousLocation == null ? void 0 : previousLocation.search, parsedSearch),
          hash: hash.split("#").reverse()[0] ?? "",
          href: `${pathname}${searchStr}${hash}`,
          state: replaceEqualDeep(previousLocation == null ? void 0 : previousLocation.state, state)
        };
      };
      const location = parse(locationToParse ?? this.history.location);
      const { __tempLocation, __tempKey } = location.state;
      if (__tempLocation && (!__tempKey || __tempKey === this.tempLocationKey)) {
        const parsedTempLocation = parse(__tempLocation);
        parsedTempLocation.state.key = location.state.key;
        parsedTempLocation.state.__TSR_key = location.state.__TSR_key;
        delete parsedTempLocation.state.__tempLocation;
        return {
          ...parsedTempLocation,
          maskedLocation: location
        };
      }
      return location;
    };
    this.resolvePathWithBase = (from, path) => {
      const resolvedPath = resolvePath({
        basepath: this.basepath,
        base: from,
        to: cleanPath(path),
        trailingSlash: this.options.trailingSlash,
        caseSensitive: this.options.caseSensitive
      });
      return resolvedPath;
    };
    this.matchRoutes = (pathnameOrNext, locationSearchOrOpts, opts) => {
      if (typeof pathnameOrNext === "string") {
        return this.matchRoutesInternal(
          {
            pathname: pathnameOrNext,
            search: locationSearchOrOpts
          },
          opts
        );
      }
      return this.matchRoutesInternal(pathnameOrNext, locationSearchOrOpts);
    };
    this.getMatchedRoutes = (pathname, routePathname) => {
      return getMatchedRoutes({
        pathname,
        routePathname,
        basepath: this.basepath,
        caseSensitive: this.options.caseSensitive,
        routesByPath: this.routesByPath,
        routesById: this.routesById,
        flatRoutes: this.flatRoutes
      });
    };
    this.cancelMatch = (id) => {
      const match = this.getMatch(id);
      if (!match) return;
      match.abortController.abort();
      this.updateMatch(id, (prev) => {
        clearTimeout(prev.pendingTimeout);
        return {
          ...prev,
          pendingTimeout: void 0
        };
      });
    };
    this.cancelMatches = () => {
      var _a;
      (_a = this.state.pendingMatches) == null ? void 0 : _a.forEach((match) => {
        this.cancelMatch(match.id);
      });
    };
    this.buildLocation = (opts) => {
      const build = (dest = {}) => {
        var _a;
        const currentLocation = dest._fromLocation || this.latestLocation;
        const allFromMatches = this.matchRoutes(currentLocation, {
          _buildLocation: true
        });
        const lastMatch = last(allFromMatches);
        let fromPath = lastMatch.fullPath;
        const toPath = dest.to ? this.resolvePathWithBase(fromPath, `${dest.to}`) : this.resolvePathWithBase(fromPath, ".");
        const routeIsChanging = !!dest.to && !this.comparePaths(dest.to.toString(), fromPath) && !this.comparePaths(toPath, fromPath);
        if (dest.unsafeRelative === "path") {
          fromPath = currentLocation.pathname;
        } else if (routeIsChanging && dest.from) {
          fromPath = dest.from;
          const existingFrom = [...allFromMatches].reverse().find((d) => {
            return this.comparePaths(d.fullPath, fromPath);
          });
          if (!existingFrom) {
            console.warn(`Could not find match for from: ${fromPath}`);
          }
        }
        const fromSearch = lastMatch.search;
        const fromParams = { ...lastMatch.params };
        const nextTo = dest.to ? this.resolvePathWithBase(fromPath, `${dest.to}`) : this.resolvePathWithBase(fromPath, ".");
        let nextParams = (dest.params ?? true) === true ? fromParams : {
          ...fromParams,
          ...functionalUpdate(dest.params, fromParams)
        };
        const destRoutes = this.matchRoutes(
          nextTo,
          {},
          {
            _buildLocation: true
          }
        ).map((d) => this.looseRoutesById[d.routeId]);
        if (Object.keys(nextParams).length > 0) {
          destRoutes.map((route) => {
            var _a2;
            return ((_a2 = route.options.params) == null ? void 0 : _a2.stringify) ?? route.options.stringifyParams;
          }).filter(Boolean).forEach((fn) => {
            nextParams = { ...nextParams, ...fn(nextParams) };
          });
        }
        const nextPathname = interpolatePath({
          path: nextTo,
          params: nextParams ?? {},
          leaveWildcards: false,
          leaveParams: opts.leaveParams,
          decodeCharMap: this.pathParamsDecodeCharMap
        }).interpolatedPath;
        let nextSearch = fromSearch;
        if (opts._includeValidateSearch && ((_a = this.options.search) == null ? void 0 : _a.strict)) {
          let validatedSearch = {};
          destRoutes.forEach((route) => {
            try {
              if (route.options.validateSearch) {
                validatedSearch = {
                  ...validatedSearch,
                  ...validateSearch(route.options.validateSearch, {
                    ...validatedSearch,
                    ...nextSearch
                  }) ?? {}
                };
              }
            } catch {
            }
          });
          nextSearch = validatedSearch;
        }
        nextSearch = applySearchMiddleware({
          search: nextSearch,
          dest,
          destRoutes,
          _includeValidateSearch: opts._includeValidateSearch
        });
        nextSearch = replaceEqualDeep(fromSearch, nextSearch);
        const searchStr = this.options.stringifySearch(nextSearch);
        const hash = dest.hash === true ? currentLocation.hash : dest.hash ? functionalUpdate(dest.hash, currentLocation.hash) : void 0;
        const hashStr = hash ? `#${hash}` : "";
        let nextState = dest.state === true ? currentLocation.state : dest.state ? functionalUpdate(dest.state, currentLocation.state) : {};
        nextState = replaceEqualDeep(currentLocation.state, nextState);
        return {
          pathname: nextPathname,
          search: nextSearch,
          searchStr,
          state: nextState,
          hash: hash ?? "",
          href: `${nextPathname}${searchStr}${hashStr}`,
          unmaskOnReload: dest.unmaskOnReload
        };
      };
      const buildWithMatches = (dest = {}, maskedDest) => {
        var _a;
        const next = build(dest);
        let maskedNext = maskedDest ? build(maskedDest) : void 0;
        if (!maskedNext) {
          let params = {};
          const foundMask = (_a = this.options.routeMasks) == null ? void 0 : _a.find((d) => {
            const match = matchPathname(this.basepath, next.pathname, {
              to: d.from,
              caseSensitive: false,
              fuzzy: false
            });
            if (match) {
              params = match;
              return true;
            }
            return false;
          });
          if (foundMask) {
            const { from: _from, ...maskProps } = foundMask;
            maskedDest = {
              ...pick(opts, ["from"]),
              ...maskProps,
              params
            };
            maskedNext = build(maskedDest);
          }
        }
        if (maskedNext) {
          const maskedFinal = build(maskedDest);
          next.maskedLocation = maskedFinal;
        }
        return next;
      };
      if (opts.mask) {
        return buildWithMatches(opts, {
          ...pick(opts, ["from"]),
          ...opts.mask
        });
      }
      return buildWithMatches(opts);
    };
    this.commitLocation = ({
      viewTransition,
      ignoreBlocker,
      ...next
    }) => {
      const isSameState = () => {
        const ignoredProps = [
          "key",
          // TODO: Remove in v2 - use __TSR_key instead
          "__TSR_key",
          "__TSR_index",
          "__hashScrollIntoViewOptions"
        ];
        ignoredProps.forEach((prop) => {
          next.state[prop] = this.latestLocation.state[prop];
        });
        const isEqual = deepEqual(next.state, this.latestLocation.state);
        ignoredProps.forEach((prop) => {
          delete next.state[prop];
        });
        return isEqual;
      };
      const isSameUrl = this.latestLocation.href === next.href;
      const previousCommitPromise = this.commitLocationPromise;
      this.commitLocationPromise = createControlledPromise(() => {
        previousCommitPromise == null ? void 0 : previousCommitPromise.resolve();
      });
      if (isSameUrl && isSameState()) {
        this.load();
      } else {
        let { maskedLocation, hashScrollIntoView, ...nextHistory } = next;
        if (maskedLocation) {
          nextHistory = {
            ...maskedLocation,
            state: {
              ...maskedLocation.state,
              __tempKey: void 0,
              __tempLocation: {
                ...nextHistory,
                search: nextHistory.searchStr,
                state: {
                  ...nextHistory.state,
                  __tempKey: void 0,
                  __tempLocation: void 0,
                  __TSR_key: void 0,
                  key: void 0
                  // TODO: Remove in v2 - use __TSR_key instead
                }
              }
            }
          };
          if (nextHistory.unmaskOnReload ?? this.options.unmaskOnReload ?? false) {
            nextHistory.state.__tempKey = this.tempLocationKey;
          }
        }
        nextHistory.state.__hashScrollIntoViewOptions = hashScrollIntoView ?? this.options.defaultHashScrollIntoView ?? true;
        this.shouldViewTransition = viewTransition;
        this.history[next.replace ? "replace" : "push"](
          nextHistory.href,
          nextHistory.state,
          { ignoreBlocker }
        );
      }
      this.resetNextScroll = next.resetScroll ?? true;
      if (!this.history.subscribers.size) {
        this.load();
      }
      return this.commitLocationPromise;
    };
    this.buildAndCommitLocation = ({
      replace,
      resetScroll,
      hashScrollIntoView,
      viewTransition,
      ignoreBlocker,
      href,
      ...rest
    } = {}) => {
      if (href) {
        const currentIndex = this.history.location.state.__TSR_index;
        const parsed = parseHref(href, {
          __TSR_index: replace ? currentIndex : currentIndex + 1
        });
        rest.to = parsed.pathname;
        rest.search = this.options.parseSearch(parsed.search);
        rest.hash = parsed.hash.slice(1);
      }
      const location = this.buildLocation({
        ...rest,
        _includeValidateSearch: true
      });
      return this.commitLocation({
        ...location,
        viewTransition,
        replace,
        resetScroll,
        hashScrollIntoView,
        ignoreBlocker
      });
    };
    this.navigate = ({ to, reloadDocument, href, ...rest }) => {
      if (!reloadDocument && href) {
        try {
          new URL(`${href}`);
          reloadDocument = true;
        } catch {
        }
      }
      if (reloadDocument) {
        if (!href) {
          const location = this.buildLocation({ to, ...rest });
          href = this.history.createHref(location.href);
        }
        if (rest.replace) {
          window.location.replace(href);
        } else {
          window.location.href = href;
        }
        return;
      }
      return this.buildAndCommitLocation({
        ...rest,
        href,
        to
      });
    };
    this.beforeLoad = () => {
      this.cancelMatches();
      this.latestLocation = this.parseLocation(this.latestLocation);
      if (this.isServer) {
        const nextLocation = this.buildLocation({
          to: this.latestLocation.pathname,
          search: true,
          params: true,
          hash: true,
          state: true,
          _includeValidateSearch: true
        });
        if (trimPath(this.latestLocation.href) !== trimPath(nextLocation.href)) {
          throw redirect({ href: nextLocation.href });
        }
      }
      let pendingMatches = this.matchRoutes(this.latestLocation);
      if (this.isShell) {
        pendingMatches = pendingMatches.slice(0, 1);
      }
      this.__store.setState((s) => ({
        ...s,
        status: "pending",
        isLoading: true,
        location: this.latestLocation,
        pendingMatches,
        // If a cached moved to pendingMatches, remove it from cachedMatches
        cachedMatches: s.cachedMatches.filter(
          (d) => !pendingMatches.find((e) => e.id === d.id)
        )
      }));
    };
    this.load = async (opts) => {
      let redirect2;
      let notFound2;
      let loadPromise;
      loadPromise = new Promise((resolve) => {
        this.startTransition(async () => {
          var _a;
          try {
            this.beforeLoad();
            const next = this.latestLocation;
            const prevLocation = this.state.resolvedLocation;
            if (!this.state.redirect) {
              this.emit({
                type: "onBeforeNavigate",
                ...getLocationChangeInfo({
                  resolvedLocation: prevLocation,
                  location: next
                })
              });
            }
            this.emit({
              type: "onBeforeLoad",
              ...getLocationChangeInfo({
                resolvedLocation: prevLocation,
                location: next
              })
            });
            await this.loadMatches({
              sync: opts == null ? void 0 : opts.sync,
              matches: this.state.pendingMatches,
              location: next,
              // eslint-disable-next-line @typescript-eslint/require-await
              onReady: async () => {
                this.startViewTransition(async () => {
                  let exitingMatches;
                  let enteringMatches;
                  let stayingMatches;
                  batch(() => {
                    this.__store.setState((s) => {
                      const previousMatches = s.matches;
                      const newMatches = s.pendingMatches || s.matches;
                      exitingMatches = previousMatches.filter(
                        (match) => !newMatches.find((d) => d.id === match.id)
                      );
                      enteringMatches = newMatches.filter(
                        (match) => !previousMatches.find((d) => d.id === match.id)
                      );
                      stayingMatches = previousMatches.filter(
                        (match) => newMatches.find((d) => d.id === match.id)
                      );
                      return {
                        ...s,
                        isLoading: false,
                        loadedAt: Date.now(),
                        matches: newMatches,
                        pendingMatches: void 0,
                        cachedMatches: [
                          ...s.cachedMatches,
                          ...exitingMatches.filter((d) => d.status !== "error")
                        ]
                      };
                    });
                    this.clearExpiredCache();
                  });
                  [
                    [exitingMatches, "onLeave"],
                    [enteringMatches, "onEnter"],
                    [stayingMatches, "onStay"]
                  ].forEach(([matches, hook]) => {
                    matches.forEach((match) => {
                      var _a2, _b;
                      (_b = (_a2 = this.looseRoutesById[match.routeId].options)[hook]) == null ? void 0 : _b.call(_a2, match);
                    });
                  });
                });
              }
            });
          } catch (err) {
            if (isRedirect(err)) {
              redirect2 = err;
              if (!this.isServer) {
                this.navigate({
                  ...redirect2.options,
                  replace: true,
                  ignoreBlocker: true
                });
              }
            } else if (isNotFound(err)) {
              notFound2 = err;
            }
            this.__store.setState((s) => ({
              ...s,
              statusCode: redirect2 ? redirect2.status : notFound2 ? 404 : s.matches.some((d) => d.status === "error") ? 500 : 200,
              redirect: redirect2
            }));
          }
          if (this.latestLoadPromise === loadPromise) {
            (_a = this.commitLocationPromise) == null ? void 0 : _a.resolve();
            this.latestLoadPromise = void 0;
            this.commitLocationPromise = void 0;
          }
          resolve();
        });
      });
      this.latestLoadPromise = loadPromise;
      await loadPromise;
      while (this.latestLoadPromise && loadPromise !== this.latestLoadPromise) {
        await this.latestLoadPromise;
      }
      if (this.hasNotFoundMatch()) {
        this.__store.setState((s) => ({
          ...s,
          statusCode: 404
        }));
      }
    };
    this.startViewTransition = (fn) => {
      const shouldViewTransition = this.shouldViewTransition ?? this.options.defaultViewTransition;
      delete this.shouldViewTransition;
      if (shouldViewTransition && typeof document !== "undefined" && "startViewTransition" in document && typeof document.startViewTransition === "function") {
        let startViewTransitionParams;
        if (typeof shouldViewTransition === "object" && this.isViewTransitionTypesSupported) {
          const next = this.latestLocation;
          const prevLocation = this.state.resolvedLocation;
          const resolvedViewTransitionTypes = typeof shouldViewTransition.types === "function" ? shouldViewTransition.types(
            getLocationChangeInfo({
              resolvedLocation: prevLocation,
              location: next
            })
          ) : shouldViewTransition.types;
          startViewTransitionParams = {
            update: fn,
            types: resolvedViewTransitionTypes
          };
        } else {
          startViewTransitionParams = fn;
        }
        document.startViewTransition(startViewTransitionParams);
      } else {
        fn();
      }
    };
    this.updateMatch = (id, updater) => {
      var _a;
      let updated;
      const isPending = (_a = this.state.pendingMatches) == null ? void 0 : _a.find((d) => d.id === id);
      const isMatched = this.state.matches.find((d) => d.id === id);
      const isCached = this.state.cachedMatches.find((d) => d.id === id);
      const matchesKey = isPending ? "pendingMatches" : isMatched ? "matches" : isCached ? "cachedMatches" : "";
      if (matchesKey) {
        this.__store.setState((s) => {
          var _a2;
          return {
            ...s,
            [matchesKey]: (_a2 = s[matchesKey]) == null ? void 0 : _a2.map(
              (d) => d.id === id ? updated = updater(d) : d
            )
          };
        });
      }
      return updated;
    };
    this.getMatch = (matchId) => {
      return [
        ...this.state.cachedMatches,
        ...this.state.pendingMatches ?? [],
        ...this.state.matches
      ].find((d) => d.id === matchId);
    };
    this.loadMatches = async ({
      location,
      matches,
      preload: allPreload,
      onReady,
      updateMatch = this.updateMatch,
      sync
    }) => {
      let firstBadMatchIndex;
      let rendered = false;
      const triggerOnReady = async () => {
        if (!rendered) {
          rendered = true;
          if (!allPreload && !this.isServer) {
            matches.forEach((match) => {
              const {
                id: matchId,
                routeId,
                _forcePending,
                minPendingPromise
              } = match;
              const route = this.looseRoutesById[routeId];
              const pendingMinMs = route.options.pendingMinMs ?? this.options.defaultPendingMinMs;
              if (_forcePending && pendingMinMs && !minPendingPromise) {
                const minPendingPromise2 = createControlledPromise();
                updateMatch(matchId, (prev) => ({
                  ...prev,
                  minPendingPromise: minPendingPromise2
                }));
                setTimeout(() => {
                  minPendingPromise2.resolve();
                  updateMatch(matchId, (prev) => ({
                    ...prev,
                    minPendingPromise: void 0
                  }));
                }, pendingMinMs);
              }
            });
          }
          await (onReady == null ? void 0 : onReady());
        }
      };
      const resolvePreload = (matchId) => {
        return !!(allPreload && !this.state.matches.find((d) => d.id === matchId));
      };
      if (!this.isServer && this.state.matches.find((d) => d._forcePending)) {
        triggerOnReady();
      }
      const handleRedirectAndNotFound = (match, err) => {
        var _a, _b, _c, _d;
        if (isRedirect(err) || isNotFound(err)) {
          if (isRedirect(err)) {
            if (err.redirectHandled) {
              if (!err.options.reloadDocument) {
                throw err;
              }
            }
          }
          (_a = match.beforeLoadPromise) == null ? void 0 : _a.resolve();
          (_b = match.loaderPromise) == null ? void 0 : _b.resolve();
          updateMatch(match.id, (prev) => ({
            ...prev,
            status: isRedirect(err) ? "redirected" : isNotFound(err) ? "notFound" : "error",
            isFetching: false,
            error: err,
            beforeLoadPromise: void 0,
            loaderPromise: void 0
          }));
          if (!err.routeId) {
            err.routeId = match.routeId;
          }
          (_c = match.loadPromise) == null ? void 0 : _c.resolve();
          if (isRedirect(err)) {
            rendered = true;
            err.options._fromLocation = location;
            err.redirectHandled = true;
            err = this.resolveRedirect(err);
            throw err;
          } else if (isNotFound(err)) {
            this._handleNotFound(matches, err, {
              updateMatch
            });
            (_d = this.serverSsr) == null ? void 0 : _d.onMatchSettled({
              router: this,
              match: this.getMatch(match.id)
            });
            throw err;
          }
        }
      };
      const shouldSkipLoader = (matchId) => {
        const match = this.getMatch(matchId);
        if (!this.isServer && match._dehydrated) {
          return true;
        }
        if (this.isServer) {
          if (match.ssr === false) {
            return true;
          }
        }
        return false;
      };
      try {
        await new Promise((resolveAll, rejectAll) => {
          ;
          (async () => {
            var _a, _b, _c, _d;
            try {
              const handleSerialError = (index, err, routerCode) => {
                var _a2, _b2;
                const { id: matchId, routeId } = matches[index];
                const route = this.looseRoutesById[routeId];
                if (err instanceof Promise) {
                  throw err;
                }
                err.routerCode = routerCode;
                firstBadMatchIndex = firstBadMatchIndex ?? index;
                handleRedirectAndNotFound(this.getMatch(matchId), err);
                try {
                  (_b2 = (_a2 = route.options).onError) == null ? void 0 : _b2.call(_a2, err);
                } catch (errorHandlerErr) {
                  err = errorHandlerErr;
                  handleRedirectAndNotFound(this.getMatch(matchId), err);
                }
                updateMatch(matchId, (prev) => {
                  var _a3, _b3;
                  (_a3 = prev.beforeLoadPromise) == null ? void 0 : _a3.resolve();
                  (_b3 = prev.loadPromise) == null ? void 0 : _b3.resolve();
                  return {
                    ...prev,
                    error: err,
                    status: "error",
                    isFetching: false,
                    updatedAt: Date.now(),
                    abortController: new AbortController(),
                    beforeLoadPromise: void 0
                  };
                });
              };
              for (const [index, { id: matchId, routeId }] of matches.entries()) {
                const existingMatch = this.getMatch(matchId);
                const parentMatchId = (_a = matches[index - 1]) == null ? void 0 : _a.id;
                const parentMatch = parentMatchId ? this.getMatch(parentMatchId) : void 0;
                const route = this.looseRoutesById[routeId];
                const pendingMs = route.options.pendingMs ?? this.options.defaultPendingMs;
                if (this.isServer) {
                  const defaultSsr = this.options.defaultSsr ?? true;
                  let ssr;
                  if ((parentMatch == null ? void 0 : parentMatch.ssr) === false) {
                    ssr = false;
                  } else {
                    let tempSsr;
                    if (route.options.ssr === void 0) {
                      tempSsr = defaultSsr;
                    } else if (typeof route.options.ssr === "function") {
                      let makeMaybe = function(value, error) {
                        if (error) {
                          return { status: "error", error };
                        }
                        return { status: "success", value };
                      };
                      const { search, params } = this.getMatch(matchId);
                      const ssrFnContext = {
                        search: makeMaybe(search, existingMatch.searchError),
                        params: makeMaybe(params, existingMatch.paramsError),
                        location,
                        matches: matches.map((match) => ({
                          index: match.index,
                          pathname: match.pathname,
                          fullPath: match.fullPath,
                          staticData: match.staticData,
                          id: match.id,
                          routeId: match.routeId,
                          search: makeMaybe(match.search, match.searchError),
                          params: makeMaybe(match.params, match.paramsError),
                          ssr: match.ssr
                        }))
                      };
                      tempSsr = await route.options.ssr(ssrFnContext) ?? defaultSsr;
                    } else {
                      tempSsr = route.options.ssr;
                    }
                    if (tempSsr === true && (parentMatch == null ? void 0 : parentMatch.ssr) === "data-only") {
                      ssr = "data-only";
                    } else {
                      ssr = tempSsr;
                    }
                  }
                  updateMatch(matchId, (prev) => ({
                    ...prev,
                    ssr
                  }));
                }
                if (shouldSkipLoader(matchId)) {
                  continue;
                }
                const shouldPending = !!(onReady && !this.isServer && !resolvePreload(matchId) && (route.options.loader || route.options.beforeLoad || routeNeedsPreload(route)) && typeof pendingMs === "number" && pendingMs !== Infinity && (route.options.pendingComponent ?? ((_b = this.options) == null ? void 0 : _b.defaultPendingComponent)));
                let executeBeforeLoad = true;
                const setupPendingTimeout = () => {
                  if (shouldPending && this.getMatch(matchId).pendingTimeout === void 0) {
                    const pendingTimeout = setTimeout(() => {
                      try {
                        triggerOnReady();
                      } catch {
                      }
                    }, pendingMs);
                    updateMatch(matchId, (prev) => ({
                      ...prev,
                      pendingTimeout
                    }));
                  }
                };
                if (
                  // If we are in the middle of a load, either of these will be present
                  // (not to be confused with `loadPromise`, which is always defined)
                  existingMatch.beforeLoadPromise || existingMatch.loaderPromise
                ) {
                  setupPendingTimeout();
                  await existingMatch.beforeLoadPromise;
                  const match = this.getMatch(matchId);
                  if (match.status === "error") {
                    executeBeforeLoad = true;
                  } else if (match.preload && (match.status === "redirected" || match.status === "notFound")) {
                    handleRedirectAndNotFound(match, match.error);
                  }
                }
                if (executeBeforeLoad) {
                  try {
                    updateMatch(matchId, (prev) => {
                      const prevLoadPromise = prev.loadPromise;
                      return {
                        ...prev,
                        loadPromise: createControlledPromise(() => {
                          prevLoadPromise == null ? void 0 : prevLoadPromise.resolve();
                        }),
                        beforeLoadPromise: createControlledPromise()
                      };
                    });
                    const { paramsError, searchError } = this.getMatch(matchId);
                    if (paramsError) {
                      handleSerialError(index, paramsError, "PARSE_PARAMS");
                    }
                    if (searchError) {
                      handleSerialError(index, searchError, "VALIDATE_SEARCH");
                    }
                    setupPendingTimeout();
                    const abortController = new AbortController();
                    const parentMatchContext = (parentMatch == null ? void 0 : parentMatch.context) ?? this.options.context ?? {};
                    updateMatch(matchId, (prev) => ({
                      ...prev,
                      isFetching: "beforeLoad",
                      fetchCount: prev.fetchCount + 1,
                      abortController,
                      context: {
                        ...parentMatchContext,
                        ...prev.__routeContext
                      }
                    }));
                    const { search, params, context, cause } = this.getMatch(matchId);
                    const preload = resolvePreload(matchId);
                    const beforeLoadFnContext = {
                      search,
                      abortController,
                      params,
                      preload,
                      context,
                      location,
                      navigate: (opts) => this.navigate({ ...opts, _fromLocation: location }),
                      buildLocation: this.buildLocation,
                      cause: preload ? "preload" : cause,
                      matches
                    };
                    const beforeLoadContext = await ((_d = (_c = route.options).beforeLoad) == null ? void 0 : _d.call(_c, beforeLoadFnContext)) ?? {};
                    if (isRedirect(beforeLoadContext) || isNotFound(beforeLoadContext)) {
                      handleSerialError(index, beforeLoadContext, "BEFORE_LOAD");
                    }
                    updateMatch(matchId, (prev) => {
                      return {
                        ...prev,
                        __beforeLoadContext: beforeLoadContext,
                        context: {
                          ...parentMatchContext,
                          ...prev.__routeContext,
                          ...beforeLoadContext
                        },
                        abortController
                      };
                    });
                  } catch (err) {
                    handleSerialError(index, err, "BEFORE_LOAD");
                  }
                  updateMatch(matchId, (prev) => {
                    var _a2;
                    (_a2 = prev.beforeLoadPromise) == null ? void 0 : _a2.resolve();
                    return {
                      ...prev,
                      beforeLoadPromise: void 0,
                      isFetching: false
                    };
                  });
                }
              }
              const validResolvedMatches = matches.slice(0, firstBadMatchIndex);
              const matchPromises = [];
              validResolvedMatches.forEach(({ id: matchId, routeId }, index) => {
                matchPromises.push(
                  (async () => {
                    var _a2, _b2;
                    let loaderShouldRunAsync = false;
                    let loaderIsRunningAsync = false;
                    const route = this.looseRoutesById[routeId];
                    const executeHead = async () => {
                      var _a3, _b3, _c2, _d2, _e, _f;
                      const match = this.getMatch(matchId);
                      if (!match) {
                        return;
                      }
                      const assetContext = {
                        matches,
                        match,
                        params: match.params,
                        loaderData: match.loaderData
                      };
                      const headFnContent = await ((_b3 = (_a3 = route.options).head) == null ? void 0 : _b3.call(_a3, assetContext));
                      const meta = headFnContent == null ? void 0 : headFnContent.meta;
                      const links = headFnContent == null ? void 0 : headFnContent.links;
                      const headScripts = headFnContent == null ? void 0 : headFnContent.scripts;
                      const styles = headFnContent == null ? void 0 : headFnContent.styles;
                      const scripts = await ((_d2 = (_c2 = route.options).scripts) == null ? void 0 : _d2.call(_c2, assetContext));
                      const headers = await ((_f = (_e = route.options).headers) == null ? void 0 : _f.call(_e, assetContext));
                      return {
                        meta,
                        links,
                        headScripts,
                        headers,
                        scripts,
                        styles
                      };
                    };
                    const potentialPendingMinPromise = async () => {
                      const latestMatch = this.getMatch(matchId);
                      if (latestMatch.minPendingPromise) {
                        await latestMatch.minPendingPromise;
                      }
                    };
                    const prevMatch = this.getMatch(matchId);
                    if (shouldSkipLoader(matchId)) {
                      if (this.isServer) {
                        const head = await executeHead();
                        updateMatch(matchId, (prev) => ({
                          ...prev,
                          ...head
                        }));
                        (_a2 = this.serverSsr) == null ? void 0 : _a2.onMatchSettled({
                          router: this,
                          match: this.getMatch(matchId)
                        });
                        return this.getMatch(matchId);
                      } else {
                        await potentialPendingMinPromise();
                      }
                    } else if (prevMatch.loaderPromise) {
                      if (prevMatch.status === "success" && !sync && !prevMatch.preload) {
                        return this.getMatch(matchId);
                      }
                      await prevMatch.loaderPromise;
                      const match = this.getMatch(matchId);
                      if (match.error) {
                        handleRedirectAndNotFound(match, match.error);
                      }
                    } else {
                      const parentMatchPromise = matchPromises[index - 1];
                      const getLoaderContext = () => {
                        const {
                          params,
                          loaderDeps,
                          abortController,
                          context,
                          cause
                        } = this.getMatch(matchId);
                        const preload2 = resolvePreload(matchId);
                        return {
                          params,
                          deps: loaderDeps,
                          preload: !!preload2,
                          parentMatchPromise,
                          abortController,
                          context,
                          location,
                          navigate: (opts) => this.navigate({ ...opts, _fromLocation: location }),
                          cause: preload2 ? "preload" : cause,
                          route
                        };
                      };
                      const age = Date.now() - this.getMatch(matchId).updatedAt;
                      const preload = resolvePreload(matchId);
                      const staleAge = preload ? route.options.preloadStaleTime ?? this.options.defaultPreloadStaleTime ?? 3e4 : route.options.staleTime ?? this.options.defaultStaleTime ?? 0;
                      const shouldReloadOption = route.options.shouldReload;
                      const shouldReload = typeof shouldReloadOption === "function" ? shouldReloadOption(getLoaderContext()) : shouldReloadOption;
                      updateMatch(matchId, (prev) => ({
                        ...prev,
                        loaderPromise: createControlledPromise(),
                        preload: !!preload && !this.state.matches.find((d) => d.id === matchId)
                      }));
                      const runLoader = async () => {
                        var _a3, _b3, _c2, _d2, _e;
                        try {
                          try {
                            if (!this.isServer || this.isServer && this.getMatch(matchId).ssr === true) {
                              this.loadRouteChunk(route);
                            }
                            updateMatch(matchId, (prev) => ({
                              ...prev,
                              isFetching: "loader"
                            }));
                            const loaderData = await ((_b3 = (_a3 = route.options).loader) == null ? void 0 : _b3.call(_a3, getLoaderContext()));
                            handleRedirectAndNotFound(
                              this.getMatch(matchId),
                              loaderData
                            );
                            updateMatch(matchId, (prev) => ({
                              ...prev,
                              loaderData
                            }));
                            await route._lazyPromise;
                            const head = await executeHead();
                            await potentialPendingMinPromise();
                            await route._componentsPromise;
                            updateMatch(matchId, (prev) => ({
                              ...prev,
                              error: void 0,
                              status: "success",
                              isFetching: false,
                              updatedAt: Date.now(),
                              ...head
                            }));
                          } catch (e) {
                            let error = e;
                            await potentialPendingMinPromise();
                            handleRedirectAndNotFound(this.getMatch(matchId), e);
                            try {
                              (_d2 = (_c2 = route.options).onError) == null ? void 0 : _d2.call(_c2, e);
                            } catch (onErrorError) {
                              error = onErrorError;
                              handleRedirectAndNotFound(
                                this.getMatch(matchId),
                                onErrorError
                              );
                            }
                            const head = await executeHead();
                            updateMatch(matchId, (prev) => ({
                              ...prev,
                              error,
                              status: "error",
                              isFetching: false,
                              ...head
                            }));
                          }
                          (_e = this.serverSsr) == null ? void 0 : _e.onMatchSettled({
                            router: this,
                            match: this.getMatch(matchId)
                          });
                        } catch (err) {
                          const head = await executeHead();
                          updateMatch(matchId, (prev) => ({
                            ...prev,
                            loaderPromise: void 0,
                            ...head
                          }));
                          handleRedirectAndNotFound(this.getMatch(matchId), err);
                        }
                      };
                      const { status, invalid, _forcePending } = this.getMatch(matchId);
                      loaderShouldRunAsync = status === "success" && (invalid || (shouldReload ?? age > staleAge));
                      if (preload && route.options.preload === false) {
                      } else if (loaderShouldRunAsync && !sync && !_forcePending) {
                        loaderIsRunningAsync = true;
                        (async () => {
                          try {
                            await runLoader();
                            const { loaderPromise, loadPromise } = this.getMatch(matchId);
                            loaderPromise == null ? void 0 : loaderPromise.resolve();
                            loadPromise == null ? void 0 : loadPromise.resolve();
                            updateMatch(matchId, (prev) => ({
                              ...prev,
                              loaderPromise: void 0
                            }));
                          } catch (err) {
                            if (isRedirect(err)) {
                              await this.navigate(err.options);
                            }
                          }
                        })();
                      } else if (status !== "success" || loaderShouldRunAsync && sync) {
                        await runLoader();
                      } else {
                        if (_forcePending) {
                          await potentialPendingMinPromise();
                        }
                        const head = await executeHead();
                        updateMatch(matchId, (prev) => ({
                          ...prev,
                          ...head
                        }));
                        (_b2 = this.serverSsr) == null ? void 0 : _b2.onMatchSettled({
                          router: this,
                          match: this.getMatch(matchId)
                        });
                      }
                    }
                    if (!loaderIsRunningAsync) {
                      const { loaderPromise, loadPromise } = this.getMatch(matchId);
                      loaderPromise == null ? void 0 : loaderPromise.resolve();
                      loadPromise == null ? void 0 : loadPromise.resolve();
                    }
                    updateMatch(matchId, (prev) => {
                      clearTimeout(prev.pendingTimeout);
                      return {
                        ...prev,
                        isFetching: loaderIsRunningAsync ? prev.isFetching : false,
                        loaderPromise: loaderIsRunningAsync ? prev.loaderPromise : void 0,
                        invalid: false,
                        pendingTimeout: void 0,
                        _dehydrated: void 0,
                        _forcePending: void 0
                      };
                    });
                    return this.getMatch(matchId);
                  })()
                );
              });
              await Promise.all(matchPromises);
              resolveAll();
            } catch (err) {
              rejectAll(err);
            }
          })();
        });
        await triggerOnReady();
      } catch (err) {
        if (isRedirect(err) || isNotFound(err)) {
          if (isNotFound(err) && !allPreload) {
            await triggerOnReady();
          }
          throw err;
        }
      }
      return matches;
    };
    this.invalidate = (opts) => {
      const invalidate = (d) => {
        var _a;
        if (((_a = opts == null ? void 0 : opts.filter) == null ? void 0 : _a.call(opts, d)) ?? true) {
          return {
            ...d,
            invalid: true,
            ...(opts == null ? void 0 : opts.forcePending) || d.status === "error" ? { status: "pending", error: void 0 } : {}
          };
        }
        return d;
      };
      this.__store.setState((s) => {
        var _a;
        return {
          ...s,
          matches: s.matches.map(invalidate),
          cachedMatches: s.cachedMatches.map(invalidate),
          pendingMatches: (_a = s.pendingMatches) == null ? void 0 : _a.map(invalidate)
        };
      });
      this.shouldViewTransition = false;
      return this.load({ sync: opts == null ? void 0 : opts.sync });
    };
    this.resolveRedirect = (redirect2) => {
      if (!redirect2.options.href) {
        redirect2.options.href = this.buildLocation(redirect2.options).href;
        redirect2.headers.set("Location", redirect2.options.href);
      }
      if (!redirect2.headers.get("Location")) {
        redirect2.headers.set("Location", redirect2.options.href);
      }
      return redirect2;
    };
    this.clearCache = (opts) => {
      const filter = opts == null ? void 0 : opts.filter;
      if (filter !== void 0) {
        this.__store.setState((s) => {
          return {
            ...s,
            cachedMatches: s.cachedMatches.filter(
              (m) => !filter(m)
            )
          };
        });
      } else {
        this.__store.setState((s) => {
          return {
            ...s,
            cachedMatches: []
          };
        });
      }
    };
    this.clearExpiredCache = () => {
      const filter = (d) => {
        const route = this.looseRoutesById[d.routeId];
        if (!route.options.loader) {
          return true;
        }
        const gcTime = (d.preload ? route.options.preloadGcTime ?? this.options.defaultPreloadGcTime : route.options.gcTime ?? this.options.defaultGcTime) ?? 5 * 60 * 1e3;
        return !(d.status !== "error" && Date.now() - d.updatedAt < gcTime);
      };
      this.clearCache({ filter });
    };
    this.loadRouteChunk = (route) => {
      if (route._lazyPromise === void 0) {
        if (route.lazyFn) {
          route._lazyPromise = route.lazyFn().then((lazyRoute) => {
            const { id: _id, ...options2 } = lazyRoute.options;
            Object.assign(route.options, options2);
          });
        } else {
          route._lazyPromise = Promise.resolve();
        }
      }
      if (route._componentsPromise === void 0) {
        route._componentsPromise = route._lazyPromise.then(
          () => Promise.all(
            componentTypes.map(async (type) => {
              const component = route.options[type];
              if (component == null ? void 0 : component.preload) {
                await component.preload();
              }
            })
          )
        );
      }
      return route._componentsPromise;
    };
    this.preloadRoute = async (opts) => {
      const next = this.buildLocation(opts);
      let matches = this.matchRoutes(next, {
        throwOnError: true,
        preload: true,
        dest: opts
      });
      const activeMatchIds = new Set(
        [...this.state.matches, ...this.state.pendingMatches ?? []].map(
          (d) => d.id
        )
      );
      const loadedMatchIds = /* @__PURE__ */ new Set([
        ...activeMatchIds,
        ...this.state.cachedMatches.map((d) => d.id)
      ]);
      batch(() => {
        matches.forEach((match) => {
          if (!loadedMatchIds.has(match.id)) {
            this.__store.setState((s) => ({
              ...s,
              cachedMatches: [...s.cachedMatches, match]
            }));
          }
        });
      });
      try {
        matches = await this.loadMatches({
          matches,
          location: next,
          preload: true,
          updateMatch: (id, updater) => {
            if (activeMatchIds.has(id)) {
              matches = matches.map((d) => d.id === id ? updater(d) : d);
            } else {
              this.updateMatch(id, updater);
            }
          }
        });
        return matches;
      } catch (err) {
        if (isRedirect(err)) {
          if (err.options.reloadDocument) {
            return void 0;
          }
          return await this.preloadRoute({
            ...err.options,
            _fromLocation: next
          });
        }
        if (!isNotFound(err)) {
          console.error(err);
        }
        return void 0;
      }
    };
    this.matchRoute = (location, opts) => {
      const matchLocation = {
        ...location,
        to: location.to ? this.resolvePathWithBase(
          location.from || "",
          location.to
        ) : void 0,
        params: location.params || {},
        leaveParams: true
      };
      const next = this.buildLocation(matchLocation);
      if ((opts == null ? void 0 : opts.pending) && this.state.status !== "pending") {
        return false;
      }
      const pending = (opts == null ? void 0 : opts.pending) === void 0 ? !this.state.isLoading : opts.pending;
      const baseLocation = pending ? this.latestLocation : this.state.resolvedLocation || this.state.location;
      const match = matchPathname(this.basepath, baseLocation.pathname, {
        ...opts,
        to: next.pathname
      });
      if (!match) {
        return false;
      }
      if (location.params) {
        if (!deepEqual(match, location.params, { partial: true })) {
          return false;
        }
      }
      if (match && ((opts == null ? void 0 : opts.includeSearch) ?? true)) {
        return deepEqual(baseLocation.search, next.search, { partial: true }) ? match : false;
      }
      return match;
    };
    this._handleNotFound = (matches, err, {
      updateMatch = this.updateMatch
    } = {}) => {
      var _a;
      const routeCursor = this.routesById[err.routeId ?? ""] ?? this.routeTree;
      const matchesByRouteId = {};
      for (const match of matches) {
        matchesByRouteId[match.routeId] = match;
      }
      if (!routeCursor.options.notFoundComponent && ((_a = this.options) == null ? void 0 : _a.defaultNotFoundComponent)) {
        routeCursor.options.notFoundComponent = this.options.defaultNotFoundComponent;
      }
      invariant(
        routeCursor.options.notFoundComponent,
        "No notFoundComponent found. Please set a notFoundComponent on your route or provide a defaultNotFoundComponent to the router."
      );
      const matchForRoute = matchesByRouteId[routeCursor.id];
      invariant(
        matchForRoute,
        "Could not find match for route: " + routeCursor.id
      );
      updateMatch(matchForRoute.id, (prev) => ({
        ...prev,
        status: "notFound",
        error: err,
        isFetching: false
      }));
      if (err.routerCode === "BEFORE_LOAD" && routeCursor.parentRoute) {
        err.routeId = routeCursor.parentRoute.id;
        this._handleNotFound(matches, err, {
          updateMatch
        });
      }
    };
    this.hasNotFoundMatch = () => {
      return this.__store.state.matches.some(
        (d) => d.status === "notFound" || d.globalNotFound
      );
    };
    this.update({
      defaultPreloadDelay: 50,
      defaultPendingMs: 1e3,
      defaultPendingMinMs: 500,
      context: void 0,
      ...options,
      caseSensitive: options.caseSensitive ?? false,
      notFoundMode: options.notFoundMode ?? "fuzzy",
      stringifySearch: options.stringifySearch ?? defaultStringifySearch,
      parseSearch: options.parseSearch ?? defaultParseSearch
    });
    if (typeof document !== "undefined") {
      window.__TSR_ROUTER__ = this;
    }
  }
  get state() {
    return this.__store.state;
  }
  get looseRoutesById() {
    return this.routesById;
  }
  matchRoutesInternal(next, opts) {
    var _a;
    const { foundRoute, matchedRoutes, routeParams } = this.getMatchedRoutes(
      next.pathname,
      (_a = opts == null ? void 0 : opts.dest) == null ? void 0 : _a.to
    );
    let isGlobalNotFound = false;
    if (
      // If we found a route, and it's not an index route and we have left over path
      foundRoute ? foundRoute.path !== "/" && routeParams["**"] : (
        // Or if we didn't find a route and we have left over path
        trimPathRight(next.pathname)
      )
    ) {
      if (this.options.notFoundRoute) {
        matchedRoutes.push(this.options.notFoundRoute);
      } else {
        isGlobalNotFound = true;
      }
    }
    const globalNotFoundRouteId = (() => {
      if (!isGlobalNotFound) {
        return void 0;
      }
      if (this.options.notFoundMode !== "root") {
        for (let i = matchedRoutes.length - 1; i >= 0; i--) {
          const route = matchedRoutes[i];
          if (route.children) {
            return route.id;
          }
        }
      }
      return rootRouteId;
    })();
    const parseErrors = matchedRoutes.map((route) => {
      var _a2;
      let parsedParamsError;
      const parseParams = ((_a2 = route.options.params) == null ? void 0 : _a2.parse) ?? route.options.parseParams;
      if (parseParams) {
        try {
          const parsedParams = parseParams(routeParams);
          Object.assign(routeParams, parsedParams);
        } catch (err) {
          parsedParamsError = new PathParamError(err.message, {
            cause: err
          });
          if (opts == null ? void 0 : opts.throwOnError) {
            throw parsedParamsError;
          }
          return parsedParamsError;
        }
      }
      return;
    });
    const matches = [];
    const getParentContext = (parentMatch) => {
      const parentMatchId = parentMatch == null ? void 0 : parentMatch.id;
      const parentContext = !parentMatchId ? this.options.context ?? {} : parentMatch.context ?? this.options.context ?? {};
      return parentContext;
    };
    matchedRoutes.forEach((route, index) => {
      var _a2, _b;
      const parentMatch = matches[index - 1];
      const [preMatchSearch, strictMatchSearch, searchError] = (() => {
        const parentSearch = (parentMatch == null ? void 0 : parentMatch.search) ?? next.search;
        const parentStrictSearch = (parentMatch == null ? void 0 : parentMatch._strictSearch) ?? {};
        try {
          const strictSearch = validateSearch(route.options.validateSearch, { ...parentSearch }) ?? {};
          return [
            {
              ...parentSearch,
              ...strictSearch
            },
            { ...parentStrictSearch, ...strictSearch },
            void 0
          ];
        } catch (err) {
          let searchParamError = err;
          if (!(err instanceof SearchParamError)) {
            searchParamError = new SearchParamError(err.message, {
              cause: err
            });
          }
          if (opts == null ? void 0 : opts.throwOnError) {
            throw searchParamError;
          }
          return [parentSearch, {}, searchParamError];
        }
      })();
      const loaderDeps = ((_b = (_a2 = route.options).loaderDeps) == null ? void 0 : _b.call(_a2, {
        search: preMatchSearch
      })) ?? "";
      const loaderDepsHash = loaderDeps ? JSON.stringify(loaderDeps) : "";
      const { usedParams, interpolatedPath } = interpolatePath({
        path: route.fullPath,
        params: routeParams,
        decodeCharMap: this.pathParamsDecodeCharMap
      });
      const matchId = interpolatePath({
        path: route.id,
        params: routeParams,
        leaveWildcards: true,
        decodeCharMap: this.pathParamsDecodeCharMap
      }).interpolatedPath + loaderDepsHash;
      const existingMatch = this.getMatch(matchId);
      const previousMatch = this.state.matches.find(
        (d) => d.routeId === route.id
      );
      const cause = previousMatch ? "stay" : "enter";
      let match;
      if (existingMatch) {
        match = {
          ...existingMatch,
          cause,
          params: previousMatch ? replaceEqualDeep(previousMatch.params, routeParams) : routeParams,
          _strictParams: usedParams,
          search: previousMatch ? replaceEqualDeep(previousMatch.search, preMatchSearch) : replaceEqualDeep(existingMatch.search, preMatchSearch),
          _strictSearch: strictMatchSearch
        };
      } else {
        const status = route.options.loader || route.options.beforeLoad || route.lazyFn || routeNeedsPreload(route) ? "pending" : "success";
        match = {
          id: matchId,
          index,
          routeId: route.id,
          params: previousMatch ? replaceEqualDeep(previousMatch.params, routeParams) : routeParams,
          _strictParams: usedParams,
          pathname: joinPaths([this.basepath, interpolatedPath]),
          updatedAt: Date.now(),
          search: previousMatch ? replaceEqualDeep(previousMatch.search, preMatchSearch) : preMatchSearch,
          _strictSearch: strictMatchSearch,
          searchError: void 0,
          status,
          isFetching: false,
          error: void 0,
          paramsError: parseErrors[index],
          __routeContext: {},
          __beforeLoadContext: {},
          context: {},
          abortController: new AbortController(),
          fetchCount: 0,
          cause,
          loaderDeps: previousMatch ? replaceEqualDeep(previousMatch.loaderDeps, loaderDeps) : loaderDeps,
          invalid: false,
          preload: false,
          links: void 0,
          scripts: void 0,
          headScripts: void 0,
          meta: void 0,
          staticData: route.options.staticData || {},
          loadPromise: createControlledPromise(),
          fullPath: route.fullPath
        };
      }
      if (!(opts == null ? void 0 : opts.preload)) {
        match.globalNotFound = globalNotFoundRouteId === route.id;
      }
      match.searchError = searchError;
      const parentContext = getParentContext(parentMatch);
      match.context = {
        ...parentContext,
        ...match.__routeContext,
        ...match.__beforeLoadContext
      };
      matches.push(match);
    });
    matches.forEach((match, index) => {
      var _a2, _b;
      const route = this.looseRoutesById[match.routeId];
      const existingMatch = this.getMatch(match.id);
      if (!existingMatch && (opts == null ? void 0 : opts._buildLocation) !== true) {
        const parentMatch = matches[index - 1];
        const parentContext = getParentContext(parentMatch);
        const contextFnContext = {
          deps: match.loaderDeps,
          params: match.params,
          context: parentContext,
          location: next,
          navigate: (opts2) => this.navigate({ ...opts2, _fromLocation: next }),
          buildLocation: this.buildLocation,
          cause: match.cause,
          abortController: match.abortController,
          preload: !!match.preload,
          matches
        };
        match.__routeContext = ((_b = (_a2 = route.options).context) == null ? void 0 : _b.call(_a2, contextFnContext)) ?? {};
        match.context = {
          ...parentContext,
          ...match.__routeContext,
          ...match.__beforeLoadContext
        };
      }
    });
    return matches;
  }
  comparePaths(path1, path2) {
    return path1.replace(/(.+)\/$/, "$1") === path2.replace(/(.+)\/$/, "$1");
  }
};
var SearchParamError = class extends Error {
};
var PathParamError = class extends Error {
};
function lazyFn(fn, key) {
  return async (...args) => {
    const imported = await fn();
    return imported[key || "default"](...args);
  };
}
function getInitialRouterState(location) {
  return {
    loadedAt: 0,
    isLoading: false,
    isTransitioning: false,
    status: "idle",
    resolvedLocation: void 0,
    location,
    matches: [],
    pendingMatches: [],
    cachedMatches: [],
    statusCode: 200
  };
}
function validateSearch(validateSearch2, input) {
  if (validateSearch2 == null) return {};
  if ("~standard" in validateSearch2) {
    const result = validateSearch2["~standard"].validate(input);
    if (result instanceof Promise)
      throw new SearchParamError("Async validation not supported");
    if (result.issues)
      throw new SearchParamError(JSON.stringify(result.issues, void 0, 2), {
        cause: result
      });
    return result.value;
  }
  if ("parse" in validateSearch2) {
    return validateSearch2.parse(input);
  }
  if (typeof validateSearch2 === "function") {
    return validateSearch2(input);
  }
  return {};
}
var componentTypes = [
  "component",
  "errorComponent",
  "pendingComponent",
  "notFoundComponent"
];
function routeNeedsPreload(route) {
  var _a;
  for (const componentType of componentTypes) {
    if ((_a = route.options[componentType]) == null ? void 0 : _a.preload) {
      return true;
    }
  }
  return false;
}
function processRouteTree({
  routeTree,
  initRoute
}) {
  const routesById = {};
  const routesByPath = {};
  const recurseRoutes = (childRoutes) => {
    childRoutes.forEach((childRoute, i) => {
      initRoute == null ? void 0 : initRoute(childRoute, i);
      const existingRoute = routesById[childRoute.id];
      invariant(
        !existingRoute,
        `Duplicate routes found with id: ${String(childRoute.id)}`
      );
      routesById[childRoute.id] = childRoute;
      if (!childRoute.isRoot && childRoute.path) {
        const trimmedFullPath = trimPathRight(childRoute.fullPath);
        if (!routesByPath[trimmedFullPath] || childRoute.fullPath.endsWith("/")) {
          routesByPath[trimmedFullPath] = childRoute;
        }
      }
      const children = childRoute.children;
      if (children == null ? void 0 : children.length) {
        recurseRoutes(children);
      }
    });
  };
  recurseRoutes([routeTree]);
  const scoredRoutes = [];
  const routes = Object.values(routesById);
  routes.forEach((d, i) => {
    var _a;
    if (d.isRoot || !d.path) {
      return;
    }
    const trimmed = trimPathLeft(d.fullPath);
    const parsed = parsePathname(trimmed);
    while (parsed.length > 1 && ((_a = parsed[0]) == null ? void 0 : _a.value) === "/") {
      parsed.shift();
    }
    const scores = parsed.map((segment) => {
      if (segment.value === "/") {
        return 0.75;
      }
      if (segment.type === "param" && segment.prefixSegment && segment.suffixSegment) {
        return 0.55;
      }
      if (segment.type === "param" && segment.prefixSegment) {
        return 0.52;
      }
      if (segment.type === "param" && segment.suffixSegment) {
        return 0.51;
      }
      if (segment.type === "param") {
        return 0.5;
      }
      if (segment.type === "wildcard" && segment.prefixSegment && segment.suffixSegment) {
        return 0.3;
      }
      if (segment.type === "wildcard" && segment.prefixSegment) {
        return 0.27;
      }
      if (segment.type === "wildcard" && segment.suffixSegment) {
        return 0.26;
      }
      if (segment.type === "wildcard") {
        return 0.25;
      }
      return 1;
    });
    scoredRoutes.push({ child: d, trimmed, parsed, index: i, scores });
  });
  const flatRoutes = scoredRoutes.sort((a, b) => {
    const minLength = Math.min(a.scores.length, b.scores.length);
    for (let i = 0; i < minLength; i++) {
      if (a.scores[i] !== b.scores[i]) {
        return b.scores[i] - a.scores[i];
      }
    }
    if (a.scores.length !== b.scores.length) {
      return b.scores.length - a.scores.length;
    }
    for (let i = 0; i < minLength; i++) {
      if (a.parsed[i].value !== b.parsed[i].value) {
        return a.parsed[i].value > b.parsed[i].value ? 1 : -1;
      }
    }
    return a.index - b.index;
  }).map((d, i) => {
    d.child.rank = i;
    return d.child;
  });
  return { routesById, routesByPath, flatRoutes };
}
function getMatchedRoutes({
  pathname,
  routePathname,
  basepath,
  caseSensitive,
  routesByPath,
  routesById,
  flatRoutes
}) {
  let routeParams = {};
  const trimmedPath = trimPathRight(pathname);
  const getMatchedParams = (route) => {
    var _a;
    const result = matchPathname(basepath, trimmedPath, {
      to: route.fullPath,
      caseSensitive: ((_a = route.options) == null ? void 0 : _a.caseSensitive) ?? caseSensitive,
      fuzzy: true
    });
    return result;
  };
  let foundRoute = routePathname !== void 0 ? routesByPath[routePathname] : void 0;
  if (foundRoute) {
    routeParams = getMatchedParams(foundRoute);
  } else {
    foundRoute = flatRoutes.find((route) => {
      const matchedParams = getMatchedParams(route);
      if (matchedParams) {
        routeParams = matchedParams;
        return true;
      }
      return false;
    });
  }
  let routeCursor = foundRoute || routesById[rootRouteId];
  const matchedRoutes = [routeCursor];
  while (routeCursor.parentRoute) {
    routeCursor = routeCursor.parentRoute;
    matchedRoutes.unshift(routeCursor);
  }
  return { matchedRoutes, routeParams, foundRoute };
}
function applySearchMiddleware({
  search,
  dest,
  destRoutes,
  _includeValidateSearch
}) {
  const allMiddlewares = destRoutes.reduce(
    (acc, route) => {
      var _a;
      const middlewares = [];
      if ("search" in route.options) {
        if ((_a = route.options.search) == null ? void 0 : _a.middlewares) {
          middlewares.push(...route.options.search.middlewares);
        }
      } else if (route.options.preSearchFilters || route.options.postSearchFilters) {
        const legacyMiddleware = ({
          search: search2,
          next
        }) => {
          let nextSearch = search2;
          if ("preSearchFilters" in route.options && route.options.preSearchFilters) {
            nextSearch = route.options.preSearchFilters.reduce(
              (prev, next2) => next2(prev),
              search2
            );
          }
          const result = next(nextSearch);
          if ("postSearchFilters" in route.options && route.options.postSearchFilters) {
            return route.options.postSearchFilters.reduce(
              (prev, next2) => next2(prev),
              result
            );
          }
          return result;
        };
        middlewares.push(legacyMiddleware);
      }
      if (_includeValidateSearch && route.options.validateSearch) {
        const validate = ({ search: search2, next }) => {
          const result = next(search2);
          try {
            const validatedSearch = {
              ...result,
              ...validateSearch(route.options.validateSearch, result) ?? {}
            };
            return validatedSearch;
          } catch {
            return result;
          }
        };
        middlewares.push(validate);
      }
      return acc.concat(middlewares);
    },
    []
  ) ?? [];
  const final = ({ search: search2 }) => {
    if (!dest.search) {
      return {};
    }
    if (dest.search === true) {
      return search2;
    }
    return functionalUpdate(dest.search, search2);
  };
  allMiddlewares.push(final);
  const applyNext = (index, currentSearch) => {
    if (index >= allMiddlewares.length) {
      return currentSearch;
    }
    const middleware = allMiddlewares[index];
    const next = (newSearch) => {
      return applyNext(index + 1, newSearch);
    };
    return middleware({ search: currentSearch, next });
  };
  return applyNext(0, search);
}

// ../../node_modules/.deno/@tanstack+router-core@1.125.4/node_modules/@tanstack/router-core/dist/esm/defer.js
var TSR_DEFERRED_PROMISE = Symbol.for("TSR_DEFERRED_PROMISE");
function defer(_promise, options) {
  const promise = _promise;
  if (promise[TSR_DEFERRED_PROMISE]) {
    return promise;
  }
  promise[TSR_DEFERRED_PROMISE] = { status: "pending" };
  promise.then((data) => {
    promise[TSR_DEFERRED_PROMISE].status = "success";
    promise[TSR_DEFERRED_PROMISE].data = data;
  }).catch((error) => {
    promise[TSR_DEFERRED_PROMISE].status = "error";
    promise[TSR_DEFERRED_PROMISE].error = {
      data: ((options == null ? void 0 : options.serializeError) ?? defaultSerializeError)(error),
      __isServerError: true
    };
  });
  return promise;
}

// ../../node_modules/.deno/@tanstack+router-core@1.125.4/node_modules/@tanstack/router-core/dist/esm/Matches.js
var isMatch = (match, path) => {
  const parts = path.split(".");
  let part;
  let value = match;
  while ((part = parts.shift()) != null && value != null) {
    value = value[part];
  }
  return value != null;
};

// ../../node_modules/.deno/@tanstack+router-core@1.125.4/node_modules/@tanstack/router-core/dist/esm/searchMiddleware.js
function retainSearchParams(keys) {
  return ({ search, next }) => {
    const result = next(search);
    if (keys === true) {
      return { ...search, ...result };
    }
    keys.forEach((key) => {
      if (!(key in result)) {
        result[key] = search[key];
      }
    });
    return result;
  };
}
function stripSearchParams(input) {
  return ({ search, next }) => {
    if (input === true) {
      return {};
    }
    const result = next(search);
    if (Array.isArray(input)) {
      input.forEach((key) => {
        delete result[key];
      });
    } else {
      Object.entries(input).forEach(
        ([key, value]) => {
          if (deepEqual(result[key], value)) {
            delete result[key];
          }
        }
      );
    }
    return result;
  };
}

// ../../node_modules/.deno/@tanstack+router-core@1.125.4/node_modules/@tanstack/router-core/dist/esm/link.js
var preloadWarning = "Error preloading route! ☝️";

// ../../node_modules/.deno/@tanstack+router-core@1.125.4/node_modules/@tanstack/router-core/dist/esm/route.js
var BaseRoute = class {
  constructor(options) {
    this.init = (opts) => {
      var _a, _b;
      this.originalIndex = opts.originalIndex;
      const options2 = this.options;
      const isRoot = !(options2 == null ? void 0 : options2.path) && !(options2 == null ? void 0 : options2.id);
      this.parentRoute = (_b = (_a = this.options).getParentRoute) == null ? void 0 : _b.call(_a);
      if (isRoot) {
        this._path = rootRouteId;
      } else if (!this.parentRoute) {
        invariant(
          false,
          `Child Route instances must pass a 'getParentRoute: () => ParentRoute' option that returns a Route instance.`
        );
      }
      let path = isRoot ? rootRouteId : options2 == null ? void 0 : options2.path;
      if (path && path !== "/") {
        path = trimPathLeft(path);
      }
      const customId = (options2 == null ? void 0 : options2.id) || path;
      let id = isRoot ? rootRouteId : joinPaths([
        this.parentRoute.id === rootRouteId ? "" : this.parentRoute.id,
        customId
      ]);
      if (path === rootRouteId) {
        path = "/";
      }
      if (id !== rootRouteId) {
        id = joinPaths(["/", id]);
      }
      const fullPath = id === rootRouteId ? "/" : joinPaths([this.parentRoute.fullPath, path]);
      this._path = path;
      this._id = id;
      this._fullPath = fullPath;
      this._to = fullPath;
    };
    this.clone = (other) => {
      this._path = other._path;
      this._id = other._id;
      this._fullPath = other._fullPath;
      this._to = other._to;
      this.options.getParentRoute = other.options.getParentRoute;
      this.children = other.children;
    };
    this.addChildren = (children) => {
      return this._addFileChildren(children);
    };
    this._addFileChildren = (children) => {
      if (Array.isArray(children)) {
        this.children = children;
      }
      if (typeof children === "object" && children !== null) {
        this.children = Object.values(children);
      }
      return this;
    };
    this._addFileTypes = () => {
      return this;
    };
    this.updateLoader = (options2) => {
      Object.assign(this.options, options2);
      return this;
    };
    this.update = (options2) => {
      Object.assign(this.options, options2);
      return this;
    };
    this.lazy = (lazyFn2) => {
      this.lazyFn = lazyFn2;
      return this;
    };
    this.options = options || {};
    this.isRoot = !(options == null ? void 0 : options.getParentRoute);
    if ((options == null ? void 0 : options.id) && (options == null ? void 0 : options.path)) {
      throw new Error(`Route cannot have both an 'id' and a 'path' option.`);
    }
  }
  get to() {
    return this._to;
  }
  get id() {
    return this._id;
  }
  get path() {
    return this._path;
  }
  get fullPath() {
    return this._fullPath;
  }
};
var BaseRouteApi = class {
  constructor({ id }) {
    this.notFound = (opts) => {
      return notFound({ routeId: this.id, ...opts });
    };
    this.id = id;
  }
};
var BaseRootRoute = class extends BaseRoute {
  constructor(options) {
    super(options);
  }
};

export {
  invariant,
  createHistory,
  createBrowserHistory,
  createHashHistory,
  createMemoryHistory,
  functionalUpdate,
  pick,
  replaceEqualDeep,
  isPlainObject,
  isPlainArray,
  deepEqual,
  createControlledPromise,
  escapeJSON,
  shallow,
  isModuleNotFoundError,
  joinPaths,
  cleanPath,
  trimPathLeft,
  trimPathRight,
  trimPath,
  removeTrailingSlash,
  exactPathTest,
  resolvePath,
  parsePathname,
  interpolatePath,
  matchPathname,
  removeBasepath,
  matchByPath,
  notFound,
  isNotFound,
  storageKey,
  scrollRestorationCache,
  defaultGetScrollRestorationKey,
  getCssSelector,
  restoreScroll,
  setupScrollRestoration,
  handleHashScroll,
  encode,
  decode,
  defaultParseSearch,
  defaultStringifySearch,
  parseSearchWith,
  stringifySearchWith,
  rootRouteId,
  redirect,
  isRedirect,
  defaultSerializeError,
  getLocationChangeInfo,
  RouterCore,
  SearchParamError,
  PathParamError,
  lazyFn,
  getInitialRouterState,
  componentTypes,
  TSR_DEFERRED_PROMISE,
  defer,
  preloadWarning,
  isMatch,
  BaseRoute,
  BaseRouteApi,
  BaseRootRoute,
  retainSearchParams,
  stripSearchParams
};
//# sourceMappingURL=chunk-VMMXHQTH.js.map
