export function h<T extends keyof HTMLElementTagNameMap>(
  tag: T,
  props: Partial<Omit<HTMLElementTagNameMap[T], 'style'> & HTMLAttributes> = {},
  ...children: (HTMLElement | SVGElement)[]
) {
  const elm = document.createElement(tag);
  if (props.class) {
    elm.setAttribute('class', props.class);
    delete props.class;
  }
  merge(elm, props);
  for (const child of children) {
    elm.appendChild(child);
  }
  return elm;
}
type HTMLAttributes = {
  class: string;
  style: Partial<CSSStyleDeclaration>;
}
function merge(source: AnyObject, target: object) {
  for (const [key, value] of Object.entries(target)) {
    if (typeof value === 'object' && value && typeof source[key] === 'object' && source[key]) {
      merge(source[key], value);
    } else {
      source[key] = value;
    }
  }
}
type AnyObject = Record<string | number, any>;
export function createCloseIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox', '0 0 1024 1024');
  svg.setAttribute('width', '32');
  svg.setAttribute('height', '32');
  svg.innerHTML = '<path d="M563.8 512l262.5-312.9c4.4-5.2 0.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9c-4.4 5.2-0.7 13.1 6.1 13.1h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z" p-id="8826" fill="#bfbfbf"></path>';
  return svg;
}