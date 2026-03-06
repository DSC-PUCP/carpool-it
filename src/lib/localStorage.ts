import { createIsomorphicFn } from '@tanstack/react-start';

const getLocalStorage = createIsomorphicFn()
  .client(() => {
    return globalThis.localStorage;
  })
  .server(() => {
    return {
      getItem: (_key: string) => null,
      setItem: (_key: string, _value: string) => {},
      removeItem: (_key: string) => {},
      clear: () => {},
      key: (_index: number) => null,
      length: 0,
    };
  });

export default getLocalStorage;
