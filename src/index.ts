import { FormEvent, FocusEvent, useCallback, useState, useMemo, useRef, ChangeEvent } from 'react'
import { z } from 'zod'

let valid = false
let submitting = false

export function useZodForm<SchemaType>(
  schema: z.AnyZodObject,
  onSubmit: SubmitHandler<SchemaType>,
  mode: UseZodFormMode = 'uncontrolled',
): UseZodFormResult<SchemaType> {
  const initialValues = getDefaults(schema)
  const initialString = useMemo(() => objectToString({ ...initialValues }), [initialValues])

  const values = useRef<SchemaType>({ ...initialValues })

  const touched = useRef<ReturnType<typeof objectToBoolean>>(objectToBoolean({ ...initialValues }))
  const dirty = useRef<ReturnType<typeof objectToBoolean>>(objectToBoolean({ ...initialValues }))
  const previousValue = useRef<unknown>('')

  const [errors, setErrors] = useState({ ...initialString })

  const getValue = (name?: keyof SchemaType) => {
    if (!name) return values.current
    return values.current[name]
  }
  const getLabel = (name: keyof SchemaType): string => schema.shape[name].description ?? ''

  const getError = (name?: keyof SchemaType) => {
    if (!name) return errors
    return getByValue(errors, name as string) ?? errors
  }

  const getForm = (): UseZodFormFormEventHandlers => {
    if (mode === 'controlled')
      return {
        onSubmit: handleSubmit,
        onFocus: handleFocus,
        onBlur: handleBlur,
        onChange: handleChange,
      }
    return {
      onSubmit: handleSubmit,
      onFocus: handleFocus,
      onBlur: handleBlur,
    }
  }

  const getField = (name: keyof SchemaType, overrideMode: UseZodFormMode = 'uncontrolled'): UseZodField => {
    const error = getError(name) ?? ''
    const value = getValue(name) ?? ''
    const label = getLabel(name) ?? ''

    if (mode === 'uncontrolled' || overrideMode !== 'controlled') {
      return {
        name,
        defaultValue: value,
        label,
        error,
      } as UnControlledField
    }
    return {
      name,
      value,
      label,
      error,
    } as ControlledField
  }

  const setError = (name: keyof SchemaType, value: string) => {
    setErrors((prevErrors) => ({ ...prevErrors, [name]: value }))
  }

  const setField = (name: keyof SchemaType, value: unknown): boolean => {
    if (!name) return false
    const result = schema.shape[name].safeParse(value)
    console.log(result)
    if (result.success) {
      values.current = {
        ...values.current,
        [name]: value,
      }
      touched.current = {
        ...touched.current,
        [name]: true,
      }
      dirty.current = {
        ...dirty.current,
        [name]: true,
      }
      setErrors((prevErrors: Record<string, string>) => {
        return {
          ...prevErrors,
          [name]: '',
        }
      })
      return true
    }
    return false
  }

  const isSubmitting = (): boolean => submitting

  const isValid = (name?: keyof SchemaType): boolean =>
    name ? schema.shape[name].safeParse(values.current[name]).success : valid

  const isTouched = (name?: keyof SchemaType): boolean => {
    if (!name) {
      const touchedCount = Object.keys({ ...touched.current }).filter(Boolean).length
      return touchedCount > 0
    }
    const n = name as string
    if (n in touched.current) {
      return Boolean(touched.current[n])
    }
    return false
  }

  const isDirty = (name?: keyof SchemaType): boolean => {
    if (!name) {
      const dirtyCount = Object.keys({ ...dirty.current }).filter(Boolean).length
      return dirtyCount > 0
    }
    const n = name as string
    if (n in dirty.current) {
      return Boolean(dirty.current[n])
    }
    return false
  }

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      submitting = true
      const result = schema.safeParse(values.current)
      if (result.success) {
        onSubmit(result.data as SchemaType)
        touched.current = objectToBoolean({ ...initialValues })
        dirty.current = objectToBoolean({ ...initialValues })
        values.current = { ...initialValues }
        setErrors({ ...initialString })
        submitting = false
        valid = false
        e.currentTarget.reset()
        return
      }
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
    },
    [onSubmit, values, schema, initialString, initialValues],
  )

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLFormElement>) => {
      const el = e.target
      const name = el.name || ''
      if (!name) return

      let value: unknown = el.value

      if (el.tagName === 'INPUT') {
        if (el.type === 'checkbox') {
          const el = e.target
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
          value = !!e.target.checked
        }
        if (e.target.type === 'number') {
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

  return {
    getField,
    getForm,
    getError,
    setField,
    setError,
    isDirty,
    isTouched,
    isValid,
    isSubmitting,
  }
}

// UTILS
function objectToBoolean(object: Record<string, unknown>): Record<string, boolean> {
  return Object.keys({ ...object }).reduce((acc, key) => ({ ...acc, [key]: false }), {})
}

function objectToString(object: Record<string, unknown>): Record<string, string> {
  return Object.keys({ ...object }).reduce((acc, key) => ({ ...acc, [key]: '' }), {})
}

function getByValue(obj: Record<string, unknown>, key: string): string | unknown {
  if (!obj || typeof obj !== 'object') return ''
  if (key in obj) return obj[key]
  return ''
}

function getDefaults<T extends z.ZodTypeAny>(schema: z.AnyZodObject | z.ZodEffects<any>): z.infer<T> {
  // Check if it's a ZodEffect
  if (schema instanceof z.ZodEffects) {
    // Check if it's a recursive ZodEffect
    if (schema.innerType() instanceof z.ZodEffects) return getDefaults(schema.innerType())
    // return schema inner shape as a fresh zodObject
    return getDefaults(z.ZodObject.create(schema.innerType().shape))
  }

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

// TYPES

export type UseZodFormMode = 'controlled' | 'uncontrolled'

export type SubmitHandler<SchemaType> = (data: SchemaType) => void

export type UnControlledField = {
  name: string
  defaultValue: string
  label: string
  error: string
}

export type ControlledField = Omit<UnControlledField, 'defaultValue'> & {
  value: string
}

export type UseZodField = ControlledField | UnControlledField

export type UseZodFormFormEventHandlers = {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  onFocus: (e: FocusEvent<HTMLFormElement>) => void
  onBlur: (e: FocusEvent<HTMLFormElement>) => void
  onChange?: (e: ChangeEvent<HTMLFormElement>) => void
}

export type UseZodFormResult<T> = {
  getField: (name: keyof T, overrideMode?: UseZodFormMode) => UseZodField
  getForm: () => UseZodFormFormEventHandlers
  getError: (name?: keyof T) => {}
  setField: (name: keyof T, value: unknown) => boolean
  setError: (name: keyof T, value: string) => void
  isDirty: (name?: keyof T) => boolean
  isTouched: (name?: keyof T) => boolean
  isValid: (name?: keyof T) => boolean
  isSubmitting: () => boolean
}
