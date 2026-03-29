import { Component, signal, inject } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { ReportsService } from '../../services/reports.service';

type ReportTab = 'errores' | 'simbolos' | 'ast';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
})
export class Reports {

  tabs: { id: ReportTab; label: string }[] = [
    { id: 'errores',  label: 'Errores'  },
    { id: 'simbolos', label: 'Símbolos' },
    { id: 'ast',      label: 'AST'      }
  ];
  reportsService = inject(ReportsService);

  activeTab = signal<ReportTab>('errores');

  setTab(tab: ReportTab): void {
    this.activeTab.set(tab);
  }

  isTab(tab: ReportTab): boolean {
    return this.activeTab() === tab;
  }

  // Para el árbol AST colapsable
  collapsedNodes = new Set<string>();

  toggleNode(path: string): void {
    if (this.collapsedNodes.has(path)) {
      this.collapsedNodes.delete(path);
    } else {
      this.collapsedNodes.add(path);
    }
  }

  isCollapsed(path: string): boolean {
    return this.collapsedNodes.has(path);
  }
}
