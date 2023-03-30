# useZodForm

A simple React hook to manage your form state. Similar to react-hook-form or formik.

## Installation

```bash
npm install usezodform

pnpm install usezodform

yarn add usezodform
```

## Usage

```typescript
import { z } from "zod"
import { useZodForm } from "usezodform"

const schema = z.object({
  firstName: z.string().min(1, "Too short").describe('Enter your first name'),
  lastName: z.string().min(1, "Too short").describe('Enter your last name')
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

const {
  name,           // the schema field name
  value,          // the current value for the given field
  description,    // the value of the "describe" for the given field
  errror,         // the validation error message for the given field
  onChange,       // onChange handler for input
  onFocus,        // onFocus handler for input
  OnBlur          // onBlur handler for input
} = getField("firstName")

```

## More Info

More to come....
