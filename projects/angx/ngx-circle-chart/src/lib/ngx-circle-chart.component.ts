import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { CircleInnerText } from './CircleInnerText';
import { ChartConfiguration, ChartData } from 'chart.js/auto';

@Component({
  selector: 'circle-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div [id]="id" class="chart-wrapper" [style.height.px]="dimensionsInPixels" [style.width.px]="dimensionsInPixels" #chartwrapper>
    <div>
    <canvas baseChart class="chart" #chartcanvas id="chart"
        style="height: {{innerDimensions}}px; max-height: {{innerDimensions}}px; width: {{innerDimensions}}px; max-width: {{innerDimensions}}px;" 
        [data]="doughnutBgChartData"
        [type]="chartType" 
        [options]="doughnutBgChartOptions" [plugins]="plugins">
</canvas>
<canvas baseChart class="chart" #chartfgcanvas id="chart-foreground"
        style="height: {{dimensionsInPixels}}px; max-height: {{dimensionsInPixels}}px; width: {{dimensionsInPixels}}px; max-width: {{dimensionsInPixels}}px;margin-left:{{(dimensionsInPixels*-1/50)}}px;margin-top:{{(dimensionsInPixels*-1/50)}}px;" 
        [data]="doughnutFgChartData"
        [type]="chartType" 
        [options]="doughnutFgChartOptions" [plugins]="plugins">
</canvas>
    </div>
</div>
  `,
  styles: `
  #chart,
  #chart-foreground
  {
    position:absolute;
    pointer-events:none;
  }`
})

export class NgxCircleChartComponent implements AfterViewInit {
  chartType: any = 'doughnut';
  @ViewChild('chart') chart!: ElementRef;
  @ViewChild('chartcanvas') chartcanvas!: ElementRef;
  @ViewChild('chartfgcanvas') chartfgcanvas!: ElementRef;

  @Input() value!: number;
  @Input() maxValue!: number;
  @Input() color!: string;
  @Input() bgColor!: string;
  @Input() gradientColoring!: boolean;
  @Input() dimensionsInPixels: number = 45;
  id!: string;
  innerDimensions!: number;
  plugins: any[];
  doughnutBgChartLabels: string[] = [];
  doughnutBgChartOptions!: ChartConfiguration<'doughnut'>['options'];
  doughnutBgChartData!: ChartData<'doughnut'>;
  doughnutFgChartLabels: string[] = [];
  doughnutFgChartOptions!: ChartConfiguration<'doughnut'>['options'];
  doughnutFgChartData!: ChartData<'doughnut'>;

  constructor(private cdr: ChangeDetectorRef) {
    this.plugins = [{
      beforeDatasetsDraw: (chartInstance: any) => {
        chartInstance._metasets.forEach((e: any) => {
          chartInstance.innerRadius = e.controller.innerRadius;
        });
        chartInstance.options.labels = [
          {
            text: this.value,
            font: {
              size: Math.round(this.innerDimensions * 1.8),
              units: 'px',
              family: 'Rubik',
              weight: '500'
            },
            color: this.color
          },
          {
            text: '/' + this.maxValue,
            font: {
              size: Math.round(this.innerDimensions * 1.5),
              units: 'px',
              family: 'Rubik',
              weight: '300'
            },
            color: this.bgColor
          }
        ];
        this.id = chartInstance.id;
        new CircleInnerText().drawCircleLabel(chartInstance, chartInstance.options);
      }
    }];
  }
  ngAfterViewInit() {
    this.innerDimensions = Math.round(this.dimensionsInPixels * 0.96);
    this.doughnutBgChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false
        }
      },
      cutout: '93%',
    };
    this.doughnutBgChartData = {
      datasets: [
        {
          data: [this.maxValue],
          backgroundColor: [this.bgColor],
        },
      ],
    };
    this.doughnutFgChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false
        }
      },
      cutout: '85%',
      circumference: 360
    };
    this.doughnutFgChartData = {
      datasets: [
        {
          data: [this.value, this.maxValue - this.value],
          circular: true,
          backgroundColor: [this.gradientColoring ? this.getGradient() : this.color, 'transparent']
        },
      ],
    };
    this.cdr.detectChanges();
  }
  getGradient() {
    var nativeElement = this.chartfgcanvas.nativeElement;
    const percent = this.value / this.maxValue;
    const ctx = nativeElement.getContext('2d');
    const offsetWidth = nativeElement.offsetWidth;
    const offsetHeight = nativeElement.offsetHeight;
    let coordinates = { x0: 0, y0: 0, x1: 0, y1: 0 };
    if (percent <= 0.25) {
      coordinates = {
        x0: (offsetWidth / 2),
        y0: 0,
        x1: (offsetWidth / 2) * (1 + percent / 0.25),
        y1: (offsetHeight / 4) * (1 + percent / 0.25)
      };
    }
    else if (percent > 0.25 && percent <= 0.5) {
      coordinates = {
        x0: (offsetWidth / 2) * (1 + (percent - 0.25) / 0.25),
        y0: offsetHeight / 2,
        x1: offsetWidth,
        y1: (offsetHeight / 2) * (1 + (percent - 0.25) / 0.25)
      };
    }
    else if (percent > 0.5 && percent <= 0.75) {
      coordinates = {
        x0: (offsetWidth / 2) * (1 - (percent - 0.5) / 0.25),
        y0: (offsetHeight / 4) * (1 + (percent - 0.5) / 0.25),
        x1: offsetWidth / 2,
        y1: offsetHeight
      };
    }
    else if (percent > 0.75) {
      coordinates = {
        x0: 0,
        y0: (offsetHeight / 4) * (1 - (percent - 0.75) / 0.25),
        x1: (offsetWidth / 4) * (1 + (percent - 0.75) / 0.25),
        y1: offsetHeight / 2
      };
    }
    coordinates = {
      x0: Math.round(coordinates.x0),
      y0: Math.round(coordinates.y0),
      x1: Math.round(coordinates.x1),
      y1: Math.round(coordinates.y1)
    };
    let gradient = ctx.createLinearGradient(coordinates.x0, coordinates.y0, coordinates.x1, coordinates.y1);
    if (percent <= 0.1) {
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(1, this.bgColor);
    }
    else if (percent > 0.1 && percent <= 0.2) {
      gradient.addColorStop(0.6, this.color);
      gradient.addColorStop(1, this.bgColor);
    }
    else if (percent > 0.2 && percent <= 0.3) {
      gradient.addColorStop(0.6, this.color);
      gradient.addColorStop(1, this.bgColor);
    }
    else if (percent > 0.3 && percent <= 0.4) {
      gradient.addColorStop(0.5, this.color);
      gradient.addColorStop(1, this.bgColor);
    }
    else if (percent > 0.4 && percent <= 0.5) {
      gradient.addColorStop(0.5, this.color);
      gradient.addColorStop(1, this.bgColor);
    }
    else if (percent > 0.5 && percent <= 0.6) {
      gradient.addColorStop(0.8, this.color);
      gradient.addColorStop(1, this.bgColor);
    }
    else if (percent > 0.6 && percent <= 0.7) {
      gradient.addColorStop(0.9, this.color);
      gradient.addColorStop(0, this.bgColor);
    }
    else if (percent > 0.7 && percent <= 0.8) {
      gradient.addColorStop(0.9, this.color);
      gradient.addColorStop(0, this.bgColor);
    }
    else if (percent > 0.8 && percent <= 0.9) {
      gradient.addColorStop(0.9, this.color);
      gradient.addColorStop(0, this.bgColor);
    }
    else if (percent > 0.9 && percent <= 1) {
      gradient.addColorStop(0.9, this.color);
      gradient.addColorStop(0, this.bgColor);
    }
    return gradient;
  }
}