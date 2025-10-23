import { Component, OnInit, AfterViewInit, ViewChild,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatBadgeModule } from '@angular/material/badge';
import { ClaimsService } from '../services/claims.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { faSearch, faDownload, faLink, faFilter, faArrowUp,faArrowDown, faRedo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-search-claims',
  standalone: true,
  imports: [FontAwesomeModule, FormsModule,MatDatepickerModule,MatNativeDateModule,MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,  MatTableModule, MatPaginatorModule,   MatCheckboxModule, MatBadgeModule,  ReactiveFormsModule,CommonModule ,],
  templateUrl: './search-claims.component.html',
  styleUrls: ['./search-claims.component.scss'],
 
})

export class SearchClaimsComponent implements OnInit, AfterViewInit {
  searchForm: FormGroup;
  claims: any[] = [];
  selectedClaims: number[] = [];
    currentPage = 1;
    pageSize = 20;
    totalRecords = 0;
	
	faSearch = faSearch;
	  faDownload = faDownload;
	  faLink = faLink;
	  faFilter = faFilter;
	  faReset = faRedo;
	  faArrowUp = faArrowUp;
	  faArrowDown = faArrowDown;
	 
  displayedColumns: string[] = ['select', 'claimNumber', 'claimantName', 'status'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private toastr: ToastrService ,  private fb: FormBuilder, private claimsService: ClaimsService) {
    this.searchForm = this.fb.group({
      claimNumber: [''],
	  claimantFirstName: [''],
	  claimantLastName: [''],
	  fromIncidentDate:[''],
	  toIncidentDate:[''],
      status: [''],
	  ssn:[''],
	  examiner: [''],
	  claimantType:[''],
	  email: [''],       
	  cell_Phone: [''],   
	  bith_date: [''],
	  employeeNumber: [''],
	  program: [''],
	  org1:[''],
	  org2:[''],
	  brokerName:[''],
	  jurisdictionClaimNumber:[''],
	  adjustingOfficer: [''],
	  affiliationClaimNumber: ['']          
	  
    });
  }
  ngOnInit(){
	this.loadClaims();
  }
  loadClaims() {
    this.claimsService.getClaims().subscribe({
      next: (res) => {
        // Adapt key names from backend to match table fields
        this.claims = res.map((c: any) => ({
          claim: c.claim,
          claim_id: c.claimId,
          adj_office: c.adjustingOffice,
          claimant: c.claimant,
          ssn: c.ssn,
          status: c.status,
          incident_date: c.incidentDate,
          type: c.claimType,
          broker_name: c.brokerName,
          insured: c.insured,
          examiner: c.examiner,
          supervisor: c.supervisor,
          accepted: c.accepted,
          denied: c.denied,
          closed: c.closed,
          employee: c.employee,
          jurisdiction: c.jurisdiction,
          jurisdiction_claim_number: c.jurisdictionClaimNumber,
          body_part: c.bodyPart,
          org1: c.org1,
          org2: c.org2,
          add_date: c.addDate,
          insurer: c.insurer
        }));
		
		// Bind the array to your table datasource
		      this.dataSource.data = this.claims;
		      this.totalRecords = this.claims.length;
			  this.toastr.success('Claims loaded successfully!', 'Success');

      },
      error: (err) => {
        console.error('Error fetching claims:', err);
		this.toastr.error('Failed to load claims', 'Error');

      }
    });
  }
/*toggleSelection(id: number) {
       if (this.selectedClaims.has(id)) {
         this.selectedClaims.delete(id);
       } else {
         this.selectedClaims.add(id);
       }
     }
	 isSelected(id: number): boolean {
	     return this.selectedClaims.has(id);
	   }*/
	 
	   // ------------------ Selection ------------------
	   toggleSelectAll(event: any): void {
	     const checked = event.target.checked;
	     this.claims.forEach((claim) => (claim.selected = checked));
	   }

	   onRowSelectChange(): void {
	     // Optionally handle row selection changes if needed
	   }

