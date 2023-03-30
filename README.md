# useCSSClass

A small utility hook to concatenate CSS classNames objects into a string.

## Example

```js

const value = 1;
const classes = useCSSClass('default',{
    'notadded' : (value ===0),
    'added' : (value===1)
});
console.log(classes);
// "default added"

```
