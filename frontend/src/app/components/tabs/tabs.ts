import { Component } from '@angular/core';
import { FileService } from '../../services/file';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabs',
  imports: [CommonModule],
  templateUrl: './tabs.html',
  styleUrl: './tabs.css',
  standalone: true,

})
export class Tabs {
  constructor(public fileService: FileService) { }
}
