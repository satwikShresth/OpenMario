import {
  DevtoolsOnCloseContext,
  ShadowDomTargetContext,
  createComponent,
  createSignal,
  lazy,
  render
} from "./chunk-NM2VQ3O4.js";
import {
  useRouter,
  useRouterState
} from "./chunk-IMQKYS6T.js";
import "./chunk-VMMXHQTH.js";
import "./chunk-SJXWFFBF.js";
import "./chunk-PKKGSRSG.js";
import {
  require_jsx_runtime
} from "./chunk-JY6JHD56.js";
import "./chunk-VEEPTEKR.js";
import {
  require_react
} from "./chunk-JZ6RMLDG.js";
import {
  __toESM
} from "./chunk-WOOG5QLI.js";

// ../../node_modules/.deno/@tanstack+react-router-devtools@1.125.6/node_modules/@tanstack/react-router-devtools/dist/esm/TanStackRouterDevtools.js
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);

// ../../node_modules/.deno/@tanstack+router-devtools-core@1.125.4/node_modules/@tanstack/router-devtools-core/dist/esm/TanStackRouterDevtoolsCore.js
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var _router;
var _routerState;
var _position;
var _initialIsOpen;
var _shadowDOMTarget;
var _panelProps;
var _closeButtonProps;
var _toggleButtonProps;
var _containerElement;
var _isMounted;
var _Component;
var _dispose;
var TanStackRouterDevtoolsCore = class {
  constructor(config) {
    __privateAdd(this, _router);
    __privateAdd(this, _routerState);
    __privateAdd(this, _position);
    __privateAdd(this, _initialIsOpen);
    __privateAdd(this, _shadowDOMTarget);
    __privateAdd(this, _panelProps);
    __privateAdd(this, _closeButtonProps);
    __privateAdd(this, _toggleButtonProps);
    __privateAdd(this, _containerElement);
    __privateAdd(this, _isMounted, false);
    __privateAdd(this, _Component);
    __privateAdd(this, _dispose);
    __privateSet(this, _router, createSignal(config.router));
    __privateSet(this, _routerState, createSignal(config.routerState));
    __privateSet(this, _position, config.position ?? "bottom-left");
    __privateSet(this, _initialIsOpen, config.initialIsOpen ?? false);
    __privateSet(this, _shadowDOMTarget, config.shadowDOMTarget);
    __privateSet(this, _panelProps, config.panelProps);
    __privateSet(this, _closeButtonProps, config.closeButtonProps);
    __privateSet(this, _toggleButtonProps, config.toggleButtonProps);
    __privateSet(this, _containerElement, config.containerElement);
  }
  mount(el) {
    if (__privateGet(this, _isMounted)) {
      throw new Error("Devtools is already mounted");
    }
    const dispose = render(() => {
      const [router] = __privateGet(this, _router);
      const [routerState] = __privateGet(this, _routerState);
      const position = __privateGet(this, _position);
      const initialIsOpen = __privateGet(this, _initialIsOpen);
      const shadowDOMTarget = __privateGet(this, _shadowDOMTarget);
      const panelProps = __privateGet(this, _panelProps);
      const closeButtonProps = __privateGet(this, _closeButtonProps);
      const toggleButtonProps = __privateGet(this, _toggleButtonProps);
      const containerElement = __privateGet(this, _containerElement);
      let Devtools;
      if (__privateGet(this, _Component)) {
        Devtools = __privateGet(this, _Component);
      } else {
        Devtools = lazy(() => import("./FloatingTanStackRouterDevtools-2JNWPNKP.js"));
        __privateSet(this, _Component, Devtools);
      }
      return createComponent(ShadowDomTargetContext.Provider, {
        value: shadowDOMTarget,
        get children() {
          return createComponent(Devtools, {
            position,
            initialIsOpen,
            router,
            routerState,
            shadowDOMTarget,
            panelProps,
            closeButtonProps,
            toggleButtonProps,
            containerElement
          });
        }
      });
    }, el);
    __privateSet(this, _isMounted, true);
    __privateSet(this, _dispose, dispose);
  }
  unmount() {
    var _a;
    if (!__privateGet(this, _isMounted)) {
      throw new Error("Devtools is not mounted");
    }
    (_a = __privateGet(this, _dispose)) == null ? void 0 : _a.call(this);
    __privateSet(this, _isMounted, false);
  }
  setRouter(router) {
    __privateGet(this, _router)[1](router);
  }
  setRouterState(routerState) {
    __privateGet(this, _routerState)[1](routerState);
  }
  setOptions(options) {
    if (options.position !== void 0) {
      __privateSet(this, _position, options.position);
    }
    if (options.initialIsOpen !== void 0) {
      __privateSet(this, _initialIsOpen, options.initialIsOpen);
    }
    if (options.shadowDOMTarget !== void 0) {
      __privateSet(this, _shadowDOMTarget, options.shadowDOMTarget);
    }
    if (options.containerElement !== void 0) {
      __privateSet(this, _containerElement, options.containerElement);
    }
  }
};
_router = /* @__PURE__ */ new WeakMap();
_routerState = /* @__PURE__ */ new WeakMap();
_position = /* @__PURE__ */ new WeakMap();
_initialIsOpen = /* @__PURE__ */ new WeakMap();
_shadowDOMTarget = /* @__PURE__ */ new WeakMap();
_panelProps = /* @__PURE__ */ new WeakMap();
_closeButtonProps = /* @__PURE__ */ new WeakMap();
_toggleButtonProps = /* @__PURE__ */ new WeakMap();
_containerElement = /* @__PURE__ */ new WeakMap();
_isMounted = /* @__PURE__ */ new WeakMap();
_Component = /* @__PURE__ */ new WeakMap();
_dispose = /* @__PURE__ */ new WeakMap();

