import { TransformFnParams } from 'class-transformer/types/interfaces';

export type MaybeType<T> = T | undefined;

export const lowerCaseTransformer = (
  params: TransformFnParams,
): MaybeType<string> => params.value?.toLowerCase().trim();

export const lowerCaseArrayTransformer = (
  params: TransformFnParams,
): MaybeType<string[]> => {
  if (!Array.isArray(params.value)) return null;

  return params.value.map((item) => item.trim().toLowerCase());
};
