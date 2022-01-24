import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHomePage(): string {
    return `<!DOCTYPE html>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans&display=swap" rel="stylesheet" />
    <style>
      html, body {
        margin:0;
        padding:0;
        font-family: 'Open Sans', sans-serif;
      }
      #app {
        padding: 40px;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right:0;
        display: flex;
        align-items: center;
        justify-items: center;
        justify-content: center;
        flex-direction: column;
      }
      h1, h2, h3, h4 {
        margin-bottom: 0.5rem;
        margin-top: 0;
      }
    </style>
    <div id="app">
      <h1>Luxe Global Awards</h1>
      <h4>Version 1 - [OAS3]</h4>
      <p>
        <a href="/docs">
          Click here to explore documentation
        </a>
      </p>
    </div>`;
  }
}
