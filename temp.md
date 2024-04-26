# useZodForm

<div style="max-width:80ch">

[![License](https://img.shields.io/badge/license-MIT-%230172ad)](https://github.com/picocss/pico/blob/master/LICENSE.md)
![NPM Version](https://img.shields.io/npm/v/usezodform)

A React hook that provides a simple way to manage form state by handling form validation, submission and field management, using a [zod](https://zod.dev) schema.

## Installation

To install `useZodForm`, use your preferred package manager, such as `npm`, `pnpm`, `bun` or `yarn`. The example below uses `npm`.

```bash
npm install usezodform
```

## Table of contents

- [Quick start](#quick-start)
- [Documentation](#documentation)
- [Copyright and license](#copyright-and-license)

## Quick start

Once installed, import the hook from the `usezodform` package.

```tsx
import { useZodForm } from "usezodform"
```

Now that you've imported the `useZodForm` hook, create a zod schema. In the example below, the schema has two fields: `firstName` and `lastName`. Both fields are required and must be at least one character long.

### Define your schema

When defining your schema, use zod's `describe` function to add a value for the label of the form field and the `default` function to set the initial value of the field.
This makes things easier for internationalization as all strings are localized to the schema. This also means you ***do not need** to create an initial values object for your form schema*.

```tsx
import {z} from 'zod'

const schema = z.object({
    firstName: z.string().min(1, "Too short").describe("First Name").default(""),
    lastName: z.string().min(1, i18n("errors.tooShort")).describe(i18n("labels.lastName")).default(""),
});
```

Next, create a form submit handler. In the example below, the form handler takes a generic type that should match your zod schema. You can also use the `SubmitHandler` type to create your form handler. See the [types](/#types) documentation for more information.  

```tsx
import { SubmitHandler } from "usezodform"

type FormSchema = z.infer<typeof schema>

const onSubmit: SubmitHandler<FormSchema> = (data) => console.log(typeof data) // FormSchema
```

Next, call the `useZodForm` hook. The hook takes two required parameters: the zod schema and the form submit handler. The third parameter, `mode`, is **optional**. It can be set to "controlled" or "uncontrolled". The default mode is "uncontrolled".

```tsx
const zodform = useZodForm(schema, onSubmit)
```

Now you can use the `getForm`, `getField` functions to access the form state. Below is a simple example.

```tsx
const { getForm, getField } = zodform

const firstName = getField('firstName')
const lastName = getField('lastName')

return (
  <form {...getForm()}>

    <div className="formfield">
      <label htmlFor={firstName.name}>{firstName.label}</label>
      <input type="text" id={firstName.name} name={firstName.name} defaultvalue={firstName.value} />
      <p>
      {firstName.error ? firstName.error : "Enter you first name"}
      </p>
    </div>

    <div className="formfield">
      <label htmlFor={lastName.name}>{lastName.label}</label>
      <input type="text" id={lastName.name} name={lastName.name} defaultValue={lastName.value} />
      <p>
      {lastName.error ? lastName.error : "Enter you last name"}
      </p>
    </div>

    <button type="submit">Submit</button>

  </form>
)
```

That's it! The form will be validated against your schema and the submit handler will be called once all fields are valid.

For more information on all of the available methods, check out the [documentation](#documentation). You can see the [Using third party components](#using-third-party-components) section or the [Creating custom components](#creating-custom-components) for more complete examples.

## Documentation

In this section, you will find all the available methods and types for the `useZodForm` hook.

The `useZodForm` hook returns the following:

| Method | Description |
| --- | --- |
| `getForm` | Returns the form event handlers |
| `getField` | Returns the given field data |
| `getError` | Returns the error message for the field or empty string |
| `setField` | Sets the field value |
| `setError` | Sets the error message for the field |
| `isValid` | Returns boolean if the form or given field is valid |
| `isSubmitting` | Returns boolean if the form is submitting |
| `isTouched` | Returns boolean if the given field has been touched |
| `isDirty` |  Returns boolean if the given field has been changed ex:|

<br/>

In most situations, the `getField` and `getForm` methods will be sufficient.

However, if you need more granular control over the form state, you can use the additional methods like `setField` and `setError`. This can be useful when dealing with interdependent fields.

### getForm

The `getForm` method returns the following:

| name     | Type | Description                |
| -------- | ---------------------|--------------------------- |
| onFocus  | (event: FocusEvent\<HTMLFormElement\>): void | focus handler for all form fields |
| onBlur   | (event: FocusEvent\<HTMLFormElement\>): void | blur handler for all form fields  |
| onSubmit | (event: FormEvent\<HTMLFormElement\>): void | calls the `onSubmit` handler when valid       |
| onChange? * | (event: ChangeEvent\<HTMLFormElement\>): void | change handler for all controlled form fields |

<br/>

**Note**: In `controlled` mode, an `onChange` handler is returned. In `uncontrolled` mode, no handler is returned.

### getField

The `getField` method returns the following:

| name         | Type   | description                              |
| -----------|---- | ---------------------------------------- |
| name     |string       | name of the current field                |
| defaultValue / value \* | unknown | current value of the given field         |
| label     | string      | current value of zod `describe`          |
| error     | string      | current error for the field              |

<br/>

**Note**: In `controlled` mode, `value` will be returned. In `uncontrolled` mode, `defaultValue` will be returned instead.

### API

### Types

```ts
declare function useZodForm<SchemaType>(
  schema: z.AnyZodObject,
  onSubmit: SubmitHandler<SchemaType>,
  mode?: UseZodFormMode
): UseZodFormReturn<SchemaType>

type UseZodFormReturn<SchemaType> = {
  getForm: (): UseZodFormFormEventHandlers
  getField: (name: keyof SchemaType): UseZodField
  getError: (name: keyof SchemaType): string
  setField: (name: keyof SchemaType, value: unknown): void
  setError: (name: keyof SchemaType, error: string): void
  isValid: (name?: keyof SchemaType): boolean
  isTouched: (name: keyof SchemaType): boolean
  isDirty: (name: keyof SchemaType): boolean
  isSubmitting: (): boolean
}

type UseZodFormMode = 'controlled' | 'uncontrolled'

type SubmitHandler<SchemaType> = (data: SchemaType) : void

type UseZodFormFormEventHandlers = {
  onSubmit: (event: FormEvent<HTMLFormElement>): void,
  onFocus: (event: FocusEvent<HTMLFormElement>): void,
  onBlur: (event: FocusEvent<HTMLFormElement>): void,
  onChange?: (event: ChangeEvent<HTMLFormElement>): void,
}

type UseZodField = ControlledField | UnControlledField

type UnControlledField = {
  name: string
  defaultValue: string
  label: string
  error: string
}

type ControlledField = Omit<UnControlledField, 'defaultValue'> & {
  value: string
}
```

### Using Third Party Components

Check out these online code sandbox examples using third party form components with useZodForm.

- [useZodForm - No Component Library](https://codesandbox.io/s/testing-usezodform-hook-8ky97s?file=/src/App.tsx)
- [useZodForm - MUI](https://codesandbox.io/s/usezodform-with-mui-87gu0o?file=/src/App.tsx)
- [useZodForm - Semantic UI](https://codesandbox.io/s/usezodform-with-semantic-ui-pn5hjy?file=/src/App.tsx)

Your favorite library not listed? Please [open an issue](https://github.com/garystorey/usezodform/issues/new) if you would like to add it.

### Creating Custom Components

## Copyright and license

Licensed under the [MIT License](https://github.com/picocss/pico/blob/master/LICENSE.md).

</div>
