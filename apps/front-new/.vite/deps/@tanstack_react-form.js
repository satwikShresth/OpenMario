import {
  useStore
} from "./chunk-SJXWFFBF.js";
import {
  Derived,
  Store,
  batch
} from "./chunk-PKKGSRSG.js";
import {
  require_jsx_runtime
} from "./chunk-JY6JHD56.js";
import {
  require_react
} from "./chunk-JZ6RMLDG.js";
import {
  __toESM
} from "./chunk-WOOG5QLI.js";

// ../../node_modules/.deno/@tanstack+form-core@1.14.0/node_modules/@tanstack/form-core/dist/esm/utils.js
function functionalUpdate(updater, input) {
  return typeof updater === "function" ? updater(input) : updater;
}
function getBy(obj, path) {
  const pathObj = makePathArray(path);
  return pathObj.reduce((current, pathPart) => {
    if (current === null) return null;
    if (typeof current !== "undefined") {
      return current[pathPart];
    }
    return void 0;
  }, obj);
}
function setBy(obj, _path, updater) {
  const path = makePathArray(_path);
  function doSet(parent) {
    if (!path.length) {
      return functionalUpdate(updater, parent);
    }
    const key = path.shift();
    if (typeof key === "string" || typeof key === "number" && !Array.isArray(parent)) {
      if (typeof parent === "object") {
        if (parent === null) {
          parent = {};
        }
        return {
          ...parent,
          [key]: doSet(parent[key])
        };
      }
      return {
        [key]: doSet()
      };
    }
    if (Array.isArray(parent) && typeof key === "number") {
      const prefix = parent.slice(0, key);
      return [
        ...prefix.length ? prefix : new Array(key),
        doSet(parent[key]),
        ...parent.slice(key + 1)
      ];
    }
    return [...new Array(key), doSet()];
  }
  return doSet(obj);
}
function deleteBy(obj, _path) {
  const path = makePathArray(_path);
  function doDelete(parent) {
    if (!parent) return;
    if (path.length === 1) {
      const finalPath = path[0];
      if (Array.isArray(parent) && typeof finalPath === "number") {
        return parent.filter((_, i) => i !== finalPath);
      }
      const { [finalPath]: remove, ...rest } = parent;
      return rest;
    }
    const key = path.shift();
    if (typeof key === "string") {
      if (typeof parent === "object") {
        return {
          ...parent,
          [key]: doDelete(parent[key])
        };
      }
    }
    if (typeof key === "number") {
      if (Array.isArray(parent)) {
        if (key >= parent.length) {
          return parent;
        }
        const prefix = parent.slice(0, key);
        return [
          ...prefix.length ? prefix : new Array(key),
          doDelete(parent[key]),
          ...parent.slice(key + 1)
        ];
      }
    }
    throw new Error("It seems we have created an infinite loop in deleteBy. ");
  }
  return doDelete(obj);
}
var reLineOfOnlyDigits = /^(\d+)$/gm;
var reDigitsBetweenDots = /\.(\d+)(?=\.)/gm;
var reStartWithDigitThenDot = /^(\d+)\./gm;
var reDotWithDigitsToEnd = /\.(\d+$)/gm;
var reMultipleDots = /\.{2,}/gm;
var intPrefix = "__int__";
var intReplace = `${intPrefix}$1`;
function makePathArray(str) {
  if (Array.isArray(str)) {
    return [...str];
  }
  if (typeof str !== "string") {
    throw new Error("Path must be a string.");
  }
  return str.replace(/(^\[)|]/gm, "").replace(/\[/g, ".").replace(reLineOfOnlyDigits, intReplace).replace(reDigitsBetweenDots, `.${intReplace}.`).replace(reStartWithDigitThenDot, `${intReplace}.`).replace(reDotWithDigitsToEnd, `.${intReplace}`).replace(reMultipleDots, ".").split(".").map((d) => {
    if (d.indexOf(intPrefix) === 0) {
      return parseInt(d.substring(intPrefix.length), 10);
    }
    return d;
  });
}
function isNonEmptyArray(obj) {
  return !(Array.isArray(obj) && obj.length === 0);
}
function getAsyncValidatorArray(cause, options) {
  const { asyncDebounceMs } = options;
  const {
    onChangeAsync,
    onBlurAsync,
    onSubmitAsync,
    onBlurAsyncDebounceMs,
    onChangeAsyncDebounceMs
  } = options.validators || {};
  const defaultDebounceMs = asyncDebounceMs ?? 0;
  const changeValidator = {
    cause: "change",
    validate: onChangeAsync,
    debounceMs: onChangeAsyncDebounceMs ?? defaultDebounceMs
  };
  const blurValidator = {
    cause: "blur",
    validate: onBlurAsync,
    debounceMs: onBlurAsyncDebounceMs ?? defaultDebounceMs
  };
  const submitValidator = {
    cause: "submit",
    validate: onSubmitAsync,
    debounceMs: 0
  };
  const noopValidator = (validator) => ({ ...validator, debounceMs: 0 });
  switch (cause) {
    case "submit":
      return [
        noopValidator(changeValidator),
        noopValidator(blurValidator),
        submitValidator
      ];
    case "blur":
      return [blurValidator];
    case "change":
      return [changeValidator];
    case "server":
    default:
      return [];
  }
}
function getSyncValidatorArray(cause, options) {
  const { onChange, onBlur, onSubmit, onMount } = options.validators || {};
  const changeValidator = { cause: "change", validate: onChange };
  const blurValidator = { cause: "blur", validate: onBlur };
  const submitValidator = { cause: "submit", validate: onSubmit };
  const mountValidator = { cause: "mount", validate: onMount };
  const serverValidator = {
    cause: "server",
    validate: () => void 0
  };
  switch (cause) {
    case "mount":
      return [mountValidator];
    case "submit":
      return [
        changeValidator,
        blurValidator,
        submitValidator,
        serverValidator
      ];
    case "server":
      return [serverValidator];
    case "blur":
      return [blurValidator, serverValidator];
    case "change":
    default:
      return [changeValidator, serverValidator];
  }
}
var isGlobalFormValidationError = (error) => {
  return !!error && typeof error === "object" && "fields" in error;
};
function evaluate(objA, objB) {
  if (Object.is(objA, objB)) {
    return true;
  }
  if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
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
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) {
    return false;
  }
  for (const key of keysA) {
    if (!keysB.includes(key) || !evaluate(objA[key], objB[key])) {
      return false;
    }
  }
  return true;
}
var determineFormLevelErrorSourceAndValue = ({
  newFormValidatorError,
  isPreviousErrorFromFormValidator,
  previousErrorValue
}) => {
  if (newFormValidatorError) {
    return { newErrorValue: newFormValidatorError, newSource: "form" };
  }
  if (isPreviousErrorFromFormValidator) {
    return { newErrorValue: void 0, newSource: void 0 };
  }
  if (previousErrorValue) {
    return { newErrorValue: previousErrorValue, newSource: "field" };
  }
  return { newErrorValue: void 0, newSource: void 0 };
};
var determineFieldLevelErrorSourceAndValue = ({
  formLevelError,
  fieldLevelError
}) => {
  if (fieldLevelError) {
    return { newErrorValue: fieldLevelError, newSource: "field" };
  }
  if (formLevelError) {
    return { newErrorValue: formLevelError, newSource: "form" };
  }
  return { newErrorValue: void 0, newSource: void 0 };
};

