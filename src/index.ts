import { FormEvent, FocusEvent, useCallback, useState, useMemo, useRef } from 'react'
import { z } from 'zod'

export type UncontrolledFieldState = {
  id: string
  name: string
  defaultValue: string
  label: string
  error: string
  onBlur: (e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => void
  onFocus: (e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => void
}

export type ControlledFieldState = {
  id: string
  name: string
  value: string
  label: string
  error: string
  onBlur: (e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => void
  onFocus: (e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => void
}

export type MUIFieldState = {
  id: string
  name: string
  defaultValue: string
  label: string
  error: boolean
  onFocus: (e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => void
  onBlur: (e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => void
  helperText: string
}

export type FieldState = UncontrolledFieldState | ControlledFieldState | MUIFieldState
// helper functions

export type UseZodFormOptions = {
  mode: 'controlled' | 'uncontrolled'
}
export type UseZodFormProps<T> = {
  onSubmit: (data: T) => void
  initialValues: T
  schema: z.AnyZodObject
  options?: UseZodFormOptions
}

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

let valid = false

const defaultZodFormOptions = {
  mode: 'uncontrolled' as const,
}

export function useZodForm<T>({
  onSubmit,
  initialValues,
  schema,
  options = defaultZodFormOptions,
}: UseZodFormProps<T>) {
  const initialString = useMemo(() => stringObjectFromInitial({ ...initialValues } as any), [initialValues])

  const values = useRef<T>({ ...initialValues })
  const touched = useRef<BooleanObject>(booleanObjectFromInitial({ ...initialValues } as any))
  const dirty = useRef<BooleanObject>(booleanObjectFromInitial({ ...initialValues } as any))

  const [errors, setErrors] = useState({ ...initialString })

  const getValue = (key: keyof T) => values.current[key]
  const getLabel = (key: keyof T) => schema.shape[key].description ?? ''
  const getDescription = (key: keyof T) => schema.shape[key].description ?? ''
  const getError = (key: keyof T) => getByValue(errors, key as string) ?? ''
  const isDirty = (key: keyof T) => (getByValue(dirty.current as any, key as string) === 'true' ? true : false ?? false)
  const isTouched = (key: keyof T) =>
    getByValue(touched.current as any, key as string) === 'true' ? true : false ?? false
  const getAllValues = () => ({ ...values.current })

  const isValid = (key?: keyof T) => (key ? schema.shape[key].safeParse(values.current[key]) : valid)

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const result = schema.safeParse(values.current)
      if (result.success) {
        onSubmit(values.current)
        touched.current = booleanObjectFromInitial({ ...initialValues } as any)
        dirty.current = booleanObjectFromInitial({ ...initialValues } as any)
        values.current = { ...initialValues }
        setErrors({ ...initialString })
        e.currentTarget.reset()
      } else {
        if ('error' in result) {
          const issues = result.error.errors.reduce((acc, i) => {
            return {
              ...acc,
              [i.path.join('-')]: i.message,
            }
          }, {})
          setErrors({ ...issues })
          valid = false
        }
      }
    },
    [onSubmit, values, schema, initialString, initialValues],
  )

  const handleFocus = useCallback((e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [e.target.name]: '',
    }))
    touched.current[e.target.name as string] = true
  }, [])

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      let value: any = e.target.value || ''
      const name = e.target.name as string
      if (e.target.tagName === 'INPUT') {
        if (e.target.type === 'checkbox') {
          const el = e.target as HTMLInputElement
          value = el.checked
        }
        if (e.target.type === 'number') {
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
        valid = schema.safeParse(values.current).success
        setErrors((prevErrors) => {
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

      setErrors((prevErrors) => {
        return {
          ...prevErrors,
          [name]: issues,
        }
      })
    },
    [schema, values],
  )

  const getField = (key: keyof T) => {
    const name = String(key)
    const error = getError(key) ?? ''
    const val = (getValue(key) as string) ?? ''
    const label = getLabel(key) ?? ''

    if (options.mode === 'uncontrolled') {
      return {
        id: name,
        name,
        defaultValue: val,
        label,
        error,
        onFocus: handleFocus,
        onBlur: handleBlur,
      } as UncontrolledFieldState
    }
    return {
      id: name,
      name,
      value: val,
      label,
      error,
      onFocus: handleFocus,
      onBlur: handleBlur,
    } as ControlledFieldState
  }

  return {
    handleSubmit,
    touched,
    dirty,

    handleBlur,
    handleFocus,

    getField,
    getAllValues,

    getLabel,
    getValue,
    getError,
    getDescription,

    isTouched,
    isDirty,
    isValid,
  }
}
