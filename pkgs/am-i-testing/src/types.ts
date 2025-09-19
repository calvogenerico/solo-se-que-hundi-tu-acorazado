export type JsonLike = {
  [key: string]: JsonLikeKey
};
export type JsonLikeKey = number | string | null | JsonLike | JsonLikeKey[]
export type Brand<K, T> = K & { __brand: T }
