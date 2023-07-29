const local = import.meta.env.VITE_DOMAIN;

export const base = import.meta.env.DEV ? `${local}/proxyBase` : import.meta.env.VITE_API_BASE;
