function h(tag, props = {}, ...children) {
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
function merge(source, target) {
    for (const [key, value] of Object.entries(target)) {
        if (typeof value === 'object' && value && typeof source[key] === 'object' && source[key]) {
            merge(source[key], value);
        }
        else {
            source[key] = value;
        }
    }
}
function createCloseIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 1024 1024');
    svg.setAttribute('width', '32');
    svg.setAttribute('height', '32');
    svg.innerHTML = '<path d="M563.8 512l262.5-312.9c4.4-5.2 0.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9c-4.4 5.2-0.7 13.1 6.1 13.1h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z" p-id="8826" fill="#bfbfbf"></path>';
    return svg;
}

const { PI, abs } = Math;
class SliderVerify {
    constructor(imageUrl, cb, width = 500, height = 250) {
        this.imageUrl = imageUrl;
        this.cb = cb;
        this.width = width;
        this.height = height;
        this.domElm = h('div');
        this.imageElm = new Image(this.width, this.height);
        this.canvas = h('canvas');
        this.opx = this.width * -0.4; // offset x of puzzle
        this.opy = this.height * -0.2; // offset y of puzzle
        this.gapx = this.width * 0.6; // x of gap
        this.gapy = this.height * 0.4; // y of gap
        this.lineLength = 20;
        this.draggable = false;
        this.dsx = 0; // drag start x
        this.dsy = 0; // drag start y
        this.onMousedown = (e) => {
            const px = this.gapx + this.opx;
            const py = this.gapy + this.opy;
            const mx = e.offsetX; // x of mouse
            const my = e.offsetY; // y of mouse - based on canvas
            if (mx > px &&
                mx < px + 3 * this.lineLength &&
                my > py &&
                my < py + 3 * this.lineLength) {
                this.dsx = mx;
                this.dsy = my;
                this.draggable = true;
            }
        };
        this.onMousemove = (e) => {
            if (this.draggable) {
                const diffX = e.offsetX - this.dsx;
                const diffY = e.offsetY - this.dsy;
                this.opx += diffX;
                this.opy += diffY;
                this.dsx = e.offsetX;
                this.dsy = e.offsetY;
                this.render();
            }
        };
        this.onMouseup = () => {
            this.draggable = false;
            if (abs(this.opx) <= 2 && abs(this.opy) <= 2) {
                this.cb(true);
            }
            else {
                this.cb(false);
            }
        };
        this.init();
    }
    async init() {
        await this.loadImage();
        const header = h('div', { class: 'slider-verify__header', style: { width: '40px', height: '40px' } }, createCloseIcon());
        this.puzzle = await this.clip();
        this.render();
        this.canvas.addEventListener('mousedown', this.onMousedown);
        this.canvas.addEventListener('mousemove', this.onMousemove);
        this.canvas.addEventListener('mouseup', this.onMouseup);
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
    render() {
        const { canvas, width, height, puzzle, opx, opy, imageElm } = this;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(imageElm, 0, 0, 1920, 1080, 0, 0, width, height);
        this.gap(ctx);
        ctx.drawImage(puzzle, opx, opy);
    }
    gap(ctx) {
        createPuzzlePath(ctx, this.gapx, this.gapy, this.lineLength);
        ctx.strokeStyle = '#bdbdbd';
        ctx.fillStyle = '#fff';
        ctx.stroke();
        ctx.fill();
    }
    clip() {
        const promise = new Promise(resolve => {
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
            ctx.save();
            ctx.globalCompositeOperation = 'source-atop';
            const blur = 2;
            createPuzzlePath(ctx, this.gapx + blur, this.gapy + blur * 1.2, this.lineLength - blur / 1.5);
            ctx.shadowColor = 'rgba(0, 0, 0, 1)';
            ctx.shadowBlur = blur * 10;
            ctx.fillStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.fill();
            ctx.restore();
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
function createPuzzlePath(ctx, sx, sy, lineLength) {
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + 1 * lineLength, sy);
    ctx.arc(sx + 1.5 * lineLength, sy, lineLength / 2, PI, 2 * PI, true);
    // ctx.moveTo(sx + 2 * lineLength, sy);
    ctx.lineTo(sx + 3 * lineLength, sy);
    ctx.lineTo(sx + 3 * lineLength, sy + lineLength);
    ctx.arc(sx + 3 * lineLength, sy + 1.5 * lineLength, lineLength / 2, -PI / 2, -3 * PI / 2, true);
    // ctx.moveTo(sx + 3 * lineLength, sy + 2 * lineLength);
    ctx.lineTo(sx + 3 * lineLength, sy + 3 * lineLength);
    ctx.lineTo(sx + 2 * lineLength, sy + 3 * lineLength);
    ctx.arc(sx + 1.5 * lineLength, sy + 3 * lineLength, lineLength / 2, 0, PI);
    // ctx.moveTo(sx + 1 * lineLength, sy + 3 * lineLength);
    ctx.lineTo(sx, sy + 3 * lineLength);
    ctx.lineTo(sx, sy + 2 * lineLength);
    ctx.arc(sx, sy + 1.5 * lineLength, lineLength / 2, PI / 2, -PI / 2);
    ctx.moveTo(sx, sy + 1 * lineLength);
    ctx.lineTo(sx, sy);
    ctx.closePath();
}

async function main (options) {
    const promise = new Promise(resolve => {
        const wrapperCb = valid => {
            options.cb && options.cb(valid);
            resolve(valid);
        };
        const elm = document.querySelector(options.selector);
        const verify = new SliderVerify(options.imgUrl, wrapperCb, options.width, options.height);
        elm.appendChild(verify.domElm);
    });
    return promise;
}

export default main;
