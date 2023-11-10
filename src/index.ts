import { FormEvent, FocusEvent, useCallback, useState, useMemo, useRef, ChangeEvent } from 'react'

import { z } from 'zod'

type FormField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

type UseZodFormMode = 'controlled' | 'uncontrolled'

export type UnControlledField = {
  id: string
  name: string
  defaultValue: string
  label: string
  error: string
}

export type ControlledField = Omit<UnControlledField, 'defaultValue'> & {
  value: string
}

export type UnControlledOrControlledField = ControlledField | UnControlledField

export type UseZodFormOptions = {
  mode?: UseZodFormMode
}

/**
 * Generates a new object with boolean properties based on the initial object.
 *
 * @param {T} object - The initial object.
 * @return {Record<string, boolean>} The new object with boolean properties.
 */
function booleanObjectFromInitial<T extends Record<string, any>>(object: T): Record<string, boolean> {
  let obj = {}
  for (const [key] of Object.entries({ ...object })) {
    obj = {
      ...obj,
      [key]: false,
    }
  }
  return obj
}

type BooleanObject = ReturnType<typeof booleanObjectFromInitial>

/**
 * Generates a string object from an initial object.
 *
 * @param {T extends Record<string, any>} object - The initial object.
 * @return {Record<string, string>} The generated string object.
 */
function stringObjectFromInitial<T extends Record<string, any>>(object: T): Record<string, string> {
  let obj = {}
  for (const [key] of Object.entries({ ...object })) {
    obj = {
      ...obj,
      [key]: '',
    }
  }
  return obj
}

function getByValue(obj: { [x: string]: any }, key: string): string {
  if (!obj || typeof obj !== 'object') return ''
  if (key in obj) return obj[key]
  return ''
}

/**
 * Retrieves the default values of a Zod schema.
 *
 * @param {z.AnyZodObject | z.ZodEffects<any>} schema - The Zod schema or Zod effect.
 * @return {z.infer<T>} The default values of the schema.
 */
