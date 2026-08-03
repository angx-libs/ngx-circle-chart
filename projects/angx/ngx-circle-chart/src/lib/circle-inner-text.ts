import type { Chart, Plugin } from 'chart.js';

/** Everything the inner-text plugin needs, read fresh on every draw. */
export interface InnerTextOptions {
  /** Text rendered large, in `valueColor`. */
  value: string;
  /** Text rendered smaller next to the value, e.g. `/8`. */
  maxValue: string;
  valueColor: string;
  maxValueColor: string;
  fontFamily: string;
  /** Reference size, in CSS pixels, the font sizes are derived from. */
  baseSize: number;
}

const VALUE_SIZE_RATIO = 1.8;
const MAX_VALUE_SIZE_RATIO = 1.5;
const LINE_HEIGHT_RATIO = 1.2;
const VALUE_WEIGHT = 500;
const MAX_VALUE_WEIGHT = 300;

/**
 * Draws the `value/maxValue` label inside the doughnut hole.
 *
 * The font starts oversized and is scaled down by the ratio needed to fit the
 * hole, which is what makes the label track the chart size automatically.
 * Positions come from the chart's own canvas metrics, so the plugin never
 * touches the document and works with any number of charts on a page.
 */
export function createInnerTextPlugin(readOptions: () => InnerTextOptions): Plugin<'doughnut'> {
  return {
    id: 'ngxCircleChartInnerText',
    afterDatasetsDraw(chart) {
      const ctx = chart.ctx;
      const innerRadius = readInnerRadius(chart);
      if (!ctx || innerRadius <= 0) {
        return;
      }

      const options = readOptions();
      let valueSize = Math.round(options.baseSize * VALUE_SIZE_RATIO);
      let maxValueSize = Math.round(options.baseSize * MAX_VALUE_SIZE_RATIO);

      const measure = () => {
        ctx.font = toFontString(VALUE_WEIGHT, valueSize, options.fontFamily);
        const valueWidth = ctx.measureText(options.value).width;
        ctx.font = toFontString(MAX_VALUE_WEIGHT, maxValueSize, options.fontFamily);
        const maxValueWidth = ctx.measureText(options.maxValue).width;
        return {
          valueWidth,
          maxValueWidth,
          width: Math.max(valueWidth, maxValueWidth),
          height: (valueSize + maxValueSize) * LINE_HEIGHT_RATIO,
        };
      };

      let box = measure();
      const fitRatio = (innerRadius * 2) / Math.hypot(box.width, box.height);
      if (fitRatio < 1) {
        valueSize = Math.max(Math.floor(valueSize * fitRatio), 1);
        maxValueSize = Math.max(Math.floor(maxValueSize * fitRatio), 1);
        box = measure();
      }

      const startX = chart.width / 2 - (box.valueWidth + box.maxValueWidth) / 2;
      const centerY = chart.height / 2;

      ctx.save();
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      ctx.font = toFontString(VALUE_WEIGHT, valueSize, options.fontFamily);
      ctx.fillStyle = options.valueColor;
      ctx.fillText(options.value, startX, centerY);

      ctx.font = toFontString(MAX_VALUE_WEIGHT, maxValueSize, options.fontFamily);
      ctx.fillStyle = shadeHexColor(options.maxValueColor, -30);
      ctx.fillText(options.maxValue, startX + box.valueWidth, centerY + maxValueSize * 0.1);

      ctx.restore();
    },
  };
}

function toFontString(weight: number, size: number, family: string): string {
  return `${weight} ${size}px ${family}`;
}

/**
 * `innerRadius` is maintained by the doughnut controller but is not part of the
 * published controller type, so it is read defensively.
 */
function readInnerRadius(chart: Chart): number {
  const controller = chart.getDatasetMeta(0)?.controller as unknown as { innerRadius?: number } | undefined;
  return controller?.innerRadius ?? 0;
}

/**
 * Lightens (positive `amount`) or darkens (negative `amount`) a hex colour.
 * Non-hex colours are returned untouched so `rgb()`, `hsl()` and named colours
 * degrade gracefully instead of producing garbage.
 */
export function shadeHexColor(color: string, amount: number): string {
  const hex = normalizeHex(color);
  if (!hex) {
    return color;
  }

  const value = parseInt(hex, 16);
  const red = clampChannel(((value >> 16) & 0xff) + amount);
  const green = clampChannel(((value >> 8) & 0xff) + amount);
  const blue = clampChannel((value & 0xff) + amount);

  return `#${((red << 16) | (green << 8) | blue).toString(16).padStart(6, '0')}`;
}

function normalizeHex(color: string): string | null {
  const value = color?.trim().replace(/^#/, '') ?? '';
  if (/^[0-9a-f]{3}$/i.test(value)) {
    return value
      .split('')
      .map((channel) => channel + channel)
      .join('');
  }
  return /^[0-9a-f]{6}$/i.test(value) ? value : null;
}

function clampChannel(value: number): number {
  return Math.min(255, Math.max(0, value));
}
