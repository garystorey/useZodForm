import { FormEvent, FocusEvent, useCallback, useState, useMemo, useRef, ChangeEvent } from 'react'
import { z } from 'zod'

type FormField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
type UseZodFormMode = 'controlled' | 'uncontrolled'

export type SubmitHandler<SchemaType> = (data: SchemaType) => void

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

export type UseZodField = ControlledField | UnControlledField

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

let valid = false
let submitting = false

export function useZodForm<SchemaType>(
  schema: z.AnyZodObject,
  onSubmit: SubmitHandler<SchemaType>,
  mode: UseZodFormMode = 'uncontrolled',
) {
  const initialValues = getDefaults(schema)
  const initialString = useMemo(() => objectToString({ ...initialValues }), [initialValues])

  const values = useRef<SchemaType>({ ...initialValues })

  const touched = useRef(objectToBoolean({ ...initialValues }))
  const dirty = useRef(objectToBoolean({ ...initialValues }))
  const previousValue = useRef<unknown>('')

  const [errors, setErrors] = useState({ ...initialString })

  const getValue = (key: string) => {
    if (!key) return
    return values.current[key as keyof SchemaType]
  }
  const getLabel = (key: string) => schema.shape[key].description ?? ''
  const getError = (key: string) => getByValue(errors, key as string) ?? ''
  const isSubmitting = () => submitting

  const isValid = (key?: keyof z.infer<typeof schema>) =>
    key ? schema.shape[key].safeParse(values.current[key as keyof SchemaType]) : valid

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
  const getField = (key: keyof SchemaType, overrideMode: UseZodFormMode = 'uncontrolled'): UseZodField => {
    const name = String(key)
    const error = getError(name) ?? ''
    const val = getValue(name) ?? ''
    const label = getLabel(name) ?? ''

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

  const setField = (name: keyof SchemaType, value: unknown) => {
    if (!name) return
    const result = schema.shape[name].safeParse(value)
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
    }
  }

  return {
    handleChange,
    setField,
    getField,
    getForm,
    touched: touched.current,
    dirty: dirty.current,
    isValid,
    isSubmitting,
  }
}
