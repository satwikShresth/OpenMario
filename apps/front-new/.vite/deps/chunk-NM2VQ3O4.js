// ../../node_modules/.deno/solid-js@1.9.7/node_modules/solid-js/dist/dev.js
var sharedConfig = {
   context: void 0,
   registry: void 0,
   effects: void 0,
   done: false,
   getContextId() {
      return getContextId(this.context.count);
   },
   getNextContextId() {
      return getContextId(this.context.count++);
   },
};
function getContextId(count) {
   const num = String(count), len = num.length - 1;
   return sharedConfig.context.id + (len ? String.fromCharCode(96 + len) : '') + num;
}
function setHydrateContext(context) {
   sharedConfig.context = context;
}
function nextHydrateContext() {
   return {
      ...sharedConfig.context,
      id: sharedConfig.getNextContextId(),
      count: 0,
   };
}
var IS_DEV = true;
var equalFn = (a, b) => a === b;
var $PROXY = Symbol('solid-proxy');
var SUPPORTS_PROXY = typeof Proxy === 'function';
var $TRACK = Symbol('solid-track');
var $DEVCOMP = Symbol('solid-dev-component');
var signalOptions = {
   equals: equalFn,
};
var ERROR = null;
var runEffects = runQueue;
var STALE = 1;
var PENDING = 2;
var UNOWNED = {
   owned: null,
   cleanups: null,
   context: null,
   owner: null,
};
var NO_INIT = {};
var Owner = null;
var Transition = null;
var Scheduler = null;
var ExternalSourceConfig = null;
var Listener = null;
var Updates = null;
var Effects = null;
var ExecCount = 0;
var DevHooks = {
   afterUpdate: null,
   afterCreateOwner: null,
   afterCreateSignal: null,
   afterRegisterGraph: null,
};
function createRoot(fn, detachedOwner) {
   const listener = Listener,
      owner = Owner,
      unowned = fn.length === 0,
      current = detachedOwner === void 0 ? owner : detachedOwner,
      root = unowned
         ? {
            owned: null,
            cleanups: null,
            context: null,
            owner: null,
         }
         : {
            owned: null,
            cleanups: null,
            context: current ? current.context : null,
            owner: current,
         },
      updateFn = unowned
         ? () =>
            fn(() => {
               throw new Error(
                  'Dispose method must be an explicit argument to createRoot function',
               );
            })
         : () => fn(() => untrack(() => cleanNode(root)));
   DevHooks.afterCreateOwner && DevHooks.afterCreateOwner(root);
   Owner = root;
   Listener = null;
   try {
      return runUpdates(updateFn, true);
   } finally {
      Listener = listener;
      Owner = owner;
   }
}
function createSignal(value, options) {
   options = options ? Object.assign({}, signalOptions, options) : signalOptions;
   const s = {
      value,
      observers: null,
      observerSlots: null,
      comparator: options.equals || void 0,
   };
   {
      if (options.name) s.name = options.name;
      if (options.internal) {
         s.internal = true;
      } else {
         registerGraph(s);
         if (DevHooks.afterCreateSignal) DevHooks.afterCreateSignal(s);
      }
   }
   const setter = (value2) => {
      if (typeof value2 === 'function') {
         if (Transition && Transition.running && Transition.sources.has(s)) {
            value2 = value2(s.tValue);
         } else value2 = value2(s.value);
      }
      return writeSignal(s, value2);
   };
   return [readSignal.bind(s), setter];
}
function createComputed(fn, value, options) {
   const c = createComputation(fn, value, true, STALE, options);
   if (Scheduler && Transition && Transition.running) Updates.push(c);
   else updateComputation(c);
}
function createRenderEffect(fn, value, options) {
   const c = createComputation(fn, value, false, STALE, options);
   if (Scheduler && Transition && Transition.running) Updates.push(c);
   else updateComputation(c);
}
function createEffect(fn, value, options) {
   runEffects = runUserEffects;
   const c = createComputation(fn, value, false, STALE, options),
      s = SuspenseContext && useContext(SuspenseContext);
   if (s) c.suspense = s;
   if (!options || !options.render) c.user = true;
   Effects ? Effects.push(c) : updateComputation(c);
}
function createMemo(fn, value, options) {
   options = options ? Object.assign({}, signalOptions, options) : signalOptions;
   const c = createComputation(fn, value, true, 0, options);
   c.observers = null;
   c.observerSlots = null;
   c.comparator = options.equals || void 0;
   if (Scheduler && Transition && Transition.running) {
      c.tState = STALE;
      Updates.push(c);
   } else updateComputation(c);
   return readSignal.bind(c);
}
function isPromise(v) {
   return v && typeof v === 'object' && 'then' in v;
}
function createResource(pSource, pFetcher, pOptions) {
   let source;
   let fetcher;
   let options;
   if (typeof pFetcher === 'function') {
      source = pSource;
      fetcher = pFetcher;
      options = pOptions || {};
   } else {
      source = true;
      fetcher = pSource;
      options = pFetcher || {};
   }
   let pr = null,
      initP = NO_INIT,
      id = null,
      loadedUnderTransition = false,
      scheduled = false,
      resolved = 'initialValue' in options,
      dynamic = typeof source === 'function' && createMemo(source);
   const contexts = /* @__PURE__ */ new Set(),
      [value, setValue] = (options.storage || createSignal)(options.initialValue),
      [error, setError] = createSignal(void 0),
      [track, trigger] = createSignal(void 0, {
         equals: false,
      }),
      [state, setState] = createSignal(resolved ? 'ready' : 'unresolved');
   if (sharedConfig.context) {
      id = sharedConfig.getNextContextId();
      if (options.ssrLoadFrom === 'initial') initP = options.initialValue;
      else if (sharedConfig.load && sharedConfig.has(id)) initP = sharedConfig.load(id);
   }
   function loadEnd(p, v, error2, key) {
      if (pr === p) {
         pr = null;
         key !== void 0 && (resolved = true);
         if ((p === initP || v === initP) && options.onHydrated) {
            queueMicrotask(() =>
               options.onHydrated(key, {
                  value: v,
               })
            );
         }
         initP = NO_INIT;
         if (Transition && p && loadedUnderTransition) {
            Transition.promises.delete(p);
            loadedUnderTransition = false;
            runUpdates(() => {
               Transition.running = true;
               completeLoad(v, error2);
            }, false);
         } else completeLoad(v, error2);
      }
      return v;
   }
   function completeLoad(v, err) {
      runUpdates(() => {
         if (err === void 0) setValue(() => v);
         setState(err !== void 0 ? 'errored' : resolved ? 'ready' : 'unresolved');
         setError(err);
         for (const c of contexts.keys()) c.decrement();
         contexts.clear();
      }, false);
   }
   function read() {
      const c = SuspenseContext && useContext(SuspenseContext), v = value(), err = error();
      if (err !== void 0 && !pr) throw err;
      if (Listener && !Listener.user && c) {
         createComputed(() => {
            track();
            if (pr) {
               if (c.resolved && Transition && loadedUnderTransition) Transition.promises.add(pr);
               else if (!contexts.has(c)) {
                  c.increment();
                  contexts.add(c);
               }
            }
         });
      }
      return v;
   }
   function load(refetching = true) {
      if (refetching !== false && scheduled) return;
      scheduled = false;
      const lookup = dynamic ? dynamic() : source;
      loadedUnderTransition = Transition && Transition.running;
      if (lookup == null || lookup === false) {
         loadEnd(pr, untrack(value));
         return;
      }
      if (Transition && pr) Transition.promises.delete(pr);
      let error2;
      const p = initP !== NO_INIT ? initP : untrack(() => {
         try {
            return fetcher(lookup, {
               value: value(),
               refetching,
            });
         } catch (fetcherError) {
            error2 = fetcherError;
         }
      });
      if (error2 !== void 0) {
         loadEnd(pr, void 0, castError(error2), lookup);
         return;
      } else if (!isPromise(p)) {
         loadEnd(pr, p, void 0, lookup);
         return p;
      }
      pr = p;
      if ('v' in p) {
         if (p.s === 1) loadEnd(pr, p.v, void 0, lookup);
         else loadEnd(pr, void 0, castError(p.v), lookup);
         return p;
      }
      scheduled = true;
      queueMicrotask(() => scheduled = false);
      runUpdates(() => {
         setState(resolved ? 'refreshing' : 'pending');
         trigger();
      }, false);
      return p.then(
         (v) => loadEnd(p, v, void 0, lookup),
         (e) => loadEnd(p, void 0, castError(e), lookup),
      );
   }
   Object.defineProperties(read, {
      state: {
         get: () => state(),
      },
      error: {
         get: () => error(),
      },
      loading: {
         get() {
            const s = state();
            return s === 'pending' || s === 'refreshing';
         },
      },
      latest: {
         get() {
            if (!resolved) return read();
            const err = error();
            if (err && !pr) throw err;
            return value();
         },
      },
   });
   let owner = Owner;
   if (dynamic) createComputed(() => (owner = Owner, load(false)));
   else load(false);
   return [read, {
      refetch: (info) => runWithOwner(owner, () => load(info)),
      mutate: setValue,
   }];
}
function untrack(fn) {
   if (!ExternalSourceConfig && Listener === null) return fn();
   const listener = Listener;
   Listener = null;
   try {
      if (ExternalSourceConfig) return ExternalSourceConfig.untrack(fn);
      return fn();
   } finally {
      Listener = listener;
   }
}
function onCleanup(fn) {
   if (Owner === null) {
      console.warn('cleanups created outside a `createRoot` or `render` will never be run');
   } else if (Owner.cleanups === null) Owner.cleanups = [fn];
   else Owner.cleanups.push(fn);
   return fn;
}
function runWithOwner(o, fn) {
   const prev = Owner;
   const prevListener = Listener;
   Owner = o;
   Listener = null;
   try {
      return runUpdates(fn, true);
   } catch (err) {
      handleError(err);
   } finally {
      Owner = prev;
      Listener = prevListener;
   }
}
function startTransition(fn) {
   if (Transition && Transition.running) {
      fn();
      return Transition.done;
   }
   const l = Listener;
   const o = Owner;
   return Promise.resolve().then(() => {
      Listener = l;
      Owner = o;
      let t;
      if (Scheduler || SuspenseContext) {
         t = Transition || (Transition = {
            sources: /* @__PURE__ */ new Set(),
            effects: [],
            promises: /* @__PURE__ */ new Set(),
            disposed: /* @__PURE__ */ new Set(),
            queue: /* @__PURE__ */ new Set(),
            running: true,
         });
         t.done || (t.done = new Promise((res) => t.resolve = res));
         t.running = true;
      }
      runUpdates(fn, false);
      Listener = Owner = null;
      return t ? t.done : void 0;
   });
}
var [transPending, setTransPending] = createSignal(false);
function devComponent(Comp, props) {
   const c = createComputation(
      () =>
         untrack(() => {
            Object.assign(Comp, {
               [$DEVCOMP]: true,
            });
            return Comp(props);
         }),
      void 0,
      true,
      0,
   );
   c.props = props;
   c.observers = null;
   c.observerSlots = null;
   c.name = Comp.name;
   c.component = Comp;
   updateComputation(c);
   return c.tValue !== void 0 ? c.tValue : c.value;
}
function registerGraph(value) {
   if (Owner) {
      if (Owner.sourceMap) Owner.sourceMap.push(value);
      else Owner.sourceMap = [value];
      value.graph = Owner;
   }
   if (DevHooks.afterRegisterGraph) DevHooks.afterRegisterGraph(value);
}
function createContext(defaultValue, options) {
   const id = Symbol('context');
   return {
      id,
      Provider: createProvider(id, options),
      defaultValue,
   };
}
function useContext(context) {
   let value;
   return Owner && Owner.context && (value = Owner.context[context.id]) !== void 0
      ? value
      : context.defaultValue;
}
function children(fn) {
   const children2 = createMemo(fn);
   const memo2 = createMemo(() => resolveChildren(children2()), void 0, {
      name: 'children',
   });
   memo2.toArray = () => {
      const c = memo2();
      return Array.isArray(c) ? c : c != null ? [c] : [];
   };
   return memo2;
}
var SuspenseContext;
function readSignal() {
   const runningTransition = Transition && Transition.running;
   if (this.sources && (runningTransition ? this.tState : this.state)) {
      if ((runningTransition ? this.tState : this.state) === STALE) updateComputation(this);
      else {
         const updates = Updates;
         Updates = null;
         runUpdates(() => lookUpstream(this), false);
         Updates = updates;
      }
   }
   if (Listener) {
      const sSlot = this.observers ? this.observers.length : 0;
      if (!Listener.sources) {
         Listener.sources = [this];
         Listener.sourceSlots = [sSlot];
      } else {
         Listener.sources.push(this);
         Listener.sourceSlots.push(sSlot);
      }
      if (!this.observers) {
         this.observers = [Listener];
         this.observerSlots = [Listener.sources.length - 1];
      } else {
         this.observers.push(Listener);
         this.observerSlots.push(Listener.sources.length - 1);
      }
   }
   if (runningTransition && Transition.sources.has(this)) return this.tValue;
   return this.value;
}
function writeSignal(node, value, isComp) {
   let current = Transition && Transition.running && Transition.sources.has(node)
      ? node.tValue
      : node.value;
   if (!node.comparator || !node.comparator(current, value)) {
      if (Transition) {
         const TransitionRunning = Transition.running;
         if (TransitionRunning || !isComp && Transition.sources.has(node)) {
            Transition.sources.add(node);
            node.tValue = value;
         }
         if (!TransitionRunning) node.value = value;
      } else node.value = value;
      if (node.observers && node.observers.length) {
         runUpdates(() => {
            for (let i = 0; i < node.observers.length; i += 1) {
               const o = node.observers[i];
               const TransitionRunning = Transition && Transition.running;
               if (TransitionRunning && Transition.disposed.has(o)) continue;
               if (TransitionRunning ? !o.tState : !o.state) {
                  if (o.pure) Updates.push(o);
                  else Effects.push(o);
                  if (o.observers) markDownstream(o);
               }
               if (!TransitionRunning) o.state = STALE;
               else o.tState = STALE;
            }
            if (Updates.length > 1e6) {
               Updates = [];
               if (IS_DEV) throw new Error('Potential Infinite Loop Detected.');
               throw new Error();
            }
         }, false);
      }
   }
   return value;
}
function updateComputation(node) {
   if (!node.fn) return;
   cleanNode(node);
   const time = ExecCount;
   runComputation(
      node,
      Transition && Transition.running && Transition.sources.has(node) ? node.tValue : node.value,
      time,
   );
   if (Transition && !Transition.running && Transition.sources.has(node)) {
      queueMicrotask(() => {
         runUpdates(() => {
            Transition && (Transition.running = true);
            Listener = Owner = node;
            runComputation(node, node.tValue, time);
            Listener = Owner = null;
         }, false);
      });
   }
}
function runComputation(node, value, time) {
   let nextValue;
   const owner = Owner, listener = Listener;
   Listener = Owner = node;
   try {
      nextValue = node.fn(value);
   } catch (err) {
      if (node.pure) {
         if (Transition && Transition.running) {
            node.tState = STALE;
            node.tOwned && node.tOwned.forEach(cleanNode);
            node.tOwned = void 0;
         } else {
            node.state = STALE;
            node.owned && node.owned.forEach(cleanNode);
            node.owned = null;
         }
      }
      node.updatedAt = time + 1;
      return handleError(err);
   } finally {
      Listener = listener;
      Owner = owner;
   }
   if (!node.updatedAt || node.updatedAt <= time) {
      if (node.updatedAt != null && 'observers' in node) {
         writeSignal(node, nextValue, true);
      } else if (Transition && Transition.running && node.pure) {
         Transition.sources.add(node);
         node.tValue = nextValue;
      } else node.value = nextValue;
      node.updatedAt = time;
   }
}
function createComputation(fn, init, pure, state = STALE, options) {
   const c = {
      fn,
      state,
      updatedAt: null,
      owned: null,
      sources: null,
      sourceSlots: null,
      cleanups: null,
      value: init,
      owner: Owner,
      context: Owner ? Owner.context : null,
      pure,
   };
   if (Transition && Transition.running) {
      c.state = 0;
      c.tState = state;
   }
   if (Owner === null) {
      console.warn(
         'computations created outside a `createRoot` or `render` will never be disposed',
      );
   } else if (Owner !== UNOWNED) {
      if (Transition && Transition.running && Owner.pure) {
         if (!Owner.tOwned) Owner.tOwned = [c];
         else Owner.tOwned.push(c);
      } else {
         if (!Owner.owned) Owner.owned = [c];
         else Owner.owned.push(c);
      }
   }
   if (options && options.name) c.name = options.name;
   if (ExternalSourceConfig && c.fn) {
      const [track, trigger] = createSignal(void 0, {
         equals: false,
      });
      const ordinary = ExternalSourceConfig.factory(c.fn, trigger);
      onCleanup(() => ordinary.dispose());
      const triggerInTransition = () => startTransition(trigger).then(() => inTransition.dispose());
      const inTransition = ExternalSourceConfig.factory(c.fn, triggerInTransition);
      c.fn = (x) => {
         track();
         return Transition && Transition.running ? inTransition.track(x) : ordinary.track(x);
      };
   }
   DevHooks.afterCreateOwner && DevHooks.afterCreateOwner(c);
   return c;
}
function runTop(node) {
   const runningTransition = Transition && Transition.running;
   if ((runningTransition ? node.tState : node.state) === 0) return;
   if ((runningTransition ? node.tState : node.state) === PENDING) return lookUpstream(node);
   if (node.suspense && untrack(node.suspense.inFallback)) return node.suspense.effects.push(node);
   const ancestors = [node];
   while ((node = node.owner) && (!node.updatedAt || node.updatedAt < ExecCount)) {
      if (runningTransition && Transition.disposed.has(node)) return;
      if (runningTransition ? node.tState : node.state) ancestors.push(node);
   }
   for (let i = ancestors.length - 1; i >= 0; i--) {
      node = ancestors[i];
      if (runningTransition) {
         let top = node, prev = ancestors[i + 1];
         while ((top = top.owner) && top !== prev) {
            if (Transition.disposed.has(top)) return;
         }
      }
      if ((runningTransition ? node.tState : node.state) === STALE) {
         updateComputation(node);
      } else if ((runningTransition ? node.tState : node.state) === PENDING) {
         const updates = Updates;
         Updates = null;
         runUpdates(() => lookUpstream(node, ancestors[0]), false);
         Updates = updates;
      }
   }
}
function runUpdates(fn, init) {
   if (Updates) return fn();
   let wait = false;
   if (!init) Updates = [];
   if (Effects) wait = true;
   else Effects = [];
   ExecCount++;
   try {
      const res = fn();
      completeUpdates(wait);
      return res;
   } catch (err) {
      if (!wait) Effects = null;
      Updates = null;
      handleError(err);
   }
}
function completeUpdates(wait) {
   if (Updates) {
      if (Scheduler && Transition && Transition.running) scheduleQueue(Updates);
      else runQueue(Updates);
      Updates = null;
   }
   if (wait) return;
   let res;
   if (Transition) {
      if (!Transition.promises.size && !Transition.queue.size) {
         const sources = Transition.sources;
         const disposed = Transition.disposed;
         Effects.push.apply(Effects, Transition.effects);
         res = Transition.resolve;
         for (const e2 of Effects) {
            'tState' in e2 && (e2.state = e2.tState);
            delete e2.tState;
         }
         Transition = null;
         runUpdates(() => {
            for (const d of disposed) cleanNode(d);
            for (const v of sources) {
               v.value = v.tValue;
               if (v.owned) {
                  for (let i = 0, len = v.owned.length; i < len; i++) cleanNode(v.owned[i]);
               }
               if (v.tOwned) v.owned = v.tOwned;
               delete v.tValue;
               delete v.tOwned;
               v.tState = 0;
            }
            setTransPending(false);
         }, false);
      } else if (Transition.running) {
         Transition.running = false;
         Transition.effects.push.apply(Transition.effects, Effects);
         Effects = null;
         setTransPending(true);
         return;
      }
   }
   const e = Effects;
   Effects = null;
   if (e.length) runUpdates(() => runEffects(e), false);
   else DevHooks.afterUpdate && DevHooks.afterUpdate();
   if (res) res();
}
function runQueue(queue) {
   for (let i = 0; i < queue.length; i++) runTop(queue[i]);
}
function scheduleQueue(queue) {
   for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      const tasks = Transition.queue;
      if (!tasks.has(item)) {
         tasks.add(item);
         Scheduler(() => {
            tasks.delete(item);
            runUpdates(() => {
               Transition.running = true;
               runTop(item);
            }, false);
            Transition && (Transition.running = false);
         });
      }
   }
}
function runUserEffects(queue) {
   let i, userLength = 0;
   for (i = 0; i < queue.length; i++) {
      const e = queue[i];
      if (!e.user) runTop(e);
      else queue[userLength++] = e;
   }
   if (sharedConfig.context) {
      if (sharedConfig.count) {
         sharedConfig.effects || (sharedConfig.effects = []);
         sharedConfig.effects.push(...queue.slice(0, userLength));
         return;
      }
      setHydrateContext();
   }
   if (sharedConfig.effects && (sharedConfig.done || !sharedConfig.count)) {
      queue = [...sharedConfig.effects, ...queue];
      userLength += sharedConfig.effects.length;
      delete sharedConfig.effects;
   }
   for (i = 0; i < userLength; i++) runTop(queue[i]);
}
function lookUpstream(node, ignore) {
   const runningTransition = Transition && Transition.running;
   if (runningTransition) node.tState = 0;
   else node.state = 0;
   for (let i = 0; i < node.sources.length; i += 1) {
      const source = node.sources[i];
      if (source.sources) {
         const state = runningTransition ? source.tState : source.state;
         if (state === STALE) {
            if (source !== ignore && (!source.updatedAt || source.updatedAt < ExecCount)) {
               runTop(source);
            }
         } else if (state === PENDING) lookUpstream(source, ignore);
      }
   }
}
function markDownstream(node) {
   const runningTransition = Transition && Transition.running;
   for (let i = 0; i < node.observers.length; i += 1) {
      const o = node.observers[i];
      if (runningTransition ? !o.tState : !o.state) {
         if (runningTransition) o.tState = PENDING;
         else o.state = PENDING;
         if (o.pure) Updates.push(o);
         else Effects.push(o);
         o.observers && markDownstream(o);
      }
   }
}
function cleanNode(node) {
   let i;
   if (node.sources) {
      while (node.sources.length) {
         const source = node.sources.pop(), index = node.sourceSlots.pop(), obs = source.observers;
         if (obs && obs.length) {
            const n = obs.pop(), s = source.observerSlots.pop();
            if (index < obs.length) {
               n.sourceSlots[s] = index;
               obs[index] = n;
               source.observerSlots[index] = s;
            }
         }
      }
   }
   if (node.tOwned) {
      for (i = node.tOwned.length - 1; i >= 0; i--) cleanNode(node.tOwned[i]);
      delete node.tOwned;
   }
   if (Transition && Transition.running && node.pure) {
      reset(node, true);
   } else if (node.owned) {
      for (i = node.owned.length - 1; i >= 0; i--) cleanNode(node.owned[i]);
      node.owned = null;
   }
   if (node.cleanups) {
      for (i = node.cleanups.length - 1; i >= 0; i--) node.cleanups[i]();
      node.cleanups = null;
   }
   if (Transition && Transition.running) node.tState = 0;
   else node.state = 0;
   delete node.sourceMap;
}
function reset(node, top) {
   if (!top) {
      node.tState = 0;
      Transition.disposed.add(node);
   }
   if (node.owned) {
      for (let i = 0; i < node.owned.length; i++) reset(node.owned[i]);
   }
}
function castError(err) {
   if (err instanceof Error) return err;
   return new Error(typeof err === 'string' ? err : 'Unknown error', {
      cause: err,
   });
}
function runErrors(err, fns, owner) {
   try {
      for (const f of fns) f(err);
   } catch (e) {
      handleError(e, owner && owner.owner || null);
   }
}
function handleError(err, owner = Owner) {
   const fns = ERROR && owner && owner.context && owner.context[ERROR];
   const error = castError(err);
   if (!fns) throw error;
   if (Effects) {
      Effects.push({
         fn() {
            runErrors(error, fns, owner);
         },
         state: STALE,
      });
   } else runErrors(error, fns, owner);
}
function resolveChildren(children2) {
   if (typeof children2 === 'function' && !children2.length) return resolveChildren(children2());
   if (Array.isArray(children2)) {
      const results = [];
      for (let i = 0; i < children2.length; i++) {
         const result = resolveChildren(children2[i]);
         Array.isArray(result) ? results.push.apply(results, result) : results.push(result);
      }
      return results;
   }
   return children2;
}
function createProvider(id, options) {
   return function provider(props) {
      let res;
      createRenderEffect(
         () =>
            res = untrack(() => {
               Owner.context = {
                  ...Owner.context,
                  [id]: props.value,
               };
               return children(() => props.children);
            }),
         void 0,
         options,
      );
      return res;
   };
}
var FALLBACK = Symbol('fallback');
var hydrationEnabled = false;
function createComponent(Comp, props) {
   if (hydrationEnabled) {
      if (sharedConfig.context) {
         const c = sharedConfig.context;
         setHydrateContext(nextHydrateContext());
         const r = devComponent(Comp, props || {});
         setHydrateContext(c);
         return r;
      }
   }
   return devComponent(Comp, props || {});
}
function trueFn() {
   return true;
}
var propTraps = {
   get(_, property, receiver) {
      if (property === $PROXY) return receiver;
      return _.get(property);
   },
   has(_, property) {
      if (property === $PROXY) return true;
      return _.has(property);
   },
   set: trueFn,
   deleteProperty: trueFn,
   getOwnPropertyDescriptor(_, property) {
      return {
         configurable: true,
         enumerable: true,
         get() {
            return _.get(property);
         },
         set: trueFn,
         deleteProperty: trueFn,
      };
   },
   ownKeys(_) {
      return _.keys();
   },
};
function resolveSource(s) {
   return !(s = typeof s === 'function' ? s() : s) ? {} : s;
}
function resolveSources() {
   for (let i = 0, length = this.length; i < length; ++i) {
      const v = this[i]();
      if (v !== void 0) return v;
   }
}
function mergeProps(...sources) {
   let proxy = false;
   for (let i = 0; i < sources.length; i++) {
      const s = sources[i];
      proxy = proxy || !!s && $PROXY in s;
      sources[i] = typeof s === 'function' ? (proxy = true, createMemo(s)) : s;
   }
   if (SUPPORTS_PROXY && proxy) {
      return new Proxy({
         get(property) {
            for (let i = sources.length - 1; i >= 0; i--) {
               const v = resolveSource(sources[i])[property];
               if (v !== void 0) return v;
            }
         },
         has(property) {
            for (let i = sources.length - 1; i >= 0; i--) {
               if (property in resolveSource(sources[i])) return true;
            }
            return false;
         },
         keys() {
            const keys = [];
            for (let i = 0; i < sources.length; i++) {
               keys.push(...Object.keys(resolveSource(sources[i])));
            }
            return [...new Set(keys)];
         },
      }, propTraps);
   }
   const sourcesMap = {};
   const defined = /* @__PURE__ */ Object.create(null);
   for (let i = sources.length - 1; i >= 0; i--) {
      const source = sources[i];
      if (!source) continue;
      const sourceKeys = Object.getOwnPropertyNames(source);
      for (let i2 = sourceKeys.length - 1; i2 >= 0; i2--) {
         const key = sourceKeys[i2];
         if (key === '__proto__' || key === 'constructor') continue;
         const desc = Object.getOwnPropertyDescriptor(source, key);
         if (!defined[key]) {
            defined[key] = desc.get
               ? {
                  enumerable: true,
                  configurable: true,
                  get: resolveSources.bind(sourcesMap[key] = [desc.get.bind(source)]),
               }
               : desc.value !== void 0
               ? desc
               : void 0;
         } else {
            const sources2 = sourcesMap[key];
            if (sources2) {
               if (desc.get) sources2.push(desc.get.bind(source));
               else if (desc.value !== void 0) sources2.push(() => desc.value);
            }
         }
      }
   }
   const target = {};
   const definedKeys = Object.keys(defined);
   for (let i = definedKeys.length - 1; i >= 0; i--) {
      const key = definedKeys[i], desc = defined[key];
      if (desc && desc.get) Object.defineProperty(target, key, desc);
      else target[key] = desc ? desc.value : void 0;
   }
   return target;
}
function splitProps(props, ...keys) {
   if (SUPPORTS_PROXY && $PROXY in props) {
      const blocked = new Set(keys.length > 1 ? keys.flat() : keys[0]);
      const res = keys.map((k) => {
         return new Proxy({
            get(property) {
               return k.includes(property) ? props[property] : void 0;
            },
            has(property) {
               return k.includes(property) && property in props;
            },
            keys() {
               return k.filter((property) => property in props);
            },
         }, propTraps);
      });
      res.push(
         new Proxy({
            get(property) {
               return blocked.has(property) ? void 0 : props[property];
            },
            has(property) {
               return blocked.has(property) ? false : property in props;
            },
            keys() {
               return Object.keys(props).filter((k) => !blocked.has(k));
            },
         }, propTraps),
      );
      return res;
   }
   const otherObject = {};
   const objects = keys.map(() => ({}));
   for (const propName of Object.getOwnPropertyNames(props)) {
      const desc = Object.getOwnPropertyDescriptor(props, propName);
      const isDefaultDesc = !desc.get && !desc.set && desc.enumerable && desc.writable &&
         desc.configurable;
      let blocked = false;
      let objectIndex = 0;
      for (const k of keys) {
         if (k.includes(propName)) {
            blocked = true;
            isDefaultDesc
               ? objects[objectIndex][propName] = desc.value
               : Object.defineProperty(objects[objectIndex], propName, desc);
         }
         ++objectIndex;
      }
      if (!blocked) {
         isDefaultDesc
            ? otherObject[propName] = desc.value
            : Object.defineProperty(otherObject, propName, desc);
      }
   }
   return [...objects, otherObject];
}
function lazy(fn) {
   let comp;
   let p;
   const wrap = (props) => {
      const ctx = sharedConfig.context;
      if (ctx) {
         const [s, set] = createSignal();
         sharedConfig.count || (sharedConfig.count = 0);
         sharedConfig.count++;
         (p || (p = fn())).then((mod) => {
            !sharedConfig.done && setHydrateContext(ctx);
            sharedConfig.count--;
            set(() => mod.default);
            setHydrateContext();
         });
         comp = s;
      } else if (!comp) {
         const [s] = createResource(() => (p || (p = fn())).then((mod) => mod.default));
         comp = s;
      }
      let Comp;
      return createMemo(() =>
         (Comp = comp())
            ? untrack(() => {
               if (IS_DEV) {
                  Object.assign(Comp, {
                     [$DEVCOMP]: true,
                  });
               }
               if (!ctx || sharedConfig.done) return Comp(props);
               const c = sharedConfig.context;
               setHydrateContext(ctx);
               const r = Comp(props);
               setHydrateContext(c);
               return r;
            })
            : ''
      );
   };
   wrap.preload = () => p || ((p = fn()).then((mod) => comp = () => mod.default), p);
   return wrap;
}
var counter = 0;
function createUniqueId() {
   const ctx = sharedConfig.context;
   return ctx ? sharedConfig.getNextContextId() : `cl-${counter++}`;
}
var narrowedError = (name) =>
   `Attempting to access a stale value from <${name}> that could possibly be undefined. This may occur because you are reading the accessor returned from the component at a time where it has already been unmounted. We recommend cleaning up any stale timers or async, or reading from the initial condition.`;
