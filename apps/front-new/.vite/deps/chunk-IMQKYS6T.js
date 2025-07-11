import {
   BaseRootRoute,
   BaseRoute,
   BaseRouteApi,
   createControlledPromise,
   deepEqual,
   defaultGetScrollRestorationKey,
   defer,
   exactPathTest,
   functionalUpdate,
   getCssSelector,
   getLocationChangeInfo,
   handleHashScroll,
   invariant,
   isModuleNotFoundError,
   isNotFound,
   isRedirect,
   notFound,
   pick,
   preloadWarning,
   removeTrailingSlash,
   replaceEqualDeep,
   restoreScroll,
   rootRouteId,
   RouterCore,
   scrollRestorationCache,
   setupScrollRestoration,
   storageKey,
   trimPathRight,
   TSR_DEFERRED_PROMISE,
} from './chunk-VMMXHQTH.js';
import { useStore } from './chunk-SJXWFFBF.js';
import { require_jsx_runtime } from './chunk-JY6JHD56.js';
import { require_react_dom } from './chunk-VEEPTEKR.js';
import { require_react } from './chunk-JZ6RMLDG.js';
import { __commonJS, __toESM } from './chunk-WOOG5QLI.js';

// ../../node_modules/.deno/jsesc@3.1.0/node_modules/jsesc/jsesc.js
var require_jsesc = __commonJS({
   '../../node_modules/.deno/jsesc@3.1.0/node_modules/jsesc/jsesc.js'(exports, module) {
      'use strict';
      var object = {};
      var hasOwnProperty = object.hasOwnProperty;
      var forOwn = (object2, callback) => {
         for (const key in object2) {
            if (hasOwnProperty.call(object2, key)) {
               callback(key, object2[key]);
            }
         }
      };
      var extend = (destination, source) => {
         if (!source) {
            return destination;
         }
         forOwn(source, (key, value) => {
            destination[key] = value;
         });
         return destination;
      };
      var forEach = (array, callback) => {
         const length = array.length;
         let index = -1;
         while (++index < length) {
            callback(array[index]);
         }
      };
      var fourHexEscape = (hex) => {
         return '\\u' + ('0000' + hex).slice(-4);
      };
      var hexadecimal = (code, lowercase) => {
         let hexadecimal2 = code.toString(16);
         if (lowercase) return hexadecimal2;
         return hexadecimal2.toUpperCase();
      };
      var toString = object.toString;
      var isArray = Array.isArray;
      var isBuffer = (value) => {
         return typeof Buffer === 'function' && Buffer.isBuffer(value);
      };
      var isObject = (value) => {
         return toString.call(value) == '[object Object]';
      };
      var isString = (value) => {
         return typeof value == 'string' || toString.call(value) == '[object String]';
      };
      var isNumber = (value) => {
         return typeof value == 'number' || toString.call(value) == '[object Number]';
      };
      var isBigInt = (value) => {
         return typeof value == 'bigint';
      };
      var isFunction = (value) => {
         return typeof value == 'function';
      };
      var isMap = (value) => {
         return toString.call(value) == '[object Map]';
      };
      var isSet = (value) => {
         return toString.call(value) == '[object Set]';
      };
      var singleEscapes = {
         '\\': '\\\\',
         '\b': '\\b',
         '\f': '\\f',
         '\n': '\\n',
         '\r': '\\r',
         '	': '\\t',
         // `\v` is omitted intentionally, because in IE < 9, '\v' == 'v'.
         // '\v': '\\x0B'
      };
      var regexSingleEscape = /[\\\b\f\n\r\t]/;
      var regexDigit = /[0-9]/;
      var regexWhitespace = /[\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/;
      var escapeEverythingRegex = /([\uD800-\uDBFF][\uDC00-\uDFFF])|([\uD800-\uDFFF])|(['"`])|[^]/g;
      var escapeNonAsciiRegex =
         /([\uD800-\uDBFF][\uDC00-\uDFFF])|([\uD800-\uDFFF])|(['"`])|[^ !#-&\(-\[\]-_a-~]/g;
      var jsesc2 = (argument, options) => {
         const increaseIndentation = () => {
            oldIndent = indent;
            ++options.indentLevel;
            indent = options.indent.repeat(options.indentLevel);
         };
         const defaults = {
            'escapeEverything': false,
            'minimal': false,
            'isScriptContext': false,
            'quotes': 'single',
            'wrap': false,
            'es6': false,
            'json': false,
            'compact': true,
            'lowercaseHex': false,
            'numbers': 'decimal',
            'indent': '	',
            'indentLevel': 0,
            '__inline1__': false,
            '__inline2__': false,
         };
         const json = options && options.json;
         if (json) {
            defaults.quotes = 'double';
            defaults.wrap = true;
         }
         options = extend(defaults, options);
         if (
            options.quotes != 'single' && options.quotes != 'double' && options.quotes != 'backtick'
         ) {
            options.quotes = 'single';
         }
         const quote = options.quotes == 'double' ? '"' : options.quotes == 'backtick' ? '`' : "'";
         const compact = options.compact;
         const lowercaseHex = options.lowercaseHex;
         let indent = options.indent.repeat(options.indentLevel);
         let oldIndent = '';
         const inline1 = options.__inline1__;
         const inline2 = options.__inline2__;
         const newLine = compact ? '' : '\n';
         let result;
         let isEmpty = true;
         const useBinNumbers = options.numbers == 'binary';
         const useOctNumbers = options.numbers == 'octal';
         const useDecNumbers = options.numbers == 'decimal';
         const useHexNumbers = options.numbers == 'hexadecimal';
         if (json && argument && isFunction(argument.toJSON)) {
            argument = argument.toJSON();
         }
         if (!isString(argument)) {
            if (isMap(argument)) {
               if (argument.size == 0) {
                  return 'new Map()';
               }
               if (!compact) {
                  options.__inline1__ = true;
                  options.__inline2__ = false;
               }
               return 'new Map(' + jsesc2(Array.from(argument), options) + ')';
            }
            if (isSet(argument)) {
               if (argument.size == 0) {
                  return 'new Set()';
               }
               return 'new Set(' + jsesc2(Array.from(argument), options) + ')';
            }
            if (isBuffer(argument)) {
               if (argument.length == 0) {
                  return 'Buffer.from([])';
               }
               return 'Buffer.from(' + jsesc2(Array.from(argument), options) + ')';
            }
            if (isArray(argument)) {
               result = [];
               options.wrap = true;
               if (inline1) {
                  options.__inline1__ = false;
                  options.__inline2__ = true;
               }
               if (!inline2) {
                  increaseIndentation();
               }
               forEach(argument, (value) => {
                  isEmpty = false;
                  if (inline2) {
                     options.__inline2__ = false;
                  }
                  result.push(
                     (compact || inline2 ? '' : indent) + jsesc2(value, options),
                  );
               });
               if (isEmpty) {
                  return '[]';
               }
               if (inline2) {
                  return '[' + result.join(', ') + ']';
               }
               return '[' + newLine + result.join(',' + newLine) + newLine +
                  (compact ? '' : oldIndent) + ']';
            } else if (isNumber(argument) || isBigInt(argument)) {
               if (json) {
                  return JSON.stringify(Number(argument));
               }
               let result2;
               if (useDecNumbers) {
                  result2 = String(argument);
               } else if (useHexNumbers) {
                  let hexadecimal2 = argument.toString(16);
                  if (!lowercaseHex) {
                     hexadecimal2 = hexadecimal2.toUpperCase();
                  }
                  result2 = '0x' + hexadecimal2;
               } else if (useBinNumbers) {
                  result2 = '0b' + argument.toString(2);
               } else if (useOctNumbers) {
                  result2 = '0o' + argument.toString(8);
               }
               if (isBigInt(argument)) {
                  return result2 + 'n';
               }
               return result2;
            } else if (isBigInt(argument)) {
               if (json) {
                  return JSON.stringify(Number(argument));
               }
               return argument + 'n';
            } else if (!isObject(argument)) {
               if (json) {
                  return JSON.stringify(argument) || 'null';
               }
               return String(argument);
            } else {
               result = [];
               options.wrap = true;
               increaseIndentation();
               forOwn(argument, (key, value) => {
                  isEmpty = false;
                  result.push(
                     (compact ? '' : indent) + jsesc2(key, options) + ':' + (compact ? '' : ' ') +
                        jsesc2(value, options),
                  );
               });
               if (isEmpty) {
                  return '{}';
               }
               return '{' + newLine + result.join(',' + newLine) + newLine +
                  (compact ? '' : oldIndent) + '}';
            }
         }
         const regex = options.escapeEverything ? escapeEverythingRegex : escapeNonAsciiRegex;
         result = argument.replace(regex, (char, pair, lone, quoteChar, index, string) => {
            if (pair) {
               if (options.minimal) return pair;
               const first = pair.charCodeAt(0);
               const second = pair.charCodeAt(1);
               if (options.es6) {
                  const codePoint = (first - 55296) * 1024 + second - 56320 + 65536;
                  const hex2 = hexadecimal(codePoint, lowercaseHex);
                  return '\\u{' + hex2 + '}';
               }
               return fourHexEscape(hexadecimal(first, lowercaseHex)) +
                  fourHexEscape(hexadecimal(second, lowercaseHex));
            }
            if (lone) {
               return fourHexEscape(hexadecimal(lone.charCodeAt(0), lowercaseHex));
            }
            if (char == '\0' && !json && !regexDigit.test(string.charAt(index + 1))) {
               return '\\0';
            }
            if (quoteChar) {
               if (quoteChar == quote || options.escapeEverything) {
                  return '\\' + quoteChar;
               }
               return quoteChar;
            }
            if (regexSingleEscape.test(char)) {
               return singleEscapes[char];
            }
            if (options.minimal && !regexWhitespace.test(char)) {
               return char;
            }
            const hex = hexadecimal(char.charCodeAt(0), lowercaseHex);
            if (json || hex.length > 2) {
               return fourHexEscape(hex);
            }
            return '\\x' + ('00' + hex).slice(-2);
         });
         if (quote == '`') {
            result = result.replace(/\$\{/g, '\\${');
         }
         if (options.isScriptContext) {
            result = result.replace(/<\/(script|style)/gi, '<\\/$1').replace(
               /<!--/g,
               json ? '\\u003C!--' : '\\x3C!--',
            );
         }
         if (options.wrap) {
            result = quote + result + quote;
         }
         return result;
      };
      jsesc2.version = '3.0.2';
      module.exports = jsesc2;
   },
});

// ../../node_modules/.deno/tiny-warning@1.0.3/node_modules/tiny-warning/dist/tiny-warning.esm.js
var isProduction = false;
function warning(condition, message) {
   if (!isProduction) {
      if (condition) {
         return;
      }
      var text = 'Warning: ' + message;
      if (typeof console !== 'undefined') {
         console.warn(text);
      }
      try {
         throw Error(text);
      } catch (x) {
      }
   }
}
var tiny_warning_esm_default = warning;

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/awaited.js
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var React = __toESM(require_react(), 1);
function useAwaited({
   promise: _promise,
}) {
   const promise = defer(_promise);
   if (promise[TSR_DEFERRED_PROMISE].status === 'pending') {
      throw promise;
   }
   if (promise[TSR_DEFERRED_PROMISE].status === 'error') {
      throw promise[TSR_DEFERRED_PROMISE].error;
   }
   return [promise[TSR_DEFERRED_PROMISE].data, promise];
}
function Await(props) {
   const inner = (0, import_jsx_runtime.jsx)(AwaitInner, { ...props });
   if (props.fallback) {
      return (0, import_jsx_runtime.jsx)(React.Suspense, {
         fallback: props.fallback,
         children: inner,
      });
   }
   return inner;
}
function AwaitInner(props) {
   const [data] = useAwaited(props);
   return props.children(data);
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/CatchBoundary.js
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
var React2 = __toESM(require_react(), 1);
function CatchBoundary(props) {
   const errorComponent = props.errorComponent ?? ErrorComponent;
   return (0, import_jsx_runtime2.jsx)(
      CatchBoundaryImpl,
      {
         getResetKey: props.getResetKey,
         onCatch: props.onCatch,
         children: ({ error, reset }) => {
            if (error) {
               return React2.createElement(errorComponent, {
                  error,
                  reset,
               });
            }
            return props.children;
         },
      },
   );
}
var CatchBoundaryImpl = class extends React2.Component {
   constructor() {
      super(...arguments);
      this.state = { error: null };
   }
   static getDerivedStateFromProps(props) {
      return { resetKey: props.getResetKey() };
   }
   static getDerivedStateFromError(error) {
      return { error };
   }
   reset() {
      this.setState({ error: null });
   }
   componentDidUpdate(prevProps, prevState) {
      if (prevState.error && prevState.resetKey !== this.state.resetKey) {
         this.reset();
      }
   }
   componentDidCatch(error, errorInfo) {
      if (this.props.onCatch) {
         this.props.onCatch(error, errorInfo);
      }
   }
   render() {
      return this.props.children({
         error: this.state.resetKey !== this.props.getResetKey() ? null : this.state.error,
         reset: () => {
            this.reset();
         },
      });
   }
};
function ErrorComponent({ error }) {
   const [show, setShow] = React2.useState(true);
   return (0, import_jsx_runtime2.jsxs)('div', {
      style: { padding: '.5rem', maxWidth: '100%' },
      children: [
         (0, import_jsx_runtime2.jsxs)('div', {
            style: { display: 'flex', alignItems: 'center', gap: '.5rem' },
            children: [
               (0, import_jsx_runtime2.jsx)('strong', {
                  style: { fontSize: '1rem' },
                  children: 'Something went wrong!',
               }),
               (0, import_jsx_runtime2.jsx)(
                  'button',
                  {
                     style: {
                        appearance: 'none',
                        fontSize: '.6em',
                        border: '1px solid currentColor',
                        padding: '.1rem .2rem',
                        fontWeight: 'bold',
                        borderRadius: '.25rem',
                     },
                     onClick: () => setShow((d) => !d),
                     children: show ? 'Hide Error' : 'Show Error',
                  },
               ),
            ],
         }),
         (0, import_jsx_runtime2.jsx)('div', { style: { height: '.25rem' } }),
         show
            ? (0, import_jsx_runtime2.jsx)('div', {
               children: (0, import_jsx_runtime2.jsx)(
                  'pre',
                  {
                     style: {
                        fontSize: '.7em',
                        border: '1px solid red',
                        borderRadius: '.25rem',
                        padding: '.3rem',
                        color: 'red',
                        overflow: 'auto',
                     },
                     children: error.message
                        ? (0, import_jsx_runtime2.jsx)('code', { children: error.message })
                        : null,
                  },
               ),
            })
            : null,
      ],
   });
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/ClientOnly.js
var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
var import_react = __toESM(require_react(), 1);
function ClientOnly({ children, fallback = null }) {
   return useHydrated()
      ? (0, import_jsx_runtime3.jsx)(import_react.default.Fragment, { children })
      : (0, import_jsx_runtime3.jsx)(import_react.default.Fragment, { children: fallback });
}
function useHydrated() {
   return import_react.default.useSyncExternalStore(
      subscribe,
      () => true,
      () => false,
   );
}
function subscribe() {
   return () => {
   };
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/route.js
var import_jsx_runtime5 = __toESM(require_jsx_runtime(), 1);
var import_react3 = __toESM(require_react(), 1);

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/useMatch.js
var React6 = __toESM(require_react(), 1);

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/useRouterState.js
var import_react2 = __toESM(require_react(), 1);

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/useRouter.js
var React4 = __toESM(require_react(), 1);

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/routerContext.js
var React3 = __toESM(require_react(), 1);
var routerContext = React3.createContext(null);
function getRouterContext() {
   if (typeof document === 'undefined') {
      return routerContext;
   }
   if (window.__TSR_ROUTER_CONTEXT__) {
      return window.__TSR_ROUTER_CONTEXT__;
   }
   window.__TSR_ROUTER_CONTEXT__ = routerContext;
   return routerContext;
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/useRouter.js
function useRouter(opts) {
   const value = React4.useContext(getRouterContext());
   tiny_warning_esm_default(
      !(((opts == null ? void 0 : opts.warn) ?? true) && !value),
      'useRouter must be used inside a <RouterProvider> component!',
   );
   return value;
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/useRouterState.js
function useRouterState(opts) {
   const contextRouter = useRouter({
      warn: (opts == null ? void 0 : opts.router) === void 0,
   });
   const router = (opts == null ? void 0 : opts.router) || contextRouter;
   const previousResult = (0, import_react2.useRef)(void 0);
   return useStore(router.__store, (state) => {
      if (opts == null ? void 0 : opts.select) {
         if (opts.structuralSharing ?? router.options.defaultStructuralSharing) {
            const newSlice = replaceEqualDeep(
               previousResult.current,
               opts.select(state),
            );
            previousResult.current = newSlice;
            return newSlice;
         }
         return opts.select(state);
      }
      return state;
   });
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/matchContext.js
var React5 = __toESM(require_react(), 1);
var matchContext = React5.createContext(void 0);
var dummyMatchContext = React5.createContext(
   void 0,
);

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/useMatch.js
function useMatch(opts) {
   const nearestMatchId = React6.useContext(
      opts.from ? dummyMatchContext : matchContext,
   );
   const matchSelection = useRouterState({
      select: (state) => {
         const match = state.matches.find(
            (d) => opts.from ? opts.from === d.routeId : d.id === nearestMatchId,
         );
         invariant(
            !((opts.shouldThrow ?? true) && !match),
            `Could not find ${
               opts.from ? `an active match from "${opts.from}"` : 'a nearest match!'
            }`,
         );
         if (match === void 0) {
            return void 0;
         }
         return opts.select ? opts.select(match) : match;
      },
      structuralSharing: opts.structuralSharing,
   });
   return matchSelection;
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/useLoaderData.js
function useLoaderData(opts) {
   return useMatch({
      from: opts.from,
      strict: opts.strict,
      structuralSharing: opts.structuralSharing,
      select: (s) => {
         return opts.select ? opts.select(s.loaderData) : s.loaderData;
      },
   });
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/useLoaderDeps.js
function useLoaderDeps(opts) {
   const { select, ...rest } = opts;
   return useMatch({
      ...rest,
      select: (s) => {
         return select ? select(s.loaderDeps) : s.loaderDeps;
      },
   });
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/useParams.js
function useParams(opts) {
   return useMatch({
      from: opts.from,
      strict: opts.strict,
      shouldThrow: opts.shouldThrow,
      structuralSharing: opts.structuralSharing,
      select: (match) => {
         return opts.select ? opts.select(match.params) : match.params;
      },
   });
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/useSearch.js
function useSearch(opts) {
   return useMatch({
      from: opts.from,
      strict: opts.strict,
      shouldThrow: opts.shouldThrow,
      structuralSharing: opts.structuralSharing,
      select: (match) => {
         return opts.select ? opts.select(match.search) : match.search;
      },
   });
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/useNavigate.js
var React7 = __toESM(require_react(), 1);
function useNavigate(_defaultOpts) {
   const { navigate, state } = useRouter();
   const matchIndex = useMatch({
      strict: false,
      select: (match) => match.index,
   });
   return React7.useCallback(
      (options) => {
         const from = options.from ?? (_defaultOpts == null ? void 0 : _defaultOpts.from) ??
            state.matches[matchIndex].fullPath;
         return navigate({
            ...options,
            from,
         });
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [_defaultOpts == null ? void 0 : _defaultOpts.from, navigate],
   );
}
function Navigate(props) {
   const router = useRouter();
   const navigate = useNavigate();
   const previousPropsRef = React7.useRef(null);
   React7.useEffect(() => {
      if (previousPropsRef.current !== props) {
         navigate(props);
         previousPropsRef.current = props;
      }
   }, [router, props, navigate]);
   return null;
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/link.js
var import_jsx_runtime4 = __toESM(require_jsx_runtime(), 1);
var React9 = __toESM(require_react(), 1);
var import_react_dom = __toESM(require_react_dom(), 1);

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/utils.js
var React8 = __toESM(require_react(), 1);
function useStableCallback(fn) {
   const fnRef = React8.useRef(fn);
   fnRef.current = fn;
   const ref = React8.useRef((...args) => fnRef.current(...args));
   return ref.current;
}
var useLayoutEffect2 = typeof window !== 'undefined' ? React8.useLayoutEffect : React8.useEffect;
function usePrevious(value) {
   const ref = React8.useRef({
      value,
      prev: null,
   });
   const current = ref.current.value;
   if (value !== current) {
      ref.current = {
         value,
         prev: current,
      };
   }
   return ref.current.prev;
}
function useIntersectionObserver(ref, callback, intersectionObserverOptions = {}, options = {}) {
   const isIntersectionObserverAvailable = React8.useRef(
      typeof IntersectionObserver === 'function',
   );
   const observerRef = React8.useRef(null);
   React8.useEffect(() => {
      if (!ref.current || !isIntersectionObserverAvailable.current || options.disabled) {
         return;
      }
      observerRef.current = new IntersectionObserver(([entry]) => {
         callback(entry);
      }, intersectionObserverOptions);
      observerRef.current.observe(ref.current);
      return () => {
         var _a;
         (_a = observerRef.current) == null ? void 0 : _a.disconnect();
      };
   }, [callback, intersectionObserverOptions, options.disabled, ref]);
   return observerRef.current;
}
function useForwardedRef(ref) {
   const innerRef = React8.useRef(null);
   React8.useImperativeHandle(ref, () => innerRef.current, []);
   return innerRef;
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/link.js
function useLinkProps(options, forwardedRef) {
   const router = useRouter();
   const [isTransitioning, setIsTransitioning] = React9.useState(false);
   const hasRenderFetched = React9.useRef(false);
   const innerRef = useForwardedRef(forwardedRef);
   const {
      // custom props
      activeProps = () => ({ className: 'active' }),
      inactiveProps = () => ({}),
      activeOptions,
      to,
      preload: userPreload,
      preloadDelay: userPreloadDelay,
      hashScrollIntoView,
      replace,
      startTransition: startTransition2,
      resetScroll,
      viewTransition,
      // element props
      children,
      target,
      disabled,
      style,
      className,
      onClick,
      onFocus,
      onMouseEnter,
      onMouseLeave,
      onTouchStart,
      ignoreBlocker,
      ...rest
   } = options;
   const {
      // prevent these from being returned
      params: _params,
      search: _search,
      hash: _hash,
      state: _state,
      mask: _mask,
      reloadDocument: _reloadDocument,
      unsafeRelative: _unsafeRelative,
      ...propsSafeToSpread
   } = rest;
   const type = React9.useMemo(() => {
      try {
         new URL(`${to}`);
         return 'external';
      } catch {
      }
      return 'internal';
   }, [to]);
   const currentSearch = useRouterState({
      select: (s) => s.location.search,
      structuralSharing: true,
   });
   const nearestFrom = useMatch({
      strict: false,
      select: (match) => match.fullPath,
   });
   const from = options.from ?? nearestFrom;
   options = { ...options, from };
   const next = React9.useMemo(
      () => router.buildLocation(options),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [router, options, currentSearch],
   );
   const preload = React9.useMemo(() => {
      if (options.reloadDocument) {
         return false;
      }
      return userPreload ?? router.options.defaultPreload;
   }, [router.options.defaultPreload, userPreload, options.reloadDocument]);
   const preloadDelay = userPreloadDelay ?? router.options.defaultPreloadDelay ?? 0;
   const isActive = useRouterState({
      select: (s) => {
         if (activeOptions == null ? void 0 : activeOptions.exact) {
            const testExact = exactPathTest(
               s.location.pathname,
               next.pathname,
               router.basepath,
            );
            if (!testExact) {
               return false;
            }
         } else {
            const currentPathSplit = removeTrailingSlash(
               s.location.pathname,
               router.basepath,
            ).split('/');
            const nextPathSplit = removeTrailingSlash(
               next.pathname,
               router.basepath,
            ).split('/');
            const pathIsFuzzyEqual = nextPathSplit.every(
               (d, i) => d === currentPathSplit[i],
            );
            if (!pathIsFuzzyEqual) {
               return false;
            }
         }
         if ((activeOptions == null ? void 0 : activeOptions.includeSearch) ?? true) {
            const searchTest = deepEqual(s.location.search, next.search, {
               partial: !(activeOptions == null ? void 0 : activeOptions.exact),
               ignoreUndefined: !(activeOptions == null ? void 0 : activeOptions.explicitUndefined),
            });
            if (!searchTest) {
               return false;
            }
         }
         if (activeOptions == null ? void 0 : activeOptions.includeHash) {
            return s.location.hash === next.hash;
         }
         return true;
      },
   });
   const doPreload = React9.useCallback(() => {
      router.preloadRoute(options).catch((err) => {
         console.warn(err);
         console.warn(preloadWarning);
      });
   }, [options, router]);
   const preloadViewportIoCallback = React9.useCallback(
      (entry) => {
         if (entry == null ? void 0 : entry.isIntersecting) {
            doPreload();
         }
      },
      [doPreload],
   );
   useIntersectionObserver(
      innerRef,
      preloadViewportIoCallback,
      { rootMargin: '100px' },
      { disabled: !!disabled || !(preload === 'viewport') },
   );
   useLayoutEffect2(() => {
      if (hasRenderFetched.current) {
         return;
      }
      if (!disabled && preload === 'render') {
         doPreload();
         hasRenderFetched.current = true;
      }
   }, [disabled, doPreload, preload]);
   if (type === 'external') {
      return {
         ...propsSafeToSpread,
         ref: innerRef,
         type,
         href: to,
         ...children && { children },
         ...target && { target },
         ...disabled && { disabled },
         ...style && { style },
         ...className && { className },
         ...onClick && { onClick },
         ...onFocus && { onFocus },
         ...onMouseEnter && { onMouseEnter },
         ...onMouseLeave && { onMouseLeave },
         ...onTouchStart && { onTouchStart },
      };
   }
   const handleClick = (e) => {
      if (
         !disabled && !isCtrlEvent(e) && !e.defaultPrevented && (!target || target === '_self') &&
         e.button === 0
      ) {
         e.preventDefault();
         (0, import_react_dom.flushSync)(() => {
            setIsTransitioning(true);
         });
         const unsub = router.subscribe('onResolved', () => {
            unsub();
            setIsTransitioning(false);
         });
         return router.navigate({
            ...options,
            replace,
            resetScroll,
            hashScrollIntoView,
            startTransition: startTransition2,
            viewTransition,
            ignoreBlocker,
         });
      }
   };
   const handleFocus = (_) => {
      if (disabled) return;
      if (preload) {
         doPreload();
      }
   };
   const handleTouchStart = handleFocus;
   const handleEnter = (e) => {
      if (disabled) return;
      const eventTarget = e.target || {};
      if (preload) {
         if (eventTarget.preloadTimeout) {
            return;
         }
         if (!preloadDelay) {
            doPreload();
         } else {
            eventTarget.preloadTimeout = setTimeout(() => {
               eventTarget.preloadTimeout = null;
               doPreload();
            }, preloadDelay);
         }
      }
   };
   const handleLeave = (e) => {
      if (disabled) return;
      const eventTarget = e.target || {};
      if (eventTarget.preloadTimeout) {
         clearTimeout(eventTarget.preloadTimeout);
         eventTarget.preloadTimeout = null;
      }
   };
   const composeHandlers = (handlers) => (e) => {
      var _a;
      (_a = e.persist) == null ? void 0 : _a.call(e);
      handlers.filter(Boolean).forEach((handler) => {
         if (e.defaultPrevented) return;
         handler(e);
      });
   };
   const resolvedActiveProps = isActive ? functionalUpdate(activeProps, {}) ?? {} : {};
   const resolvedInactiveProps = isActive ? {} : functionalUpdate(inactiveProps, {});
   const resolvedClassName = [
      className,
      resolvedActiveProps.className,
      resolvedInactiveProps.className,
   ].filter(Boolean).join(' ');
   const resolvedStyle = {
      ...style,
      ...resolvedActiveProps.style,
      ...resolvedInactiveProps.style,
   };
   return {
      ...propsSafeToSpread,
      ...resolvedActiveProps,
      ...resolvedInactiveProps,
      href: disabled
         ? void 0
         : next.maskedLocation
         ? router.history.createHref(next.maskedLocation.href)
         : router.history.createHref(next.href),
      ref: innerRef,
      onClick: composeHandlers([onClick, handleClick]),
      onFocus: composeHandlers([onFocus, handleFocus]),
      onMouseEnter: composeHandlers([onMouseEnter, handleEnter]),
      onMouseLeave: composeHandlers([onMouseLeave, handleLeave]),
      onTouchStart: composeHandlers([onTouchStart, handleTouchStart]),
      disabled: !!disabled,
      target,
      ...Object.keys(resolvedStyle).length && { style: resolvedStyle },
      ...resolvedClassName && { className: resolvedClassName },
      ...disabled && {
         role: 'link',
         'aria-disabled': true,
      },
      ...isActive && { 'data-status': 'active', 'aria-current': 'page' },
      ...isTransitioning && { 'data-transitioning': 'transitioning' },
   };
}
function createLink(Comp) {
   return React9.forwardRef(function CreatedLink(props, ref) {
      return (0, import_jsx_runtime4.jsx)(Link, { ...props, _asChild: Comp, ref });
   });
}
var Link = React9.forwardRef(
   (props, ref) => {
      const { _asChild, ...rest } = props;
      const {
         type: _type,
         ref: innerRef,
         ...linkProps
      } = useLinkProps(rest, ref);
      const children = typeof rest.children === 'function'
         ? rest.children({
            isActive: linkProps['data-status'] === 'active',
         })
         : rest.children;
      if (typeof _asChild === 'undefined') {
         delete linkProps.disabled;
      }
      return React9.createElement(
         _asChild ? _asChild : 'a',
         {
            ...linkProps,
            ref: innerRef,
         },
         children,
      );
   },
);
function isCtrlEvent(e) {
   return !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey);
}
var linkOptions = (options) => {
   return options;
};

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/route.js
function getRouteApi(id) {
   return new RouteApi({ id });
}
var RouteApi = class extends BaseRouteApi {
   /**
    * @deprecated Use the `getRouteApi` function instead.
    */
   constructor({ id }) {
      super({ id });
      this.useMatch = (opts) => {
         return useMatch({
            select: opts == null ? void 0 : opts.select,
            from: this.id,
            structuralSharing: opts == null ? void 0 : opts.structuralSharing,
         });
      };
      this.useRouteContext = (opts) => {
         return useMatch({
            from: this.id,
            select: (d) =>
               (opts == null ? void 0 : opts.select) ? opts.select(d.context) : d.context,
         });
      };
      this.useSearch = (opts) => {
         return useSearch({
            select: opts == null ? void 0 : opts.select,
            structuralSharing: opts == null ? void 0 : opts.structuralSharing,
            from: this.id,
         });
      };
      this.useParams = (opts) => {
         return useParams({
            select: opts == null ? void 0 : opts.select,
            structuralSharing: opts == null ? void 0 : opts.structuralSharing,
            from: this.id,
         });
      };
      this.useLoaderDeps = (opts) => {
         return useLoaderDeps({ ...opts, from: this.id, strict: false });
      };
      this.useLoaderData = (opts) => {
         return useLoaderData({ ...opts, from: this.id, strict: false });
      };
      this.useNavigate = () => {
         const router = useRouter();
         return useNavigate({ from: router.routesById[this.id].fullPath });
      };
      this.notFound = (opts) => {
         return notFound({ routeId: this.id, ...opts });
      };
      this.Link = import_react3.default.forwardRef((props, ref) => {
         const router = useRouter();
         const fullPath = router.routesById[this.id].fullPath;
         return (0, import_jsx_runtime5.jsx)(Link, { ref, from: fullPath, ...props });
      });
   }
};
var Route = class extends BaseRoute {
   /**
    * @deprecated Use the `createRoute` function instead.
    */
   constructor(options) {
      super(options);
      this.useMatch = (opts) => {
         return useMatch({
            select: opts == null ? void 0 : opts.select,
            from: this.id,
            structuralSharing: opts == null ? void 0 : opts.structuralSharing,
         });
      };
      this.useRouteContext = (opts) => {
         return useMatch({
            ...opts,
            from: this.id,
            select: (d) =>
               (opts == null ? void 0 : opts.select) ? opts.select(d.context) : d.context,
         });
      };
      this.useSearch = (opts) => {
         return useSearch({
            select: opts == null ? void 0 : opts.select,
            structuralSharing: opts == null ? void 0 : opts.structuralSharing,
            from: this.id,
         });
      };
      this.useParams = (opts) => {
         return useParams({
            select: opts == null ? void 0 : opts.select,
            structuralSharing: opts == null ? void 0 : opts.structuralSharing,
            from: this.id,
         });
      };
      this.useLoaderDeps = (opts) => {
         return useLoaderDeps({ ...opts, from: this.id });
      };
      this.useLoaderData = (opts) => {
         return useLoaderData({ ...opts, from: this.id });
      };
      this.useNavigate = () => {
         return useNavigate({ from: this.fullPath });
      };
      this.Link = import_react3.default.forwardRef(
         (props, ref) => {
            return (0, import_jsx_runtime5.jsx)(Link, { ref, from: this.fullPath, ...props });
         },
      );
      this.$$typeof = Symbol.for('react.memo');
   }
};
function createRoute(options) {
   return new Route(options);
}
function createRootRouteWithContext() {
   return (options) => {
      return createRootRoute(options);
   };
}
var rootRouteWithContext = createRootRouteWithContext;
var RootRoute = class extends BaseRootRoute {
   /**
    * @deprecated `RootRoute` is now an internal implementation detail. Use `createRootRoute()` instead.
    */
   constructor(options) {
      super(options);
      this.useMatch = (opts) => {
         return useMatch({
            select: opts == null ? void 0 : opts.select,
            from: this.id,
            structuralSharing: opts == null ? void 0 : opts.structuralSharing,
         });
      };
      this.useRouteContext = (opts) => {
         return useMatch({
            ...opts,
            from: this.id,
            select: (d) =>
               (opts == null ? void 0 : opts.select) ? opts.select(d.context) : d.context,
         });
      };
      this.useSearch = (opts) => {
         return useSearch({
            select: opts == null ? void 0 : opts.select,
            structuralSharing: opts == null ? void 0 : opts.structuralSharing,
            from: this.id,
         });
      };
      this.useParams = (opts) => {
         return useParams({
            select: opts == null ? void 0 : opts.select,
            structuralSharing: opts == null ? void 0 : opts.structuralSharing,
            from: this.id,
         });
      };
      this.useLoaderDeps = (opts) => {
         return useLoaderDeps({ ...opts, from: this.id });
      };
      this.useLoaderData = (opts) => {
         return useLoaderData({ ...opts, from: this.id });
      };
      this.useNavigate = () => {
         return useNavigate({ from: this.fullPath });
      };
      this.Link = import_react3.default.forwardRef(
         (props, ref) => {
            return (0, import_jsx_runtime5.jsx)(Link, { ref, from: this.fullPath, ...props });
         },
      );
      this.$$typeof = Symbol.for('react.memo');
   }
};
function createRootRoute(options) {
   return new RootRoute(options);
}
function createRouteMask(opts) {
   return opts;
}
var NotFoundRoute = class extends Route {
   constructor(options) {
      super({
         ...options,
         id: '404',
      });
   }
};

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/fileRoute.js
function createFileRoute(path) {
   if (typeof path === 'object') {
      return new FileRoute(path, {
         silent: true,
      }).createRoute(path);
   }
   return new FileRoute(path, {
      silent: true,
   }).createRoute;
}
var FileRoute = class {
   constructor(path, _opts) {
      this.path = path;
      this.createRoute = (options) => {
         tiny_warning_esm_default(
            this.silent,
            'FileRoute is deprecated and will be removed in the next major version. Use the createFileRoute(path)(options) function instead.',
         );
         const route = createRoute(options);
         route.isRoot = false;
         return route;
      };
      this.silent = _opts == null ? void 0 : _opts.silent;
   }
};
function FileRouteLoader(_path) {
   tiny_warning_esm_default(
      false,
      `FileRouteLoader is deprecated and will be removed in the next major version. Please place the loader function in the the main route file, inside the \`createFileRoute('/path/to/file')(options)\` options`,
   );
   return (loaderFn) => loaderFn;
}
var LazyRoute = class {
   constructor(opts) {
      this.useMatch = (opts2) => {
         return useMatch({
            select: opts2 == null ? void 0 : opts2.select,
            from: this.options.id,
            structuralSharing: opts2 == null ? void 0 : opts2.structuralSharing,
         });
      };
      this.useRouteContext = (opts2) => {
         return useMatch({
            from: this.options.id,
            select: (d) =>
               (opts2 == null ? void 0 : opts2.select) ? opts2.select(d.context) : d.context,
         });
      };
      this.useSearch = (opts2) => {
         return useSearch({
            select: opts2 == null ? void 0 : opts2.select,
            structuralSharing: opts2 == null ? void 0 : opts2.structuralSharing,
            from: this.options.id,
         });
      };
      this.useParams = (opts2) => {
         return useParams({
            select: opts2 == null ? void 0 : opts2.select,
            structuralSharing: opts2 == null ? void 0 : opts2.structuralSharing,
            from: this.options.id,
         });
      };
      this.useLoaderDeps = (opts2) => {
         return useLoaderDeps({ ...opts2, from: this.options.id });
      };
      this.useLoaderData = (opts2) => {
         return useLoaderData({ ...opts2, from: this.options.id });
      };
      this.useNavigate = () => {
         const router = useRouter();
         return useNavigate({ from: router.routesById[this.options.id].fullPath });
      };
      this.options = opts;
      this.$$typeof = Symbol.for('react.memo');
   }
};
function createLazyRoute(id) {
   return (opts) => {
      return new LazyRoute({
         id,
         ...opts,
      });
   };
}
function createLazyFileRoute(id) {
   if (typeof id === 'object') {
      return new LazyRoute(id);
   }
   return (opts) => new LazyRoute({ id, ...opts });
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/lazyRouteComponent.js
var React10 = __toESM(require_react(), 1);
function lazyRouteComponent(importer, exportName) {
   let loadPromise;
   let comp;
   let error;
   let reload;
   const load = () => {
      if (!loadPromise) {
         loadPromise = importer().then((res) => {
            loadPromise = void 0;
            comp = res[exportName ?? 'default'];
         }).catch((err) => {
            error = err;
            if (isModuleNotFoundError(error)) {
               if (
                  error instanceof Error && typeof window !== 'undefined' &&
                  typeof sessionStorage !== 'undefined'
               ) {
                  const storageKey2 = `tanstack_router_reload:${error.message}`;
                  if (!sessionStorage.getItem(storageKey2)) {
                     sessionStorage.setItem(storageKey2, '1');
                     reload = true;
                  }
               }
            }
         });
      }
      return loadPromise;
   };
   const lazyComp = function Lazy(props) {
      if (reload) {
         window.location.reload();
         throw new Promise(() => {
         });
      }
      if (error) {
         throw error;
      }
      if (!comp) {
         throw load();
      }
      return React10.createElement(comp, props);
   };
   lazyComp.preload = load;
   return lazyComp;
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/Matches.js
var import_jsx_runtime12 = __toESM(require_jsx_runtime(), 1);
var React13 = __toESM(require_react(), 1);

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/Transitioner.js
var React11 = __toESM(require_react(), 1);
function Transitioner() {
   const router = useRouter();
   const mountLoadForRouter = React11.useRef({ router, mounted: false });
   const isLoading = useRouterState({
      select: ({ isLoading: isLoading2 }) => isLoading2,
   });
   const [isTransitioning, setIsTransitioning] = React11.useState(false);
   const hasPendingMatches = useRouterState({
      select: (s) => s.matches.some((d) => d.status === 'pending'),
      structuralSharing: true,
   });
   const previousIsLoading = usePrevious(isLoading);
   const isAnyPending = isLoading || isTransitioning || hasPendingMatches;
   const previousIsAnyPending = usePrevious(isAnyPending);
   const isPagePending = isLoading || hasPendingMatches;
   const previousIsPagePending = usePrevious(isPagePending);
   if (!router.isServer) {
      router.startTransition = (fn) => {
         setIsTransitioning(true);
         React11.startTransition(() => {
            fn();
            setIsTransitioning(false);
         });
      };
   }
   React11.useEffect(() => {
      const unsub = router.history.subscribe(router.load);
      const nextLocation = router.buildLocation({
         to: router.latestLocation.pathname,
         search: true,
         params: true,
         hash: true,
         state: true,
         _includeValidateSearch: true,
      });
      if (trimPathRight(router.latestLocation.href) !== trimPathRight(nextLocation.href)) {
         router.commitLocation({ ...nextLocation, replace: true });
      }
      return () => {
         unsub();
      };
   }, [router, router.history]);
   useLayoutEffect2(() => {
      if (
         typeof window !== 'undefined' && router.clientSsr ||
         mountLoadForRouter.current.router === router && mountLoadForRouter.current.mounted
      ) {
         return;
      }
      mountLoadForRouter.current = { router, mounted: true };
      const tryLoad = async () => {
         try {
            await router.load();
         } catch (err) {
            console.error(err);
         }
      };
      tryLoad();
   }, [router]);
   useLayoutEffect2(() => {
      if (previousIsLoading && !isLoading) {
         router.emit({
            type: 'onLoad',
            // When the new URL has committed, when the new matches have been loaded into state.matches
            ...getLocationChangeInfo(router.state),
         });
      }
   }, [previousIsLoading, router, isLoading]);
   useLayoutEffect2(() => {
      if (previousIsPagePending && !isPagePending) {
         router.emit({
            type: 'onBeforeRouteMount',
            ...getLocationChangeInfo(router.state),
         });
      }
   }, [isPagePending, previousIsPagePending, router]);
   useLayoutEffect2(() => {
      if (previousIsAnyPending && !isAnyPending) {
         router.emit({
            type: 'onResolved',
            ...getLocationChangeInfo(router.state),
         });
         router.__store.setState((s) => ({
            ...s,
            status: 'idle',
            resolvedLocation: s.location,
         }));
         handleHashScroll(router);
      }
   }, [isAnyPending, previousIsAnyPending, router]);
   return null;
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/Match.js
var import_jsx_runtime11 = __toESM(require_jsx_runtime(), 1);
var React12 = __toESM(require_react(), 1);

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/not-found.js
var import_jsx_runtime6 = __toESM(require_jsx_runtime(), 1);
function CatchNotFound(props) {
   const resetKey = useRouterState({
      select: (s) => `not-found-${s.location.pathname}-${s.status}`,
   });
   return (0, import_jsx_runtime6.jsx)(
      CatchBoundary,
      {
         getResetKey: () => resetKey,
         onCatch: (error, errorInfo) => {
            var _a;
            if (isNotFound(error)) {
               (_a = props.onCatch) == null ? void 0 : _a.call(props, error, errorInfo);
            } else {
               throw error;
            }
         },
         errorComponent: ({ error }) => {
            var _a;
            if (isNotFound(error)) {
               return (_a = props.fallback) == null ? void 0 : _a.call(props, error);
            } else {
               throw error;
            }
         },
         children: props.children,
      },
   );
}
function DefaultGlobalNotFound() {
   return (0, import_jsx_runtime6.jsx)('p', { children: 'Not Found' });
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/SafeFragment.js
var import_jsx_runtime7 = __toESM(require_jsx_runtime(), 1);
function SafeFragment(props) {
   return (0, import_jsx_runtime7.jsx)(import_jsx_runtime7.Fragment, { children: props.children });
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/renderRouteNotFound.js
var import_jsx_runtime8 = __toESM(require_jsx_runtime(), 1);
function renderRouteNotFound(router, route, data) {
   if (!route.options.notFoundComponent) {
      if (router.options.defaultNotFoundComponent) {
         return (0, import_jsx_runtime8.jsx)(router.options.defaultNotFoundComponent, { data });
      }
      if (true) {
         tiny_warning_esm_default(
            route.options.notFoundComponent,
            `A notFoundError was encountered on the route with ID "${route.id}", but a notFoundComponent option was not configured, nor was a router level defaultNotFoundComponent configured. Consider configuring at least one of these to avoid TanStack Router's overly generic defaultNotFoundComponent (<div>Not Found<div>)`,
         );
      }
      return (0, import_jsx_runtime8.jsx)(DefaultGlobalNotFound, {});
   }
   return (0, import_jsx_runtime8.jsx)(route.options.notFoundComponent, { data });
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/scroll-restoration.js
var import_jsx_runtime10 = __toESM(require_jsx_runtime(), 1);

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/ScriptOnce.js
var import_jsx_runtime9 = __toESM(require_jsx_runtime(), 1);
var import_jsesc = __toESM(require_jsesc(), 1);
function ScriptOnce({
   children,
   log,
}) {
   if (typeof document !== 'undefined') {
      return null;
   }
   return (0, import_jsx_runtime9.jsx)(
      'script',
      {
         className: 'tsr-once',
         dangerouslySetInnerHTML: {
            __html: [
               children,
               (log ?? true) && true
                  ? `console.info(\`Injected From Server:
${(0, import_jsesc.default)(children.toString(), { quotes: 'backtick' })}\`)`
                  : '',
               'if (typeof __TSR_SSR__ !== "undefined") __TSR_SSR__.cleanScripts()',
            ].filter(Boolean).join('\n'),
         },
      },
   );
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/scroll-restoration.js
function ScrollRestoration() {
   const router = useRouter();
   const getKey = router.options.getScrollRestorationKey || defaultGetScrollRestorationKey;
   const userKey = getKey(router.latestLocation);
   const resolvedKey = userKey !== defaultGetScrollRestorationKey(router.latestLocation)
      ? userKey
      : null;
   if (!router.isScrollRestoring || !router.isServer) {
      return null;
   }
   return (0, import_jsx_runtime10.jsx)(
      ScriptOnce,
      {
         children: `(${restoreScroll.toString()})(${JSON.stringify(storageKey)},${
            JSON.stringify(resolvedKey)
         }, undefined, true)`,
         log: false,
      },
   );
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/Match.js
var Match = React12.memo(function MatchImpl({
   matchId,
}) {
   var _a, _b;
   const router = useRouter();
   const matchState = useRouterState({
      select: (s) => {
         const match = s.matches.find((d) => d.id === matchId);
         invariant(
            match,
            `Could not find match for matchId "${matchId}". Please file an issue!`,
         );
         return pick(match, ['routeId', 'ssr', '_displayPending']);
      },
      structuralSharing: true,
   });
   const route = router.routesById[matchState.routeId];
   const PendingComponent = route.options.pendingComponent ??
      router.options.defaultPendingComponent;
   const pendingElement = PendingComponent
      ? (0, import_jsx_runtime11.jsx)(PendingComponent, {})
      : null;
   const routeErrorComponent = route.options.errorComponent ?? router.options.defaultErrorComponent;
   const routeOnCatch = route.options.onCatch ?? router.options.defaultOnCatch;
   const routeNotFoundComponent = route.isRoot
      ? (
         // If it's the root route, use the globalNotFound option, with fallback to the notFoundRoute's component
         route.options.notFoundComponent ??
            ((_a = router.options.notFoundRoute) == null ? void 0 : _a.options.component)
      )
      : route.options.notFoundComponent;
   const resolvedNoSsr = matchState.ssr === false || matchState.ssr === 'data-only';
   const ResolvedSuspenseBoundary = (
      // If we're on the root route, allow forcefully wrapping in suspense
      (!route.isRoot || route.options.wrapInSuspense || resolvedNoSsr) &&
         (route.options.wrapInSuspense ?? PendingComponent ??
            (((_b = route.options.errorComponent) == null ? void 0 : _b.preload) || resolvedNoSsr))
         ? React12.Suspense
         : SafeFragment
   );
   const ResolvedCatchBoundary = routeErrorComponent ? CatchBoundary : SafeFragment;
   const ResolvedNotFoundBoundary = routeNotFoundComponent ? CatchNotFound : SafeFragment;
   const resetKey = useRouterState({
      select: (s) => s.loadedAt,
   });
   const parentRouteId = useRouterState({
      select: (s) => {
         var _a2;
         const index = s.matches.findIndex((d) => d.id === matchId);
         return (_a2 = s.matches[index - 1]) == null ? void 0 : _a2.routeId;
      },
   });
   const ShellComponent = route.isRoot
      ? route.options.shellComponent ?? SafeFragment
      : SafeFragment;
   return (0, import_jsx_runtime11.jsxs)(ShellComponent, {
      children: [
         (0, import_jsx_runtime11.jsx)(matchContext.Provider, {
            value: matchId,
            children: (0, import_jsx_runtime11.jsx)(ResolvedSuspenseBoundary, {
               fallback: pendingElement,
               children: (0, import_jsx_runtime11.jsx)(
                  ResolvedCatchBoundary,
                  {
                     getResetKey: () => resetKey,
                     errorComponent: routeErrorComponent || ErrorComponent,
                     onCatch: (error, errorInfo) => {
                        if (isNotFound(error)) throw error;
                        tiny_warning_esm_default(false, `Error in route match: ${matchId}`);
                        routeOnCatch == null ? void 0 : routeOnCatch(error, errorInfo);
                     },
                     children: (0, import_jsx_runtime11.jsx)(
                        ResolvedNotFoundBoundary,
                        {
                           fallback: (error) => {
                              if (
                                 !routeNotFoundComponent ||
                                 error.routeId && error.routeId !== matchState.routeId ||
                                 !error.routeId && !route.isRoot
                              ) {
                                 throw error;
                              }
                              return React12.createElement(routeNotFoundComponent, error);
                           },
                           children: resolvedNoSsr || router.isShell || matchState._displayPending
                              ? (0, import_jsx_runtime11.jsx)(ClientOnly, {
                                 fallback: pendingElement,
                                 children: (0, import_jsx_runtime11.jsx)(MatchInner, { matchId }),
                              })
                              : (0, import_jsx_runtime11.jsx)(MatchInner, { matchId }),
                        },
                     ),
                  },
               ),
            }),
         }),
         parentRouteId === rootRouteId && router.options.scrollRestoration
            ? (0, import_jsx_runtime11.jsxs)(import_jsx_runtime11.Fragment, {
               children: [
                  (0, import_jsx_runtime11.jsx)(OnRendered, {}),
                  (0, import_jsx_runtime11.jsx)(ScrollRestoration, {}),
               ],
            })
            : null,
      ],
   });
});
function OnRendered() {
   const router = useRouter();
   const prevLocationRef = React12.useRef(
      void 0,
   );
   return (0, import_jsx_runtime11.jsx)(
      'script',
      {
         suppressHydrationWarning: true,
         ref: (el) => {
            if (
               el &&
               (prevLocationRef.current === void 0 ||
                  prevLocationRef.current.href !== router.latestLocation.href)
            ) {
               router.emit({
                  type: 'onRendered',
                  ...getLocationChangeInfo(router.state),
               });
               prevLocationRef.current = router.latestLocation;
            }
         },
      },
      router.latestLocation.state.__TSR_key,
   );
}
var MatchInner = React12.memo(function MatchInnerImpl({
   matchId,
}) {
   var _a, _b, _c, _d;
   const router = useRouter();
   const { match, key, routeId } = useRouterState({
      select: (s) => {
         const matchIndex = s.matches.findIndex((d) => d.id === matchId);
         const match2 = s.matches[matchIndex];
         const routeId2 = match2.routeId;
         const remountFn = router.routesById[routeId2].options.remountDeps ??
            router.options.defaultRemountDeps;
         const remountDeps = remountFn == null ? void 0 : remountFn({
            routeId: routeId2,
            loaderDeps: match2.loaderDeps,
            params: match2._strictParams,
            search: match2._strictSearch,
         });
         const key2 = remountDeps ? JSON.stringify(remountDeps) : void 0;
         return {
            key: key2,
            routeId: routeId2,
            match: pick(match2, [
               'id',
               'status',
               'error',
               '_forcePending',
               '_displayPending',
            ]),
         };
      },
      structuralSharing: true,
   });
   const route = router.routesById[routeId];
   const out = React12.useMemo(() => {
      const Comp = route.options.component ?? router.options.defaultComponent;
      if (Comp) {
         return (0, import_jsx_runtime11.jsx)(Comp, {}, key);
      }
      return (0, import_jsx_runtime11.jsx)(Outlet, {});
   }, [key, route.options.component, router.options.defaultComponent]);
   if (match._displayPending) {
      throw (_a = router.getMatch(match.id)) == null ? void 0 : _a.displayPendingPromise;
   }
   if (match.status === 'pending' || match._forcePending) {
      const pendingMinMs = route.options.pendingMinMs ?? router.options.defaultPendingMinMs;
      if (
         pendingMinMs && !((_b = router.getMatch(match.id)) == null ? void 0 : _b.minPendingPromise)
      ) {
         if (!router.isServer) {
            const minPendingPromise = createControlledPromise();
            Promise.resolve().then(() => {
               router.updateMatch(match.id, (prev) => ({
                  ...prev,
                  minPendingPromise,
               }));
            });
            setTimeout(() => {
               minPendingPromise.resolve();
               router.updateMatch(match.id, (prev) => ({
                  ...prev,
                  minPendingPromise: void 0,
               }));
            }, pendingMinMs);
         }
      }
      throw (_c = router.getMatch(match.id)) == null ? void 0 : _c.loadPromise;
   }
   if (match.status === 'notFound') {
      invariant(isNotFound(match.error), 'Expected a notFound error');
      return renderRouteNotFound(router, route, match.error);
   }
   if (match.status === 'redirected') {
      invariant(isRedirect(match.error), 'Expected a redirect error');
      throw (_d = router.getMatch(match.id)) == null ? void 0 : _d.loadPromise;
   }
   if (match.status === 'error') {
      if (router.isServer) {
         const RouteErrorComponent =
            (route.options.errorComponent ?? router.options.defaultErrorComponent) ||
            ErrorComponent;
         return (0, import_jsx_runtime11.jsx)(
            RouteErrorComponent,
            {
               error: match.error,
               reset: void 0,
               info: {
                  componentStack: '',
               },
            },
         );
      }
      throw match.error;
   }
   return out;
});
var Outlet = React12.memo(function OutletImpl() {
   const router = useRouter();
   const matchId = React12.useContext(matchContext);
   const routeId = useRouterState({
      select: (s) => {
         var _a;
         return (_a = s.matches.find((d) => d.id === matchId)) == null ? void 0 : _a.routeId;
      },
   });
   const route = router.routesById[routeId];
   const parentGlobalNotFound = useRouterState({
      select: (s) => {
         const matches = s.matches;
         const parentMatch = matches.find((d) => d.id === matchId);
         invariant(
            parentMatch,
            `Could not find parent match for matchId "${matchId}"`,
         );
         return parentMatch.globalNotFound;
      },
   });
   const childMatchId = useRouterState({
      select: (s) => {
         var _a;
         const matches = s.matches;
         const index = matches.findIndex((d) => d.id === matchId);
         return (_a = matches[index + 1]) == null ? void 0 : _a.id;
      },
   });
   const pendingElement = router.options.defaultPendingComponent
      ? (0, import_jsx_runtime11.jsx)(router.options.defaultPendingComponent, {})
      : null;
   if (parentGlobalNotFound) {
      return renderRouteNotFound(router, route, void 0);
   }
   if (!childMatchId) {
      return null;
   }
   const nextMatch = (0, import_jsx_runtime11.jsx)(Match, { matchId: childMatchId });
   if (matchId === rootRouteId) {
      return (0, import_jsx_runtime11.jsx)(React12.Suspense, {
         fallback: pendingElement,
         children: nextMatch,
      });
   }
   return nextMatch;
});

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/Matches.js
function Matches() {
   const router = useRouter();
   const pendingElement = router.options.defaultPendingComponent
      ? (0, import_jsx_runtime12.jsx)(router.options.defaultPendingComponent, {})
      : null;
   const ResolvedSuspense = router.isServer || typeof document !== 'undefined' && router.clientSsr
      ? SafeFragment
      : React13.Suspense;
   const inner = (0, import_jsx_runtime12.jsxs)(ResolvedSuspense, {
      fallback: pendingElement,
      children: [
         (0, import_jsx_runtime12.jsx)(Transitioner, {}),
         (0, import_jsx_runtime12.jsx)(MatchesInner, {}),
      ],
   });
   return router.options.InnerWrap
      ? (0, import_jsx_runtime12.jsx)(router.options.InnerWrap, { children: inner })
      : inner;
}
function MatchesInner() {
   const matchId = useRouterState({
      select: (s) => {
         var _a;
         return (_a = s.matches[0]) == null ? void 0 : _a.id;
      },
   });
   const resetKey = useRouterState({
      select: (s) => s.loadedAt,
   });
   return (0, import_jsx_runtime12.jsx)(matchContext.Provider, {
      value: matchId,
      children: (0, import_jsx_runtime12.jsx)(
         CatchBoundary,
         {
            getResetKey: () => resetKey,
            errorComponent: ErrorComponent,
            onCatch: (error) => {
               tiny_warning_esm_default(
                  false,
                  `The following error wasn't caught by any route! At the very least, consider setting an 'errorComponent' in your RootRoute!`,
               );
               tiny_warning_esm_default(false, error.message || error.toString());
            },
            children: matchId ? (0, import_jsx_runtime12.jsx)(Match, { matchId }) : null,
         },
      ),
   });
}
function useMatchRoute() {
   const router = useRouter();
   useRouterState({
      select: (s) => {
         var _a;
         return [s.location.href, (_a = s.resolvedLocation) == null ? void 0 : _a.href, s.status];
      },
      structuralSharing: true,
   });
   return React13.useCallback(
      (opts) => {
         const { pending, caseSensitive, fuzzy, includeSearch, ...rest } = opts;
         return router.matchRoute(rest, {
            pending,
            caseSensitive,
            fuzzy,
            includeSearch,
         });
      },
      [router],
   );
}
function MatchRoute(props) {
   const matchRoute = useMatchRoute();
   const params = matchRoute(props);
   if (typeof props.children === 'function') {
      return props.children(params);
   }
   return params ? props.children : null;
}
function useMatches(opts) {
   return useRouterState({
      select: (state) => {
         const matches = state.matches;
         return (opts == null ? void 0 : opts.select) ? opts.select(matches) : matches;
      },
      structuralSharing: opts == null ? void 0 : opts.structuralSharing,
   });
}
function useParentMatches(opts) {
   const contextMatchId = React13.useContext(matchContext);
   return useMatches({
      select: (matches) => {
         matches = matches.slice(
            0,
            matches.findIndex((d) => d.id === contextMatchId),
         );
         return (opts == null ? void 0 : opts.select) ? opts.select(matches) : matches;
      },
      structuralSharing: opts == null ? void 0 : opts.structuralSharing,
   });
}
function useChildMatches(opts) {
   const contextMatchId = React13.useContext(matchContext);
   return useMatches({
      select: (matches) => {
         matches = matches.slice(
            matches.findIndex((d) => d.id === contextMatchId) + 1,
         );
         return (opts == null ? void 0 : opts.select) ? opts.select(matches) : matches;
      },
      structuralSharing: opts == null ? void 0 : opts.structuralSharing,
   });
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/router.js
var createRouter = (options) => {
   return new Router(options);
};
var Router = class extends RouterCore {
   constructor(options) {
      super(options);
   }
};
if (typeof globalThis !== 'undefined') {
   globalThis.createFileRoute = createFileRoute;
   globalThis.createLazyFileRoute = createLazyFileRoute;
} else if (typeof window !== 'undefined') {
   window.createFileRoute = createFileRoute;
   window.createFileRoute = createLazyFileRoute;
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/RouterProvider.js
var import_jsx_runtime13 = __toESM(require_jsx_runtime(), 1);
function RouterContextProvider({
   router,
   children,
   ...rest
}) {
   if (Object.keys(rest).length > 0) {
      router.update({
         ...router.options,
         ...rest,
         context: {
            ...router.options.context,
            ...rest.context,
         },
      });
   }
   const routerContext2 = getRouterContext();
   const provider = (0, import_jsx_runtime13.jsx)(routerContext2.Provider, {
      value: router,
      children,
   });
   if (router.options.Wrap) {
      return (0, import_jsx_runtime13.jsx)(router.options.Wrap, { children: provider });
   }
   return provider;
}
function RouterProvider({ router, ...rest }) {
   return (0, import_jsx_runtime13.jsx)(RouterContextProvider, {
      router,
      ...rest,
      children: (0, import_jsx_runtime13.jsx)(Matches, {}),
   });
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/ScrollRestoration.js
function useScrollRestoration() {
   const router = useRouter();
   setupScrollRestoration(router, true);
}
function ScrollRestoration2(_props) {
   useScrollRestoration();
   if (true) {
      console.warn(
         "The ScrollRestoration component is deprecated. Use createRouter's `scrollRestoration` option instead.",
      );
   }
   return null;
}
function useElementScrollRestoration(options) {
   var _a, _b;
   useScrollRestoration();
   const router = useRouter();
   const getKey = options.getKey || defaultGetScrollRestorationKey;
   let elementSelector = '';
   if (options.id) {
      elementSelector = `[data-scroll-restoration-id="${options.id}"]`;
   } else {
      const element = (_a = options.getElement) == null ? void 0 : _a.call(options);
      if (!element) {
         return;
      }
      elementSelector = element instanceof Window ? 'window' : getCssSelector(element);
   }
   const restoreKey = getKey(router.latestLocation);
   const byKey = (_b = scrollRestorationCache) == null ? void 0 : _b.state[restoreKey];
   return byKey == null ? void 0 : byKey[elementSelector];
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/useBlocker.js
var React14 = __toESM(require_react(), 1);
function _resolveBlockerOpts(opts, condition) {
   if (opts === void 0) {
      return {
         shouldBlockFn: () => true,
         withResolver: false,
      };
   }
   if ('shouldBlockFn' in opts) {
      return opts;
   }
   if (typeof opts === 'function') {
      const shouldBlock2 = Boolean(condition ?? true);
      const _customBlockerFn2 = async () => {
         if (shouldBlock2) return await opts();
         return false;
      };
      return {
         shouldBlockFn: _customBlockerFn2,
         enableBeforeUnload: shouldBlock2,
         withResolver: false,
      };
   }
   const shouldBlock = Boolean(opts.condition ?? true);
   const fn = opts.blockerFn;
   const _customBlockerFn = async () => {
      if (shouldBlock && fn !== void 0) {
         return await fn();
      }
      return shouldBlock;
   };
   return {
      shouldBlockFn: _customBlockerFn,
      enableBeforeUnload: shouldBlock,
      withResolver: fn === void 0,
   };
}
function useBlocker(opts, condition) {
   const {
      shouldBlockFn,
      enableBeforeUnload = true,
      disabled = false,
      withResolver = false,
   } = _resolveBlockerOpts(opts, condition);
   const router = useRouter();
   const { history } = router;
   const [resolver, setResolver] = React14.useState({
      status: 'idle',
      current: void 0,
      next: void 0,
      action: void 0,
      proceed: void 0,
      reset: void 0,
   });
   React14.useEffect(() => {
      const blockerFnComposed = async (blockerFnArgs) => {
         function getLocation(location) {
            const parsedLocation = router.parseLocation(void 0, location);
            const matchedRoutes = router.getMatchedRoutes(
               parsedLocation.pathname,
               void 0,
            );
            if (matchedRoutes.foundRoute === void 0) {
               throw new Error(`No route found for location ${location.href}`);
            }
            return {
               routeId: matchedRoutes.foundRoute.id,
               fullPath: matchedRoutes.foundRoute.fullPath,
               pathname: parsedLocation.pathname,
               params: matchedRoutes.routeParams,
               search: parsedLocation.search,
            };
         }
         const current = getLocation(blockerFnArgs.currentLocation);
         const next = getLocation(blockerFnArgs.nextLocation);
         const shouldBlock = await shouldBlockFn({
            action: blockerFnArgs.action,
            current,
            next,
         });
         if (!withResolver) {
            return shouldBlock;
         }
         if (!shouldBlock) {
            return false;
         }
         const promise = new Promise((resolve) => {
            setResolver({
               status: 'blocked',
               current,
               next,
               action: blockerFnArgs.action,
               proceed: () => resolve(false),
               reset: () => resolve(true),
            });
         });
         const canNavigateAsync = await promise;
         setResolver({
            status: 'idle',
            current: void 0,
            next: void 0,
            action: void 0,
            proceed: void 0,
            reset: void 0,
         });
         return canNavigateAsync;
      };
      return disabled
         ? void 0
         : history.block({ blockerFn: blockerFnComposed, enableBeforeUnload });
   }, [
      shouldBlockFn,
      enableBeforeUnload,
      disabled,
      withResolver,
      history,
      router,
   ]);
   return resolver;
}
var _resolvePromptBlockerArgs = (props) => {
   if ('shouldBlockFn' in props) {
      return { ...props };
   }
   const shouldBlock = Boolean(props.condition ?? true);
   const fn = props.blockerFn;
   const _customBlockerFn = async () => {
      if (shouldBlock && fn !== void 0) {
         return await fn();
      }
      return shouldBlock;
   };
   return {
      shouldBlockFn: _customBlockerFn,
      enableBeforeUnload: shouldBlock,
      withResolver: fn === void 0,
   };
};
function Block(opts) {
   const { children, ...rest } = opts;
   const args = _resolvePromptBlockerArgs(rest);
   const resolver = useBlocker(args);
   return children ? typeof children === 'function' ? children(resolver) : children : null;
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/useRouteContext.js
function useRouteContext(opts) {
   return useMatch({
      ...opts,
      select: (match) => opts.select ? opts.select(match.context) : match.context,
   });
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/useLocation.js
function useLocation(opts) {
   return useRouterState({
      select: (state) =>
         (opts == null ? void 0 : opts.select) ? opts.select(state.location) : state.location,
   });
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/useCanGoBack.js
function useCanGoBack() {
   return useRouterState({ select: (s) => s.location.state.__TSR_index !== 0 });
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/Asset.js
var import_jsx_runtime14 = __toESM(require_jsx_runtime(), 1);
var React15 = __toESM(require_react(), 1);
function Asset({
   tag,
   attrs,
   children,
}) {
   switch (tag) {
      case 'title':
         return (0, import_jsx_runtime14.jsx)('title', {
            ...attrs,
            suppressHydrationWarning: true,
            children,
         });
      case 'meta':
         return (0, import_jsx_runtime14.jsx)('meta', { ...attrs, suppressHydrationWarning: true });
      case 'link':
         return (0, import_jsx_runtime14.jsx)('link', { ...attrs, suppressHydrationWarning: true });
      case 'style':
         return (0, import_jsx_runtime14.jsx)(
            'style',
            {
               ...attrs,
               dangerouslySetInnerHTML: { __html: children },
            },
         );
      case 'script':
         return (0, import_jsx_runtime14.jsx)(Script, { attrs, children });
      default:
         return null;
   }
}
function Script({
   attrs,
   children,
}) {
   React15.useEffect(() => {
      if (attrs == null ? void 0 : attrs.src) {
         const script = document.createElement('script');
         for (const [key, value] of Object.entries(attrs)) {
            if (key !== 'suppressHydrationWarning' && value !== void 0 && value !== false) {
               script.setAttribute(
                  key,
                  typeof value === 'boolean' ? '' : String(value),
               );
            }
         }
         document.head.appendChild(script);
         return () => {
            if (script.parentNode) {
               script.parentNode.removeChild(script);
            }
         };
      }
      if (typeof children === 'string') {
         const script = document.createElement('script');
         script.textContent = children;
         if (attrs) {
            for (const [key, value] of Object.entries(attrs)) {
               if (key !== 'suppressHydrationWarning' && value !== void 0 && value !== false) {
                  script.setAttribute(
                     key,
                     typeof value === 'boolean' ? '' : String(value),
                  );
               }
            }
         }
         document.head.appendChild(script);
         return () => {
            if (script.parentNode) {
               script.parentNode.removeChild(script);
            }
         };
      }
      return void 0;
   }, [attrs, children]);
   if ((attrs == null ? void 0 : attrs.src) && typeof attrs.src === 'string') {
      return (0, import_jsx_runtime14.jsx)('script', { ...attrs, suppressHydrationWarning: true });
   }
   if (typeof children === 'string') {
      return (0, import_jsx_runtime14.jsx)(
         'script',
         {
            ...attrs,
            dangerouslySetInnerHTML: { __html: children },
            suppressHydrationWarning: true,
         },
      );
   }
   return null;
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/HeadContent.js
var React16 = __toESM(require_react(), 1);
var import_react4 = __toESM(require_react(), 1);
var useTags = () => {
   const router = useRouter();
   const routeMeta = useRouterState({
      select: (state) => {
         return state.matches.map((match) => match.meta).filter(Boolean);
      },
   });
   const meta = React16.useMemo(() => {
      const resultMeta = [];
      const metaByAttribute = {};
      let title;
      [...routeMeta].reverse().forEach((metas) => {
         [...metas].reverse().forEach((m) => {
            if (!m) return;
            if (m.title) {
               if (!title) {
                  title = {
                     tag: 'title',
                     children: m.title,
                  };
               }
            } else {
               const attribute = m.name ?? m.property;
               if (attribute) {
                  if (metaByAttribute[attribute]) {
                     return;
                  } else {
                     metaByAttribute[attribute] = true;
                  }
               }
               resultMeta.push({
                  tag: 'meta',
                  attrs: {
                     ...m,
                  },
               });
            }
         });
      });
      if (title) {
         resultMeta.push(title);
      }
      resultMeta.reverse();
      return resultMeta;
   }, [routeMeta]);
   const links = useRouterState({
      select: (state) => {
         var _a;
         const constructed = state.matches.map((match) => match.links).filter(Boolean).flat(1).map((
            link,
         ) => ({
            tag: 'link',
            attrs: {
               ...link,
            },
         }));
         const manifest = (_a = router.ssr) == null ? void 0 : _a.manifest;
         const assets = state.matches.map((match) => {
            var _a2;
            return ((_a2 = manifest == null ? void 0 : manifest.routes[match.routeId]) == null
               ? void 0
               : _a2.assets) ?? [];
         }).filter(Boolean).flat(1).filter((asset) => asset.tag === 'link').map(
            (asset) => ({
               tag: 'link',
               attrs: {
                  ...asset.attrs,
                  suppressHydrationWarning: true,
               },
            }),
         );
         return [...constructed, ...assets];
      },
      structuralSharing: true,
   });
   const preloadMeta = useRouterState({
      select: (state) => {
         const preloadMeta2 = [];
         state.matches.map((match) => router.looseRoutesById[match.routeId]).forEach(
            (route) => {
               var _a, _b, _c, _d;
               return (_d = (_c = (_b = (_a = router.ssr) == null ? void 0 : _a.manifest) == null
                        ? void 0
                        : _b.routes[route.id]) == null
                     ? void 0
                     : _c.preloads) == null
                  ? void 0
                  : _d.filter(Boolean).forEach((preload) => {
                     preloadMeta2.push({
                        tag: 'link',
                        attrs: {
                           rel: 'modulepreload',
                           href: preload,
                        },
                     });
                  });
            },
         );
         return preloadMeta2;
      },
      structuralSharing: true,
   });
   const styles = useRouterState({
      select: (state) =>
         state.matches.map((match) => match.styles).flat(1).filter(Boolean).map((
            { children, ...attrs },
         ) => ({
            tag: 'style',
            attrs,
            children,
         })),
      structuralSharing: true,
   });
   const headScripts = useRouterState({
      select: (state) =>
         state.matches.map((match) => match.headScripts).flat(1).filter(Boolean).map((
            { children, ...script },
         ) => ({
            tag: 'script',
            attrs: {
               ...script,
            },
            children,
         })),
      structuralSharing: true,
   });
   return uniqBy(
      [
         ...meta,
         ...preloadMeta,
         ...links,
         ...styles,
         ...headScripts,
      ],
      (d) => {
         return JSON.stringify(d);
      },
   );
};
function HeadContent() {
   const tags = useTags();
   return tags.map((tag) =>
      (0, import_react4.createElement)(Asset, { ...tag, key: `tsr-meta-${JSON.stringify(tag)}` })
   );
}
function uniqBy(arr, fn) {
   const seen = /* @__PURE__ */ new Set();
   return arr.filter((item) => {
      const key = fn(item);
      if (seen.has(key)) {
         return false;
      }
      seen.add(key);
      return true;
   });
}

// ../../node_modules/.deno/@tanstack+react-router@1.125.6/node_modules/@tanstack/react-router/dist/esm/Scripts.js
var import_jsx_runtime15 = __toESM(require_jsx_runtime(), 1);
var import_react5 = __toESM(require_react(), 1);
var Scripts = () => {
   const router = useRouter();
   const assetScripts = useRouterState({
      select: (state) => {
         var _a;
         const assetScripts2 = [];
         const manifest = (_a = router.ssr) == null ? void 0 : _a.manifest;
         if (!manifest) {
            return [];
         }
         state.matches.map((match) => router.looseRoutesById[match.routeId]).forEach(
            (route) => {
               var _a2, _b;
               return (_b = (_a2 = manifest.routes[route.id]) == null ? void 0 : _a2.assets) == null
                  ? void 0
                  : _b.filter((d) => d.tag === 'script').forEach((asset) => {
                     assetScripts2.push({
                        tag: 'script',
                        attrs: asset.attrs,
                        children: asset.children,
                     });
                  });
            },
         );
         return assetScripts2;
      },
      structuralSharing: true,
   });
   const { scripts } = useRouterState({
      select: (state) => ({
         scripts: state.matches.map((match) => match.scripts).flat(1).filter(Boolean).map((
            { children, ...script },
         ) => ({
            tag: 'script',
            attrs: {
               ...script,
               suppressHydrationWarning: true,
            },
            children,
         })),
      }),
      structuralSharing: true,
   });
   const allScripts = [...scripts, ...assetScripts];
   return (0, import_jsx_runtime15.jsx)(import_jsx_runtime15.Fragment, {
      children: allScripts.map((asset, i) =>
         (0, import_react5.createElement)(Asset, { ...asset, key: `tsr-scripts-${asset.tag}-${i}` })
      ),
   });
};

export {
   Asset,
   Await,
   Block,
   CatchBoundary,
   CatchNotFound,
   ClientOnly,
   createFileRoute,
   createLazyFileRoute,
   createLazyRoute,
   createLink,
   createRootRoute,
   createRootRouteWithContext,
   createRoute,
   createRouteMask,
   createRouter,
   DefaultGlobalNotFound,
   ErrorComponent,
   FileRoute,
   FileRouteLoader,
   getRouteApi,
   getRouterContext,
   HeadContent,
   LazyRoute,
   lazyRouteComponent,
   Link,
   linkOptions,
   Match,
   matchContext,
   Matches,
   MatchRoute,
   Navigate,
   NotFoundRoute,
   Outlet,
   RootRoute,
   rootRouteWithContext,
   Route,
   RouteApi,
   Router,
   RouterContextProvider,
   RouterProvider,
   ScriptOnce,
   Scripts,
   ScrollRestoration2 as ScrollRestoration,
   tiny_warning_esm_default,
   useAwaited,
   useBlocker,
   useCanGoBack,
   useChildMatches,
   useElementScrollRestoration,
   useLayoutEffect2 as useLayoutEffect,
   useLinkProps,
   useLoaderData,
   useLoaderDeps,
   useLocation,
   useMatch,
   useMatches,
   useMatchRoute,
   useNavigate,
   useParams,
   useParentMatches,
   useRouteContext,
   useRouter,
   useRouterState,
   useSearch,
   useStableCallback,
};
//# sourceMappingURL=chunk-IMQKYS6T.js.map
