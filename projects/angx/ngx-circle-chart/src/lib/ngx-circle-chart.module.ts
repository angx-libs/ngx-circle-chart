import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts';
import { NgxCircleChartComponent } from './ngx-circle-chart.component';

@NgModule({
  declarations: [NgxCircleChartComponent],
  imports: [
    CommonModule,
    ChartsModule
  ],
  exports: [NgxCircleChartComponent]
})
export class NgxCircleChartModule { }