// ../../node_modules/.deno/@tanstack+form-core@1.14.0/node_modules/@tanstack/form-core/dist/esm/standardSchemaValidator.js
function prefixSchemaToErrors(issues) {
  const schema = /* @__PURE__ */ new Map();
  for (const issue of issues) {
    const path = [...issue.path ?? []].map((segment) => {
      const normalizedSegment = typeof segment === "object" ? segment.key : segment;
      return typeof normalizedSegment === "number" ? `[${normalizedSegment}]` : normalizedSegment;
    }).join(".").replace(/\.\[/g, "[");
    schema.set(path, (schema.get(path) ?? []).concat(issue));
  }
  return Object.fromEntries(schema);
}
var transformFormIssues = (issues) => {
  const schemaErrors = prefixSchemaToErrors(issues);
  return {
    form: schemaErrors,
    fields: schemaErrors
  };
};
var standardSchemaValidators = {
  validate({
    value,
    validationSource
  }, schema) {
    const result = schema["~standard"].validate(value);
    if (result instanceof Promise) {
      throw new Error("async function passed to sync validator");
    }
    if (!result.issues) return;
    if (validationSource === "field")
      return result.issues;
    return transformFormIssues(result.issues);
  },
  async validateAsync({
    value,
    validationSource
  }, schema) {
    const result = await schema["~standard"].validate(value);
    if (!result.issues) return;
    if (validationSource === "field")
      return result.issues;
    return transformFormIssues(result.issues);
  }
};
var isStandardSchemaValidator = (validator) => !!validator && "~standard" in validator;

// ../../node_modules/.deno/@tanstack+form-core@1.14.0/node_modules/@tanstack/form-core/dist/esm/metaHelper.js
var defaultFieldMeta = {
  isValidating: false,
  isTouched: false,
  isBlurred: false,
  isDirty: false,
  isPristine: true,
  isValid: true,
  isDefaultValue: true,
  errors: [],
  errorMap: {},
  errorSourceMap: {}
};
function metaHelper(formApi) {
  function handleArrayFieldMetaShift(field, index, mode, secondIndex) {
    const affectedFields = getAffectedFields(field, index, mode, secondIndex);
    const handlers = {
      insert: () => handleInsertMode(affectedFields, field, index),
      remove: () => handleRemoveMode(affectedFields),
      swap: () => secondIndex !== void 0 && handleSwapMode(affectedFields, field, index, secondIndex),
      move: () => secondIndex !== void 0 && handleMoveMode(affectedFields, field, index, secondIndex)
    };
    handlers[mode]();
  }
  function getFieldPath(field, index) {
    return `${field}[${index}]`;
  }
  function getAffectedFields(field, index, mode, secondIndex) {
    const affectedFieldKeys = [getFieldPath(field, index)];
    if (mode === "swap") {
      affectedFieldKeys.push(getFieldPath(field, secondIndex));
    } else if (mode === "move") {
      const [startIndex, endIndex] = [
        Math.min(index, secondIndex),
        Math.max(index, secondIndex)
      ];
      for (let i = startIndex; i <= endIndex; i++) {
        affectedFieldKeys.push(getFieldPath(field, i));
      }
    } else {
      const currentValue = formApi.getFieldValue(field);
      const fieldItems = Array.isArray(currentValue) ? currentValue.length : 0;
      for (let i = index + 1; i < fieldItems; i++) {
        affectedFieldKeys.push(getFieldPath(field, i));
      }
    }
    return Object.keys(formApi.fieldInfo).filter(
      (fieldKey) => affectedFieldKeys.some((key) => fieldKey.startsWith(key))
    );
  }
  function updateIndex(fieldKey, direction) {
    return fieldKey.replace(/\[(\d+)\]/, (_, num) => {
      const currIndex = parseInt(num, 10);
      const newIndex = direction === "up" ? currIndex + 1 : Math.max(0, currIndex - 1);
      return `[${newIndex}]`;
    });
  }
  function shiftMeta(fields, direction) {
    const sortedFields = direction === "up" ? fields : [...fields].reverse();
    sortedFields.forEach((fieldKey) => {
      const nextFieldKey = updateIndex(fieldKey.toString(), direction);
      const nextFieldMeta = formApi.getFieldMeta(nextFieldKey);
      if (nextFieldMeta) {
        formApi.setFieldMeta(fieldKey, nextFieldMeta);
      } else {
        formApi.setFieldMeta(fieldKey, getEmptyFieldMeta());
      }
    });
  }
  const getEmptyFieldMeta = () => defaultFieldMeta;
  const handleInsertMode = (fields, field, insertIndex) => {
    shiftMeta(fields, "down");
    fields.forEach((fieldKey) => {
      if (fieldKey.toString().startsWith(getFieldPath(field, insertIndex))) {
        formApi.setFieldMeta(fieldKey, getEmptyFieldMeta());
      }
    });
  };
  const handleRemoveMode = (fields) => {
    shiftMeta(fields, "up");
  };
  const handleMoveMode = (fields, field, fromIndex, toIndex) => {
    const fromFields = new Map(
      Object.keys(formApi.fieldInfo).filter(
        (fieldKey) => fieldKey.startsWith(getFieldPath(field, fromIndex))
      ).map((fieldKey) => [
        fieldKey,
        formApi.getFieldMeta(fieldKey)
      ])
    );
    shiftMeta(fields, fromIndex < toIndex ? "up" : "down");
    Object.keys(formApi.fieldInfo).filter((fieldKey) => fieldKey.startsWith(getFieldPath(field, toIndex))).forEach((fieldKey) => {
      const fromKey = fieldKey.replace(
        getFieldPath(field, toIndex),
        getFieldPath(field, fromIndex)
      );
      const fromMeta = fromFields.get(fromKey);
      if (fromMeta) {
        formApi.setFieldMeta(fieldKey, fromMeta);
      }
    });
  };
  const handleSwapMode = (fields, field, index, secondIndex) => {
    fields.forEach((fieldKey) => {
      if (!fieldKey.toString().startsWith(getFieldPath(field, index))) return;
      const swappedKey = fieldKey.toString().replace(
        getFieldPath(field, index),
        getFieldPath(field, secondIndex)
      );
      const [meta1, meta2] = [
        formApi.getFieldMeta(fieldKey),
        formApi.getFieldMeta(swappedKey)
      ];
      if (meta1) formApi.setFieldMeta(swappedKey, meta1);
      if (meta2) formApi.setFieldMeta(fieldKey, meta2);
    });
  };
  return { handleArrayFieldMetaShift };
}

// ../../node_modules/.deno/@tanstack+form-core@1.14.0/node_modules/@tanstack/form-core/dist/esm/FormApi.js
function getDefaultFormState(defaultState) {
  return {
    values: defaultState.values ?? {},
    errorMap: defaultState.errorMap ?? {},
    fieldMetaBase: defaultState.fieldMetaBase ?? {},
    isSubmitted: defaultState.isSubmitted ?? false,
    isSubmitting: defaultState.isSubmitting ?? false,
    isValidating: defaultState.isValidating ?? false,
    submissionAttempts: defaultState.submissionAttempts ?? 0,
    isSubmitSuccessful: defaultState.isSubmitSuccessful ?? false,
    validationMetaMap: defaultState.validationMetaMap ?? {
      onChange: void 0,
      onBlur: void 0,
      onSubmit: void 0,
      onMount: void 0,
      onServer: void 0
    }
  };
}
var FormApi = class {
  /**
   * Constructs a new `FormApi` instance with the given form options.
   */
  constructor(opts) {
    var _a;
    this.options = {};
    this.fieldInfo = {};
    this.prevTransformArray = [];
    this.mount = () => {
      var _a2, _b;
      const cleanupFieldMetaDerived = this.fieldMetaDerived.mount();
      const cleanupStoreDerived = this.store.mount();
      const cleanup = () => {
        cleanupFieldMetaDerived();
        cleanupStoreDerived();
      };
      (_b = (_a2 = this.options.listeners) == null ? void 0 : _a2.onMount) == null ? void 0 : _b.call(_a2, { formApi: this });
      const { onMount } = this.options.validators || {};
      if (!onMount) return cleanup;
      this.validateSync("mount");
      return cleanup;
    };
    this.update = (options) => {
      var _a2, _b;
      if (!options) return;
      const oldOptions = this.options;
      this.options = options;
      const shouldUpdateReeval = !!((_b = (_a2 = options.transform) == null ? void 0 : _a2.deps) == null ? void 0 : _b.some(
        (val, i) => val !== this.prevTransformArray[i]
      ));
      const shouldUpdateValues = options.defaultValues && !evaluate(options.defaultValues, oldOptions.defaultValues) && !this.state.isTouched;
      const shouldUpdateState = !evaluate(options.defaultState, oldOptions.defaultState) && !this.state.isTouched;
      if (!shouldUpdateValues && !shouldUpdateState && !shouldUpdateReeval) return;
      batch(() => {
        this.baseStore.setState(
          () => getDefaultFormState(
            Object.assign(
              {},
              this.state,
              shouldUpdateState ? options.defaultState : {},
              shouldUpdateValues ? {
                values: options.defaultValues
              } : {},
              shouldUpdateReeval ? { _force_re_eval: !this.state._force_re_eval } : {}
            )
          )
        );
      });
    };
    this.reset = (values, opts2) => {
      const { fieldMeta: currentFieldMeta } = this.state;
      const fieldMetaBase = this.resetFieldMeta(currentFieldMeta);
      if (values && !(opts2 == null ? void 0 : opts2.keepDefaultValues)) {
        this.options = {
          ...this.options,
          defaultValues: values
        };
      }
      this.baseStore.setState(
        () => {
          var _a2;
          return getDefaultFormState({
            ...this.options.defaultState,
            values: values ?? this.options.defaultValues ?? ((_a2 = this.options.defaultState) == null ? void 0 : _a2.values),
            fieldMetaBase
          });
        }
      );
    };
    this.validateAllFields = async (cause) => {
      const fieldValidationPromises = [];
      batch(() => {
        void Object.values(this.fieldInfo).forEach(
          (field) => {
            if (!field.instance) return;
            const fieldInstance = field.instance;
            fieldValidationPromises.push(
              // Remember, `validate` is either a sync operation or a promise
              Promise.resolve().then(
                () => fieldInstance.validate(cause, { skipFormValidation: true })
              )
            );
            if (!field.instance.state.meta.isTouched) {
              field.instance.setMeta((prev) => ({ ...prev, isTouched: true }));
            }
          }
        );
      });
      const fieldErrorMapMap = await Promise.all(fieldValidationPromises);
      return fieldErrorMapMap.flat();
    };
    this.validateArrayFieldsStartingFrom = async (field, index, cause) => {
      const currentValue = this.getFieldValue(field);
      const lastIndex = Array.isArray(currentValue) ? Math.max(currentValue.length - 1, 0) : null;
      const fieldKeysToValidate = [`${field}[${index}]`];
      for (let i = index + 1; i <= (lastIndex ?? 0); i++) {
        fieldKeysToValidate.push(`${field}[${i}]`);
      }
      const fieldsToValidate = Object.keys(this.fieldInfo).filter(
        (fieldKey) => fieldKeysToValidate.some((key) => fieldKey.startsWith(key))
      );
      const fieldValidationPromises = [];
      batch(() => {
        fieldsToValidate.forEach((nestedField) => {
          fieldValidationPromises.push(
            Promise.resolve().then(() => this.validateField(nestedField, cause))
          );
        });
      });
      const fieldErrorMapMap = await Promise.all(fieldValidationPromises);
      return fieldErrorMapMap.flat();
    };
    this.validateField = (field, cause) => {
      var _a2;
      const fieldInstance = (_a2 = this.fieldInfo[field]) == null ? void 0 : _a2.instance;
      if (!fieldInstance) return [];
      if (!fieldInstance.state.meta.isTouched) {
        fieldInstance.setMeta((prev) => ({ ...prev, isTouched: true }));
      }
      return fieldInstance.validate(cause);
    };
    this.validateSync = (cause) => {
      const validates = getSyncValidatorArray(cause, this.options);
      let hasErrored = false;
      const currentValidationErrorMap = {};
      batch(() => {
        var _a2, _b;
        for (const validateObj of validates) {
          if (!validateObj.validate) continue;
          const rawError = this.runValidator({
            validate: validateObj.validate,
            value: {
              value: this.state.values,
              formApi: this,
              validationSource: "form"
            },
            type: "validate"
          });
          const { formError, fieldErrors } = normalizeError(rawError);
          const errorMapKey = getErrorMapKey(validateObj.cause);
          for (const field of Object.keys(
            this.state.fieldMeta
          )) {
            const fieldMeta = this.getFieldMeta(field);
            if (!fieldMeta) continue;
            const {
              errorMap: currentErrorMap,
              errorSourceMap: currentErrorMapSource
            } = fieldMeta;
            const newFormValidatorError = fieldErrors == null ? void 0 : fieldErrors[field];
            const { newErrorValue, newSource } = determineFormLevelErrorSourceAndValue({
              newFormValidatorError,
              isPreviousErrorFromFormValidator: (
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                (currentErrorMapSource == null ? void 0 : currentErrorMapSource[errorMapKey]) === "form"
              ),
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              previousErrorValue: currentErrorMap == null ? void 0 : currentErrorMap[errorMapKey]
            });
            if (newSource === "form") {
              currentValidationErrorMap[field] = {
                ...currentValidationErrorMap[field],
                [errorMapKey]: newFormValidatorError
              };
            }
            if (
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              (currentErrorMap == null ? void 0 : currentErrorMap[errorMapKey]) !== newErrorValue
            ) {
              this.setFieldMeta(field, (prev) => ({
                ...prev,
                errorMap: {
                  ...prev.errorMap,
                  [errorMapKey]: newErrorValue
                },
                errorSourceMap: {
                  ...prev.errorSourceMap,
                  [errorMapKey]: newSource
                }
              }));
            }
          }
          if (((_a2 = this.state.errorMap) == null ? void 0 : _a2[errorMapKey]) !== formError) {
            this.baseStore.setState((prev) => ({
              ...prev,
              errorMap: {
                ...prev.errorMap,
                [errorMapKey]: formError
              }
            }));
          }
          if (formError || fieldErrors) {
            hasErrored = true;
          }
        }
        const submitErrKey = getErrorMapKey("submit");
        if (
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          ((_b = this.state.errorMap) == null ? void 0 : _b[submitErrKey]) && cause !== "submit" && !hasErrored
        ) {
          this.baseStore.setState((prev) => ({
            ...prev,
            errorMap: {
              ...prev.errorMap,
              [submitErrKey]: void 0
            }
          }));
        }
      });
      return { hasErrored, fieldsErrorMap: currentValidationErrorMap };
    };
    this.validateAsync = async (cause) => {
      const validates = getAsyncValidatorArray(cause, this.options);
      if (!this.state.isFormValidating) {
        this.baseStore.setState((prev) => ({ ...prev, isFormValidating: true }));
      }
      const promises = [];
      let fieldErrorsFromFormValidators;
      for (const validateObj of validates) {
        if (!validateObj.validate) continue;
        const key = getErrorMapKey(validateObj.cause);
        const fieldValidatorMeta = this.state.validationMetaMap[key];
        fieldValidatorMeta == null ? void 0 : fieldValidatorMeta.lastAbortController.abort();
        const controller = new AbortController();
        this.state.validationMetaMap[key] = {
          lastAbortController: controller
        };
        promises.push(
          new Promise(async (resolve) => {
            let rawError;
            try {
              rawError = await new Promise((rawResolve, rawReject) => {
                setTimeout(async () => {
                  if (controller.signal.aborted) return rawResolve(void 0);
                  try {
                    rawResolve(
                      await this.runValidator({
                        validate: validateObj.validate,
                        value: {
                          value: this.state.values,
                          formApi: this,
                          validationSource: "form",
                          signal: controller.signal
                        },
                        type: "validateAsync"
                      })
                    );
                  } catch (e) {
                    rawReject(e);
                  }
                }, validateObj.debounceMs);
              });
            } catch (e) {
              rawError = e;
            }
            const { formError, fieldErrors: fieldErrorsFromNormalizeError } = normalizeError(rawError);
            if (fieldErrorsFromNormalizeError) {
              fieldErrorsFromFormValidators = fieldErrorsFromFormValidators ? {
                ...fieldErrorsFromFormValidators,
                ...fieldErrorsFromNormalizeError
              } : fieldErrorsFromNormalizeError;
            }
            const errorMapKey = getErrorMapKey(validateObj.cause);
            for (const field of Object.keys(
              this.state.fieldMeta
            )) {
              const fieldMeta = this.getFieldMeta(field);
              if (!fieldMeta) continue;
              const {
                errorMap: currentErrorMap,
                errorSourceMap: currentErrorMapSource
              } = fieldMeta;
              const newFormValidatorError = fieldErrorsFromFormValidators == null ? void 0 : fieldErrorsFromFormValidators[field];
              const { newErrorValue, newSource } = determineFormLevelErrorSourceAndValue({
                newFormValidatorError,
                isPreviousErrorFromFormValidator: (
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  (currentErrorMapSource == null ? void 0 : currentErrorMapSource[errorMapKey]) === "form"
                ),
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                previousErrorValue: currentErrorMap == null ? void 0 : currentErrorMap[errorMapKey]
              });
              if (
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                (currentErrorMap == null ? void 0 : currentErrorMap[errorMapKey]) !== newErrorValue
              ) {
                this.setFieldMeta(field, (prev) => ({
                  ...prev,
                  errorMap: {
                    ...prev.errorMap,
                    [errorMapKey]: newErrorValue
                  },
                  errorSourceMap: {
                    ...prev.errorSourceMap,
                    [errorMapKey]: newSource
                  }
                }));
              }
            }
            this.baseStore.setState((prev) => ({
              ...prev,
              errorMap: {
                ...prev.errorMap,
                [errorMapKey]: formError
              }
            }));
            resolve(
              fieldErrorsFromFormValidators ? { fieldErrors: fieldErrorsFromFormValidators, errorMapKey } : void 0
            );
          })
        );
      }
      let results = [];
      const fieldsErrorMap = {};
      if (promises.length) {
        results = await Promise.all(promises);
        for (const fieldValidationResult of results) {
          if (fieldValidationResult == null ? void 0 : fieldValidationResult.fieldErrors) {
            const { errorMapKey } = fieldValidationResult;
            for (const [field, fieldError] of Object.entries(
              fieldValidationResult.fieldErrors
            )) {
              const oldErrorMap = fieldsErrorMap[field] || {};
              const newErrorMap = {
                ...oldErrorMap,
                [errorMapKey]: fieldError
              };
              fieldsErrorMap[field] = newErrorMap;
            }
          }
        }
      }
      this.baseStore.setState((prev) => ({
        ...prev,
        isFormValidating: false
      }));
      return fieldsErrorMap;
    };
    this.validate = (cause) => {
      const { hasErrored, fieldsErrorMap } = this.validateSync(cause);
      if (hasErrored && !this.options.asyncAlways) {
        return fieldsErrorMap;
      }
      return this.validateAsync(cause);
    };
    this.getFieldValue = (field) => getBy(this.state.values, field);
    this.getFieldMeta = (field) => {
      return this.state.fieldMeta[field];
    };
    this.getFieldInfo = (field) => {
      var _a2;
      return (_a2 = this.fieldInfo)[field] || (_a2[field] = {
        instance: null,
        validationMetaMap: {
          onChange: void 0,
          onBlur: void 0,
          onSubmit: void 0,
          onMount: void 0,
          onServer: void 0
        }
      });
    };
    this.setFieldMeta = (field, updater) => {
      this.baseStore.setState((prev) => {
        return {
          ...prev,
          fieldMetaBase: {
            ...prev.fieldMetaBase,
            [field]: functionalUpdate(
              updater,
              prev.fieldMetaBase[field]
            )
          }
        };
      });
    };
    this.resetFieldMeta = (fieldMeta) => {
      return Object.keys(fieldMeta).reduce(
        (acc, key) => {
          const fieldKey = key;
          acc[fieldKey] = defaultFieldMeta;
          return acc;
        },
        {}
      );
    };
    this.setFieldValue = (field, updater, opts2) => {
      const dontUpdateMeta = (opts2 == null ? void 0 : opts2.dontUpdateMeta) ?? false;
      batch(() => {
        if (!dontUpdateMeta) {
          this.setFieldMeta(field, (prev) => ({
            ...prev,
            isTouched: true,
            isDirty: true,
            errorMap: {
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              ...prev == null ? void 0 : prev.errorMap,
              onMount: void 0
            }
          }));
        }
        this.baseStore.setState((prev) => {
          return {
            ...prev,
            values: setBy(prev.values, field, updater)
          };
        });
      });
    };
    this.deleteField = (field) => {
      const subFieldsToDelete = Object.keys(this.fieldInfo).filter((f) => {
        const fieldStr = field.toString();
        return f !== fieldStr && f.startsWith(fieldStr);
      });
      const fieldsToDelete = [...subFieldsToDelete, field];
      this.baseStore.setState((prev) => {
        const newState = { ...prev };
        fieldsToDelete.forEach((f) => {
          newState.values = deleteBy(newState.values, f);
          delete this.fieldInfo[f];
          delete newState.fieldMetaBase[f];
        });
        return newState;
      });
    };
    this.pushFieldValue = (field, value, opts2) => {
      this.setFieldValue(
        field,
        (prev) => [...Array.isArray(prev) ? prev : [], value],
        opts2
      );
      this.validateField(field, "change");
    };
    this.insertFieldValue = async (field, index, value, opts2) => {
      this.setFieldValue(
        field,
        (prev) => {
          return [
            ...prev.slice(0, index),
            value,
            ...prev.slice(index)
          ];
        },
        opts2
      );
      await this.validateField(field, "change");
      metaHelper(this).handleArrayFieldMetaShift(field, index, "insert");
      await this.validateArrayFieldsStartingFrom(field, index, "change");
    };
    this.replaceFieldValue = async (field, index, value, opts2) => {
      this.setFieldValue(
        field,
        (prev) => {
          return prev.map(
            (d, i) => i === index ? value : d
          );
        },
        opts2
      );
      await this.validateField(field, "change");
      await this.validateArrayFieldsStartingFrom(field, index, "change");
    };
    this.removeFieldValue = async (field, index, opts2) => {
      const fieldValue = this.getFieldValue(field);
      const lastIndex = Array.isArray(fieldValue) ? Math.max(fieldValue.length - 1, 0) : null;
      this.setFieldValue(
        field,
        (prev) => {
          return prev.filter(
            (_d, i) => i !== index
          );
        },
        opts2
      );
      metaHelper(this).handleArrayFieldMetaShift(field, index, "remove");
      if (lastIndex !== null) {
        const start = `${field}[${lastIndex}]`;
        this.deleteField(start);
      }
      await this.validateField(field, "change");
      await this.validateArrayFieldsStartingFrom(field, index, "change");
    };
    this.swapFieldValues = (field, index1, index2, opts2) => {
      this.setFieldValue(
        field,
        (prev) => {
          const prev1 = prev[index1];
          const prev2 = prev[index2];
          return setBy(setBy(prev, `${index1}`, prev2), `${index2}`, prev1);
        },
        opts2
      );
      metaHelper(this).handleArrayFieldMetaShift(field, index1, "swap", index2);
      this.validateField(field, "change");
      this.validateField(`${field}[${index1}]`, "change");
      this.validateField(`${field}[${index2}]`, "change");
    };
    this.moveFieldValues = (field, index1, index2, opts2) => {
      this.setFieldValue(
        field,
        (prev) => {
          const next = [...prev];
          next.splice(index2, 0, next.splice(index1, 1)[0]);
          return next;
        },
        opts2
      );
      metaHelper(this).handleArrayFieldMetaShift(field, index1, "move", index2);
      this.validateField(field, "change");
      this.validateField(`${field}[${index1}]`, "change");
      this.validateField(`${field}[${index2}]`, "change");
    };
    this.clearFieldValues = (field, opts2) => {
      const fieldValue = this.getFieldValue(field);
      const lastIndex = Array.isArray(fieldValue) ? Math.max(fieldValue.length - 1, 0) : null;
      this.setFieldValue(field, [], opts2);
      if (lastIndex !== null) {
        for (let i = 0; i <= lastIndex; i++) {
          const fieldKey = `${field}[${i}]`;
          this.deleteField(fieldKey);
        }
      }
      this.validateField(field, "change");
    };
    this.resetField = (field) => {
      this.baseStore.setState((prev) => {
        return {
          ...prev,
          fieldMetaBase: {
            ...prev.fieldMetaBase,
            [field]: defaultFieldMeta
          },
          values: this.options.defaultValues ? setBy(prev.values, field, getBy(this.options.defaultValues, field)) : prev.values
        };
      });
    };
    this.getAllErrors = () => {
      return {
        form: {
          errors: this.state.errors,
          errorMap: this.state.errorMap
        },
        fields: Object.entries(this.state.fieldMeta).reduce(
          (acc, [fieldName, fieldMeta]) => {
            if (Object.keys(fieldMeta).length && fieldMeta.errors.length) {
              acc[fieldName] = {
                errors: fieldMeta.errors,
                errorMap: fieldMeta.errorMap
              };
            }
            return acc;
          },
          {}
        )
      };
    };
    this.parseValuesWithSchema = (schema) => {
      return standardSchemaValidators.validate(
        { value: this.state.values, validationSource: "form" },
        schema
      );
    };
    this.parseValuesWithSchemaAsync = (schema) => {
      return standardSchemaValidators.validateAsync(
        { value: this.state.values, validationSource: "form" },
        schema
      );
    };
    this.baseStore = new Store(
      getDefaultFormState({
        ...opts == null ? void 0 : opts.defaultState,
        values: (opts == null ? void 0 : opts.defaultValues) ?? ((_a = opts == null ? void 0 : opts.defaultState) == null ? void 0 : _a.values)
      })
    );
    this.fieldMetaDerived = new Derived({
      deps: [this.baseStore],
      fn: ({ prevDepVals, currDepVals, prevVal: _prevVal }) => {
        var _a2, _b, _c;
        const prevVal = _prevVal;
        const prevBaseStore = prevDepVals == null ? void 0 : prevDepVals[0];
        const currBaseStore = currDepVals[0];
        let originalMetaCount = 0;
        const fieldMeta = {};
        for (const fieldName of Object.keys(
          currBaseStore.fieldMetaBase
        )) {
          const currBaseMeta = currBaseStore.fieldMetaBase[fieldName];
          const prevBaseMeta = prevBaseStore == null ? void 0 : prevBaseStore.fieldMetaBase[fieldName];
          const prevFieldInfo = prevVal == null ? void 0 : prevVal[fieldName];
          const curFieldVal = getBy(currBaseStore.values, fieldName);
          let fieldErrors = prevFieldInfo == null ? void 0 : prevFieldInfo.errors;
          if (!prevBaseMeta || currBaseMeta.errorMap !== prevBaseMeta.errorMap) {
            fieldErrors = Object.values(currBaseMeta.errorMap ?? {}).filter(
              (val) => val !== void 0
            );
            const fieldInstance = (_a2 = this.getFieldInfo(fieldName)) == null ? void 0 : _a2.instance;
            if (fieldInstance && !fieldInstance.options.disableErrorFlat) {
              fieldErrors = fieldErrors == null ? void 0 : fieldErrors.flat(
                1
              );
            }
          }
          const isFieldValid = !isNonEmptyArray(fieldErrors ?? []);
          const isFieldPristine = !currBaseMeta.isDirty;
          const isDefaultValue = evaluate(
            curFieldVal,
            getBy(this.options.defaultValues, fieldName)
          ) || evaluate(
            curFieldVal,
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            (_c = (_b = this.getFieldInfo(fieldName)) == null ? void 0 : _b.instance) == null ? void 0 : _c.options.defaultValue
          );
          if (prevFieldInfo && prevFieldInfo.isPristine === isFieldPristine && prevFieldInfo.isValid === isFieldValid && prevFieldInfo.isDefaultValue === isDefaultValue && prevFieldInfo.errors === fieldErrors && currBaseMeta === prevBaseMeta) {
            fieldMeta[fieldName] = prevFieldInfo;
            originalMetaCount++;
            continue;
          }
          fieldMeta[fieldName] = {
            ...currBaseMeta,
            errors: fieldErrors,
            isPristine: isFieldPristine,
            isValid: isFieldValid,
            isDefaultValue
          };
        }
        if (!Object.keys(currBaseStore.fieldMetaBase).length) return fieldMeta;
        if (prevVal && originalMetaCount === Object.keys(currBaseStore.fieldMetaBase).length) {
          return prevVal;
        }
        return fieldMeta;
      }
    });
    this.store = new Derived({
      deps: [this.baseStore, this.fieldMetaDerived],
      fn: ({ prevDepVals, currDepVals, prevVal: _prevVal }) => {
        var _a2, _b, _c, _d;
        const prevVal = _prevVal;
        const prevBaseStore = prevDepVals == null ? void 0 : prevDepVals[0];
        const currBaseStore = currDepVals[0];
        const currFieldMeta = currDepVals[1];
        const fieldMetaValues = Object.values(currFieldMeta).filter(
          Boolean
        );
        const isFieldsValidating = fieldMetaValues.some(
          (field) => field.isValidating
        );
        const isFieldsValid = fieldMetaValues.every((field) => field.isValid);
        const isTouched = fieldMetaValues.some((field) => field.isTouched);
        const isBlurred = fieldMetaValues.some((field) => field.isBlurred);
        const isDefaultValue = fieldMetaValues.every(
          (field) => field.isDefaultValue
        );
        const shouldInvalidateOnMount = (
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          isTouched && ((_a2 = currBaseStore.errorMap) == null ? void 0 : _a2.onMount)
        );
        const isDirty = fieldMetaValues.some((field) => field.isDirty);
        const isPristine = !isDirty;
        const hasOnMountError = Boolean(
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          ((_b = currBaseStore.errorMap) == null ? void 0 : _b.onMount) || // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          fieldMetaValues.some((f) => {
            var _a3;
            return (_a3 = f == null ? void 0 : f.errorMap) == null ? void 0 : _a3.onMount;
          })
        );
        const isValidating = !!isFieldsValidating;
        let errors = (prevVal == null ? void 0 : prevVal.errors) ?? [];
        if (!prevBaseStore || currBaseStore.errorMap !== prevBaseStore.errorMap) {
          errors = Object.values(currBaseStore.errorMap).reduce((prev, curr) => {
            if (curr === void 0) return prev;
            if (curr && isGlobalFormValidationError(curr)) {
              prev.push(curr.form);
              return prev;
            }
            prev.push(curr);
            return prev;
          }, []);
        }
        const isFormValid = errors.length === 0;
        const isValid = isFieldsValid && isFormValid;
        const submitInvalid = this.options.canSubmitWhenInvalid ?? false;
        const canSubmit = currBaseStore.submissionAttempts === 0 && !isTouched && !hasOnMountError || !isValidating && !currBaseStore.isSubmitting && isValid || submitInvalid;
        let errorMap = currBaseStore.errorMap;
        if (shouldInvalidateOnMount) {
          errors = errors.filter(
            (err) => err !== currBaseStore.errorMap.onMount
          );
          errorMap = Object.assign(errorMap, { onMount: void 0 });
        }
        if (prevVal && prevBaseStore && prevVal.errorMap === errorMap && prevVal.fieldMeta === this.fieldMetaDerived.state && prevVal.errors === errors && prevVal.isFieldsValidating === isFieldsValidating && prevVal.isFieldsValid === isFieldsValid && prevVal.isFormValid === isFormValid && prevVal.isValid === isValid && prevVal.canSubmit === canSubmit && prevVal.isTouched === isTouched && prevVal.isBlurred === isBlurred && prevVal.isPristine === isPristine && prevVal.isDefaultValue === isDefaultValue && prevVal.isDirty === isDirty && evaluate(prevBaseStore, currBaseStore)) {
          return prevVal;
        }
        let state = {
          ...currBaseStore,
          errorMap,
          fieldMeta: this.fieldMetaDerived.state,
          errors,
          isFieldsValidating,
          isFieldsValid,
          isFormValid,
          isValid,
          canSubmit,
          isTouched,
          isBlurred,
          isPristine,
          isDefaultValue,
          isDirty
        };
        const transformArray = ((_c = this.options.transform) == null ? void 0 : _c.deps) ?? [];
        const shouldTransform = transformArray.length !== this.prevTransformArray.length || transformArray.some((val, i) => val !== this.prevTransformArray[i]);
        if (shouldTransform) {
          const newObj = Object.assign({}, this, { state });
          (_d = this.options.transform) == null ? void 0 : _d.fn(newObj);
          state = newObj.state;
          this.prevTransformArray = transformArray;
        }
        return state;
      }
    });
    this.handleSubmit = this.handleSubmit.bind(this);
    this.update(opts || {});
  }
  get state() {
    return this.store.state;
  }
  /**
   * @private
   */
  runValidator(props) {
    if (isStandardSchemaValidator(props.validate)) {
      return standardSchemaValidators[props.type](
        props.value,
        props.validate
      );
    }
    return props.validate(props.value);
  }
  async handleSubmit(submitMeta) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    this.baseStore.setState((old) => ({
      ...old,
      // Submission attempts mark the form as not submitted
      isSubmitted: false,
      // Count submission attempts
      submissionAttempts: old.submissionAttempts + 1,
      isSubmitSuccessful: false
      // Reset isSubmitSuccessful at the start of submission
    }));
    batch(() => {
      void Object.values(this.fieldInfo).forEach(
        (field) => {
          if (!field.instance) return;
          if (!field.instance.state.meta.isTouched) {
            field.instance.setMeta((prev) => ({ ...prev, isTouched: true }));
          }
        }
      );
    });
    if (!this.state.canSubmit) return;
    this.baseStore.setState((d) => ({ ...d, isSubmitting: true }));
    const done = () => {
      this.baseStore.setState((prev) => ({ ...prev, isSubmitting: false }));
    };
    await this.validateAllFields("submit");
    if (!this.state.isFieldsValid) {
      done();
      (_b = (_a = this.options).onSubmitInvalid) == null ? void 0 : _b.call(_a, {
        value: this.state.values,
        formApi: this
      });
      return;
    }
    await this.validate("submit");
    if (!this.state.isValid) {
      done();
      (_d = (_c = this.options).onSubmitInvalid) == null ? void 0 : _d.call(_c, {
        value: this.state.values,
        formApi: this
      });
      return;
    }
    batch(() => {
      void Object.values(this.fieldInfo).forEach(
        (field) => {
          var _a2, _b2, _c2;
          (_c2 = (_b2 = (_a2 = field.instance) == null ? void 0 : _a2.options.listeners) == null ? void 0 : _b2.onSubmit) == null ? void 0 : _c2.call(_b2, {
            value: field.instance.state.value,
            fieldApi: field.instance
          });
        }
      );
    });
    (_f = (_e = this.options.listeners) == null ? void 0 : _e.onSubmit) == null ? void 0 : _f.call(_e, { formApi: this });
    try {
      await ((_h = (_g = this.options).onSubmit) == null ? void 0 : _h.call(_g, {
        value: this.state.values,
        formApi: this,
        meta: submitMeta ?? this.options.onSubmitMeta
      }));
      batch(() => {
        this.baseStore.setState((prev) => ({
          ...prev,
          isSubmitted: true,
          isSubmitSuccessful: true
          // Set isSubmitSuccessful to true on successful submission
        }));
        done();
      });
    } catch (err) {
      this.baseStore.setState((prev) => ({
        ...prev,
        isSubmitSuccessful: false
        // Ensure isSubmitSuccessful is false if an error occurs
      }));
      done();
      throw err;
    }
  }
  /**
   * Updates the form's errorMap
   */
  setErrorMap(errorMap) {
    batch(() => {
      Object.entries(errorMap).forEach(([key, value]) => {
        const errorMapKey = key;
        if (isGlobalFormValidationError(value)) {
          const { formError, fieldErrors } = normalizeError(value);
          for (const fieldName of Object.keys(
            this.fieldInfo
          )) {
            const fieldMeta = this.getFieldMeta(fieldName);
            if (!fieldMeta) continue;
            this.setFieldMeta(fieldName, (prev) => ({
              ...prev,
              errorMap: {
                ...prev.errorMap,
                [errorMapKey]: fieldErrors == null ? void 0 : fieldErrors[fieldName]
              },
              errorSourceMap: {
                ...prev.errorSourceMap,
                [errorMapKey]: "form"
              }
            }));
          }
          this.baseStore.setState((prev) => ({
            ...prev,
            errorMap: {
              ...prev.errorMap,
              [errorMapKey]: formError
            }
          }));
        } else {
          this.baseStore.setState((prev) => ({
            ...prev,
            errorMap: {
              ...prev.errorMap,
              [errorMapKey]: value
            }
          }));
        }
      });
    });
  }
};
function normalizeError(rawError) {
  if (rawError) {
    if (isGlobalFormValidationError(rawError)) {
      const formError = normalizeError(rawError.form).formError;
      const fieldErrors = rawError.fields;
      return { formError, fieldErrors };
    }
    return { formError: rawError };
  }
  return { formError: void 0 };
}
function getErrorMapKey(cause) {
  switch (cause) {
    case "submit":
      return "onSubmit";
    case "blur":
      return "onBlur";
    case "mount":
      return "onMount";
    case "server":
      return "onServer";
    case "change":
    default:
      return "onChange";
  }
}

