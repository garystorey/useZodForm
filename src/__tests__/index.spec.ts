import { useCSSClass } from '../index';

test('useCSSClass', () => {
  expect(
    useCSSClass('default', {
      notadded: false,
      added: true,
    }),
  ).toBe('default added');
});
