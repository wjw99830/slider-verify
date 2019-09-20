import { h, createCloseIcon } from './utils';

export class SliderVerify {
  domElm: HTMLElement = h('div');
  private imageElm: HTMLImageElement = new Image(this.width, this.height);
  private canvas: HTMLCanvasElement = h('canvas');
  private puzzle!: HTMLCanvasElement;
  private px = 0;
  private py = 0;
  constructor(
    private imageUrl: string,
    private width = 500,
    private height = 250,
  ) {
    this.px = width * 0.2;
    this.py = height * 0.5;
    this.init();
  }
  async init() {
    await this.loadImage();
    const header = h(
      'div',
      { class: 'slider-verify__header', style: { width: '40px', height: '40px' } },
      createCloseIcon(),
    );
    this.puzzle = await this.clip();
    this.render();
    this.domElm.appendChild(header);
    this.domElm.appendChild(this.canvas);
  }
  render() {
    const { canvas, width, height, imageUrl, puzzle, px, py, imageElm } = this;
    imageElm.src = imageUrl;
    imageElm.addEventListener('load', function handler() {
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imageElm, 0, 0, 1920, 1080, 0, 0, width, height);
      ctx.drawImage(puzzle, px, py);
      imageElm.removeEventListener('load', handler);
    });
  }
  clip() {
    const promise = new Promise<HTMLCanvasElement>(resolve => {
      const { width, height } = this;
      const canvas = document.createElement('canvas');
      const img = new Image(this.width, this.height);
      img.src = this.imageUrl;
      img.addEventListener('load', function handler() {
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        createPuzzlePath(ctx, width * 0.6, height * 0.4);
        ctx.clip();
        ctx.drawImage(img, 0, 0, 1920, 1080, 0, 0, width, height);
        this.removeEventListener('load', handler);
        resolve(canvas);
      });
    });
    return promise;
  }
  loadImage() {
    return new Promise(resolve => {
      const img = this.imageElm;
      img.src = this.imageUrl;
      img.addEventListener('load', function handler() {
        resolve();
        img.removeEventListener('load', handler);
      });
    });
  }
}
const PI = Math.PI;
function createPuzzlePath(ctx: CanvasRenderingContext2D, sx: number, sy: number) {
  const lineLength = 20;
  ctx.beginPath();

  ctx.moveTo(sx, sy);
  ctx.lineTo(sx + 1 * lineLength, sy);
  ctx.arc   (sx + 1.5 * lineLength, sy, lineLength / 2, PI, 2 * PI, true);
  // ctx.moveTo(sx + 2 * lineLength, sy);
  ctx.lineTo(sx + 3 * lineLength, sy);

  ctx.lineTo(sx + 3 * lineLength, sy + lineLength);
  ctx.arc   (sx + 3 * lineLength, sy + 1.5 * lineLength, lineLength / 2, -PI / 2, -3 * PI / 2, true);
  // ctx.moveTo(sx + 3 * lineLength, sy + 2 * lineLength);
  ctx.lineTo(sx + 3 * lineLength, sy + 3 * lineLength);

  ctx.lineTo(sx + 2 * lineLength, sy + 3 * lineLength);
  ctx.arc   (sx + 1.5 * lineLength, sy + 3 * lineLength, lineLength / 2, 0, PI);
  // ctx.moveTo(sx + 1 * lineLength, sy + 3 * lineLength);
  ctx.lineTo(sx, sy + 3 * lineLength);

  ctx.lineTo(sx, sy + 2 * lineLength);
  ctx.arc   (sx, sy + 1.5 * lineLength, lineLength / 2, PI / 2, -PI / 2);
  ctx.moveTo(sx, sy + 1 * lineLength);
  ctx.lineTo(sx, sy);

  ctx.closePath();
}
