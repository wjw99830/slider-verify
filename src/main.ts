import { SliderVerify, VerifyCallback } from './slider-verify';

export default async function (options: SliderVerifyOptions) {
  const promise = new Promise<boolean>(resolve => {
    const wrapperCb: VerifyCallback = valid => {
      options.cb && options.cb(valid);
      resolve(valid);
    };
    const elm = document.querySelector(options.selector)
    const verify = new SliderVerify(options.imgUrl, wrapperCb, options.width, options.height);
    elm.appendChild(verify.domElm);
  });
  return promise;
}
interface SliderVerifyOptions {
  selector: string;
  imgUrl: string;
  cb?: VerifyCallback;
  width?: number;
  height?: number;
}
