import { z, ZodTypeAny } from 'zod'
/**
 * Generates a new object with boolean properties based on the initial object.
 *
 * @param {T} object - The initial object.
 * @return {Record<string, boolean>} The new object with boolean properties.
 */
export function booleanObjectFromInitial<T extends Record<string, any>>(object: T): Record<string, boolean> {
  let obj = {}
  for (const [key] of Object.entries({ ...object })) {
    obj = {
      ...obj,
      [key]: false,
    }
  }
  return obj
}

export type InitialBooleanObject = ReturnType<typeof booleanObjectFromInitial>

/**
 * Generates a string object from an initial object.
 *
 * @param {T extends Record<string, any>} object - The initial object.
 * @return {Record<string, string>} The generated string object.
 */
export function stringObjectFromInitial<T extends Record<string, any>>(object: T): Record<string, string> {
  let obj = {}
  for (const [key] of Object.entries({ ...object })) {
    obj = {
      ...obj,
      [key]: '',
    }
  }
  return obj
}

export type InitialStringObject = ReturnType<typeof booleanObjectFromInitial>

/**
 * Returns the value associated with a given key from an object.
 *
 * @param {Object} obj - The object to search for the key-value pair.
 * @param {string} key - The key to search for in the object.
 * @return {string} The value associated with the given key, or an empty string if the key is not found.
 */
export function getByValue(obj: { [x: string]: any }, key: string): string {
  if (!obj || typeof obj !== 'object') return ''
  if (key in obj) return obj[key]
  return ''
}

/**
 * Retrieves the default value for a given schema.
 *
 * @param {z.ZodTypeAny} schema - The schema to retrieve the default value from.
 * @return {unknown} The default value of the schema.
 */
function getDefaultValue(schema: z.ZodTypeAny): unknown {
  if (schema instanceof z.ZodDefault) return schema._def.defaultValue()
  // return an empty array if it is
  if (schema instanceof z.ZodArray) return []
  // return an empty string if it is
  if (schema instanceof z.ZodString) return ''
  // return an content of object recursivly
  if (schema instanceof z.ZodObject) return getDefaults(schema)

  if (!('innerType' in schema._def)) return undefined
  return getDefaultValue(schema._def.innerType)
}

/**
 * Retrieves the default values of a Zod schema.
 *
 * @param {z.AnyZodObject | z.ZodEffects<any>} schema - The Zod schema or Zod effect.
 * @return {z.infer<T>} The default values of the schema.
 */
export function getDefaults<T extends z.ZodTypeAny>(schema: z.AnyZodObject | z.ZodEffects<any>): z.infer<T> {
  // Check if it's a ZodEffect
  if (schema instanceof z.ZodEffects) {
    // Check if it's a recursive ZodEffect
    if (schema.innerType() instanceof z.ZodEffects) return getDefaults(schema.innerType())
    // return schema inner shape as a fresh zodObject
    return getDefaults(z.ZodObject.create(schema.innerType().shape))
  }

  return Object.fromEntries(
    Object.entries(schema.shape).map(([key, value]) => {
      return [key, getDefaultValue(value as ZodTypeAny) ?? '']
    }),
  )
}
