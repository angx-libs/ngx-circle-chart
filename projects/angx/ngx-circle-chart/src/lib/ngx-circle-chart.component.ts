import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { Colors } from 'ng2-charts';
import { CircleInnerText } from './CircleInnerText';

@Component({
  selector: 'circle-chart',
  templateUrl: './ngx-circle-chart.component.html',
  styles: [`
  #chart-wrapper {
    display: block;
    width:150%;
    margin-left: -25%;
  }
  #chart,
    #chart-foreground {
      position: absolute;
    }
  `]
})
export class NgxCircleChartComponent implements OnInit {

  readonly chartType: ChartType = 'doughnut';
  @ViewChild('chartwrapper') chart: ElementRef;
  @ViewChild('chartcanvas') chartcanvas: ElementRef;
  @ViewChild('chartfgcanvas') chartfgcanvas: ElementRef;

  @Input() value: number;
  @Input() maxValue: number;
  @Input() color: string;
  @Input() bgColor: string;
  @Input() gradientColoring: boolean;


  chartData: number[];
  bgChartData: number[];
  chartColors: Colors[];
  bgChartColors: Colors[];
  chartOptions: ChartOptions;
  bgChartOptions: ChartOptions;
  plugins: any;
  enableGraph: boolean;
  enableFg: boolean;
  showGraph: boolean;

  constructor() {
    new CircleInnerText().register();
  }

  ngOnInit() {
    this.initializeChart();
  }

  initializeChart() {
    this.value = this.value || 0;
    this.maxValue = this.maxValue || 0;
    this.color = this.color || '#d13537';
    this.bgColor = this.bgColor || '#ededed';
    this.chartData = [this.value];
    this.bgChartData = [this.value, this.maxValue - this.value];
    this.chartColors = [
      {
        backgroundColor: [this.bgColor],
        borderColor: [this.bgColor],
        pointBackgroundColor: [this.bgColor],
        pointBorderColor: [this.bgColor],
        pointHoverBackgroundColor: [this.bgColor],
        pointHoverBorderColor: [this.bgColor]
      }
    ];

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      cutoutPercentage: 95,
      legend: {
        display: false
      },
      layout: {
        padding: 11
      },
      tooltips: {
        enabled: false
      }
    };
    this.enableGraph = true;
    let paddingAdjustment = 0;
    setTimeout(() => {
      try {
        this.chart.nativeElement.style.height = this.chartcanvas.nativeElement.offsetHeight + 5 + 'px';
        paddingAdjustment = this.chartcanvas.nativeElement.offsetHeight / 120;
      } catch (e) { }
      this.bgChartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        cutoutPercentage: 85,
        legend: {
          display: false
        },
        layout: {
          padding: 9 - paddingAdjustment
        },
        tooltips: {
          enabled: false
        },
        plugins: {
          doughnutlabel: {
            labels: [
              {
                text: this.value,
                font: {
                  size: '120',
                  units: 'em',
                  family: 'Rubik',
                  weight: '500'
                },
                color: this.color
              },
              {
                text: '/' + this.maxValue,
                font: {
                  size: '85',
                  units: 'em',
                  family: 'Rubik',
                  weight: '300'
                },
                color: this.bgColor
              }
            ]
          }
        }
      };
      this.bgChartColors = [
        {
          backgroundColor: [this.color, 'transparent'],
          borderColor: [this.color, 'transparent'],
          pointBackgroundColor: [this.color, 'transparent'],
          pointBorderColor: [this.color, 'transparent'],
          pointHoverBackgroundColor: [this.color, 'transparent'],
          pointHoverBorderColor: [this.color, 'transparent']
        }
      ];
      this.enableFg = true;
      setTimeout(() => {
        this.applyGradient();
        this.showGraph = true;
      }, 1000);
    }, 100);
  }

  applyGradient() {
    try {
      this.chart.nativeElement.style.height = this.chartcanvas.nativeElement.offsetHeight + 5 + 'px';
    } catch (e) { }
    if (this.gradientColoring) {
      const ctx = this.chartfgcanvas.nativeElement.getContext('2d');
      const percent = this.value / this.maxValue;
      if (percent > 0.5 && percent <= 0.75) {
        const gradient = ctx.createLinearGradient(0
          , this.chartfgcanvas.nativeElement.offsetHeight / 6, 0, this.chartfgcanvas.nativeElement.offsetHeight * 0.9);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, this.bgColor);
        this.bgChartColors = [
          {
            backgroundColor: [gradient, 'transparent'],
            borderColor: [gradient, 'transparent'],
            pointBackgroundColor: [gradient, 'transparent'],
            pointBorderColor: [gradient, 'transparent'],
            pointHoverBackgroundColor: [gradient, 'transparent'],
            pointHoverBorderColor: [gradient, 'transparent']
          }
        ];
      } else if (percent > 0.75) {
        const gradient = ctx.createLinearGradient(this.chartfgcanvas.nativeElement.offsetWidth / 40,
          0, this.chartfgcanvas.nativeElement.offsetWidth / 6,
          this.chartfgcanvas.nativeElement.offsetHeight / 2);
        gradient.addColorStop(0.85, this.bgColor);
        gradient.addColorStop(1, this.color);
        this.bgChartColors = [
          {
            backgroundColor: [gradient, 'transparent'],
            borderColor: [gradient, 'transparent'],
            pointBackgroundColor: [gradient, 'transparent'],
            pointBorderColor: [gradient, 'transparent'],
            pointHoverBackgroundColor: [gradient, 'transparent'],
            pointHoverBorderColor: [gradient, 'transparent']
          }
        ];
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    setTimeout(() => {
      this.applyGradient();
    }, 100);
  }

}
