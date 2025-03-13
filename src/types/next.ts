// Types pour les pages Next.js
export type PageProps<P = {}, S = {}> = {
  params: P;
  searchParams?: S & { [key: string]: string | string[] | undefined };
};

// Exemple d'utilisation:
// import { PageProps } from '@/types/next';
// 
// export default function Page({ params, searchParams }: PageProps<{ id: string }, { sort?: string }>) {
//   // ...
// } 