// Types pour les pages Next.js
export type PageProps<P = {}, S = {}> = {
  params: P;
  searchParams?: S & { [key: string]: string | string[] | undefined };
};

// Types pour les pages Server Components de Next.js
export type ServerPageProps<P = {}, S = {}> = {
  params: Promise<P>;
  searchParams?: S & { [key: string]: string | string[] | undefined };
};

