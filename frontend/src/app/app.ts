import { Component, signal } from '@angular/core';
import { IDE } from './components/ide/ide';

@Component({
  selector: 'app-root',
  imports: [IDE],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
