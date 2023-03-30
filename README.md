# useZodForm

A simple React hook to manage your form state. Similar to react-hook-form or formik.

## Installation

Use one of the followin commands to install:

```shell
npm install usezodform
pnpm install usezodform
yarn add usezodform
```

## Usage

```jsx
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
  getField,       // get info for a field... SEE BELOW
  getValue,       // get the value for a field
  getError,       // getError('fieldName'):string ("" || error)
  getDescription, // getDescription('fieldName'):string (the value of zod.describe)
  handleSubmit,   // submit handler for form
  handleChange,   // change handler for all fields
  handleBlur,     // blur handler for all fields
  handleFocus,    // focus handler for all fields
  values,         // current form values (FormSchema)
  isTouched,      // isTouched('fieldName'):boolean
  isDirty,        // isDirty('fieldName'):boolean
} = form

const {
  name,           // the schema field name
  value,          // the current value for the given field
  description,    // the value of zod.describe for the given field
  error,          // the validation error message for the given field
  onChange,       // onChange handler for input
  onFocus,        // onFocus handler for input
  OnBlur          // onBlur handler for input
} = getField("firstName")

return (
  <form onSubmit={handleSubmit}>
    <div>
     <label htmlFor={name}>First Name</label>
     <input name={name} type="text" value={value} onChange={onChange} onBlur={onBlur} onFocus={onFocus}>
     {error ?<div>{error}</div>: <div>{description}</div>}
    </div>
    <button disabled={state !=="valid"}>Submit</button>
  </form>
)

```

This is meant as a simple example. We recommend using custom component that accept the results of `getField`
as parameters:

```jsx
<form onSubmit={handleSubmit}>
  <InputField label="First Name" {...getField('firstName')} />
</form>
```

## More Info

Although we dont anticpate this breaking any of your code, try at your own risk.
