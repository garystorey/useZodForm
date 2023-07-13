import { FormEvent, FocusEvent, useCallback, useState, useMemo, useRef, ChangeEvent } from 'react'
import { z } from 'zod'
import type {
  UseZodFormProps,
  UseZodFormMode,
  UnControlledOrControlledField,
  UnControlledField,
  ControlledField,
  FormField,
  ZodFormProps,
} from './types'
import { booleanObjectFromInitial, getByValue, getDefaults, stringObjectFromInitial } from './utils'

import type { InitialBooleanObject } from './utils'
let valid = false

const defaultZodFormOptions = {
  mode: 'uncontrolled',
} as const

export function useZodForm<T>({ onSubmit, schema, options = defaultZodFormOptions }: UseZodFormProps<T>) {
  const initialValues = getDefaults(schema)
  const initialString = useMemo(() => stringObjectFromInitial({ ...initialValues } as any), [initialValues])

  const values = useRef<T>({ ...initialValues })

  const touched = useRef<InitialBooleanObject>(booleanObjectFromInitial({ ...initialValues } as any))
  const dirty = useRef<InitialBooleanObject>(booleanObjectFromInitial({ ...initialValues } as any))
  const previousValue = useRef<unknown>('')

  const [errors, setErrors] = useState({ ...initialString })

  const getValue = (key: keyof T) => values.current[key]
  const getLabel = (key: keyof T) => schema.shape[key].description ?? ''
  const getError = (key: keyof T) => getByValue(errors, key as string) ?? ''

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
        setErrors((prevErrors) => {
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

      setErrors((prevErrors) => {
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
      setErrors((prevErrors) => ({
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

  /**
   * Generates a form object with event handlers.
   *
   * @return {ZodFormProps} - The form properties  */
  const getForm = (): ZodFormProps => {
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
   * @return {UnControlledOrControlledField} - The field properties.
   */
  const getField = (key: keyof T, mode: UseZodFormMode = 'uncontrolled'): UnControlledOrControlledField => {
    const name = String(key)
    const error = getError(key) ?? ''
    const val = (getValue(key) as string) ?? ''
    const label = getLabel(key) ?? ''

    if (options.mode === 'uncontrolled' || mode !== 'controlled') {
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
  }
}
