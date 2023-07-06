import { z, ZodTypeAny } from 'zod'

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

export type BooleanObject = ReturnType<typeof booleanObjectFromInitial>

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

export function getByValue(obj: { [x: string]: any }, key: string): string {
  if (!obj || typeof obj !== 'object') return ''
  if (key in obj) return obj[key]
  return ''
}

export function getDefaultValue(schema: z.ZodTypeAny): unknown {
  if (schema instanceof z.ZodDefault) return schema._def.defaultValue()
  // return an empty array
  if (schema instanceof z.ZodArray) return []
  // return an empty string
  if (schema instanceof z.ZodString) return ''
  // return an content of object recursivly
  if (schema instanceof z.ZodObject) return getDefaults(schema)

  if (!('innerType' in schema._def)) return undefined
  return getDefaultValue(schema._def.innerType)
}

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
