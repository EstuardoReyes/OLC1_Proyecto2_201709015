import { Component, inject } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FileService }       from '../../services/file.service';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.html',
})
export class Tabs {
  fileService = inject(FileService);

  isActive(id: number): boolean {
    return this.fileService.activeTabId() === id;
  }

  switchTab(id: number): void {
    this.fileService.setActiveTab(id);
  }

  closeTab(event: MouseEvent, id: number): void {
    event.stopPropagation(); // no activar la pestaña al cerrar
    this.fileService.closeTab(id);
  }

  newFile():   void { this.fileService.createFile(); }
  openFile():  void { this.fileService.openFile(); }
  saveFile():  void { this.fileService.saveFile(); }
  ejecutar(): void { /* delega al EditorComponent vía IDEComponent */ }
}
