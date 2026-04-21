import { Component, signal, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { ReportsService } from '../../services/reports.service';
import { instance } from '@viz-js/viz';


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

  // ── Modal AST ────────────────────────────────────────────────────────
  showAstModal = signal<boolean>(false);

  /** Abre el modal y renderiza el SVG del AST */
  async openAstModal() {
    const dotString = this.reportsService.ast();
    if (!dotString) return;

    this.showAstModal.set(true);

    // Esperar al siguiente ciclo para que el DOM esté listo
    setTimeout(async () => {
      const viz = await instance();
      const svg = viz.renderSVGElement(dotString);

      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.style.width  = '100%';
      svg.style.height = '100%';

      const container = document.getElementById('ast-modal-content');
      if (container) {
        container.innerHTML = '';
        container.appendChild(svg);
      }
    }, 0);
  }

  closeAstModal() {
    this.showAstModal.set(false);
  }

  /** Cerrar con Escape */
  onModalKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') this.closeAstModal();
  }
}

