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
const { isValid, getField, handleSubmit } = useZodForm<FormSchema>({ schema, onSubmit })

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
    <button disabled={!isValid()}>Submit</button>
  </form>
)
```

**Note:** By design, `useZodForm` does not use the `onChange` event as this can cause the form to re-render unnecessarily.

When using a custom React component, the code can be simplified by spreading the results of the `getField` call onto your component:

```tsx
<MyCustomInput {...getField('firstName')} />
```

<br/>

## Props

`useZodForm` accepts the following properties:

| name     | description                                           |
| -------- | ----------------------------------------------------- |
| schema   | any valid `zod` schema                                |
| onSubmit | callback function to handle form data                 |
| options  | configures the `mode`: _uncontrolled_ vs _controlled_ |

<br/>

**Note:** To set the initial values used by the form, simply add a `default` value to your schema fields.

<br/>

`useZodForm` returns the following:

| name         | description                                              |
| ------------ | -------------------------------------------------------- |
| getField     | get info for a given field (_see below_)                 |
| handleSubmit | submit handler for form                                  |
| isTouched    | `true/false` - field been touched by user                |
| isDirty      | `true/false` - field been modified by user               |
| isValid      | `true/false` - is the field or the form currently valid. |

<br/>

## The `getField` method

This is the default way for getting information about a schema field. By default, `getField` returns the following:

| name         | description                              |
| ------------ | ---------------------------------------- |
| name         | name of the current field                |
| id           | id of the current field (_same as name_) |
| defaultValue | current value of the given field         |
| label        | current value of zod `describe`          |
| error        | current error for the field              |
| onBlur       | blur handler for the given field         |
| onFocus      | focus handler for the given field        |

**Note:** If you are using `controlled` mode, then `defaultValue` will not be returned. Simply add the `value` and `onChange` props to the component.

<br/>

## Other get methods

Although `getField` is the recommended way to get all the information about a specific field, in some situations you may want to get specific pieces of the information. The other `get*` methods return a single value and are useful for manually passing the props to your component.

| name           | description                                            |
| -------------- | ------------------------------------------------------ |
| getValue       | get the current value for a field                      |
| getAllValues   | returns all the current values of all the form fields  |
| getError       | returns a string with current error or "" for no error |
| getDescription | returns the value of zod `describe`                    |
| getDefault     | returns the value of zod `default`                     |

**Note:** `getField` also returns an `onBlur` and `onFocus` functions. These handle the schema validation and should always be passed to the component.

<br/>

## Overriding the form mode

You can now override the form mode (_uncontrolled/controlled_) set in the options by passing `mode` as an second parameter to the `getField` method.
For example, `getField('firstName','controlled')` will return the properties of the `firstName` field as a controlled component.

<br/>

## Examples

- [useZodForm - No Component Libary](https://codesandbox.io/s/testing-usezodform-hook-8ky97s?file=/src/App.tsx)
- [useZodForm- MUI](https://codesandbox.io/s/usezodform-with-mui-87gu0o?file=/src/App.tsx)

<br/>

## To Do

- Continue to optimize performance
- Add support for additional component libraries:
  - Antd
  - ??
- Add documentation
