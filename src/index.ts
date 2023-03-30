import { ChangeEvent, FormEvent, FocusEvent, useCallback, useState } from 'react'
import { z } from 'zod'

type FormState = 'initial' | 'invalid' | 'valid' | 'validating'

type FieldState = {
  name: string
  value: string
  description: string
  error: string
  onBlur: (e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => void
  onFocus: (e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => void
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}
// helper functions

function booleanObjectFromInitial<T extends Record<string, any>>(object: T) {
  let obj = {}
  for (const [key] of Object.entries({ ...object })) {
    obj = {
      ...obj,
      [key]: false,
    }
  }
  return obj
}

function stringObjectFromInitial<T extends Record<string, any>>(object: T) {
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

export type UseZodFormProps<T> = {
  onSubmit: (data: T) => void
  initialValues: T
  schema: z.AnyZodObject
}

export function useZodForm<T>({ onSubmit, initialValues, schema }: UseZodFormProps<T>) {
  const initialBoolean = booleanObjectFromInitial({ ...initialValues } as any)
  const initialString = stringObjectFromInitial({ ...initialValues } as any)

  const [values, setValues] = useState<T>({ ...initialValues })
  const [touched, setTouched] = useState({ ...initialBoolean })
  const [dirty, setDirty] = useState({ ...initialBoolean })
  const [errors, setErrors] = useState({ ...initialString })
  const [state, setState] = useState<FormState>('initial')

  const getValue = (key: keyof T) => values[key]
  const getDescription = (key: keyof T) => schema.shape[key].description
  const getError = (key: keyof T) => getByValue(errors, key as string)
  const isDirty = (key: keyof T) => getByValue(dirty, key as string)
  const isTouched = (key: keyof T) => getByValue(touched, key as string)

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const result = schema.safeParse(values)
      if (result.success) {
        onSubmit(values)
        e.currentTarget.reset()
        setTouched({ ...initialBoolean })
        setDirty({ ...initialBoolean })
        setErrors({ ...initialString })
        setValues({ ...initialValues })
      } else {
        if ('error' in result) {
          const errors = result.error.errors.reduce((acc, i) => {
            return {
              ...acc,
              [i.path.join('-')]: i.message,
            }
          }, {})
          setErrors({ ...errors })
          setState('invalid')
        }
      }
    },
    [onSubmit, values, schema, initialBoolean, initialString, initialValues],
  )

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let value: any = e.target.value || ''
    const name = e.target.name

    if (e.target.tagName === 'INPUT') {
      if (e.target.type === 'checkbox') {
        const el = e.target as HTMLInputElement
        value = el.checked
      }
      if (e.target.type === 'number') {
        value = Number(value)
      }
    }
    setValues((prevForm) => ({ ...prevForm, [name]: value }))
    setTouched((prevForm) => ({ ...prevForm, [name]: true }))
    setDirty((prevForm) => ({ ...prevForm, [name]: true }))
  }, [])

  const handleFocus = useCallback((e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    setState('validating')
    setTouched((prevForm) => ({ ...prevForm, [e.target.name]: true }))
    setErrors((prevErrors) => ({
      ...prevErrors,
      [e.target.name]: '',
    }))
  }, [])

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      let value: any = e.target.value || ''
      const name = e.target.name

      const result = schema.shape[name].safeParse(value)

      if (result.success) {
        setState(schema.safeParse(values).success ? 'valid' : 'invalid')
        return
      }
      setState('invalid')

      const errors = result.error.errors.reduce((acc: string, i: z.ZodIssue) => {
        return (acc += i.message)
      }, '')

      setErrors((prevErrors) => {
        return {
          ...prevErrors,
          [name]: errors,
        }
      })

      setTouched((prevForm) => ({ ...prevForm, [e.target.name]: true }))
    },
    [schema, values],
  )

  const getField = (key: keyof T): FieldState => ({
    name: String(key),
    value: getValue(key) as string,
    description: getDescription(key),
    error: getError(key),
    onChange: handleChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
  })

  return {
    state,
    values,

    handleChange,
    handleSubmit,
    handleBlur,
    handleFocus,

    getDescription,
    getValue,
    getError,
    getField,

    isTouched,
    isDirty,
  }
}
