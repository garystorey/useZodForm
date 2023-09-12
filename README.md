# useZodForm

A React hook to manage your form state similar to react-hook-form or formik.

## Installation

Use one of the following commands to install:

```bash
npm install usezodform
// or
pnpm add usezodform
// or
yarn add usezodform
```

## Usage

First, create a [zod](https://zod.dev) schema and a form `onSubmit` handler. This handler will receive the form data as an argument.

```tsx
import { z } from 'zod'

const schema = z.object({
  firstName: z.string().min(1, 'Too short').describe('First Name').default(''),
  lastName: z.string().min(1, 'Too short').describe('Last Name').default(''),
})

type FormSchema = z.infer<typeof schema>

const onSubmit = (data: FormSchema) => console.log(data)
```

**Note:** The zod `describe` function is used as the input's ` label` for the form field and `default` will be used as the initial value for the field.

Next, import `usezodform` and set up the form:

```tsx
import { useZodForm } from 'usezodform'
const { getField, getForm } = useZodForm<FormSchema>({ schema, onSubmit })

const firstName = getField('firstName')
const lastName = getField('lastName')

return (
  <form {...getForm()}>
    <div>
      <label htmlFor={firstName.name}>{firstName.label}</label>
      <input type="text" id={firstName.id} name={firstName.name} value={firstName.value} />
      {firstName.error ? <div>{firstName.error}</div> : null}
    </div>
    <div>
      <label htmlFor={lastName.name}>{lastName.label}</label>
      <input type="text" id={lastName.id} name={lastName.name} value={lastName.value} />
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

**Note:** It is also recommended to `memo`-ize your components to reduce re-rendering.

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

| name         | description                                                                                           |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| getField     | get the props for a given form field                                                                  |
| getForm      | get the props for the form                                                                            |
| touched      | `true/false` - has given field been touched by user (ex: touched.firstName===true)                    |
| dirty        | `true/false` - has given field been modified by user (ex: dirty.firstName===true)                     |
| isValid      | `true/false` - given field (or form if no name passed) is currently valid (ex: isValid('firstName') ) |
| handleChange | An `onChange` handler for a form field (_onChange is not used by default_)                            |

<br/>

The `getForm` method returns the following:

| name     | description                       |
| -------- | --------------------------------- |
| onFocus  | focus handler for all form fields |
| onBlur   | blur handler for all form fields  |
| onSubmit | submit handler for the form       |

<br/>

The `getField` method returns the following:

| name            | description                              |
| --------------- | ---------------------------------------- |
| name            | name of the current field                |
| id              | id of the current field (_same as name_) |
| defaultValue \* | current value of the given field         |
| label           | current value of zod `describe`          |
| error           | current error for the field              |

\* If you are using `controlled` mode, then `defaultValue` will be returned as `value`.

<br/>

## Overriding the form mode

You can now override the form mode (_uncontrolled/controlled_) set in the options by passing `mode` as an second parameter to the `getField` method. For example, `getField('firstName','controlled')` will return the properties of the `firstName` field as a controlled component.

<br/>

## Examples

- [useZodForm - No Component Library](https://codesandbox.io/s/testing-usezodform-hook-8ky97s?file=/src/App.tsx)
- [useZodForm- MUI](https://codesandbox.io/s/usezodform-with-mui-87gu0o?file=/src/App.tsx)
- [useZodForm- Semantic UI](https://codesandbox.io/s/usezodform-with-semantic-ui-pn5hjy?file=/src/App.tsx)

<br/>

## To Do

- Finalize API for v1.0.
- Continue to optimize performance
- Add examples for additional component libraries
- Create documentation website
