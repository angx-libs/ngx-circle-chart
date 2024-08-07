import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxCircleChartComponent } from '../../projects/angx/ngx-circle-chart/src/public-api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgxCircleChartComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ngx-circle-chart';
}
