import { Component, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SearchClaimsComponent } from './search-claims/search-claims.component';
import { ToastrModule } from 'ngx-toastr';



@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [SearchClaimsComponent,ReactiveFormsModule ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  protected readonly title = signal('claims-dashboard');
}
