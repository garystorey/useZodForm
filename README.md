# useZodForm

A React hook to manage your form state using [zod](https://zod.dev) with no additional dependencies.

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

const formSchema = z.object({
  // "describe" will be used as the label for the form field
  firstName: z.string().min(1, 'Too short').describe('First Name').default(''),
  // "default" will be used as the initial value for the form field
  lastName: z.string().min(1, 'Too short').describe('Last Name').default(''),
})

// handle the form submit. recieves the validated data
// You can use the SubmitHandler type from 'usezodform' if you prefer

// const onSubmit: SubmitHandler<FormSchema> = (data) => console.log(data)
const onSubmit = (data: FormSchema) => console.log(data)
```

**Note:** The zod `describe` function is used as the input's `label` for the form field and `default` will be used as the initial value for the field.

Next, import `usezodform` and set up the form:

```tsx
import { useZodForm } from 'usezodform'

/*
Pass the required "schema" and "onSubmit" form handler to useZodForm. **Note**: "uncontrolled" is the default mode for useZodForm and is not required.
*/

const zodform= useZodForm(formSchema, onSubmit, /* "uncontrolled" */ ) 
/* destructure here for easy readability */
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

    <button aria-disabled={zf.isSubmitting()}>
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
