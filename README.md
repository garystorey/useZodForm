# useZodForm

<div style="max-width:80ch">

[![License](https://img.shields.io/badge/license-MIT-%230172ad)](https://github.com/garystorey/usezodform/blob/master/LICENSE.md)
![NPM Version](https://img.shields.io/npm/v/usezodform)

A React hook that provides a simple way to manage form state by handling form validation, submission and field management, using a [zod](https://zod.dev) schema.

## Table of contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [Documentation](#documentation)
- [Upgrade Guide](#upgrade-guide)
- [License](#license)

## Installation

To install `useZodForm`, use your preferred package manager, such as `npm`, `pnpm`, `bun` or `yarn`. `zod` is also required. The example below uses `npm`.

```bash
npm install usezodform zod
```

## Quick start

Follow the steps below to get started with `useZodForm`.

### Define your schema

The first step is to create a zod schema for the form. In this example, the schema that has two fields: `firstName` and `lastName`. Both fields are required and must be at least one character long.

```ts
const schema = z.object({
  firstName: z.string().min(1, "Too short"),
  lastName: z.string().min(1, "Too short"),
})
```

To make managing the form fields easier, `useZodForm` will make use of zod's `describe` function to add a label to the field. This makes it easier to internationalize the form, as all strings are localized to the schema.

Similarly, zod's `default` function can be used to set an initial value for the field. Because of this, `useZodform` does not require an "initial values" object to be created.

```tsx
import {z} from 'zod'

const stringSchema = z.string().min(1, "Too short")

const nameSchema = z.object({
    firstName: stringSchema.describe("First Name").default(""),
    // i18n label for last name
    lastName: stringSchema.describe(i18n("labels.lastName")).default(""),
});
```

### Create submit handler

Next, create a form submit handler. In the example below, the form handler takes a generic type that matches the zod schema. The `SubmitHandler` type is used to create the form handler. See the [types](/#types) section for more information.  

```tsx
import { SubmitHandler } from "usezodform"

type FormSchema = z.infer<typeof schema>

const onSubmit: SubmitHandler<FormSchema> = (data) => console.log(data)
```

### Initialize the hook

Import the hook from the `usezodform` package.

The hook takes two required parameters: the zod schema and the form submit handler.

The third parameter, `mode`, is **optional**. It can be set to "**controlled**" or "**uncontrolled**" (*the default is "uncontrolled"*). To understand which is the best for your situation,
refer to the [difference between controlled and uncontrolled form fields](https://claritydev.net/blog/react-controlled-vs-uncontrolled-components).

```tsx
import { useZodForm } from "usezodform"
const zodform = useZodForm<FormSchema>(schema, onSubmit)
```

### Setup the form

To setup the form, use the `getForm` and `getField` functions.
The `getForm` will set the form event handlers and `getField` returns the given field data. In the example below, `isSubmitting` is also used to check if the form is currently submitting.

```tsx
const { getForm, getField, isSubmitting } = useZodForm(schema, onSubmit)

const firstName = getField('firstName')
const lastName = getField('lastName')

return (
  <form {...getForm()}>

    <div>
      <label htmlFor={firstName.name}>{firstName.label}</label>
      <input type="text" 
        id={firstName.name} name={firstName.name} 
        defaultValue={firstName.defaultValue} 
      />
      <p>
      {firstName.error ? firstName.error : "Enter you first name"}
      </p>
    </div>

    <div>
      <label htmlFor={lastName.name}>{lastName.label}</label>
      <input type="text" 
        id={lastName.name} name={lastName.name} 
        defaultValue={lastName.defaultValue} 
      />
      <p>
      {lastName.error ? lastName.error : "Enter you last name"}
      </p>
    </div>

    <button type="submit" aria-disabled={isSubmitting()}>
    {isSubmitting() ? "Submitting..." : "Submit"}
    </button>

  </form>
)
```

That's it!

The form will be validated against your schema and the submit handler will be called when all fields are valid.

### More Information

To view all of the available methods, check out the [documentation](#documentation) below. For more complete examples, see the [using third party component libraries](#using-third-party-components) or the [creating custom components](#creating-custom-components) sections.

## Documentation

In this section, you will find all the available methods and types for the `useZodForm` hook.

The `useZodForm` hook returns the following methods. See the [UseZodFormReturn](#types) type for more information.

| Method | Description |
| --- | --- |
| `getForm` | Returns the form event handlers |
| `getField` | Returns the given field data |
| `getError` | Returns the error message for the field or empty string |
| `setField` | Sets the field value |
| `setError` | Sets the error message for the field |
| `isSubmitting` | Returns boolean if the form is submitting |
| `isValid` | Returns boolean if the form or field is valid |
| `isTouched` | Returns boolean if the form or field has been touched |
| `isDirty` |  Returns boolean if the form or field has been changed |

<br/>

In most situations, the `getField` and `getForm` methods will be sufficient.

However, if you need more granular control over the form state, you can use the additional methods like `setField` and `setError`. This can be useful when dealing with interdependent fields.

### getForm

The `getForm` method returns the following events.
 See the [UseZodFormFormEventHandlers](#types) type for more information.

| name     | Type | Description                |
| -------- | ---------------------|--------------------------- |
| `onFocus`  | (event: FocusEvent\<HTMLFormElement\>): void | focus handler for all form fields |
| `onBlur`   | (event: FocusEvent\<HTMLFormElement\>): void | blur handler for all form fields  |
| `onSubmit` | (event: FormEvent\<HTMLFormElement\>): void | calls the `onSubmit` handler when valid       |
| `onChange`?&nbsp;* | (event: ChangeEvent\<HTMLFormElement\>): void | change handler for all controlled form fields |

<br/>

**Note** * : In `controlled` mode, an `onChange` handler is returned. In `uncontrolled` mode, no change handler is returned.

### getField

The `getField` method returns the following data. See the [UseZodField](#types) type for more information.

| name         | Type   | description                              |
| -----------|---- | ---------------------------------------- |
| `name`    |string       | name of the current field                |
| `defaultValue` / `value` \* | unknown | current value of the given field         |
| `label`     | string      | current value of zod `describe`          |
| `error`     | string      | current error for the field              |

<br/>

**Note**: In `controlled` mode, `value` will be returned. In `uncontrolled` mode, `defaultValue` will be returned.

### getError

The `getError` method returns a `string` representing the current error for the given field.

```tsx
// empty string or error message
const firstNameError =  getError("firstName")
```

### setField

The `setField` method will update the value in form state for the given field. Returns `true` if the field is valid and updated successfully, `false` otherwise. **Note**: This method should only be used when you need to update the value in form state directly. For example, if you need to update the value of one field based on the value of another.

```tsx
// returns true if valid, false otherwise
const result = setField('firstName', 'John')
```

### setError

The `setError` will update the error in form state for the given field. Similar to the `setField` method, this method should only be used if you need to set an error for a field based on the value of another.

```tsx
// returns true if valid, false otherwise
const result = setError('firstName', 'Too short')
```

### isValid

The `isValid` method will return a boolean indicating whether the given field or the entire form is valid.

```tsx
// returns true if valid, false otherwise
const fieldResult = isValid('firstName')
const formResult = isValid()
```

### isSubmitting

The `isSubmitting` method will return a boolean indicating whether the form is currently submitting or not.

```tsx
<button>
  {isSubmitting() ? "Submitting..." : "Submit"}
</button>
```

### isDirty

The `isDirty` method will return a boolean indicating whether the given field or, if no name is provided, whether any field in the form has been changed.

```tsx
// returns true if valid, false otherwise
const fieldDirty = isDirty('firstName')
const formDirty = isDirty()
```

## Reporting Issues

If you encounter any issues, please [open an issue](https://github.com/garystorey/usezodform/issues/new)

## Using Third Party Components

Check out these online code sandbox examples using third party form components with useZodForm.

- [useZodForm - No Component Library](https://codesandbox.io/s/testing-usezodform-hook-8ky97s?file=/src/App.tsx)
- [useZodForm - MUI](https://codesandbox.io/s/usezodform-with-mui-87gu0o?file=/src/App.tsx)
- [useZodForm - Semantic UI](https://codesandbox.io/s/usezodform-with-semantic-ui-pn5hjy?file=/src/App.tsx)

Your favorite library not listed? Please [open an issue](https://github.com/garystorey/usezodform/issues/new) if you would like to add it.

### Creating Custom Components

In most instances, it is recommended to create custom components for your form fields. These can be wrappers around existing component libaries or your own custom components.

In the code example above, we can take the code for a single form field and extract that into its own component and pass the results of the `getField` method to it.

```tsx
// Field.tsx

export type FieldProps = UseZodField & {
  description?: string
  // any other custom props
}

export function Field(props: FieldProps) {
  const {name, label, error, description="", ...rest} = props
  return (
    <div className="formfield">
      <label htmlFor={name}>{label}</label>
      <input type="text" id={name} {...rest} />
      <p>
      {error ? error : description}
      </p>
    </div>
  )
}

// Form.tsx

<Field {...getField('firstName')} description="Enter your first name" />
```

**Please Note:** This is just an example. This is ***not an accessible component***.

## Types

The following types are exported from the `useZodForm` hook.

```ts
type UseZodFormMode = 'controlled' | 'uncontrolled';

type SubmitHandler<SchemaType> = (data: SchemaType) => void;

type UnControlledField = {
    name: string;
    defaultValue: string;
    label: string;
    error: string;
};

type ControlledField = Omit<UnControlledField, 'defaultValue'> & {
    value: string;
};

type UseZodField = ControlledField | UnControlledField;

type UseZodFormFormEventHandlers = {
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    onFocus: (e: FocusEvent<HTMLFormElement>) => void;
    onBlur: (e: FocusEvent<HTMLFormElement>) => void;
    onChange?: (e: ChangeEvent<HTMLFormElement>) => void;
};

type UseZodFormResult<T> = {
    getField: (name: keyof T, overrideMode?: UseZodFormMode) => UseZodField;
    getForm: () => UseZodFormFormEventHandlers;
    getError: (name: keyof T) => {};
    setField: (name: keyof T, value: unknown) => boolean;
    setError: (name: keyof T, value: string) => void;
    isDirty: (name?: keyof T) => boolean;
    isTouched: (name?: keyof T) => boolean;
    isValid: (name?: keyof T) => boolean;
    isSubmitting: () => boolean;
};
```

## Upgrade Guide

If you are updating from an older version of `useZodForm` you will need to update your code to use the new methods as there are breaking changes from the beta release.

### Breaking changes from v0.5.3

1 - `id` has been removed from the `getField` method. This was a duplicate of the `name` property. Simply replace any `id` property with `name`.

2 - The `dirty`, `error` and `touched` objects have been removed. They have been replaced with the `isDirty`, `getError` and `isTouched` methods respectively.

The example below shows how to update your code to use the new methods.

```ts
// old
if(dirty.firstName) {
  // ...
}

// new 
if(isDirty('firstName')) {
  // ...
}

if (error.lastName !== "") {
  // ...
}
if (getError('lastName') !== "") {
  // ...
}

```

### Breaking changes < v0.5.3

Honestly, I dont remember. Just add the new methods. 🫠

## License

Licensed under the [MIT License](https://github.com/garystorey/usezodform/blob/master/LICENSE.md).

</div>
