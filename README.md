# useZodForm

A simple React hook to manage your form state. Similar to react-hook-form or formik.

## Installation

Use one of the followin commands to install:

```bash
npm install usezodform

//or

pnpm install usezodform

//or

yarn add usezodform
```

## Usage

First you need to create a zod schema and infer the type:

```tsx
import { z } from 'zod'

const schema = z.object({
  firstName: z.string().min(1, 'Too short').describe('First Name'),
  lastName: z.string().min(1, 'Too short').describe('Last Name'),
})

type FormSchema = z.infer<typeof schema>
```

Once you have created the schema, create the initial values object for the schema and a submit handler that will receive the data from the form.

```tsx
const initialValues: FormSchema = {
  firstName: '',
  lastName: '',
}

const onSubmit = (data: FormSchema) => console.log(data)
```

Now, import `usezodform` and set up the form:

```tsx
import { useZodForm } from 'usezodform'
const { state, getField, handleSubmit } = useZodForm<FormSchema>({ schema, initialValues, onSubmit })

const { name, value, onChange, onBlur, onFocus, error, label } = getField('firstName')

return (
  <form onSubmit={handleSubmit}>
    <div>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type="text" value={value} onChange={onChange} onBlur={onBlur} onFocus={onFocus} />
      {error ? <div>{error}</div> : null}
    </div>
    <button disabled={state !== 'valid'}>Submit</button>
  </form>
)
```

When using a custom React component, the code can be simplified by spreading the results of the `getField` call onto your component:

```tsx
<MyIput {...getField('firstName')} />
```

<br/>

## Props

`useZodForm` accepts the following properties:

| name          | description                               |
| ------------- | ----------------------------------------- |
| schema        | any valid `zod` schema                    |
| initialValues | default values for each field in the form |
| onSubmit      | callback function to handle form data     |

---

<br/>

`useZodForm` returns the following:

| name         | description                                                             |
| ------------ | ----------------------------------------------------------------------- |
| state        | current form state: "`initial`", "`validating`","`valid`" , "`invalid`" |
| getField     | get info for a given field (_see below_)                                |
| getValue     | get the current value for a field                                       |
| getAllValues | returns all the current values of all the form fields                   |
| getError     | returns a string with current error or "" for no error                  |
| getLabel     | returns the value of zod `describe`                                     |
| handleSubmit | submit handler for form                                                 |
| handleChange | change handler for all fields                                           |
| handleBlur   | blur handler for all fields                                             |
| handleFocus  | focus handler for all fields                                            |
| isTouched    | `true/false` - has given field been touched by user                     |
| isDirty      | `true/false` - has given field been modified by user                    |

<br/>

`getField` is the default way to get data about a specific field. The other `get*` methods return a single value and are useful to manually pass in the props to your component. `getField` returns the following:

| name     | description                              |
| -------- | ---------------------------------------- |
| name     | name of the current field                |
| id       | id of the current field (_same as name_) |
| value    | current value of the given field         |
| label    | current value of zod `describe`          |
| onChange | change handler for the given field       |
| onBlur   | blur handler for the given field         |
| onFocus  | focus handler for the given field        |

**Note**: `onBlur` and `onFocus` are used to track the `touched` values and to perform validation on blur. If you do not need this functionality then you do not have to add those events to your form field.

## More Info

Although I dont anticpate this breaking any of your code, use at your own risk.
