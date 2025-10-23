import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClaimsService {
  private API_URL = 'http://localhost:8080/api/claims';

  constructor(private http: HttpClient) {}

  getClaims(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}`); // /api/claims
  }

  
  // Fetch all claims or filter by parameters
    /*searchClaims(filters: any): Observable<any[]> {
      let params = new HttpParams();
	  
      Object.keys(filters || {}).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });

	  return this.http.get<any[]>(`${this.API_URL}/search`, { params });
    }*/
	
	// Fetch all claims or filter by parameters
	searchClaims(filters: any): Observable<any[]> {
	  return this.http.post<any[]>(`${this.API_URL}/search`, filters);
	}

  

  downloadClaims(filters: any, format: string): void {
      let params = new HttpParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params = params.append(key, filters[key]);
      });
      params = params.append('format', format);

      this.http.get(`${this.API_URL}/export`, {
        params,
        responseType: 'blob'
      }).subscribe(blob => {
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = `claims.${format}`;
        link.click();
        window.URL.revokeObjectURL(url);
      });
    }
  }
