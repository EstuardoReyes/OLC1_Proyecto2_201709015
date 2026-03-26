import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as monaco from 'monaco-editor';
import { FileService } from '../../services/file';

@Component({
  selector: 'app-editor',
  imports: [],
  templateUrl: './editor.html',
  styleUrl: './editor.css',
  standalone: true,
})
export class Editor implements AfterViewInit {

  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;
  editor!: monaco.editor.IStandaloneCodeEditor;

  constructor(private fileService: FileService) {}

  ngAfterViewInit(): void {
    this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
      value: 'Hello, World!',
      language: 'typescript',
      theme: 'vs-dark',
      automaticLayout: true,
    });
    this.editor.onDidChangeModelContent(() => {
      this.fileService.updateContent(this.editor.getValue());
    });
  }

  
}
