import { Component } from '@angular/core';
import { Tabs } from '../tabs/tabs';
import { Editor } from '../editor/editor';
import { Console } from '../console/console';
import { Reports } from '../reports/reports';

@Component({
  selector: 'app-ide',
  imports: [Tabs, Editor, Console, Reports],
  templateUrl: './ide.html',
  styleUrl: './ide.css',
  standalone: true,
})
export class IDE {}
