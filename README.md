# @angx/ngx-circle-chart

Beautiful, auto-scaling circle (doughnut) progress chart for Angular.

![Angular Circle Chart](https://raw.githubusercontent.com/angx-libs/ngx-circle-chart/master/src/assets/screenshot.png)

Built directly on [chart.js](https://www.npmjs.com/package/chart.js).

## Features

- Value label scales itself to fit the ring, at any size
- Optional gradient colouring along the progress arc
- Themeable colours, size and font
- Zoneless and SSR safe — no canvas work happens on the server
- Registers only the doughnut controller, not all of `chart.js/auto`
- Standalone component, no `NgModule` required

## Requirements

| | |
|---|---|
| Angular | 21 or 22 |
| chart.js | ^4.4.0 |

## Install

```bash
npm i @angx/ngx-circle-chart chart.js
```

`chart.js` is a peer dependency, so install it alongside.

## Usage

```ts
import { Component } from '@angular/core';
import { NgxCircleChartComponent } from '@angx/ngx-circle-chart';

@Component({
  selector: 'app-stats',
  imports: [NgxCircleChartComponent],
  template: `
    <circle-chart
      [value]="6"
      [maxValue]="8"
      color="#FF4040"
      bgColor="#FADADA"
      [gradientColoring]="true"
      [dimensionsInPixels]="200"
    />
  `,
})
export class StatsComponent {}
```

The chart updates automatically whenever an input changes — bind a signal and it follows.

## Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | *required* | Current value. Clamped into `[0, maxValue]`. |
| `maxValue` | `number` | *required* | Value that represents a full circle. |
| `color` | `string` | `'#0076ff'` | Progress arc and value text. |
| `bgColor` | `string` | `'#e7e9ed'` | Background track, and (darkened) the `/maxValue` text. |
| `gradientColoring` | `boolean` | `false` | Fade the arc from `color` towards `bgColor`. |
| `dimensionsInPixels` | `number` | `45` | Width and height, in CSS pixels. |
| `fontFamily` | `string` | system stack | Font used for the centre label. |

## Migrating from 3.x

- **Angular 21+ is required**, and the workspace targets Angular 22.
- **`ng2-charts` is no longer needed.** It was a peer dependency and pulled `@angular/cdk` in with it. Unless you use them elsewhere:
  ```bash
  npm uninstall ng2-charts
  ```
- `value` and `maxValue` are now **required** inputs — the compiler will tell you if one is missing.
- New optional `fontFamily` input.
- Inputs are signal-based internally; template bindings are unchanged.

### Fixed in 4.0.0

- The chart never redrew when its inputs changed — it was built once in `ngAfterViewInit`.
- Every instance emitted `id="chart"` and `id="chart-foreground"`, so two charts on one page collided and the centre label was measured against the wrong element.
- The label colour helper dropped leading zeros (`#0f1e2d` darkened to the invalid `#51423`), silently breaking the `/maxValue` text.
- A `value` greater than `maxValue` produced a negative arc segment.
- Charts were never destroyed, leaking a chart.js instance per component.
- Canvas code ran during server-side rendering.
- The centre label is now genuinely centred rather than offset by a hard-coded fudge factor.

## Development

```bash
npm install
npm run build:lib   # build the package into dist/angx/ngx-circle-chart
npm start           # build the lib, then serve the demo app
npm test            # run the library unit tests
```

## Support

If you like my work and feel like buying me a coffee, please feel free to do so:

[Buy Me A Coffee](https://buymeacoffee.com/er.abhishek)

## License

MIT © Abhishek Singh

[GitHub](https://github.com/asingh0601) · [Twitter](https://twitter.com/only_abhishek)
