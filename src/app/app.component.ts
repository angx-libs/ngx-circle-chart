import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgxCircleChartComponent } from '@angx/ngx-circle-chart';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgxCircleChartComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  /** Drives the live chart, to show that the chart tracks input changes. */
  readonly liveValue = signal(3);

  onLiveValueChange(event: Event): void {
    this.liveValue.set(Number((event.target as HTMLInputElement).value));
  }
}
