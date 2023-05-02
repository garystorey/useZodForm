# useZodForm

A simple React hook to manage your form state. Similar to react-hook-form or formik.
You can check it out on [CodeSandbox](https://codesandbox.io/s/testing-usezodform-hook-8ky97s?file=/src/App.tsx).

## Installation

Use one of the following commands to install:

```bash
npm install usezodform

//or

pnpm install usezodform

//or

yarn add usezodform
```

## Usage

First, create a zod schema and infer the type:

```tsx
import { z } from 'zod'

const schema = z.object({
  firstName: z.string().min(1, 'Too short').describe('First Name'),
  lastName: z.string().min(1, 'Too short').describe('Last Name'),
})

type FormSchema = z.infer<typeof schema>
```

Now, create an `initialValues` object for the schema and a form submit handler that will receive the data from the form.

```tsx
const initialValues: FormSchema = {
  firstName: '',
  lastName: '',
}

const onSubmit = (data: FormSchema) => console.log(data)
```

Next, import `usezodform` and set up the form:

```tsx
import { useZodForm } from 'usezodform'
const { isValid, getField, handleSubmit } = useZodForm<FormSchema>({ schema, initialValues, onSubmit })

const fn = getField('firstName')
const ln = getField('lastName')

return (
  <form onSubmit={handleSubmit}>
    <div>
      <label htmlFor={fn.name}>{fn.label}</label>
      <input id={fn.name} name={fn.name} type="text" value={fn.value} onBlur={fn.onBlur} onFocus={fn.onFocus} />
      {fn.error ? <div>{fn.error}</div> : null}
    </div>
    <div>
      <label htmlFor={fn.name}>{fn.label}</label>
      <input id={fn.name} name={fn.name} type="text" value={fn.value} onBlur={fn.onBlur} onFocus={fn.onFocus} />
      {fn.error ? <div>{fn.error}</div> : null}
    </div>
    <button disabled={!isValid()}>Submit</button>
  </form>
)
```

When using a custom React component, the code can be simplified by spreading the results of the `getField` call onto your component:

```tsx
<MyCustomInput {...getField('firstName')} />
```

<br/>

## Props

`useZodForm` accepts the following properties:

| name          | description                                 |
| ------------- | ------------------------------------------- |
| schema        | any valid `zod` schema                      |
| initialValues | default values for each field in the schema |
| onSubmit      | callback function to handle form data       |

---

<br/>

`useZodForm` returns the following:

| name           | description                                            |
| -------------- | ------------------------------------------------------ |
| getField       | get info for a given field (_see below_)               |
| getValue       | get the current value for a field                      |
| getAllValues   | returns all the current values of all the form fields  |
| getError       | returns a string with current error or "" for no error |
| getLabel       | returns the value of zod `describe`                    |
| getDescription | returns the value of zod `describe`                    |
| handleSubmit   | submit handler for form                                |
| handleBlur     | blur handler for all fields                            |
| handleFocus    | focus handler for all fields                           |
| isTouched      | `true/false` - has given field been touched by user    |
| isDirty        | `true/false` - has given field been modified by user   |
| isValid        | `true/false` - is given field currently valid          |

<br/>

`getField` is the default way to get data about a specific field. The other `get*` methods return a single value and are useful to manually pass in the props to your component. `getField` returns the following:

| name         | description                              |
| ------------ | ---------------------------------------- |
| name         | name of the current field                |
| id           | id of the current field (_same as name_) |
| defaultValue | current value of the given field         |
| label        | current value of zod `describe`          |
| onBlur       | blur handler for the given field         |
| onFocus      | focus handler for the given field        |

## More Info

Although I don't anticpate this breaking any of your code, use at your own risk.

## TODO

- Continue to optimize performance
