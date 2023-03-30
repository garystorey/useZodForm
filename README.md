# useZodForm

A simple React hook to manage your form state. Similar to react-hook-form or formik.

## Installation

```terminal
npm install @garystorey/useZodForm
```

## Usage

```typescript
import { z } from "zod"
import { useZodForm } from "@garystorey/useZodForm"

const schema = z.object({
  firstName: z.string().min(1, "Too short"),
  lastName: z.string().min(1, "Too short")
})

type FormSchema = z.infer<typeof schema>

const initialValues = {
  firstName: "",
  lastName: ""
}

const onSubmit = (data: FormSchema) => console.log(data)

const form = useZodForm<FormSchema>({ schema, initialValues, onSubmit })
const {
  state           // "initial" | "validating" | "valid" | "invalid"
  getError,       // getError('fieldName'):string ("" || error)
  getValue,       // get the value for a field
  getDescription, // get description for a field
  getField,       // get all available info for a field
  handleSubmit,   // submit handler for form
  handleChange,   // change handler for all fields
  handleBlur,     // blur handler for all fields
  handleFocus,    // focus handler for all fields
  values,         // current form values
  isTouched,      // isTouched('fieldName'):boolean
  isDirty,        // isDirty('fieldName'):boolean
} = form

```
