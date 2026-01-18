import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader} from '@angular/material/card';

@Component({
  selector: 'app-dashboard-skeleton',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardContent
  ],
  templateUrl: './dashboard-skeleton.html',
  styleUrl: './dashboard-skeleton.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardSkeleton {

}