// ../../node_modules/.deno/@tanstack+router-devtools-core@1.125.4/node_modules/@tanstack/router-devtools-core/dist/esm/TanStackRouterDevtoolsPanelCore.js
var __typeError2 = (msg) => {
  throw TypeError(msg);
};
var __accessCheck2 = (obj, member, msg) => member.has(obj) || __typeError2("Cannot " + msg);
var __privateGet2 = (obj, member, getter) => (__accessCheck2(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd2 = (obj, member, value) => member.has(obj) ? __typeError2("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet2 = (obj, member, value, setter) => (__accessCheck2(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var _router2;
var _routerState2;
var _shadowDOMTarget2;
var _isMounted2;
var _setIsOpen;
var _dispose2;
var _Component2;
var TanStackRouterDevtoolsPanelCore = class {
  constructor(config) {
    __privateAdd2(this, _router2);
    __privateAdd2(this, _routerState2);
    __privateAdd2(this, _shadowDOMTarget2);
    __privateAdd2(this, _isMounted2, false);
    __privateAdd2(this, _setIsOpen);
    __privateAdd2(this, _dispose2);
    __privateAdd2(this, _Component2);
    const {
      router,
      routerState,
      shadowDOMTarget,
      setIsOpen
    } = config;
    __privateSet2(this, _router2, createSignal(router));
    __privateSet2(this, _routerState2, createSignal(routerState));
    __privateSet2(this, _shadowDOMTarget2, shadowDOMTarget);
    __privateSet2(this, _setIsOpen, setIsOpen);
  }
  mount(el) {
    if (__privateGet2(this, _isMounted2)) {
      throw new Error("Devtools is already mounted");
    }
    const dispose = render(() => {
      const [router] = __privateGet2(this, _router2);
      const [routerState] = __privateGet2(this, _routerState2);
      const shadowDOMTarget = __privateGet2(this, _shadowDOMTarget2);
      const setIsOpen = __privateGet2(this, _setIsOpen);
      let BaseTanStackRouterDevtoolsPanel;
      if (__privateGet2(this, _Component2)) {
        BaseTanStackRouterDevtoolsPanel = __privateGet2(this, _Component2);
      } else {
        BaseTanStackRouterDevtoolsPanel = lazy(() => import("./BaseTanStackRouterDevtoolsPanel-3GE527XV.js"));
        __privateSet2(this, _Component2, BaseTanStackRouterDevtoolsPanel);
      }
      return createComponent(ShadowDomTargetContext.Provider, {
        value: shadowDOMTarget,
        get children() {
          return createComponent(DevtoolsOnCloseContext.Provider, {
            value: {
              onCloseClick: () => {
              }
            },
            get children() {
              return createComponent(BaseTanStackRouterDevtoolsPanel, {
                router,
                routerState,
                shadowDOMTarget,
                setIsOpen
              });
            }
          });
        }
      });
    }, el);
    __privateSet2(this, _isMounted2, true);
    __privateSet2(this, _dispose2, dispose);
  }
  unmount() {
    var _a;
    if (!__privateGet2(this, _isMounted2)) {
      throw new Error("Devtools is not mounted");
    }
    (_a = __privateGet2(this, _dispose2)) == null ? void 0 : _a.call(this);
    __privateSet2(this, _isMounted2, false);
  }
  setRouter(router) {
    __privateGet2(this, _router2)[1](router);
  }
  setRouterState(routerState) {
    __privateGet2(this, _routerState2)[1](routerState);
  }
  setOptions(options) {
    if (options.shadowDOMTarget !== void 0) {
      __privateSet2(this, _shadowDOMTarget2, options.shadowDOMTarget);
    }
    if (options.router !== void 0) {
      this.setRouter(options.router);
    }
    if (options.routerState !== void 0) {
      this.setRouterState(options.routerState);
    }
  }
};
_router2 = /* @__PURE__ */ new WeakMap();
_routerState2 = /* @__PURE__ */ new WeakMap();
_shadowDOMTarget2 = /* @__PURE__ */ new WeakMap();
_isMounted2 = /* @__PURE__ */ new WeakMap();
_setIsOpen = /* @__PURE__ */ new WeakMap();
_dispose2 = /* @__PURE__ */ new WeakMap();
_Component2 = /* @__PURE__ */ new WeakMap();

// ../../node_modules/.deno/@tanstack+react-router-devtools@1.125.6/node_modules/@tanstack/react-router-devtools/dist/esm/TanStackRouterDevtools.js
var import_react = __toESM(require_react(), 1);
function TanStackRouterDevtools(props) {
  const {
    initialIsOpen,
    panelProps,
    closeButtonProps,
    toggleButtonProps,
    position,
    containerElement,
    shadowDOMTarget,
    router: propsRouter
  } = props;
  const hookRouter = useRouter({ warn: false });
  const activeRouter = propsRouter ?? hookRouter;
  const activeRouterState = useRouterState({ router: activeRouter });
  const devToolRef = (0, import_react.useRef)(null);
  const [devtools] = (0, import_react.useState)(
    () => new TanStackRouterDevtoolsCore({
      initialIsOpen,
      panelProps,
      closeButtonProps,
      toggleButtonProps,
      position,
      containerElement,
      shadowDOMTarget,
      router: activeRouter,
      routerState: activeRouterState
    })
  );
  (0, import_react.useEffect)(() => {
    devtools.setRouter(activeRouter);
  }, [devtools, activeRouter]);
  (0, import_react.useEffect)(() => {
    devtools.setRouterState(activeRouterState);
  }, [devtools, activeRouterState]);
  (0, import_react.useEffect)(() => {
    devtools.setOptions({
      initialIsOpen,
      panelProps,
      closeButtonProps,
      toggleButtonProps,
      position,
      containerElement,
      shadowDOMTarget
    });
  }, [
    devtools,
    initialIsOpen,
    panelProps,
    closeButtonProps,
    toggleButtonProps,
    position,
    containerElement,
    shadowDOMTarget
  ]);
  (0, import_react.useEffect)(() => {
    if (devToolRef.current) {
      devtools.mount(devToolRef.current);
    }
    return () => {
      devtools.unmount();
    };
  }, [devtools]);
  return (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: (0, import_jsx_runtime.jsx)("div", { ref: devToolRef }) });
}

// ../../node_modules/.deno/@tanstack+react-router-devtools@1.125.6/node_modules/@tanstack/react-router-devtools/dist/esm/TanStackRouterDevtoolsPanel.js
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
var import_react2 = __toESM(require_react(), 1);
var TanStackRouterDevtoolsPanel = (props) => {
  const { router: propsRouter, ...rest } = props;
  const hookRouter = useRouter({ warn: false });
  const activeRouter = propsRouter ?? hookRouter;
  const activeRouterState = useRouterState({ router: activeRouter });
  const devToolRef = (0, import_react2.useRef)(null);
  const [devtools] = (0, import_react2.useState)(
    () => new TanStackRouterDevtoolsPanelCore({
      ...rest,
      router: activeRouter,
      routerState: activeRouterState
    })
  );
  (0, import_react2.useEffect)(() => {
    devtools.setRouter(activeRouter);
  }, [devtools, activeRouter]);
  (0, import_react2.useEffect)(() => {
    devtools.setRouterState(activeRouterState);
  }, [devtools, activeRouterState]);
  (0, import_react2.useEffect)(() => {
    devtools.setOptions({
      className: props.className,
      style: props.style,
      shadowDOMTarget: props.shadowDOMTarget
    });
  }, [devtools, props.className, props.style, props.shadowDOMTarget]);
  (0, import_react2.useEffect)(() => {
    if (devToolRef.current) {
      devtools.mount(devToolRef.current);
    }
    return () => {
      devtools.unmount();
    };
  }, [devtools]);
  return (0, import_jsx_runtime2.jsx)(import_jsx_runtime2.Fragment, { children: (0, import_jsx_runtime2.jsx)("div", { ref: devToolRef }) });
};

// ../../node_modules/.deno/@tanstack+react-router-devtools@1.125.6/node_modules/@tanstack/react-router-devtools/dist/esm/index.js
var TanStackRouterDevtools2 = false ? function() {
  return null;
} : TanStackRouterDevtools;
var TanStackRouterDevtoolsInProd = TanStackRouterDevtools;
var TanStackRouterDevtoolsPanel2 = false ? function() {
  return null;
} : TanStackRouterDevtoolsPanel;
var TanStackRouterDevtoolsPanelInProd = TanStackRouterDevtoolsPanel;
export {
  TanStackRouterDevtools2 as TanStackRouterDevtools,
  TanStackRouterDevtoolsInProd,
  TanStackRouterDevtoolsPanel2 as TanStackRouterDevtoolsPanel,
  TanStackRouterDevtoolsPanelInProd
};
//# sourceMappingURL=@tanstack_react-router-devtools.js.map