	   getSelectedClaims(): any[] {
	     return this.claims.filter((c) => c.selected);
	   }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onSearch() {
   const filters = this.searchForm.value;
	
	const formValue = this.searchForm.value;
	
	// Combine first and last name
	  const combinedClaimantName = `${formValue.claimantFirstName || ''} ${formValue.claimantLastName || ''}`.trim();

	  // Build search criteria object
	  const searchFilters = {
	    ...formValue,					// all fields from form
	    claimantName: combinedClaimantName   // ✅ backend expects this field
	  };
	  
    // Only send filters that have values
/*   const searchFilters: any = {};*/
    Object.keys(filters).forEach(key => {
		
      if (filters[key] !== null && filters[key] !== '') {
        searchFilters[key] = filters[key];
      }
    });
	
	
	// Check if any filter is selected
	 if (Object.keys(searchFilters).length === 0) {
	   // No filters selected → show message and exit
	   this.claims = [];
	   this.dataSource.data = [];
	   this.toastr.warning('Please select at least one filter before searching.', 'No Filters');
	   return;
	 }

    // Call service
    this.claimsService.searchClaims(searchFilters).subscribe({
      next: (res) => {
        // Map backend keys to table keys
        /*this.claims = res.map((c: any) => ({
          claim: c.claim,
          claim_id: c.claimId,
          adj_office: c.adjustingOffice,
          claimant: c.claimant,
          ssn: c.ssn,
          status: c.status,
          incident_date: c.incidentDate,
          type: c.claimType,
          broker_name: c.brokerName,
          insured: c.insured,
          examiner: c.examiner,
          supervisor: c.supervisor,
          accepted: c.accepted,
          denied: c.denied,
          closed: c.closed,
          employee: c.employee,
          jurisdiction: c.jurisdiction,
          jurisdiction_claim_number: c.jurisdictionClaimNumber,
          body_part: c.bodyPart,
          org1: c.org1,
          org2: c.org2,
          add_date: c.addDate,
          insurer: c.insurer
        }));

        // Update table
        this.dataSource.data = this.claims*/

       
		this.claims = res;
		this.dataSource.data = res;
		if (res.length > 0) {
		       this.toastr.success(`${res.length} result(s) found.`, 'Search Completed');
		     } else {
		       this.toastr.info('No results found for the selected filter(s).', 'Search Completed');
		     }

			 // Reset paginator to first page
			        if(this.paginator) this.paginator.firstPage();
      },
      error: (err) => console.error('Error fetching claims:', err),

    });
  }


  onReset() {
    this.searchForm.reset();
    this.dataSource.data = [];
  }

  // ------------------ Excel Export ------------------
    exportSelectedToExcel(): void {
      const selected = this.getSelectedClaims();
      if (selected.length === 0) {
		this.toastr.warning('Please select at least one row to download.', 'No Selection');
        return;
      }

      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(selected);
      const workbook: XLSX.WorkBook = {
        Sheets: { 'Selected Claims': worksheet },
        SheetNames: ['Selected Claims'],
      };

      const excelBuffer: any = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      const blob: Blob = new Blob([excelBuffer], {
        type: 'application/octet-stream',
      });
      saveAs(blob, 'SelectedClaims.xlsx');
	  this.toastr.success('Excel downloaded successfully!', 'Success');

    }

    // ------------------ CSV Export ------------------
/*    exportSelectedToCSV(): void {
      const selected = this.getSelectedClaims();
      if (selected.length === 0) {
        alert('Please select at least one row to download.');
        return;
      }

      const csvRows = [];
      const headers = Object.keys(selected[0]);
      csvRows.push(headers.join(','));

      for (const row of selected) {
        const values = headers.map((header) =>
          JSON.stringify(row[header] ?? '')
        );
        csvRows.push(values.join(','));
      }

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SelectedClaims.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    }*/
	exportSelectedToCSV(): void {
	  const selected = this.getSelectedClaims();
	  if (selected.length === 0) {
		this.toastr.warning('Please select at least one row to download.', 'No Selection');
	    return;
	  }

	  const escapeCSV = (value: any) => {
	    if (value == null) return '';
	    const str = value.toString();
	    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
	      return `"${str.replace(/"/g, '""')}"`;
	    }
	    return str;
	  };

	  const headers = Object.keys(selected[0]);
	  const csvRows = [
	    headers.join(',')
	  ];

	  selected.forEach(row => {
	    const values = headers.map(header => escapeCSV(row[header]));
	    csvRows.push(values.join(','));
	  });

	  const blob = new Blob([csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
	  saveAs(blob, 'SelectedClaims.csv');
	  this.toastr.success('Excel downloaded successfully!', 'Success');

	}
	
	sortColumn(column: string, order: 'asc' | 'desc') {
	   this.claims.sort((a, b) => {
	     if (a[column] < b[column]) return order === 'asc' ? -1 : 1;
	     if (a[column] > b[column]) return order === 'asc' ? 1 : -1;
	     return 0;
	   });
	 }
	 filterColumn(column: string) {
	     // logic for filter popup or input
	     console.log('Filter for column:', column);
	   }
  }