function Show(props) {
   const keyed = props.keyed;
   const conditionValue = createMemo(() => props.when, void 0, {
      name: 'condition value',
   });
   const condition = keyed ? conditionValue : createMemo(conditionValue, void 0, {
      equals: (a, b) => !a === !b,
      name: 'condition',
   });
   return createMemo(
      () => {
         const c = condition();
         if (c) {
            const child = props.children;
            const fn = typeof child === 'function' && child.length > 0;
            return fn
               ? untrack(() =>
                  child(
                     keyed ? c : () => {
                        if (!untrack(condition)) throw narrowedError('Show');
                        return conditionValue();
                     },
                  )
               )
               : child;
         }
         return props.fallback;
      },
      void 0,
      {
         name: 'value',
      },
   );
}
var SuspenseListContext = createContext();
if (globalThis) {
   if (!globalThis.Solid$$) globalThis.Solid$$ = true;
   else {console.warn(
         'You appear to have multiple instances of Solid. This can lead to unexpected behavior.',
      );}
}

// ../../node_modules/.deno/solid-js@1.9.7/node_modules/solid-js/web/dist/dev.js
var booleans = [
   'allowfullscreen',
   'async',
   'autofocus',
   'autoplay',
   'checked',
   'controls',
   'default',
   'disabled',
   'formnovalidate',
   'hidden',
   'indeterminate',
   'inert',
   'ismap',
   'loop',
   'multiple',
   'muted',
   'nomodule',
   'novalidate',
   'open',
   'playsinline',
   'readonly',
   'required',
   'reversed',
   'seamless',
   'selected',
];
var Properties = /* @__PURE__ */ new Set([
   'className',
   'value',
   'readOnly',
   'noValidate',
   'formNoValidate',
   'isMap',
   'noModule',
   'playsInline',
   ...booleans,
]);
var ChildProperties = /* @__PURE__ */ new Set([
   'innerHTML',
   'textContent',
   'innerText',
   'children',
]);
var Aliases = Object.assign(/* @__PURE__ */ Object.create(null), {
   className: 'class',
   htmlFor: 'for',
});
var PropAliases = Object.assign(/* @__PURE__ */ Object.create(null), {
   class: 'className',
   novalidate: {
      $: 'noValidate',
      FORM: 1,
   },
   formnovalidate: {
      $: 'formNoValidate',
      BUTTON: 1,
      INPUT: 1,
   },
   ismap: {
      $: 'isMap',
      IMG: 1,
   },
   nomodule: {
      $: 'noModule',
      SCRIPT: 1,
   },
   playsinline: {
      $: 'playsInline',
      VIDEO: 1,
   },
   readonly: {
      $: 'readOnly',
      INPUT: 1,
      TEXTAREA: 1,
   },
});
function getPropAlias(prop, tagName) {
   const a = PropAliases[prop];
   return typeof a === 'object' ? a[tagName] ? a['$'] : void 0 : a;
}
var DelegatedEvents = /* @__PURE__ */ new Set([
   'beforeinput',
   'click',
   'dblclick',
   'contextmenu',
   'focusin',
   'focusout',
   'input',
   'keydown',
   'keyup',
   'mousedown',
   'mousemove',
   'mouseout',
   'mouseover',
   'mouseup',
   'pointerdown',
   'pointermove',
   'pointerout',
   'pointerover',
   'pointerup',
   'touchend',
   'touchmove',
   'touchstart',
]);
var SVGElements = /* @__PURE__ */ new Set([
   'altGlyph',
   'altGlyphDef',
   'altGlyphItem',
   'animate',
   'animateColor',
   'animateMotion',
   'animateTransform',
   'circle',
   'clipPath',
   'color-profile',
   'cursor',
   'defs',
   'desc',
   'ellipse',
   'feBlend',
   'feColorMatrix',
   'feComponentTransfer',
   'feComposite',
   'feConvolveMatrix',
   'feDiffuseLighting',
   'feDisplacementMap',
   'feDistantLight',
   'feDropShadow',
   'feFlood',
   'feFuncA',
   'feFuncB',
   'feFuncG',
   'feFuncR',
   'feGaussianBlur',
   'feImage',
   'feMerge',
   'feMergeNode',
   'feMorphology',
   'feOffset',
   'fePointLight',
   'feSpecularLighting',
   'feSpotLight',
   'feTile',
   'feTurbulence',
   'filter',
   'font',
   'font-face',
   'font-face-format',
   'font-face-name',
   'font-face-src',
   'font-face-uri',
   'foreignObject',
   'g',
   'glyph',
   'glyphRef',
   'hkern',
   'image',
   'line',
   'linearGradient',
   'marker',
   'mask',
   'metadata',
   'missing-glyph',
   'mpath',
   'path',
   'pattern',
   'polygon',
   'polyline',
   'radialGradient',
   'rect',
   'set',
   'stop',
   'svg',
   'switch',
   'symbol',
   'text',
   'textPath',
   'tref',
   'tspan',
   'use',
   'view',
   'vkern',
]);
var SVGNamespace = {
   xlink: 'http://www.w3.org/1999/xlink',
   xml: 'http://www.w3.org/XML/1998/namespace',
};
var memo = (fn) => createMemo(() => fn());
function reconcileArrays(parentNode, a, b) {
   let bLength = b.length,
      aEnd = a.length,
      bEnd = bLength,
      aStart = 0,
      bStart = 0,
      after = a[aEnd - 1].nextSibling,
      map = null;
   while (aStart < aEnd || bStart < bEnd) {
      if (a[aStart] === b[bStart]) {
         aStart++;
         bStart++;
         continue;
      }
      while (a[aEnd - 1] === b[bEnd - 1]) {
         aEnd--;
         bEnd--;
      }
      if (aEnd === aStart) {
         const node = bEnd < bLength
            ? bStart ? b[bStart - 1].nextSibling : b[bEnd - bStart]
            : after;
         while (bStart < bEnd) parentNode.insertBefore(b[bStart++], node);
      } else if (bEnd === bStart) {
         while (aStart < aEnd) {
            if (!map || !map.has(a[aStart])) a[aStart].remove();
            aStart++;
         }
      } else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
         const node = a[--aEnd].nextSibling;
         parentNode.insertBefore(b[bStart++], a[aStart++].nextSibling);
         parentNode.insertBefore(b[--bEnd], node);
         a[aEnd] = b[bEnd];
      } else {
         if (!map) {
            map = /* @__PURE__ */ new Map();
            let i = bStart;
            while (i < bEnd) map.set(b[i], i++);
         }
         const index = map.get(a[aStart]);
         if (index != null) {
            if (bStart < index && index < bEnd) {
               let i = aStart, sequence = 1, t;
               while (++i < aEnd && i < bEnd) {
                  if ((t = map.get(a[i])) == null || t !== index + sequence) break;
                  sequence++;
               }
               if (sequence > index - bStart) {
                  const node = a[aStart];
                  while (bStart < index) parentNode.insertBefore(b[bStart++], node);
               } else parentNode.replaceChild(b[bStart++], a[aStart++]);
            } else aStart++;
         } else a[aStart++].remove();
      }
   }
}
var $$EVENTS = '_$DX_DELEGATE';
function render(code, element, init, options = {}) {
   if (!element) {
      throw new Error(
         "The `element` passed to `render(..., element)` doesn't exist. Make sure `element` exists in the document.",
      );
   }
   let disposer;
   createRoot((dispose) => {
      disposer = dispose;
      element === document
         ? code()
         : insert(element, code(), element.firstChild ? null : void 0, init);
   }, options.owner);
   return () => {
      disposer();
      element.textContent = '';
   };
}
function template(html, isImportNode, isSVG, isMathML) {
   let node;
   const create = () => {
      if (isHydrating()) {
         throw new Error(
            'Failed attempt to create new DOM elements during hydration. Check that the libraries you are using support hydration.',
         );
      }
      const t = isMathML
         ? document.createElementNS('http://www.w3.org/1998/Math/MathML', 'template')
         : document.createElement('template');
      t.innerHTML = html;
      return isSVG
         ? t.content.firstChild.firstChild
         : isMathML
         ? t.firstChild
         : t.content.firstChild;
   };
   const fn = isImportNode
      ? () => untrack(() => document.importNode(node || (node = create()), true))
      : () => (node || (node = create())).cloneNode(true);
   fn.cloneNode = fn;
   return fn;
}
function delegateEvents(eventNames, document2 = window.document) {
   const e = document2[$$EVENTS] || (document2[$$EVENTS] = /* @__PURE__ */ new Set());
   for (let i = 0, l = eventNames.length; i < l; i++) {
      const name = eventNames[i];
      if (!e.has(name)) {
         e.add(name);
         document2.addEventListener(name, eventHandler);
      }
   }
}
function setAttribute(node, name, value) {
   if (isHydrating(node)) return;
   if (value == null) node.removeAttribute(name);
   else node.setAttribute(name, value);
}
function setAttributeNS(node, namespace, name, value) {
   if (isHydrating(node)) return;
   if (value == null) node.removeAttributeNS(namespace, name);
   else node.setAttributeNS(namespace, name, value);
}
function setBoolAttribute(node, name, value) {
   if (isHydrating(node)) return;
   value ? node.setAttribute(name, '') : node.removeAttribute(name);
}
function className(node, value) {
   if (isHydrating(node)) return;
   if (value == null) node.removeAttribute('class');
   else node.className = value;
}
function addEventListener(node, name, handler, delegate) {
   if (delegate) {
      if (Array.isArray(handler)) {
         node[`$$${name}`] = handler[0];
         node[`$$${name}Data`] = handler[1];
      } else node[`$$${name}`] = handler;
   } else if (Array.isArray(handler)) {
      const handlerFn = handler[0];
      node.addEventListener(name, handler[0] = (e) => handlerFn.call(node, handler[1], e));
   } else node.addEventListener(name, handler, typeof handler !== 'function' && handler);
}
function classList(node, value, prev = {}) {
   const classKeys = Object.keys(value || {}), prevKeys = Object.keys(prev);
   let i, len;
   for (i = 0, len = prevKeys.length; i < len; i++) {
      const key = prevKeys[i];
      if (!key || key === 'undefined' || value[key]) continue;
      toggleClassKey(node, key, false);
      delete prev[key];
   }
   for (i = 0, len = classKeys.length; i < len; i++) {
      const key = classKeys[i], classValue = !!value[key];
      if (!key || key === 'undefined' || prev[key] === classValue || !classValue) continue;
      toggleClassKey(node, key, true);
      prev[key] = classValue;
   }
   return prev;
}
function style(node, value, prev) {
   if (!value) return prev ? setAttribute(node, 'style') : value;
   const nodeStyle = node.style;
   if (typeof value === 'string') return nodeStyle.cssText = value;
   typeof prev === 'string' && (nodeStyle.cssText = prev = void 0);
   prev || (prev = {});
   value || (value = {});
   let v, s;
   for (s in prev) {
      value[s] == null && nodeStyle.removeProperty(s);
      delete prev[s];
   }
   for (s in value) {
      v = value[s];
      if (v !== prev[s]) {
         nodeStyle.setProperty(s, v);
         prev[s] = v;
      }
   }
   return prev;
}
function spread(node, props = {}, isSVG, skipChildren) {
   const prevProps = {};
   if (!skipChildren) {
      createRenderEffect(() =>
         prevProps.children = insertExpression(node, props.children, prevProps.children)
      );
   }
   createRenderEffect(() => typeof props.ref === 'function' && use(props.ref, node));
   createRenderEffect(() => assign(node, props, isSVG, true, prevProps, true));
   return prevProps;
}
function use(fn, element, arg) {
   return untrack(() => fn(element, arg));
}
function insert(parent, accessor, marker, initial) {
   if (marker !== void 0 && !initial) initial = [];
   if (typeof accessor !== 'function') return insertExpression(parent, accessor, initial, marker);
   createRenderEffect((current) => insertExpression(parent, accessor(), current, marker), initial);
}
function assign(node, props, isSVG, skipChildren, prevProps = {}, skipRef = false) {
   props || (props = {});
   for (const prop in prevProps) {
      if (!(prop in props)) {
         if (prop === 'children') continue;
         prevProps[prop] = assignProp(node, prop, null, prevProps[prop], isSVG, skipRef, props);
      }
   }
   for (const prop in props) {
      if (prop === 'children') {
         if (!skipChildren) insertExpression(node, props.children);
         continue;
      }
      const value = props[prop];
      prevProps[prop] = assignProp(node, prop, value, prevProps[prop], isSVG, skipRef, props);
   }
}
function getNextElement(template2) {
   let node, key, hydrating = isHydrating();
   if (!hydrating || !(node = sharedConfig.registry.get(key = getHydrationKey()))) {
      if (hydrating) {
         sharedConfig.done = true;
         throw new Error(`Hydration Mismatch. Unable to find DOM nodes for hydration key: ${key}
${template2 ? template2().outerHTML : ''}`);
      }
      return template2();
   }
   if (sharedConfig.completed) sharedConfig.completed.add(node);
   sharedConfig.registry.delete(key);
   return node;
}
function isHydrating(node) {
   return !!sharedConfig.context && !sharedConfig.done && (!node || node.isConnected);
}
function toPropertyName(name) {
   return name.toLowerCase().replace(/-([a-z])/g, (_, w) => w.toUpperCase());
}
function toggleClassKey(node, key, value) {
   const classNames = key.trim().split(/\s+/);
   for (let i = 0, nameLen = classNames.length; i < nameLen; i++) {
      node.classList.toggle(classNames[i], value);
   }
}
function assignProp(node, prop, value, prev, isSVG, skipRef, props) {
   let isCE, isProp, isChildProp, propAlias, forceProp;
   if (prop === 'style') return style(node, value, prev);
   if (prop === 'classList') return classList(node, value, prev);
   if (value === prev) return prev;
   if (prop === 'ref') {
      if (!skipRef) value(node);
   } else if (prop.slice(0, 3) === 'on:') {
      const e = prop.slice(3);
      prev && node.removeEventListener(e, prev, typeof prev !== 'function' && prev);
      value && node.addEventListener(e, value, typeof value !== 'function' && value);
   } else if (prop.slice(0, 10) === 'oncapture:') {
      const e = prop.slice(10);
      prev && node.removeEventListener(e, prev, true);
      value && node.addEventListener(e, value, true);
   } else if (prop.slice(0, 2) === 'on') {
      const name = prop.slice(2).toLowerCase();
      const delegate = DelegatedEvents.has(name);
      if (!delegate && prev) {
         const h = Array.isArray(prev) ? prev[0] : prev;
         node.removeEventListener(name, h);
      }
      if (delegate || value) {
         addEventListener(node, name, value, delegate);
         delegate && delegateEvents([name]);
      }
   } else if (prop.slice(0, 5) === 'attr:') {
      setAttribute(node, prop.slice(5), value);
   } else if (prop.slice(0, 5) === 'bool:') {
      setBoolAttribute(node, prop.slice(5), value);
   } else if (
      (forceProp = prop.slice(0, 5) === 'prop:') || (isChildProp = ChildProperties.has(prop)) ||
      !isSVG &&
         ((propAlias = getPropAlias(prop, node.tagName)) || (isProp = Properties.has(prop))) ||
      (isCE = node.nodeName.includes('-') || 'is' in props)
   ) {
      if (forceProp) {
         prop = prop.slice(5);
         isProp = true;
      } else if (isHydrating(node)) return value;
      if (prop === 'class' || prop === 'className') className(node, value);
      else if (isCE && !isProp && !isChildProp) node[toPropertyName(prop)] = value;
      else node[propAlias || prop] = value;
   } else {
      const ns = isSVG && prop.indexOf(':') > -1 && SVGNamespace[prop.split(':')[0]];
      if (ns) setAttributeNS(node, ns, prop, value);
      else setAttribute(node, Aliases[prop] || prop, value);
   }
   return value;
}
function eventHandler(e) {
   if (sharedConfig.registry && sharedConfig.events) {
      if (sharedConfig.events.find(([el, ev]) => ev === e)) return;
   }
   let node = e.target;
   const key = `$$${e.type}`;
   const oriTarget = e.target;
   const oriCurrentTarget = e.currentTarget;
   const retarget = (value) =>
      Object.defineProperty(e, 'target', {
         configurable: true,
         value,
      });
   const handleNode = () => {
      const handler = node[key];
      if (handler && !node.disabled) {
         const data = node[`${key}Data`];
         data !== void 0 ? handler.call(node, data, e) : handler.call(node, e);
         if (e.cancelBubble) return;
      }
      node.host && typeof node.host !== 'string' && !node.host._$host && node.contains(e.target) &&
         retarget(node.host);
      return true;
   };
   const walkUpTree = () => {
      while (handleNode() && (node = node._$host || node.parentNode || node.host));
   };
   Object.defineProperty(e, 'currentTarget', {
      configurable: true,
      get() {
         return node || document;
      },
   });
   if (sharedConfig.registry && !sharedConfig.done) sharedConfig.done = _$HY.done = true;
   if (e.composedPath) {
      const path = e.composedPath();
      retarget(path[0]);
      for (let i = 0; i < path.length - 2; i++) {
         node = path[i];
         if (!handleNode()) break;
         if (node._$host) {
            node = node._$host;
            walkUpTree();
            break;
         }
         if (node.parentNode === oriCurrentTarget) {
            break;
         }
      }
   } else walkUpTree();
   retarget(oriTarget);
}
function insertExpression(parent, value, current, marker, unwrapArray) {
   const hydrating = isHydrating(parent);
   if (hydrating) {
      !current && (current = [...parent.childNodes]);
      let cleaned = [];
      for (let i = 0; i < current.length; i++) {
         const node = current[i];
         if (node.nodeType === 8 && node.data.slice(0, 2) === '!$') node.remove();
         else cleaned.push(node);
      }
      current = cleaned;
   }
   while (typeof current === 'function') current = current();
   if (value === current) return current;
   const t = typeof value, multi = marker !== void 0;
   parent = multi && current[0] && current[0].parentNode || parent;
   if (t === 'string' || t === 'number') {
      if (hydrating) return current;
      if (t === 'number') {
         value = value.toString();
         if (value === current) return current;
      }
      if (multi) {
         let node = current[0];
         if (node && node.nodeType === 3) {
            node.data !== value && (node.data = value);
         } else node = document.createTextNode(value);
         current = cleanChildren(parent, current, marker, node);
      } else {
         if (current !== '' && typeof current === 'string') {
            current = parent.firstChild.data = value;
         } else current = parent.textContent = value;
      }
   } else if (value == null || t === 'boolean') {
      if (hydrating) return current;
      current = cleanChildren(parent, current, marker);
   } else if (t === 'function') {
      createRenderEffect(() => {
         let v = value();
         while (typeof v === 'function') v = v();
         current = insertExpression(parent, v, current, marker);
      });
      return () => current;
   } else if (Array.isArray(value)) {
      const array = [];
      const currentArray = current && Array.isArray(current);
      if (normalizeIncomingArray(array, value, current, unwrapArray)) {
         createRenderEffect(() => current = insertExpression(parent, array, current, marker, true));
         return () => current;
      }
      if (hydrating) {
         if (!array.length) return current;
         if (marker === void 0) return current = [...parent.childNodes];
         let node = array[0];
         if (node.parentNode !== parent) return current;
         const nodes = [node];
         while ((node = node.nextSibling) !== marker) nodes.push(node);
         return current = nodes;
      }
      if (array.length === 0) {
         current = cleanChildren(parent, current, marker);
         if (multi) return current;
      } else if (currentArray) {
         if (current.length === 0) {
            appendNodes(parent, array, marker);
         } else reconcileArrays(parent, current, array);
      } else {
         current && cleanChildren(parent);
         appendNodes(parent, array);
      }
      current = array;
   } else if (value.nodeType) {
      if (hydrating && value.parentNode) return current = multi ? [value] : value;
      if (Array.isArray(current)) {
         if (multi) return current = cleanChildren(parent, current, marker, value);
         cleanChildren(parent, current, null, value);
      } else if (current == null || current === '' || !parent.firstChild) {
         parent.appendChild(value);
      } else parent.replaceChild(value, parent.firstChild);
      current = value;
   } else console.warn(`Unrecognized value. Skipped inserting`, value);
   return current;
}
function normalizeIncomingArray(normalized, array, current, unwrap) {
   let dynamic = false;
   for (let i = 0, len = array.length; i < len; i++) {
      let item = array[i], prev = current && current[normalized.length], t;
      if (item == null || item === true || item === false);
      else if ((t = typeof item) === 'object' && item.nodeType) {
         normalized.push(item);
      } else if (Array.isArray(item)) {
         dynamic = normalizeIncomingArray(normalized, item, prev) || dynamic;
      } else if (t === 'function') {
         if (unwrap) {
            while (typeof item === 'function') item = item();
            dynamic = normalizeIncomingArray(
               normalized,
               Array.isArray(item) ? item : [item],
               Array.isArray(prev) ? prev : [prev],
            ) || dynamic;
         } else {
            normalized.push(item);
            dynamic = true;
         }
      } else {
         const value = String(item);
         if (prev && prev.nodeType === 3 && prev.data === value) normalized.push(prev);
         else normalized.push(document.createTextNode(value));
      }
   }
   return dynamic;
}
function appendNodes(parent, array, marker = null) {
   for (let i = 0, len = array.length; i < len; i++) parent.insertBefore(array[i], marker);
}
function cleanChildren(parent, current, marker, replacement) {
   if (marker === void 0) return parent.textContent = '';
   const node = replacement || document.createTextNode('');
   if (current.length) {
      let inserted = false;
      for (let i = current.length - 1; i >= 0; i--) {
         const el = current[i];
         if (node !== el) {
            const isParent = el.parentNode === parent;
            if (!inserted && !i) {
               isParent ? parent.replaceChild(node, el) : parent.insertBefore(node, marker);
            } else isParent && el.remove();
         } else inserted = true;
      }
   } else parent.insertBefore(node, marker);
   return [node];
}
function getHydrationKey() {
   return sharedConfig.getNextContextId();
}
var RequestContext = Symbol();
var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
function createElement(tagName, isSVG = false) {
   return isSVG
      ? document.createElementNS(SVG_NAMESPACE, tagName)
      : document.createElement(tagName);
}
function createDynamic(component, props) {
   const cached = createMemo(component);
   return createMemo(() => {
      const component2 = cached();
      switch (typeof component2) {
         case 'function':
            Object.assign(component2, {
               [$DEVCOMP]: true,
            });
            return untrack(() => component2(props));
         case 'string':
            const isSvg = SVGElements.has(component2);
            const el = sharedConfig.context ? getNextElement() : createElement(component2, isSvg);
            spread(el, props, isSvg);
            return el;
      }
   });
}
function Dynamic(props) {
   const [, others] = splitProps(props, ['component']);
   return createDynamic(() => props.component, others);
}

// ../../node_modules/.deno/@tanstack+router-devtools-core@1.125.4/node_modules/@tanstack/router-devtools-core/dist/esm/context.js
var ShadowDomTargetContext = createContext(
   void 0,
);
var DevtoolsOnCloseContext = createContext(void 0);
var useDevtoolsOnClose = () => {
   const context = useContext(DevtoolsOnCloseContext);
   if (!context) {
      throw new Error(
         'useDevtoolsOnClose must be used within a TanStackRouterDevtools component',
      );
   }
   return context;
};

export {
   addEventListener,
   className,
   createComponent,
   createEffect,
   createMemo,
   createRenderEffect,
   createSignal,
   createUniqueId,
   delegateEvents,
   DevtoolsOnCloseContext,
   Dynamic,
   insert,
   lazy,
   memo,
   mergeProps,
   render,
   setAttribute,
   ShadowDomTargetContext,
   Show,
   spread,
   template,
   useContext,
   useDevtoolsOnClose,
};
//# sourceMappingURL=chunk-NM2VQ3O4.js.map
