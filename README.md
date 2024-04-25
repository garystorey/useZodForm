# useZodForm

A React hook written in TypeScript to manage form state using [zod](https://zod.dev) with no additional dependencies.
It provides functions and state variables for handling form validation, submission and field management based on the provided Zod schema.

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

To use `useZodForm`, you need a zod schema and a form submission handler.

`useZodForm` takes advantage of zod's `default` and `describe` functions. When defining your schema, you can use zod's `describe` function to add a label to your form field and the `default` function to set an initial value for the form field. This means you only have to update information about your form fields in one location.

```tsx
import { z } from 'zod'

const formSchema = z.object({
  firstName: z.string().min(1, 'Too short').describe('First Name').default(''),
  lastName: z.string().min(1, 'Too short').describe('Last Name').default(''),
})

```

The submit handler will receive validated form data as its argument.
When creating your form handler, you can optionally use the useZodForm `SubmitHandler<T>` type.
It accepts a generic type that should match your form schema.

```tsx
type FormSchema = z.infer<typeof formSchema>

//const onSubmit: SubmitHandler<FormSchema> = (data) => console.log(data)

const onSubmit = (data: FormSchema) => console.log(data)

```

Next, import `usezodform`. The hook takes two required paramaters and one optional parameter.
The first parameter is the zod `schema` and the second parameter is the `onSubmit` handler.
The `mode` parameter is optional and defaults to "uncontrolled".

**Note**: "uncontrolled" is the default mode for useZodForm and is not required.  

```tsx
import { useZodForm } from 'usezodform'

const zodform = useZodForm(formSchema, onSubmit, /* "uncontrolled" */ ) 

```

```tsx
const { getForm, getField, isSubmitting } = zodform

/* grab the field data */
const firstName = getField('firstName')
const lastName = getField('lastName')

return (
  <form {...getForm()}>

    <div className="formfield">
      <label htmlFor={firstName.id}>{firstName.label}</label>
      <input type="text" 
        id={firstName.id} name={firstName.name} 
        value={firstName.value}
        aria-describedby={`${firstName.id}-description`}
        aria-invalid={firstName.error ? 'true' : 'false'} 
        aria-errormessage={
          firstName.error ? `${firstName.id}-description` : undefined
        }
      />
      <output aria-live="polite" id={`${firstName.id}-description`} className={firstName.error ? 'error' : ''}>
        {firstName.error ? firstName.error : "Enter your first name"}
      </output>
    </div>

    <div className="formfield">
      <label htmlFor={lastName.id}>{lastName.label}</label>
      <input type="text" 
        id={lastName.id} name={lastName.name} 
        value={lastName.value}
        aria-describedby={`${lastName.id}-description`} 
        aria-invalid={lastName.error ? 'true' : 'false'}
        aria-errormessage={
          lastName.error ? `${lastName.id}-description` : undefined
        }
      />
      <output aria-live="polite" id={`${lastName.id}-description`} className={lastName.error ? 'error' : ''}>
        {lastName.error ? lastName.error : "Enter your last name"}
      </output>
    </div>

    <button aria-disabled={isSubmitting()}>
    {isSubmitting() ? 'Submitting...' : 'Submit'}</button>
    
  </form>
)
```

When using a custom React component, the code can be simplified by spreading the results of the `getField` call onto your component:

```tsx
<MyCustomInput {...getField('firstName')} />
```

## Props

`useZodForm` accepts the following parameters:

| name     | description                                   |
| -------- | --------------------------------------------- |
| schema   | any valid `zod` schema                        |
| onSubmit | callback function to handle form data         |
| mode?    |  `uncontrolled` (_default_) / `controlled`        |

<br/>

`useZodForm` returns the following:

| name         | description                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| getField     | get the props for a given form field                                                                    |
| setField     | set the value of a given form field                                                                     |
| getForm      | get the props for the form                                                                              |
| touched      | has given field been touched by user (ex: touched.firstName===true)                                     |
| dirty        | has given field been modified by user (ex: `dirty.firstName===true`)                                      |
| isValid      | `true/false` - given field (_or form if no name passed_) is currently valid (ex: `isValid('firstName')` ) |
| isSubmitting | `true/false` - is the form currently being submitted                                                    |
| handleChange | An `onChange` handler for a form field (_onChange is not used by default_)                              |
| errors | List of errors on the current form                                |

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
| defaultValue / value \* | current value of the given field         |
| label           | current value of zod `describe`          |
| error           | current error for the field              |

\* In `uncontrolled` mode, `defaultValue` will be returned. In `controlled` mode, `value` will be returned instead.

<br/>

## Overriding the form mode

You can now override the default form `mode` by passing an optional `mode` to the `getField` method as a second parameter. For example,

```tsx
getField('firstName','controlled')
```

will return the properties of the `firstName` field as a _controlled_ component.

<br/>

## Examples

- [useZodForm - No Component Library](https://codesandbox.io/s/testing-usezodform-hook-8ky97s?file=/src/App.tsx)
- [useZodForm- MUI](https://codesandbox.io/s/usezodform-with-mui-87gu0o?file=/src/App.tsx)
- [useZodForm- Semantic UI](https://codesandbox.io/s/usezodform-with-semantic-ui-pn5hjy?file=/src/App.tsx)

<br/>

## To Do

- <del>Finalize API for v1.0.</del> - Unless I find an issue this is it.
- <del>Continue to optimize performance</del> - only changes to errors cause a re-render.
- <del>Add examples for additional component libraries</del>
- Create documentation website
