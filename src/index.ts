import { cssclass, CSSClassObject } from '@garystorey/cssclass';
export const useCSSClass = (...values: (string | CSSClassObject)[]) => cssclass(...values);
export default useCSSClass;
