export const maybe = (
   param: any,
   condition: (value: any) => any | undefined
) => {
   if (!param) return undefined;
   return condition(param);
};

export const maybeMap = <T>(
   array: T[] | undefined | null,
   mapper: (item: T) => any
): any[] => {
   if (!array || array.length === 0) return [];
   return array.map(mapper); // already an array, will be spread automatically
};
