import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Application shell. Every page renders through the router outlet below. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
