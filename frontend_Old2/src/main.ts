import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

(window as any).MonacoEnvironment = {
  getWorkerUrl: function () {
    return '/assets/monaco-editor/vs/editor/editor.worker.js';}
};
