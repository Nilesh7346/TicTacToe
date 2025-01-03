import { Component, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { HotTableComponent, HotTableModule } from '@handsontable/angular';
import Handsontable from 'handsontable';
import { registerAllModules } from 'handsontable/registry';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HotTableModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild(HotTableComponent) hotTableComponent!: HotTableComponent; // Access HotTableComponent
  eventMsg: string = "";
  // Define your dataset with five columns, including 'notes' for the popup editor
  data: any[] = [
    { name: 'Tagcat', company: 'ABC', age: 35, dob: "1990/03/31", notes: '' },
    { name: 'Zoomzone', company: 'ABC', age: 32, dob: "1993/05/20", notes: '' },
    { name: 'Meeveo', company: 'XYZ', age: 29, dob: "1995/12/08", notes: '' },
  ];

  constructor(private cdr: ChangeDetectorRef) {
    // Register all Handsontable modules
    registerAllModules();

    // Define the custom editor by extending the TextEditor
    class PopupEditor extends Handsontable.editors.TextEditor {
      private inputValue: string | null = null;
      override open() {
        this.inputValue = this.cellProperties.instance.getDataAtCell(this.row, this.col) || '';

        // Show a popup dialog to enter the new value
        var input = prompt(
          'Enter text for the cell:',
          this.inputValue || ''
        );

        if (input !== null) {
          // Save the new value to the specific cell
          this.cellProperties.instance.setDataAtCell(this.row, this.col, input);
          this.inputValue = '';
          input = null;
        }
        this.finishEditing(); // Finish editing        
      }

      override close() {
        super.close(); // Call the parent class's close method
      }
    }

    //Register the custom editor with Handsontable
    Handsontable.editors.registerEditor('popupEditor', PopupEditor);
  }

  ngAfterViewInit(): void {
    const hotInstance = (this.hotTableComponent as any).hotInstance; // Access `hotInstance` dynamically

    if (hotInstance) {
      hotInstance.addHook('afterChange', this.handleAfterChange.bind(this));
      hotInstance.addHook('afterSelection', this.afterSelection.bind(this));
      hotInstance.addHook('cellMouseDown', this.handleCellMouseDown.bind(this));
    }
  }

  afterSelection(r: number, c: number, r2: number, c2: number, event: any): void {
    this.eventMsg = "after selection";
    this.cdr.detectChanges();
    if (c == 4) {
      const hotInstance = (this.hotTableComponent as any).hotInstance;
      const cellValue = hotInstance.getDataAtCell(r, c);
      hotInstance.setDataAtRowProp(r, 'notes', cellValue);
    }
  }


  handleAfterChange(changes: Handsontable.CellChange[] | null, source: string): void {
    this.eventMsg = "after change";
    this.cdr.detectChanges();
    if (changes) {
      changes.forEach(([row, property, oldValue, newValue]) => {
        if (property === 'dob' && newValue) {
          const hotInstance = (this.hotTableComponent as any).hotInstance;
          const age = this.calculateAge(newValue);
          hotInstance.setDataAtRowProp(row, 'age', age);
        }
      });
    }
  }

  handleCellMouseDown(event: MouseEvent, coords: Handsontable.CellCoords, td: HTMLTableCellElement, prop: string, value: any) {
    this.eventMsg = "after mouse down";
    this.cdr.detectChanges();
  }

  calculateAge(dob: string): number {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : 0; // Return 0 if the DOB is invalid or in the future
  }

  nameValidator(value: string, callback: Function): void {
    const isValid = value.length <= 10;
    callback(isValid);
  }

  // DOB validator: Ensures date is not in the future
  dobValidator(value: string, callback: Function): void {
    const today = new Date();
    const dob = new Date(value);
    const isValid = dob <= today;
    callback(isValid);
  }

}