function getDefaults<T extends z.ZodTypeAny>(schema: z.AnyZodObject | z.ZodEffects<any>): z.infer<T> {
  // Check if it's a ZodEffect
  if (schema instanceof z.ZodEffects) {
    // Check if it's a recursive ZodEffect
    if (schema.innerType() instanceof z.ZodEffects) return getDefaults(schema.innerType())
    // return schema inner shape as a fresh zodObject
    return getDefaults(z.ZodObject.create(schema.innerType().shape))
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

  return Object.fromEntries(
    Object.entries(schema.shape).map(([key, value]) => {
      return [key, getDefaultValue(value as z.ZodTypeAny) ?? '']
    }),
  )
}

function objectKeys<T extends object>(t: T): Array<keyof T> {
  return Object.keys(t) as Array<keyof T>
}

let valid = false
let submitting = false

export function useZodForm(
  schema: z.AnyZodObject,
  onSubmit: (data: z.infer<typeof schema>) => void,
  mode: UseZodFormMode = 'uncontrolled',
) {
  const initialValues = getDefaults(schema)
  const initialString = useMemo(() => stringObjectFromInitial({ ...initialValues } as any), [initialValues])

  const values = useRef<z.infer<typeof schema>>({ ...initialValues })

  const touched = useRef<BooleanObject>(booleanObjectFromInitial({ ...initialValues } as any))
  const dirty = useRef<BooleanObject>(booleanObjectFromInitial({ ...initialValues } as any))
  const previousValue = useRef<unknown>('')

  const [errors, setErrors] = useState({ ...initialString })

  const getValue = (key: keyof z.infer<typeof schema>) => values.current[key.toString()]
  const getLabel = (key: keyof z.infer<typeof schema>) => schema.shape[key].description ?? ''
  const getError = (key: keyof z.infer<typeof schema>) => getByValue(errors, key as string) ?? ''
  const isSubmitting = () => submitting

  const isValid = (key?: keyof z.infer<typeof schema>) =>
    key ? schema.shape[key].safeParse(values.current[key.toString()]) : valid

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      submitting = true
      const result = schema.safeParse(values.current)
      if (result.success) {
        onSubmit(result.data as z.infer<typeof schema>)
        touched.current = booleanObjectFromInitial({ ...initialValues } as any)
        dirty.current = booleanObjectFromInitial({ ...initialValues } as any)
        values.current = { ...initialValues }
        setErrors({ ...initialString })
        submitting = false
        valid = false
        e.currentTarget.reset()
      } else {
        if ('error' in result) {
          const issues = result.error.errors.reduce((acc: Record<string, string>, i: z.ZodIssue) => {
            return {
              ...acc,
              [i.path.join('-')]: i.message,
            }
          }, {})
          setErrors({ ...issues })
          valid = false
          submitting = false
        }
      }
    },
    [onSubmit, values, schema, initialString, initialValues],
  )

  const handleChange = useCallback(
    (e: ChangeEvent<FormField>) => {
      const el = e.target
      const name = el.name || ''
      if (!name) return

      let value: unknown = el.value

      if (el.tagName === 'INPUT') {
        if (el.type === 'checkbox') {
          const el = e.target as HTMLInputElement
          value = el.checked
        }
        if (el.type === 'number') {
          value = Number(value)
        }
      }
      const result = schema.shape[name].safeParse(value)

      touched.current[name] = true
      dirty.current[name] = true

      values.current = {
        ...values.current,
        [name]: value,
      }

      if (result.success) {
        setErrors((prevErrors: Record<string, string>) => {
          return {
            ...prevErrors,
            [name]: '',
          }
        })
        return
      }

      const issues = result.error.errors.reduce((acc: string, i: z.ZodIssue) => {
        return (acc += i.message)
      }, '')

      setErrors((prevErrors: Record<string, string>) => {
        return {
          ...prevErrors,
          [name]: issues,
        }
      })
    },
    [schema, values],
  )

  const handleFocus = useCallback((e: FocusEvent<HTMLFormElement>) => {
    const { name = '', value = '' } = e.target
    if (name) {
      setErrors((prevErrors: Record<string, string>) => ({
        ...prevErrors,
        [e.target.name]: '',
      }))
      touched.current[name] = true
      previousValue.current = value
    }
  }, [])

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLFormElement>) => {
      const name = e.target.name || ''
      if (!name || name === '') return

      let value = e.target.value || ''
      if (previousValue.current !== value) {
        dirty.current[name] = true
      }

      if (e.target.tagName === 'INPUT') {
        if (e.target.type === 'checkbox') {
          console.log('input:checkbox')
          value = !!e.target.checked
        }
        if (e.target.type === 'number') {
          console.log('input:number')
          value = Number(value)
        }
      }

      touched.current[name] = true
      values.current = {
        ...values.current,
        [name]: value,
      }

      const result = schema.shape[name].safeParse(value)
      if (result.success) {
        valid = schema.safeParse(values.current).success
        setErrors((prevErrors: Record<string, string>) => {
          return {
            ...prevErrors,
            [name]: '',
          }
        })
        return
      }

      valid = false

      const issues = result.error.errors.reduce((acc: string, i: z.ZodIssue) => {
        return (acc += i.message)
      }, '')

      setErrors((prevErrors: Record<string, string>) => {
        return {
          ...prevErrors,
          [name]: issues,
        }
      })
    },
    [schema, values],
  )

  const getForm = () => {
    return {
      onSubmit: handleSubmit,
      onFocus: handleFocus,
      onBlur: handleBlur,
    }
  }

  /**
   * Retrieves a field's information based on the given key.
   *
   * @param {keyof T} key - The key of the field.
   * @param {UseZodFormMode} mode - The mode of the form.
   * @return {UnControlledOrControlledField} - The field information.
   */
  const getField = (
    key: keyof z.infer<typeof schema>,
    overrideMode: UseZodFormMode = 'uncontrolled',
  ): UnControlledOrControlledField => {
    const name = String(key)
    const error = getError(key) ?? ''
    const val = (getValue(key) as string) ?? ''
    const label = getLabel(key) ?? ''

    if (mode === 'uncontrolled' || overrideMode !== 'controlled') {
      return {
        id: name,
        name,
        defaultValue: val,
        label,
        error,
      } as UnControlledField
    }
    return {
      id: name,
      name,
      value: val,
      label,
      error,
    } as ControlledField
  }

  return {
    handleChange,
    getField,
    getForm,
    touched: touched.current,
    dirty: dirty.current,
    isValid,
    isSubmitting,
  }
}
