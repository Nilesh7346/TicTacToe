import { Component, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { HotTableModule } from '@handsontable/angular';
import { registerAllModules } from 'handsontable/registry';
registerAllModules();
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HotTableModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent  {
  data: any[] = [
    { name: 'Tagcat', company: 'ABC', age:35 , dob:"1990-03-31"},
    { name: 'Zoomzone', company: 'ABC', age:32 , dob: "1993-05-20" },
    { name: 'Meeveo', company: 'XYZ', age:29 , dob: "1995-12-08" },
  ]
}
