/* global engine */
class ToolsView extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({
      mode: 'open'
    });
    this.shadow = shadow;
    shadow.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-wrap: wrap;
          margin: 0 2px;
          user-select: none;
        }
        button {
          display: inline-flex;
          align-items: center;
          background-color: transparent;
          border: none;
          outline: none;
          font-size: inherit;
          font-family: inherit;
          color: inherit;
          padding: 0;
          margin-bottom: 2px;
        }
        button span {
          background-color: #dadada;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          height: 24px;
          padding: 0 5px;
        }
        button span:hover {
          background-color: rgba(0, 0, 0, 0.15);
        }
        span[data-enabled=false] {
          color: #a0a0a0;
          text-shadow: 1px 1px #fcffff;
          pointer-events: none;
        }
        svg {
          margin: 0 2px;
        }
        span u {
          pointer-events: none;
        }
      </style>
      <button>
        <svg width="12" height="12" viewBox="-21 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <path d="m186.667969 416c-49.984375 0-90.667969-40.683594-90.667969-90.667969v-218.664062h-37.332031c-32.363281 0-58.667969 26.300781-58.667969 58.664062v288c0 32.363281 26.304688 58.667969 58.667969 58.667969h266.664062c32.363281 0 58.667969-26.304688 58.667969-58.667969v-37.332031zm0 0" fill="#1976d2"/>
          <path d="m469.332031 58.667969c0-32.40625-26.261719-58.667969-58.664062-58.667969h-224c-32.40625 0-58.667969 26.261719-58.667969 58.667969v266.664062c0 32.40625 26.261719 58.667969 58.667969 58.667969h224c32.402343 0 58.664062-26.261719 58.664062-58.667969zm0 0" fill="#2196f3"/>
        </svg>
        Copy&nbsp;<span title="Ctrl + X or Command + X" data-command="copy-title">Title (<u>X</u>)</span>&nbsp;
                  <span title="Ctrl + C or Command + C" data-command="copy-link">Link (C)</span>&nbsp;
                  <span title="Ctrl + I or Command + I" data-command="copy-id"><u>I</u>D</span>
      </button>
      <button>
        <svg width="16" height="16" viewBox="0 0 6.3499998 6.3499998">
          <path fill="#607d8b" d="M 4.5135398,1.4550781 2.9354148,3.0351563 A 0.26460978,0.26460978 0 0 0 2.8592429,3.1972657 L 2.7791649,4.0664063 A 0.26460978,0.26460978 0 0 0 3.0662742,4.3535157 L 3.9354149,4.2753906 A 0.26460978,0.26460978 0 0 0 4.0994775,4.1992187 L 5.6776024,2.6191405 c 0.1878881,-0.1878871 0.1878873,-0.5015659 0,-0.6894532 L 5.2029929,1.4550781 c -0.187887,-0.1878881 -0.5015659,-0.1878873 -0.6894531,0 z M 4.8592428,1.859375 5.2733054,2.2753906 3.7928368,3.7558595 3.3358053,3.7968751 3.376821,3.3398439 Z"/>
          <path fill="#4caf50" d="m 0.76744594,4.498047 a 0.26495279,0.26495279 0 0 0 0.0253906,0.5292968 H 3.4393209 a 0.26464844,0.26464844 0 1 0 0,-0.5292968 H 0.79283657 a 0.26460978,0.26460978 0 0 0 -0.0253906,0 z"/>
        </svg>
        Edit&nbsp;<span title="Ctrl + E or Command + E" data-command="edit-title">Titl<u>e</u></span>&nbsp;
                  <span title="Ctrl + L or Command + L" data-command="edit-link"><u>L</u>ink</span>
      </button>
      <button>
      <svg width="12" height="12" viewBox="0 0 469.33333 469.33333">
        <path fill="#4caf50" d="m437.332031 192h-405.332031c-17.664062 0-32 14.335938-32 32v21.332031c0 17.664063 14.335938 32 32 32h405.332031c17.664063 0 32-14.335937 32-32v-21.332031c0-17.664062-14.335937-32-32-32zm0 0"/>
        <path fill="#4caf50" d="m192 32v405.332031c0 17.664063 14.335938 32 32 32h21.332031c17.664063 0 32-14.335937 32-32v-405.332031c0-17.664062-14.335937-32-32-32h-21.332031c-17.664062 0-32 14.335938-32 32zm0 0"/>
      </svg>
        New&nbsp;<span title="Ctrl + B or Command + B" data-command="new-file"><u>B</u>ookmark</span>&nbsp;
                 <span title="Ctrl + D or Command + D" data-command="new-directory"><u>D</u>irectory</span>
      </button>
      <button>
        <svg height="12" viewBox="0 -21 512.03658 512" width="12">
          <path d="m170.667969 384.019531c0-35.757812-22.144531-66.328125-53.398438-79.019531l386.558594-216.363281c4.246094-2.367188 7.167969-6.550781 7.980469-11.347657.832031-4.714843-.640625-9.6875-3.882813-13.3125-29.886719-33.195312-81.046875-35.585937-133.527343-6.230468l-19.027344 10.582031c-58.773438 32.597656-139.265625 77.246094-164.972656 108.09375-24.789063 29.761719-31.464844 59.777344-33.042969 69.484375l-113.621094 63.59375c-.449219.257812-.640625.746094-1.046875 1.046875-25.40625 14.804687-42.6875 42.027344-42.6875 73.472656 0 47.058594 38.273438 85.332031 85.332031 85.332031 47.0625 0 85.335938-38.273437 85.335938-85.332031zm-128 0c0-23.53125 19.132812-42.667969 42.664062-42.667969s42.667969 19.136719 42.667969 42.667969-19.136719 42.664063-42.667969 42.664063-42.664062-19.15625-42.664062-42.664063zm0 0" fill="#607d8b"/>
          <path d="m85.332031.0195312c-47.058593 0-85.332031 38.2695308-85.332031 85.3320308 0 31.445313 17.28125 58.644532 42.644531 73.449219.425781.300781.597657.789063 1.046875 1.046875l113.621094 63.59375c1.578125 9.707032 8.253906 39.722656 33.042969 69.484375 25.707031 30.847657 106.21875 75.496094 164.972656 108.09375l19.027344 10.582031c52.480469 29.355469 103.640625 26.964844 133.527343-6.230468 3.242188-3.625 4.714844-8.59375 3.882813-13.308594-.789063-4.824219-3.710937-8.984375-7.980469-11.351562l-386.515625-216.363282c31.253907-12.671875 53.398438-43.242187 53.398438-78.996094 0-47.0625-38.292969-85.3320308-85.335938-85.3320308zm0 42.6640628c23.53125 0 42.667969 19.136718 42.667969 42.667968s-19.136719 42.667969-42.667969 42.667969-42.664062-19.160156-42.664062-42.667969c0-23.507812 19.132812-42.667968 42.664062-42.667968zm0 0" fill="#607d8b"/>
        </svg>
        Move&nbsp;<span title="Ctrl + ArrowLeft or Command + ArrowLeft" data-command="move-left">Left (&#x2190;)</span>&nbsp;
                  <span title="Ctrl + ArrowRight or Command + ArrowRight" data-command="move-right">Right (&#x2192;)</span>
      </button>
      <button>
        <svg width="13" height="13" viewBox="0 -107 512 512">
          <path d="m85.332031 64h212.269531c-12.84375 25.75-20.269531 54.65625-20.269531 85.332031 0 30.679688 7.425781 59.585938 20.269531 85.335938h-212.269531c-47.058593 0-85.332031-38.273438-85.332031-85.335938 0-47.058593 38.273438-85.332031 85.332031-85.332031zm0 0" fill="#00bcd4"/>
          <path d="m512 149.332031c0 82.476563-66.859375 149.335938-149.332031 149.335938-82.476563 0-149.335938-66.859375-149.335938-149.335938 0-82.472656 66.859375-149.332031 149.335938-149.332031 82.472656 0 149.332031 66.859375 149.332031 149.332031zm0 0" fill="#607d8b"/>
          <path d="m426.667969 149.332031c0 35.347657-28.65625 64-64 64-35.347657 0-64-28.652343-64-64 0-35.34375 28.652343-64 64-64 35.34375 0 64 28.65625 64 64zm0 0" fill="#fafafa"/>
        </svg>
        Tools&nbsp;<span title="Both panes: Ctrl + O or Command + O&#013;Active pane: Ctrl + Shift + O or Command + Shift + O" data-command="root">R<u>o</u>ot</span>&nbsp;
                   <span title="Ctrl + M or Command + M" data-command="mirror"><u>M</u>irror</span>&nbsp;
                   <span title="Ctrl + Delete, Ctrl + Backspace, Command + Delete, or Command + Backspace" data-command="trash">Delete</span>&nbsp;
                   <span title="Search for a query: Ctrl + F or Command + F&#013;Find duplicates: Ctrl + Shift + F or Command + Shift + F" data-command="search">Search (<u>F</u>)</span>&nbsp;
                   <span title="A-Z: Ctrl + J or Command + J&#013;Z-A: Ctrl + Shift + J or Command + Shift + J" data-command="sort">Sort (<u>J</u>)</span>
      </button>
    `;
    this.shadow.addEventListener('click', e => {
      const command = e.target.dataset.command;
      if (command) {
        this.emit('tools-view:command', {
          command,
          shiftKey: e.shiftKey
        });
      }
    });
  }
  emit(name, detail) {
    return this.dispatchEvent(new CustomEvent(name, {
      bubbles: true,
      detail
    }));
  }
  validate(name) {
    const d = this.shadow.querySelector(`[data-command="${name}"]`);
    if (d) {
      if (d.dataset.enabled === 'false') {
        return 0;
      }
      else {
        return 1;
      }
    }
    return -1;
  }
  command(e, callback) {
    const meta = e.ctrlKey || e.metaKey;
    let command = '';
    if (e.code === 'KeyC' && meta) {
      command = 'copy-link';
    }
    else if (e.code === 'KeyX' && meta) {
      command = 'copy-title';
    }
    else if (e.code === 'KeyI' && meta) {
      command = 'copy-id';
    }
    else if (e.code === 'KeyE' && meta) {
      command = 'edit-title';
    }
    else if (e.code === 'KeyL' && meta) {
      command = 'edit-link';
    }
    else if (e.code === 'KeyB' && meta) {
      command = 'new-file';
    }
    else if (e.code === 'KeyD' && meta) {
      command = 'new-directory';
    }
    else if (e.code === 'ArrowLeft' && meta) {
      command = 'move-left';
    }
    else if (e.code === 'ArrowRight' && meta) {
      command = 'move-right';
    }
    else if ((e.code === 'Delete' || e.code === 'Backspace') && meta) {
      command = 'trash';
    }
    else if (e.code === 'KeyO' && meta) {
      command = 'root';
    }
    else if (e.code === 'KeyM' && meta) {
      command = 'mirror';
    }
    else if (e.code === 'KeyF' && meta) {
      command = 'search';
    }
    else if (e.code === 'KeyJ' && meta) {
      command = 'sort';
    }
    // command box
    if (e.code === 'KeyS' && meta) {
      engine.user.ask(`Enter a Command:

icon=[default|light|dark]
font-size=[number]px
font-family=[font-name]`).then(command => {
        if (command.startsWith('icon=')) {
          const path = command.replace('icon=', '') || 'default';
          chrome.storage.local.set({
            'custom-icon': path === 'default' ? '' : path
          });
        }
        else if (command.startsWith('font-size=')) {
          const px = /font-size=(\d+)px/.exec(command);
          chrome.storage.local.set({
            'font-size': px && px.length ? px[1] : ''
          });
        }
        else if (command.startsWith('font-family=')) {
          chrome.storage.local.set({
            'font-family': command.replace('font-family=', '')
          });
        }
      });
      e.preventDefault();
    }

    if (command) {
      const code = this.validate(command);
      if (code === 0 || code === 1) {
        e.preventDefault();
        e.stopPropagation(); // to prevent other modules from running
      }
      if (code === 1) {
        callback(command, e);
      }
      if (code === 0) {
        engine.notify('beep');
      }
    }
  }
  state(command, enabled) {
    const e = this.shadow.querySelector(`[data-command="${command}"]`);
    if (e) {
      e.dataset.enabled = enabled;
    }
  }
}
window.customElements.define('tools-view', ToolsView);