// ../../node_modules/.deno/@tanstack+form-core@1.14.0/node_modules/@tanstack/form-core/dist/esm/FieldApi.js
var FieldApi = class {
  /**
   * Initializes a new `FieldApi` instance.
   */
  constructor(opts) {
    this.options = {};
    this.mount = () => {
      var _a, _b;
      const cleanup = this.store.mount();
      if (this.options.defaultValue !== void 0) {
        this.form.setFieldValue(this.name, this.options.defaultValue, {
          dontUpdateMeta: true
        });
      }
      const info = this.getInfo();
      info.instance = this;
      this.update(this.options);
      const { onMount } = this.options.validators || {};
      if (onMount) {
        const error = this.runValidator({
          validate: onMount,
          value: {
            value: this.state.value,
            fieldApi: this,
            validationSource: "field"
          },
          type: "validate"
        });
        if (error) {
          this.setMeta(
            (prev) => ({
              ...prev,
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              errorMap: { ...prev == null ? void 0 : prev.errorMap, onMount: error },
              errorSourceMap: {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                ...prev == null ? void 0 : prev.errorSourceMap,
                onMount: "field"
              }
            })
          );
        }
      }
      (_b = (_a = this.options.listeners) == null ? void 0 : _a.onMount) == null ? void 0 : _b.call(_a, {
        value: this.state.value,
        fieldApi: this
      });
      return cleanup;
    };
    this.update = (opts2) => {
      this.options = opts2;
      const nameHasChanged = this.name !== opts2.name;
      this.name = opts2.name;
      if (this.state.value === void 0) {
        const formDefault = getBy(opts2.form.options.defaultValues, opts2.name);
        const defaultValue = opts2.defaultValue ?? formDefault;
        if (nameHasChanged) {
          this.setValue((val) => val || defaultValue, {
            dontUpdateMeta: true
          });
        } else if (defaultValue !== void 0) {
          this.setValue(defaultValue, {
            dontUpdateMeta: true
          });
        }
      }
      if (this.form.getFieldMeta(this.name) === void 0) {
        this.setMeta(this.state.meta);
      }
    };
    this.getValue = () => {
      return this.form.getFieldValue(this.name);
    };
    this.setValue = (updater, options) => {
      this.form.setFieldValue(this.name, updater, options);
      this.triggerOnChangeListener();
      this.validate("change");
    };
    this.getMeta = () => this.store.state.meta;
    this.setMeta = (updater) => this.form.setFieldMeta(this.name, updater);
    this.getInfo = () => this.form.getFieldInfo(this.name);
    this.pushValue = (value, opts2) => {
      this.form.pushFieldValue(this.name, value, opts2);
      this.triggerOnChangeListener();
    };
    this.insertValue = (index, value, opts2) => {
      this.form.insertFieldValue(this.name, index, value, opts2);
      this.triggerOnChangeListener();
    };
    this.replaceValue = (index, value, opts2) => {
      this.form.replaceFieldValue(this.name, index, value, opts2);
      this.triggerOnChangeListener();
    };
    this.removeValue = (index, opts2) => {
      this.form.removeFieldValue(this.name, index, opts2);
      this.triggerOnChangeListener();
    };
    this.swapValues = (aIndex, bIndex, opts2) => {
      this.form.swapFieldValues(this.name, aIndex, bIndex, opts2);
      this.triggerOnChangeListener();
    };
    this.moveValue = (aIndex, bIndex, opts2) => {
      this.form.moveFieldValues(this.name, aIndex, bIndex, opts2);
      this.triggerOnChangeListener();
    };
    this.clearValues = (opts2) => {
      this.form.clearFieldValues(this.name, opts2);
      this.triggerOnChangeListener();
    };
    this.getLinkedFields = (cause) => {
      const fields = Object.values(this.form.fieldInfo);
      const linkedFields = [];
      for (const field of fields) {
        if (!field.instance) continue;
        const { onChangeListenTo, onBlurListenTo } = field.instance.options.validators || {};
        if (cause === "change" && (onChangeListenTo == null ? void 0 : onChangeListenTo.includes(this.name))) {
          linkedFields.push(field.instance);
        }
        if (cause === "blur" && (onBlurListenTo == null ? void 0 : onBlurListenTo.includes(this.name))) {
          linkedFields.push(field.instance);
        }
      }
      return linkedFields;
    };
    this.validateSync = (cause, errorFromForm) => {
      var _a;
      const validates = getSyncValidatorArray(cause, this.options);
      const linkedFields = this.getLinkedFields(cause);
      const linkedFieldValidates = linkedFields.reduce(
        (acc, field) => {
          const fieldValidates = getSyncValidatorArray(cause, field.options);
          fieldValidates.forEach((validate) => {
            validate.field = field;
          });
          return acc.concat(fieldValidates);
        },
        []
      );
      let hasErrored = false;
      batch(() => {
        const validateFieldFn = (field, validateObj) => {
          var _a2;
          const errorMapKey = getErrorMapKey2(validateObj.cause);
          const fieldLevelError = validateObj.validate ? normalizeError2(
            field.runValidator({
              validate: validateObj.validate,
              value: {
                value: field.store.state.value,
                validationSource: "field",
                fieldApi: field
              },
              type: "validate"
            })
          ) : void 0;
          const formLevelError = errorFromForm[errorMapKey];
          const { newErrorValue, newSource } = determineFieldLevelErrorSourceAndValue({
            formLevelError,
            fieldLevelError
          });
          if (((_a2 = field.state.meta.errorMap) == null ? void 0 : _a2[errorMapKey]) !== newErrorValue) {
            field.setMeta((prev) => ({
              ...prev,
              errorMap: {
                ...prev.errorMap,
                [errorMapKey]: newErrorValue
              },
              errorSourceMap: {
                ...prev.errorSourceMap,
                [errorMapKey]: newSource
              }
            }));
          }
          if (newErrorValue) {
            hasErrored = true;
          }
        };
        for (const validateObj of validates) {
          validateFieldFn(this, validateObj);
        }
        for (const fieldValitateObj of linkedFieldValidates) {
          if (!fieldValitateObj.validate) continue;
          validateFieldFn(fieldValitateObj.field, fieldValitateObj);
        }
      });
      const submitErrKey = getErrorMapKey2("submit");
      if (
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        ((_a = this.state.meta.errorMap) == null ? void 0 : _a[submitErrKey]) && cause !== "submit" && !hasErrored
      ) {
        this.setMeta((prev) => ({
          ...prev,
          errorMap: {
            ...prev.errorMap,
            [submitErrKey]: void 0
          },
          errorSourceMap: {
            ...prev.errorSourceMap,
            [submitErrKey]: void 0
          }
        }));
      }
      return { hasErrored };
    };
    this.validateAsync = async (cause, formValidationResultPromise) => {
      const validates = getAsyncValidatorArray(cause, this.options);
      const asyncFormValidationResults = await formValidationResultPromise;
      const linkedFields = this.getLinkedFields(cause);
      const linkedFieldValidates = linkedFields.reduce(
        (acc, field) => {
          const fieldValidates = getAsyncValidatorArray(cause, field.options);
          fieldValidates.forEach((validate) => {
            validate.field = field;
          });
          return acc.concat(fieldValidates);
        },
        []
      );
      if (!this.state.meta.isValidating) {
        this.setMeta((prev) => ({ ...prev, isValidating: true }));
      }
      for (const linkedField of linkedFields) {
        linkedField.setMeta((prev) => ({ ...prev, isValidating: true }));
      }
      const validatesPromises = [];
      const linkedPromises = [];
      const validateFieldAsyncFn = (field, validateObj, promises) => {
        const errorMapKey = getErrorMapKey2(validateObj.cause);
        const fieldValidatorMeta = field.getInfo().validationMetaMap[errorMapKey];
        fieldValidatorMeta == null ? void 0 : fieldValidatorMeta.lastAbortController.abort();
        const controller = new AbortController();
        this.getInfo().validationMetaMap[errorMapKey] = {
          lastAbortController: controller
        };
        promises.push(
          new Promise(async (resolve) => {
            var _a;
            let rawError;
            try {
              rawError = await new Promise((rawResolve, rawReject) => {
                if (this.timeoutIds.validations[validateObj.cause]) {
                  clearTimeout(this.timeoutIds.validations[validateObj.cause]);
                }
                this.timeoutIds.validations[validateObj.cause] = setTimeout(
                  async () => {
                    if (controller.signal.aborted) return rawResolve(void 0);
                    try {
                      rawResolve(
                        await this.runValidator({
                          validate: validateObj.validate,
                          value: {
                            value: field.store.state.value,
                            fieldApi: field,
                            signal: controller.signal,
                            validationSource: "field"
                          },
                          type: "validateAsync"
                        })
                      );
                    } catch (e) {
                      rawReject(e);
                    }
                  },
                  validateObj.debounceMs
                );
              });
            } catch (e) {
              rawError = e;
            }
            if (controller.signal.aborted) return resolve(void 0);
            const fieldLevelError = normalizeError2(rawError);
            const formLevelError = (_a = asyncFormValidationResults[this.name]) == null ? void 0 : _a[errorMapKey];
            const { newErrorValue, newSource } = determineFieldLevelErrorSourceAndValue({
              formLevelError,
              fieldLevelError
            });
            field.setMeta((prev) => {
              return {
                ...prev,
                errorMap: {
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  ...prev == null ? void 0 : prev.errorMap,
                  [errorMapKey]: newErrorValue
                },
                errorSourceMap: {
                  ...prev.errorSourceMap,
                  [errorMapKey]: newSource
                }
              };
            });
            resolve(newErrorValue);
          })
        );
      };
      for (const validateObj of validates) {
        if (!validateObj.validate) continue;
        validateFieldAsyncFn(this, validateObj, validatesPromises);
      }
      for (const fieldValitateObj of linkedFieldValidates) {
        if (!fieldValitateObj.validate) continue;
        validateFieldAsyncFn(
          fieldValitateObj.field,
          fieldValitateObj,
          linkedPromises
        );
      }
      let results = [];
      if (validatesPromises.length || linkedPromises.length) {
        results = await Promise.all(validatesPromises);
        await Promise.all(linkedPromises);
      }
      this.setMeta((prev) => ({ ...prev, isValidating: false }));
      for (const linkedField of linkedFields) {
        linkedField.setMeta((prev) => ({ ...prev, isValidating: false }));
      }
      return results.filter(Boolean);
    };
    this.validate = (cause, opts2) => {
      var _a;
      if (!this.state.meta.isTouched) return [];
      const { fieldsErrorMap } = (opts2 == null ? void 0 : opts2.skipFormValidation) ? { fieldsErrorMap: {} } : this.form.validateSync(cause);
      const { hasErrored } = this.validateSync(
        cause,
        fieldsErrorMap[this.name] ?? {}
      );
      if (hasErrored && !this.options.asyncAlways) {
        (_a = this.getInfo().validationMetaMap[getErrorMapKey2(cause)]) == null ? void 0 : _a.lastAbortController.abort();
        return this.state.meta.errors;
      }
      const formValidationResultPromise = (opts2 == null ? void 0 : opts2.skipFormValidation) ? Promise.resolve({}) : this.form.validateAsync(cause);
      return this.validateAsync(cause, formValidationResultPromise);
    };
    this.handleChange = (updater) => {
      this.setValue(updater);
    };
    this.handleBlur = () => {
      const prevTouched = this.state.meta.isTouched;
      if (!prevTouched) {
        this.setMeta((prev) => ({ ...prev, isTouched: true }));
      }
      if (!this.state.meta.isBlurred) {
        this.setMeta((prev) => ({ ...prev, isBlurred: true }));
      }
      this.validate("blur");
      this.triggerOnBlurListener();
    };
    this.parseValueWithSchema = (schema) => {
      return standardSchemaValidators.validate(
        { value: this.state.value, validationSource: "field" },
        schema
      );
    };
    this.parseValueWithSchemaAsync = (schema) => {
      return standardSchemaValidators.validateAsync(
        { value: this.state.value, validationSource: "field" },
        schema
      );
    };
    this.form = opts.form;
    this.name = opts.name;
    this.timeoutIds = {
      validations: {},
      listeners: {},
      formListeners: {}
    };
    this.store = new Derived({
      deps: [this.form.store],
      fn: () => {
        const value = this.form.getFieldValue(this.name);
        const meta = this.form.getFieldMeta(this.name) ?? {
          ...defaultFieldMeta,
          ...opts.defaultMeta
        };
        return {
          value,
          meta
        };
      }
    });
    this.options = opts;
  }
  /**
   * The current field state.
   */
  get state() {
    return this.store.state;
  }
  /**
   * @private
   */
  runValidator(props) {
    if (isStandardSchemaValidator(props.validate)) {
      return standardSchemaValidators[props.type](
        props.value,
        props.validate
      );
    }
    return props.validate(props.value);
  }
  /**
   * Updates the field's errorMap
   */
  setErrorMap(errorMap) {
    this.setMeta((prev) => ({
      ...prev,
      errorMap: {
        ...prev.errorMap,
        ...errorMap
      }
    }));
  }
  triggerOnBlurListener() {
    var _a, _b, _c, _d, _e, _f;
    const formDebounceMs = (_a = this.form.options.listeners) == null ? void 0 : _a.onBlurDebounceMs;
    if (formDebounceMs && formDebounceMs > 0) {
      if (this.timeoutIds.formListeners.blur) {
        clearTimeout(this.timeoutIds.formListeners.blur);
      }
      this.timeoutIds.formListeners.blur = setTimeout(() => {
        var _a2, _b2;
        (_b2 = (_a2 = this.form.options.listeners) == null ? void 0 : _a2.onBlur) == null ? void 0 : _b2.call(_a2, {
          formApi: this.form,
          fieldApi: this
        });
      }, formDebounceMs);
    } else {
      (_c = (_b = this.form.options.listeners) == null ? void 0 : _b.onBlur) == null ? void 0 : _c.call(_b, {
        formApi: this.form,
        fieldApi: this
      });
    }
    const fieldDebounceMs = (_d = this.options.listeners) == null ? void 0 : _d.onBlurDebounceMs;
    if (fieldDebounceMs && fieldDebounceMs > 0) {
      if (this.timeoutIds.listeners.blur) {
        clearTimeout(this.timeoutIds.listeners.blur);
      }
      this.timeoutIds.listeners.blur = setTimeout(() => {
        var _a2, _b2;
        (_b2 = (_a2 = this.options.listeners) == null ? void 0 : _a2.onBlur) == null ? void 0 : _b2.call(_a2, {
          value: this.state.value,
          fieldApi: this
        });
      }, fieldDebounceMs);
    } else {
      (_f = (_e = this.options.listeners) == null ? void 0 : _e.onBlur) == null ? void 0 : _f.call(_e, {
        value: this.state.value,
        fieldApi: this
      });
    }
  }
  triggerOnChangeListener() {
    var _a, _b, _c, _d, _e, _f;
    const formDebounceMs = (_a = this.form.options.listeners) == null ? void 0 : _a.onChangeDebounceMs;
    if (formDebounceMs && formDebounceMs > 0) {
      if (this.timeoutIds.formListeners.change) {
        clearTimeout(this.timeoutIds.formListeners.change);
      }
      this.timeoutIds.formListeners.change = setTimeout(() => {
        var _a2, _b2;
        (_b2 = (_a2 = this.form.options.listeners) == null ? void 0 : _a2.onChange) == null ? void 0 : _b2.call(_a2, {
          formApi: this.form,
          fieldApi: this
        });
      }, formDebounceMs);
    } else {
      (_c = (_b = this.form.options.listeners) == null ? void 0 : _b.onChange) == null ? void 0 : _c.call(_b, {
        formApi: this.form,
        fieldApi: this
      });
    }
    const fieldDebounceMs = (_d = this.options.listeners) == null ? void 0 : _d.onChangeDebounceMs;
    if (fieldDebounceMs && fieldDebounceMs > 0) {
      if (this.timeoutIds.listeners.change) {
        clearTimeout(this.timeoutIds.listeners.change);
      }
      this.timeoutIds.listeners.change = setTimeout(() => {
        var _a2, _b2;
        (_b2 = (_a2 = this.options.listeners) == null ? void 0 : _a2.onChange) == null ? void 0 : _b2.call(_a2, {
          value: this.state.value,
          fieldApi: this
        });
      }, fieldDebounceMs);
    } else {
      (_f = (_e = this.options.listeners) == null ? void 0 : _e.onChange) == null ? void 0 : _f.call(_e, {
        value: this.state.value,
        fieldApi: this
      });
    }
  }
};
function normalizeError2(rawError) {
  if (rawError) {
    return rawError;
  }
  return void 0;
}
function getErrorMapKey2(cause) {
  switch (cause) {
    case "submit":
      return "onSubmit";
    case "blur":
      return "onBlur";
    case "mount":
      return "onMount";
    case "server":
      return "onServer";
    case "change":
    default:
      return "onChange";
  }
}

