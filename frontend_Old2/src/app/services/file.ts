import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FileService {

  tabs = [
    { id: 1, name: 'main.gst', content: '' }
  ];

  activeTab = 1;

  get activeFile() {
    return this.tabs.find(t => t.id === this.activeTab);
  }

  updateContent(content: string) {
    const file = this.activeFile;
    if (file) file.content = content;
  }

  setActiveTab(id: number) {
  this.activeTab = id;
}

createFile() {
  const newTab = {
    id: Date.now(),
    name: `file${this.tabs.length + 1}.gst`,
    content: ''
  };
  this.tabs.push(newTab);
  this.activeTab = newTab.id;
}
}