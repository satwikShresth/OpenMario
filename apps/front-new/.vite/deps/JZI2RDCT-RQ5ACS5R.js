import {
  ContentView,
  ParentPanel,
  PiPProvider,
  QueryDevtoolsContext,
  THEME_PREFERENCE,
  ThemeContext,
  createLocalStorage
} from "./chunk-GNYIFT4C.js";
import {
  createComponent,
  createMemo,
  getPreferredColorScheme
} from "./chunk-J7P766K4.js";
import "./chunk-WOOG5QLI.js";

// ../../node_modules/.deno/@tanstack+query-devtools@5.81.2/node_modules/@tanstack/query-devtools/build/DevtoolsPanelComponent/JZI2RDCT.js
var DevtoolsPanelComponent = (props) => {
  const [localStore, setLocalStore] = createLocalStorage({
    prefix: "TanstackQueryDevtools"
  });
  const colorScheme = getPreferredColorScheme();
  const theme = createMemo(() => {
    const preference = localStore.theme_preference || THEME_PREFERENCE;
    if (preference !== "system") return preference;
    return colorScheme();
  });
  return createComponent(QueryDevtoolsContext.Provider, {
    value: props,
    get children() {
      return createComponent(PiPProvider, {
        disabled: true,
        localStore,
        setLocalStore,
        get children() {
          return createComponent(ThemeContext.Provider, {
            value: theme,
            get children() {
              return createComponent(ParentPanel, {
                get children() {
                  return createComponent(ContentView, {
                    localStore,
                    setLocalStore,
                    get onClose() {
                      return props.onClose;
                    },
                    showPanelViewOnly: true
                  });
                }
              });
            }
          });
        }
      });
    }
  });
};
var DevtoolsPanelComponent_default = DevtoolsPanelComponent;
export {
  DevtoolsPanelComponent_default as default
};
//# sourceMappingURL=JZI2RDCT-RQ5ACS5R.js.map
