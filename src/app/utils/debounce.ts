type DebouncedFunction = {
  (...args: [string]): void;
  cancel: () => void;
};

export const debounce = (
  fn: (arg0: string) => void,
  delay: number,
): DebouncedFunction => {
  let timeout: NodeJS.Timeout;

  const debouncedFn = (...args: [string]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };

  debouncedFn.cancel = () => {
    clearTimeout(timeout);
  };

  return debouncedFn;
};
