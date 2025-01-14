import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  template: `

    <div class="flex flex-col">
      <div class="flex-grow"></div>
      <footer class=" text-white text-center p-4 mt-5">
        <div class="">
          <p class="hidden md:block text-xl text-gray-500 dark:text-gray-400">
            Copyright &copy; {{ _year }} Ruamsuk&trade; Kanchanaburi.
          </p>
        </div>
      </footer>
    </div>

  `,
  styles: `
    .truncate {
      display: block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    /*footer {
      position: fixed;
      left: 0;
      bottom: 0;
      width: 100%;
      background-color: var(--background-color-b);
      text-align: center;
      padding: 10px;
      z-index: -1;
    }*/

    .hidden-md {
      display: none;
    }

    @media (min-width: 768px) {
      .hidden-md {
        display: block;
      }
      .visible-md {
        display: none;
      }
    }
  `,
})
export class FooterComponent {
  _year = new Date().getFullYear();
}
