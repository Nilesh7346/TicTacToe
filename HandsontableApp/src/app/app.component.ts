import { Component, AfterViewInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
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
  @ViewChild(HotTableComponent) hotTableComponent!: HotTableComponent;
  @ViewChild('messageDiv', { static: true }) messageDiv!: ElementRef;
  col = 0;
  row = 0;
  currentTooltip: any;
  eventMsg: string = "";
  data: any[] = [
    { name: 'Nilesh', company: 'ABC', age: 35, dob: "1990/03/31", notes: '' },
    { name: 'Shriyansh', company: 'PQR', age: 32, dob: "1993/05/20", notes: '' },
    { name: 'Pravin', company: 'XYZ', age: 1, dob: "2023/12/08", notes: '' },
  ];

  constructor(private renderer: Renderer2) {

    registerAllModules();

    class PopupEditor extends Handsontable.editors.TextEditor {
      private inputValue: string | null = null;
      override open() {
        this.inputValue = this.cellProperties.instance.getDataAtCell(this.row, this.col) || '';
        var input = prompt(
          'Enter text for the cell:',
          this.inputValue || ''
        );

        if (input !== null) {
          this.cellProperties.instance.setDataAtCell(this.row, this.col, input);
          this.inputValue = '';
          input = null;
        }
        this.finishEditing();
      }

      override close() {
        super.close();
      }
    }
    Handsontable.editors.registerEditor('popupEditor', PopupEditor);
  }


  ngAfterViewInit(): void {


    const hotInstance = (this.hotTableComponent as any).hotInstance;

    if (hotInstance) {
      hotInstance.addHook('afterChange', this.handleAfterChange.bind(this));
      hotInstance.addHook('afterSelection', this.afterSelection.bind(this));
      hotInstance.addHook('afterValidate', this.handleAfterValidate.bind(this));
    }

    const tableContainer = document.querySelector('.handsontable') as HTMLElement;

  }

  afterSelection(r: number, c: number, r2: number, c2: number, event: any): void {
    this.row = r;
    this.col = c;
    this.renderer.setProperty(this.messageDiv.nativeElement, 'innerHTML', "after selection" + " row :" + this.row + " and col:" + this.col + " at:" + new Date());
    const hotInstance = (this.hotTableComponent as any).hotInstance;
    if (c == 4) {
      const cellValue = hotInstance.getDataAtCell(r, c);
      hotInstance.setDataAtRowProp(r, 'notes', cellValue);
    }
  }
  handleAfterValidate(isValid: boolean, value: any, row: number, prop: string, source: string): void {
    this.renderer.setProperty(this.messageDiv.nativeElement, 'innerHTML', "after validate" + " row :" + this.row + " and col:" + this.col + " at:" + new Date());
    if (!isValid) {
      if (prop == "name") {
        this.showErrorTooltip(row, "Name length max limit reached.");
      }
      else if (prop == "dob") {
        this.showErrorTooltip(row, "Invalid date. Please enter a valid date.");
      }
      else if (prop == "company") {
        this.showErrorTooltip(row, "Invalid company. Please select a valid company.");
      }
    } else {
      this.hideErrorTooltip();
    }
  }

  handleAfterChange(changes: Handsontable.CellChange[] | null, source: string): void {
    this.renderer.setProperty(this.messageDiv.nativeElement, 'innerHTML', "after change" + " row :" + this.row + " and col:" + this.col + " at:" + new Date());
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

  calculateAge(dob: string): number {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : 0;
  }

  nameValidator(value: string, callback: Function): void {
    const isValid = value.length <= 10;
    const hotInstance = (this.hotTableComponent as any).hotInstance;
    callback(isValid);
  }

  dobValidator(value: string, callback: Function): void {
    const today = new Date();
    const dob = new Date(value);
    const isValid = dob <= today;
    callback(isValid);
  }

  createCustomTooltip(hotInstance: any, messasge: string): void {
    // Get the cell position (top, left)

    const cell = hotInstance.getCell(this.row, this.col);

    if (!cell) return;

    const rect = cell.getBoundingClientRect();
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.innerText = messasge;

    // Position the tooltip near the invalid cell
    tooltip.style.position = 'absolute';
    tooltip.style.top = `${rect.top + window.scrollY + 5}px`;  // Add 5px for offset
    tooltip.style.left = `${rect.left + window.scrollX + 5}px`; // Add 5px for offset
    tooltip.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
    tooltip.style.color = '#fff';
    tooltip.style.padding = '5px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.zIndex = '9999';

    // Append the tooltip to the document body
    document.body.appendChild(tooltip);

    // Store the tooltip for later removal
    this.currentTooltip = tooltip;
    setTimeout(() => {
      this.removeCustomTooltip();
    }, 2000);

  }

  removeCustomTooltip(): void {
    if (this.currentTooltip) {
      document.body.removeChild(this.currentTooltip);
      this.currentTooltip = null;
    }
  }

  showErrorTooltip(row: number, message: string): void {
    const hotInstance = (this.hotTableComponent as any).hotInstance;
    const td = hotInstance.getCell(row, this.col);
    this.createCustomTooltip(hotInstance, message);
    if (td) {
      td.setAttribute('title', message); // Set the title attribute for the tooltip
      td.classList.add('error-tooltip'); // Add a class to show custom styles    
    }
  }

  addNewRow(): void {
    const hotInstance = (this.hotTableComponent as any).hotInstance;

    // Insert a new empty row or with default values
    const newRow = { name: '', company: '', age: 0, dob: '', notes: '' };

    // Push the new row into the data array
    this.data.push(newRow);

    // Alter the Handsontable instance to insert the row
    hotInstance.alter('insert_row', this.data.length - 1);

    // Optionally, you can set focus or select the new row
    hotInstance.selectCell(this.data.length - 1, 0);
  }


  hideErrorTooltip(): void {
    const hotInstance = (this.hotTableComponent as any).hotInstance;
    const td = hotInstance.getCell(this.row, this.col);

    if (td) {
      td.removeAttribute('title'); // Remove the tooltip
      td.classList.remove('error-tooltip'); // Remove error class
    }
  }
  notesRenderer = (instance: Handsontable, td: HTMLElement, row: number, col: number, prop: string | number, value: any, cellProperties: Handsontable.CellProperties) => {
    // Set the 80% part as non-interactive
    const textHtml = `<span class="readonly-text" style="width: 80%; display: inline-block; pointer-events: none; user-select: none; overflow: hidden; text-overflow: ellipsis;">${value || ''}</span>`;

    // Set the icon part (20% area) - clickable to open the popup editor
    const iconHtml = `<span class="open-editor-icon" style="cursor: pointer; text-align: center; display: block; width: 20%;"><img src="assets/images/icon.svg" alt="Edit Icon" style="width: 100%; height: auto;"></span>`;

    td.innerHTML = `${textHtml}${iconHtml}`;
    td.style.display = 'flex';
    td.style.justifyContent = 'space-between';

    // Apply pointer-events: none to the entire cell content except for the icon area
    td.style.pointerEvents = 'none';

    // Find the icon element and enable pointer-events for the icon area so it can be clicked
    const iconElement = td.querySelector('.open-editor-icon') as HTMLElement;
    if (iconElement) {
      iconElement.setAttribute('style', 'pointer-events: auto; cursor: pointer; text-align: center; display: block; width: 20%;');
    }
  }
}

