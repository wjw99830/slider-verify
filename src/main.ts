import { SliderVerify } from './slider-verify';

export default async function (sel: string, imgUrl: string, callback?: VerifyCallback) {
  const elm = document.querySelector(sel);
  const verify = new SliderVerify(imgUrl);
  elm.appendChild(verify.domElm);
}
type VerifyCallback = (valid: boolean) => any;