// ../../node_modules/.deno/@tanstack+form-core@1.14.0/node_modules/@tanstack/form-core/dist/esm/mergeForm.js
function isValidKey(key) {
  const dangerousProps = ["__proto__", "constructor", "prototype"];
  return !dangerousProps.includes(String(key));
}
function mutateMergeDeep(target, source) {
  if (target === null || target === void 0 || typeof target !== "object")
    return {};
  if (source === null || source === void 0 || typeof source !== "object")
    return target;
  const targetKeys = Object.keys(target);
  const sourceKeys = Object.keys(source);
  const keySet = /* @__PURE__ */ new Set([...targetKeys, ...sourceKeys]);
  for (const key of keySet) {
    if (!isValidKey(key)) continue;
    const targetKey = key;
    const sourceKey = key;
    if (!Object.hasOwn(source, sourceKey)) continue;
    const sourceValue = source[sourceKey];
    const targetValue = target[targetKey];
    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      Object.defineProperty(target, key, {
        value: [...sourceValue],
        enumerable: true,
        writable: true,
        configurable: true
      });
      continue;
    }
    const isTargetObj = typeof targetValue === "object" && targetValue !== null;
    const isSourceObj = typeof sourceValue === "object" && sourceValue !== null;
    const areObjects = isTargetObj && isSourceObj && !Array.isArray(targetValue) && !Array.isArray(sourceValue);
    if (areObjects) {
      mutateMergeDeep(targetValue, sourceValue);
      continue;
    }
    Object.defineProperty(target, key, {
      value: sourceValue,
      enumerable: true,
      writable: true,
      configurable: true
    });
  }
  return target;
}
function mergeForm(baseForm, state) {
  mutateMergeDeep(baseForm.state, state);
  return baseForm;
}

