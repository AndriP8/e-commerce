/**
 * A utility type to manipulate generated types.
 *
 * @example
 * type OriginalType = {
 *   foo: Generated<string>,
 *   bar: Generated<number>,
 *   baz: boolean,
 * };
 *
 * type ModifiedType = ManipulateGeneratedTypes<
 *   OriginalType,
 *   [['foo', OriginalType['foo'][__select__], ['bar',  OriginalType['bar'][__select__]]]
 * >;
 *
 * // type ModifiedType = {
 * //   foo: number;
 * //   bar: string;
 * //   baz: boolean;
 * // }
 */

export type ManipulateGeneratedTypes<T, M extends [keyof T, unknown][]> = Omit<
  T,
  M[number][0]
> & {
  [K in M[number] as K[0]]: K[1];
};
