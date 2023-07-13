import { z } from 'zod'
import { FocusEvent } from 'react'

export type FormField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

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

export type UseZodFormMode = 'controlled' | 'uncontrolled'
export type UseZodFormOptions = {
  mode?: UseZodFormMode
}

export type UseZodFormProps<T> = {
  onSubmit: (data: T) => void
  schema: z.AnyZodObject
  options?: UseZodFormOptions
}
export type ZodFormProps = {
  onSubmit: (data: any) => void
  onFocus: (e: FocusEvent<HTMLFormElement>) => void
  onBlur: (e: FocusEvent<HTMLFormElement>) => void
}
