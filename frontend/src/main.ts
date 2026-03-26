import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

(window as any).MonacoEnvironment = {
  getWorkerUrl: function () {
    return '/assets/monaco-editor/vs/editor/editor.worker.js';
  }
};

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));