import Chart from 'chart.js/auto';
import { valueOrDefault, isNullOrUndef, toLineHeight, resolve } from 'chart.js/helpers';

export class CircleInnerText {
    drawCircleLabel(chart: any, options: any) {
        const utils = {
            parseFont: (value: any) => {
                const size = valueOrDefault(value.size, Chart.defaults.font.size);
                const font = {
                    family: valueOrDefault(value.family, Chart.defaults.font.family),
                    lineHeight: toLineHeight(value.lineHeight, size),
                    size,
                    style: valueOrDefault(value.style, Chart.defaults.font.style),
                    weight: valueOrDefault(value.weight, null),
                    string: ''
                };
                font.string = utils.toFontString(font) ?? '';
                return font;
            },
            toFontString: (font: any) => {
                if (!font || isNullOrUndef(font.size) || isNullOrUndef(font.family)) {
                    return null;
                }
                return (font.style ? font.style + ' ' : '')
                    + (font.weight ? font.weight + ' ' : '')
                    + font.size + 'px '
                    + font.family;
            },
            textSize: (ctx: any, labels: any) => {
                const items = ([] as any[]).concat(labels);
                const ilen = items.length;
                const prev = ctx.font;
                let width = 0;
                let height = 0;
                let i;
                for (i = 0; i < ilen; ++i) {
                    ctx.font = items[i].font.string;
                    width = Math.max(ctx.measureText(items[i].text).width, width);
                    height += items[i].font.lineHeight;
                }
                ctx.font = prev;
                const result = {
                    height,
                    width
                };
                return result;
            }
        };
        if (options?.labels?.length > 0) {
            const ctx = chart.ctx;
            const innerLabels: any[] = [];
            options.labels.forEach((label: any) => {
                const text = typeof (label.text) === 'function' ? label.text(chart) : label.text;
                const innerLabel = {
                    text,
                    font: utils.parseFont(resolve([label.font, options.font, {}], ctx, 0)),
                    color: resolve([label.color, options.color, Chart.defaults.color], ctx, 0)
                };
                innerLabels.push(innerLabel);
            });
            let textAreaSize = utils.textSize(ctx, innerLabels);
            // Calculate the adjustment ratio to fit the text area into the doughnut inner circle
            const hypotenuse = Math.sqrt(Math.pow(textAreaSize.width, 2) + Math.pow(textAreaSize.height, 2));
            const innerDiameter = chart.innerRadius * 2;
            const fitRatio = innerDiameter / hypotenuse;
            // Adjust the font if necessary and recalculate the text area after applying the fit ratio
            if (fitRatio < 1) {
                innerLabels.forEach((innerLabel) => {
                    innerLabel.font.size = Math.floor(innerLabel.font.size * fitRatio);
                    innerLabel.font.lineHeight = undefined;
                    innerLabel.font = utils.parseFont(resolve([innerLabel.font, {}], ctx, 0));
                });
                textAreaSize = utils.textSize(ctx, innerLabels);
            }
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = innerLabels[0].color;
            ctx.font = innerLabels[0].font.string;
            const elem = document.getElementById(chart?.id);
            if (elem) {
                ctx.fillText(innerLabels[0].text, elem.offsetWidth / 2 - textAreaSize.width / 2, elem.offsetHeight / 2);
                ctx.fillStyle = this.lightenDarkenColor(innerLabels[1].color, -30);
                ctx.font = innerLabels[1].font.string;
                ctx.fillText(innerLabels[1].text, elem.offsetWidth / 2.3 + textAreaSize.width / 2, elem.offsetHeight / 2 + textAreaSize.height * 0.1);
            }
        }
    }
    lightenDarkenColor(col: any, amt: any) {
        let usePound = false;
        if (col[0] === '#') {
            col = col.slice(1);
            usePound = true;
        }
        const num = parseInt(col, 16);
        // tslint:disable-next-line:no-bitwise
        let r = (num >> 16) + amt;
        if (r > 255) {
            r = 255;
        }
        else if (r < 0) {
            r = 0;
        }
        // tslint:disable-next-line:no-bitwise
        let b = ((num >> 8) & 0x00FF) + amt;
        if (b > 255) {
            b = 255;
        }
        else if (b < 0) {
            b = 0;
        }
        // tslint:disable-next-line:no-bitwise
        let g = (num & 0x0000FF) + amt;
        if (g > 255) {
            g = 255;
        }
        else if (g < 0) {
            g = 0;
        }
        // tslint:disable-next-line:no-bitwise
        return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16);
    }
}