# useZodForm

A simple React hook to manage your form state. Similar to react-hook-form or formik. See below for example implementations.

## Installation

Use one of the following commands to install:

```bash
npm install usezodform
//or
pnpm add usezodform
//or
yarn add usezodform
```

## Usage

First, create a zod schema and a form submit handler.

```tsx
import { z } from 'zod'

const schema = z.object({
  firstName: z.string().min(1, 'Too short').describe('First Name').default(''),
  lastName: z.string().min(1, 'Too short').describe('Last Name').default(''),
})

type FormSchema = z.infer<typeof schema>

const onSubmit = (data: FormSchema) => console.log(data)
```

Next, import `usezodform` and set up the form:

```tsx
import { useZodForm } from 'usezodform'
const { getField, handleSubmit } = useZodForm<FormSchema>({ schema, onSubmit })

const firstName = getField('firstName')
const lastName = getField('lastName')

return (
  <form onSubmit={handleSubmit}>
    <div>
      <label htmlFor={firstName.name}>{firstName.label}</label>
      <input
        type="text"
        id={firstName.id}
        name={firstName.name}
        value={firstName.value}
        onBlur={firstName.onBlur}
        onFocus={firstName.onFocus}
      />
      {firstName.error ? <div>{firstName.error}</div> : null}
    </div>
    <div>
      <label htmlFor={lastName.name}>{lastName.label}</label>
      <input
        type="text"
        id={lastName.id}
        name={lastName.name}
        value={lastName.value}
        onBlur={lastName.onBlur}
        onFocus={lastName.onFocus}
      />
      {lastName.error ? <div>{lastName.error}</div> : null}
    </div>
    <button>Submit</button>
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

| name     | description                                 |
| -------- | ------------------------------------------- |
| schema   | any valid `zod` schema                      |
| onSubmit | callback function to handle form data       |
| options  | `mode`: uncontrolled (default) / controlled |

<br/>

**Note:** To set the initial values used by the form, simply add a `default` value to your schema fields.

<br/>

`useZodForm` returns the following:

| name         | description                                                                        |
| ------------ | ---------------------------------------------------------------------------------- |
| getField     | get info for a given field (_see below_)                                           |
| handleSubmit | submit handler for form                                                            |
| touched      | `true/false` - has given field been touched by user (ex: touched.firstName===true) |
| isValid      | `true/false` - is given field currently valid                                      |

<br/>

The `getField` method returns the following:

| name            | description                              |
| --------------- | ---------------------------------------- |
| name            | name of the current field                |
| id              | id of the current field (_same as name_) |
| defaultValue \* | current value of the given field         |
| label           | current value of zod `describe`          |
| error           | current error for the field              |
| onBlur          | blur handler for the given field         |
| onFocus         | focus handler for the given field        |
| onChange \*\*   | change handler for the given field       |

\* If you are using `controlled` mode, then `defaultValue` will be returned as `value`.

\*\* `onChange` is only returned when using `controlled` mode.

<br/>

## Overriding the form mode

You can now override the form mode (_uncontrolled/controlled_) set in the options by passing `mode` as an second parameter to the `getField` method. For example, `getField('firstName','controlled')` will return the properties of the `firstName` field as a controlled component.

<br/>

## Examples

- [useZodForm - No Component Libary](https://codesandbox.io/s/testing-usezodform-hook-8ky97s?file=/src/App.tsx)
- [useZodForm- MUI](https://codesandbox.io/s/usezodform-with-mui-87gu0o?file=/src/App.tsx)

<br/>

## To Do

- Continue to optimize performance
- Add support for additional component libraries:
- Add documentation
