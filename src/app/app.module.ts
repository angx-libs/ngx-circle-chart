import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxCircleChartModule } from 'projects/angx/ngx-circle-chart/src/lib/ngx-circle-chart.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxCircleChartModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
