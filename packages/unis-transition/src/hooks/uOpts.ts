export const uOpts = <T extends object>(
  defaultData: Partial<T>,
  cb: () => T
) => {
  const pick = <T extends Record<string, any>>(data: T): T => {
    Object.keys(data).forEach((key) => {
      if (data[key] == undefined) delete data[key];
    });
    return data;
  };
  return () => ({
    ...defaultData,
    ...pick(cb()),
  });
};
