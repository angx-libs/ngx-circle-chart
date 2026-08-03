import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  viewChild,
} from '@angular/core';
import {
  ArcElement,
  Chart,
  DoughnutController,
  type ChartConfiguration,
  type ScriptableContext,
} from 'chart.js';
import { createInnerTextPlugin } from './circle-inner-text';

/** Fraction of the host size occupied by the background track. */
const TRACK_SCALE = 0.96;

@Component({
  selector: 'circle-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="circle-chart"
      [style.width.px]="dimensionsInPixels()"
      [style.height.px]="dimensionsInPixels()"
    >
      <div class="circle-chart__layer circle-chart__layer--track">
        <canvas #track></canvas>
      </div>
      <div class="circle-chart__layer circle-chart__layer--progress">
        <canvas #progress></canvas>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: inline-block;
    }

    .circle-chart {
      position: relative;
    }

    .circle-chart__layer {
      position: absolute;
      pointer-events: none;
    }

    .circle-chart__layer--track {
      inset: 2%;
    }

    .circle-chart__layer--progress {
      inset: 0;
    }

    .circle-chart__layer canvas {
      display: block;
    }
  `,
})
export class NgxCircleChartComponent {
  private readonly trackCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('track');
  private readonly progressCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('progress');

  /** Current value. Clamped into `[0, maxValue]` before it is drawn. */
  readonly value = input.required({ transform: numberAttribute });

  /** Value representing a full circle. */
  readonly maxValue = input.required({ transform: numberAttribute });

  /** Colour of the progress arc and of the value text. */
  readonly color = input('#0076ff');

  /** Colour of the background track and, darkened, of the `/maxValue` text. */
  readonly bgColor = input('#e7e9ed');

  /** Fade the progress arc from `color` towards `bgColor` along its length. */
  readonly gradientColoring = input(false, { transform: booleanAttribute });

  /** Width and height of the chart, in CSS pixels. */
  readonly dimensionsInPixels = input(45, { transform: numberAttribute });

  /** Font stack used for the label inside the circle. */
  readonly fontFamily = input('system-ui, -apple-system, "Segoe UI", Roboto, sans-serif');

  /** `[filled, remaining]`, clamped so a value above `maxValue` cannot wrap. */
  private readonly segments = computed(() => {
    const max = Math.max(this.maxValue(), 0);
    const filled = Math.min(Math.max(this.value(), 0), max);
    return [filled, max - filled];
  });

  private trackChart?: Chart<'doughnut'>;
  private progressChart?: Chart<'doughnut'>;

  constructor() {
    // Registered here rather than at module scope: the package is marked
    // `sideEffects: false`, so a top-level call could legitimately be dropped
    // by a bundler. `Chart.register` de-duplicates, so repeat calls are free.
    // Registering only the doughnut pieces avoids pulling in every chart.js
    // controller and scale the way `chart.js/auto` would.
    Chart.register(DoughnutController, ArcElement);

    // `afterNextRender` only runs in the browser, which keeps the whole
    // canvas/Chart.js path out of server-side rendering.
    afterNextRender(() => {
      this.trackChart = new Chart(this.trackCanvas().nativeElement, this.trackConfig());
      this.progressChart = new Chart(this.progressCanvas().nativeElement, this.progressConfig());
    });

    effect(() => {
      const segments = this.segments();
      const bgColor = this.bgColor();
      // Read so the effect re-runs when they change; the values themselves are
      // pulled from the signals again at draw time.
      this.color();
      this.gradientColoring();
      this.fontFamily();

      if (!this.trackChart || !this.progressChart) {
        return;
      }

      this.trackChart.data.datasets[0].backgroundColor = [bgColor];
      this.progressChart.data.datasets[0].data = segments;
      this.trackChart.update('none');
      this.progressChart.update('none');
    });

    inject(DestroyRef).onDestroy(() => {
      this.trackChart?.destroy();
      this.progressChart?.destroy();
    });
  }

  private trackConfig(): ChartConfiguration<'doughnut'> {
    return {
      type: 'doughnut',
      data: {
        // A single segment always fills the ring, whatever `maxValue` is.
        datasets: [{ data: [1], backgroundColor: [this.bgColor()], borderWidth: 0 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        events: [],
        cutout: '93%',
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
      },
    };
  }

  private progressConfig(): ChartConfiguration<'doughnut'> {
    return {
      type: 'doughnut',
      data: {
        datasets: [
          {
            data: this.segments(),
            circular: true,
            borderWidth: 0,
            // Scriptable so the gradient is rebuilt whenever the canvas is
            // resized or the chart is redrawn.
            backgroundColor: (context: ScriptableContext<'doughnut'>) => this.segmentColor(context),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        events: [],
        cutout: '85%',
        circumference: 360,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
      },
      plugins: [
        createInnerTextPlugin(() => ({
          value: `${this.value()}`,
          maxValue: `/${this.maxValue()}`,
          valueColor: this.color(),
          maxValueColor: this.bgColor(),
          fontFamily: this.fontFamily(),
          baseSize: this.dimensionsInPixels() * TRACK_SCALE,
        })),
      ],
    };
  }

  private segmentColor(context: ScriptableContext<'doughnut'>): string | CanvasGradient {
    if (context.dataIndex !== 0) {
      return 'transparent';
    }
    if (!this.gradientColoring()) {
      return this.color();
    }
    return this.buildGradient(context.chart) ?? this.color();
  }

  /**
   * Builds a linear gradient whose direction follows the end of the arc, so the
   * fade always runs along the drawn portion rather than across a fixed axis.
   */
  private buildGradient(chart: Chart): CanvasGradient | null {
    const { ctx, width, height } = chart;
    if (!ctx || width <= 0 || height <= 0) {
      return null;
    }

    const max = Math.max(this.maxValue(), 0);
    const progress = max === 0 ? 0 : Math.min(Math.max(this.value(), 0), max) / max;
    const angle = 2 * Math.PI * progress - Math.PI / 2;
    const radius = Math.min(width, height) / 2;
    const centerX = width / 2;
    const centerY = height / 2;

    const gradient = ctx.createLinearGradient(
      centerX,
      centerY - radius,
      centerX + Math.cos(angle) * radius,
      centerY + Math.sin(angle) * radius,
    );
    gradient.addColorStop(0, this.color());
    gradient.addColorStop(1, this.bgColor());
    return gradient;
  }
}