// ../../node_modules/.deno/@tanstack+form-core@1.14.0/node_modules/@tanstack/form-core/dist/esm/formOptions.js
function formOptions(defaultOpts) {
  return defaultOpts;
}

// ../../node_modules/.deno/@tanstack+react-form@1.14.1/node_modules/@tanstack/react-form/dist/esm/useForm.js
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
var import_react3 = __toESM(require_react(), 1);

// ../../node_modules/.deno/@tanstack+react-form@1.14.1/node_modules/@tanstack/react-form/dist/esm/useField.js
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var import_react2 = __toESM(require_react(), 1);

// ../../node_modules/.deno/@tanstack+react-form@1.14.1/node_modules/@tanstack/react-form/dist/esm/useIsomorphicLayoutEffect.js
var import_react = __toESM(require_react(), 1);
var useIsomorphicLayoutEffect = typeof window !== "undefined" ? import_react.useLayoutEffect : import_react.useEffect;

// ../../node_modules/.deno/@tanstack+react-form@1.14.1/node_modules/@tanstack/react-form/dist/esm/useField.js
function useField(opts) {
  const [fieldApi] = (0, import_react2.useState)(() => {
    const api = new FieldApi({
      ...opts,
      form: opts.form,
      name: opts.name
    });
    const extendedApi = api;
    extendedApi.Field = Field;
    return extendedApi;
  });
  useIsomorphicLayoutEffect(fieldApi.mount, [fieldApi]);
  useIsomorphicLayoutEffect(() => {
    fieldApi.update(opts);
  });
  useStore(
    fieldApi.store,
    opts.mode === "array" ? (state) => {
      return [
        state.meta,
        Object.keys(state.value ?? []).length
      ];
    } : void 0
  );
  return fieldApi;
}
var Field = ({
  children,
  ...fieldOptions
}) => {
  const fieldApi = useField(fieldOptions);
  const jsxToDisplay = (0, import_react2.useMemo)(
    () => functionalUpdate(children, fieldApi),
    /**
     * The reason this exists is to fix an issue with the React Compiler.
     * Namely, functionalUpdate is memoized where it checks for `fieldApi`, which is a static type.
     * This means that when `state.value` changes, it does not trigger a re-render. The useMemo explicitly fixes this problem
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [children, fieldApi, fieldApi.state.value, fieldApi.state.meta]
  );
  return (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: jsxToDisplay });
};

// ../../node_modules/.deno/@tanstack+react-form@1.14.1/node_modules/@tanstack/react-form/dist/esm/useForm.js
function LocalSubscribe({
  form,
  selector,
  children
}) {
  const data = useStore(form.store, selector);
  return functionalUpdate(children, data);
}
function useForm(opts) {
  const [formApi] = (0, import_react3.useState)(() => {
    const api = new FormApi(opts);
    const extendedApi = api;
    extendedApi.Field = function APIField(props) {
      return (0, import_jsx_runtime2.jsx)(Field, { ...props, form: api });
    };
    extendedApi.Subscribe = function Subscribe(props) {
      return (0, import_jsx_runtime2.jsx)(
        LocalSubscribe,
        {
          form: api,
          selector: props.selector,
          children: props.children
        }
      );
    };
    return extendedApi;
  });
  useIsomorphicLayoutEffect(formApi.mount, []);
  useIsomorphicLayoutEffect(() => {
    formApi.update(opts);
  });
  return formApi;
}

// ../../node_modules/.deno/@tanstack+react-form@1.14.1/node_modules/@tanstack/react-form/dist/esm/useTransform.js
function useTransform(fn, deps) {
  return {
    fn,
    deps
  };
}

// ../../node_modules/.deno/@tanstack+react-form@1.14.1/node_modules/@tanstack/react-form/dist/esm/createFormHook.js
var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
var import_react4 = __toESM(require_react(), 1);
function createFormHookContexts() {
  const fieldContext = (0, import_react4.createContext)(null);
  function useFieldContext() {
    const field = (0, import_react4.useContext)(fieldContext);
    if (!field) {
      throw new Error(
        "`fieldContext` only works when within a `fieldComponent` passed to `createFormHook`"
      );
    }
    return field;
  }
  const formContext = (0, import_react4.createContext)(null);
  function useFormContext() {
    const form = (0, import_react4.useContext)(formContext);
    if (!form) {
      throw new Error(
        "`formContext` only works when within a `formComponent` passed to `createFormHook`"
      );
    }
    return form;
  }
  return { fieldContext, useFieldContext, useFormContext, formContext };
}
function createFormHook({
  fieldComponents,
  fieldContext,
  formContext,
  formComponents
}) {
  function useAppForm(props) {
    const form = useForm(props);
    const AppForm = (0, import_react4.useMemo)(() => {
      const AppForm2 = ({ children }) => {
        return (0, import_jsx_runtime3.jsx)(formContext.Provider, { value: form, children });
      };
      return AppForm2;
    }, [form]);
    const AppField = (0, import_react4.useMemo)(() => {
      const AppField2 = ({ children, ...props2 }) => {
        return (0, import_jsx_runtime3.jsx)(form.Field, { ...props2, children: (field) => (
          // eslint-disable-next-line @eslint-react/no-context-provider
          (0, import_jsx_runtime3.jsx)(fieldContext.Provider, { value: field, children: children(Object.assign(field, fieldComponents)) })
        ) });
      };
      return AppField2;
    }, [form]);
    const extendedForm = (0, import_react4.useMemo)(() => {
      return Object.assign(form, {
        AppField,
        AppForm,
        ...formComponents
      });
    }, [form, AppField, AppForm]);
    return extendedForm;
  }
  function withForm({
    render,
    props
  }) {
    return (innerProps) => render({ ...props, ...innerProps });
  }
  return {
    useAppForm,
    withForm
  };
}
export {
  Field,
  FieldApi,
  FormApi,
  createFormHook,
  createFormHookContexts,
  deleteBy,
  determineFieldLevelErrorSourceAndValue,
  determineFormLevelErrorSourceAndValue,
  evaluate,
  formOptions,
  functionalUpdate,
  getAsyncValidatorArray,
  getBy,
  getSyncValidatorArray,
  isGlobalFormValidationError,
  isNonEmptyArray,
  isStandardSchemaValidator,
  makePathArray,
  mergeForm,
  mutateMergeDeep,
  setBy,
  standardSchemaValidators,
  useField,
  useForm,
  useStore,
  useTransform
};
//# sourceMappingURL=@tanstack_react-form.js.map
