import { h, createCloseIcon } from './utils';

export type VerifyCallback = (valid: boolean) => any;

const { PI, abs } = Math;

export class SliderVerify {
  domElm: HTMLElement = h('div');
  private imageElm: HTMLImageElement = new Image(this.width, this.height);
  private canvas: HTMLCanvasElement = h('canvas');
  private puzzle!: HTMLCanvasElement;
  private opx = this.width * -0.4; // offset x of puzzle
  private opy = this.height * -0.2; // offset y of puzzle
  private gapx = this.width * 0.6; // x of gap
  private gapy = this.height * 0.4; // y of gap
  private lineLength = 20;
  private draggable = false;
  private dsx = 0; // drag start x
  private dsy = 0; // drag start y

  constructor(
    private imageUrl: string,
    private cb: VerifyCallback,
    private width = 500,
    private height = 250,
  ) {
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
    this.canvas.addEventListener('mousedown', this.onMousedown);
    this.canvas.addEventListener('mousemove', this.onMousemove);
    this.canvas.addEventListener('mouseup', this.onMouseup)
    this.domElm.appendChild(header);
    this.domElm.appendChild(this.canvas);
  }
  destroy() {
    this.canvas.removeEventListener('mousedown', this.onMousedown);
    this.canvas.removeEventListener('mousemove', this.onMousemove);
    this.canvas.removeEventListener('mouseup', this.onMouseup);
    this.imageElm.remove();
    this.imageElm = null;
    this.canvas.remove();
    this.canvas = null;
  }
  onMousedown = (e: MouseEvent) => {
    const px = this.gapx + this.opx;
    const py = this.gapy + this.opy;
    const mx = e.offsetX; // x of mouse
    const my = e.offsetY; // y of mouse - based on canvas
    if (
      mx > px &&
      mx < px + 3 * this.lineLength &&
      my > py &&
      my < py + 3 * this.lineLength
    ) {
      this.dsx = mx;
      this.dsy = my;
      this.draggable = true;
    }
  }
  onMousemove = (e: MouseEvent) => {
    if (this.draggable) {
      const diffX = e.offsetX - this.dsx;
      const diffY = e.offsetY - this.dsy;
      this.opx += diffX;
      this.opy += diffY;
      this.dsx = e.offsetX;
      this.dsy = e.offsetY;
      this.render();
    }
  }
  onMouseup = () => {
    this.draggable = false;
    if (abs(this.opx) <= 2 && abs(this.opy) <= 2) {
      this.cb(true);
    } else {
      this.cb(false);
    }
  }
  render() {
    const { canvas, width, height, puzzle, opx, opy, imageElm } = this;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(imageElm, 0, 0, 1920, 1080, 0, 0, width, height);
    this.gap();
    ctx.drawImage(puzzle, opx, opy);
  }
  gap() {
    const ctx = this.canvas.getContext('2d');
    createPuzzlePath(ctx, this.gapx, this.gapy, this.lineLength);
    ctx.strokeStyle = '#bdbdbd';
    ctx.fillStyle = '#fff';
    ctx.stroke();
    ctx.fill();
  }
  clip() {
    const promise = new Promise<HTMLCanvasElement>(resolve => {
      const { width, height } = this;
      const canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      const ctx = canvas.getContext('2d');
      createPuzzlePath(ctx, this.gapx, this.gapy, this.lineLength);
      ctx.strokeStyle = '#bdbdbd';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.clip();
      ctx.drawImage(this.imageElm, 0, 0, 1920, 1080, 0, 0, width, height);
      resolve(canvas);
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

function createPuzzlePath(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  lineLength: number,
) {
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
