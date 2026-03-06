import type { defaultNS, resources } from '.';

declare module 'i18next' {
  interface CustomTypeOptions {
    enableSelector: true;
    defaultNS: typeof defaultNS;
    resources: (typeof resources)['es'];
  }
}
