import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { SearchClaimsComponent } from './app/search-claims/search-claims.component';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';


  bootstrapApplication(AppComponent, {
    providers: [
		importProvidersFrom(HttpClientModule),
		provideAnimations(),
		    provideToastr({		
			  timeOut: 3000,          // toast visible duration (3 seconds)
		      positionClass: 'toast-top-right',
		      preventDuplicates: true
		    })
	  ]
  })
  .catch((err) => console.error(err));