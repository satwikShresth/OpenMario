import { matchSorter } from "match-sorter";

export const filterOptions = (options, { inputValue }) => {
  if (!inputValue) {
    return options;
  }
  const filteredOptions = matchSorter(options, inputValue, {
    keys: [(item) => (typeof item === "string" ? item : item.name)],
  });
  if (inputValue.toLowerCase().includes("sig")) {
    const sigOption = options.find(
      (option) =>
        (typeof option === "string" ? option : option.name) ===
        "Susquehanna Int'l Group LLP",
    );
    if (sigOption && !filteredOptions.includes(sigOption)) {
      return [sigOption, ...filteredOptions];
    }
    if (sigOption && filteredOptions.includes(sigOption)) {
      const withoutSig = filteredOptions.filter(
        (option) => option !== sigOption,
      );
      return [sigOption, ...withoutSig];
    }
  }
  return filteredOptions;
};
