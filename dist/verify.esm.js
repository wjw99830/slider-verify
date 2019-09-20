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

class SliderVerify {
    constructor(imageUrl, width = 500, height = 250) {
        this.imageUrl = imageUrl;
        this.width = width;
        this.height = height;
        this.domElm = h('div');
        this.imageElm = new Image(this.width, this.height);
        this.canvas = h('canvas');
        this.px = 0;
        this.py = 0;
        this.px = width * 0.2;
        this.py = height * 0.5;
        this.init();
    }
    async init() {
        await this.loadImage();
        const header = h('div', { class: 'slider-verify__header', style: { width: '40px', height: '40px' } }, createCloseIcon());
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
        const promise = new Promise(resolve => {
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
function createPuzzlePath(ctx, sx, sy) {
    const lineLength = 20;
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

async function main (sel, imgUrl, callback) {
    const elm = document.querySelector(sel);
    const verify = new SliderVerify(imgUrl);
    elm.appendChild(verify.domElm);
}

export default main;
