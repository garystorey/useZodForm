import { FocusEvent } from 'react'
import { z } from 'zod'

export type UncontrolledFieldState = {
  id: string
  name: string
  defaultValue: string
  label: string
  error: string
  onBlur: (e: FocusEvent<HTMLInputElement>) => void
  onFocus: (e: FocusEvent<HTMLInputElement>) => void
}

export type ControlledFieldState = {
  id: string
  name: string
  label: string
  error: string
  onBlur: (e: FocusEvent<HTMLInputElement>) => void
  onFocus: (e: FocusEvent<HTMLInputElement>) => void
}

export type FieldState = UncontrolledFieldState | ControlledFieldState

export type FormMode = 'controlled' | 'uncontrolled'
export type ControlledForm = Omit<FormMode, 'uncontrolled'>
export type UncontrolledForm = Omit<FormMode, 'controlled'>

export type UseZodFormOptions = {
  mode: FormMode
}

export type UseZodFormProps<T> = {
  onSubmit: (data: T) => void
  schema: z.AnyZodObject
  options?: UseZodFormOptions
}
