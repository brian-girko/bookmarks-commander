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
          background-color: var(--bg-light, #dadada);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          height: 28px;
          padding: 0 5px;
        }
        button span:hover {
          background-color: rgba(0, 0, 0, 0.15);
        }
        span[data-enabled=false] {
          color: var(--disabled-color, #a0a0a0);
          text-shadow: 1px 1px var(--disabled-shadow, #fcffff);
          pointer-events: none;
        }
        svg {
          margin: 0 5px 0 2px;
        }
        span u {
          pointer-events: none;
        }
        :host-context(body[data-views="1"]) .view-2 {
          display: none;
        }
      </style>
      <button>
        &nbsp;Copy&nbsp;<span title="Ctrl + X or Command + X: Copy bookmark's title to the clipboard" data-command="copy-title">Title (<u>X</u>)</span>&nbsp;
                  <span title="Ctrl + C or Command + C: Copy bookmark's link to the clipboard" data-command="copy-link">Link (C)</span>&nbsp;
                  <span title="Ctrl + I or Command + I: Copy bookmark's internal ID to the clipboard" data-command="copy-id"><u>I</u>D</span>&nbsp;
      </button>
      <button>
        &nbsp;Edit&nbsp;<span title="Ctrl + E or Command + E: Change bookmark's title" data-command="edit-title">Titl<u>e</u></span>&nbsp;
                  <span title="Ctrl + L or Command + L: Change bookmark's link" data-command="edit-link"><u>L</u>ink</span>
      </button>
      <button>
        &nbsp;JSON&nbsp;<span title="Ctrl + P or Command + P: Paste the current bookmark tree inside a directory or next to the current bookmark" data-command="import-tree">Im<u>p</u>ort</span>&nbsp;
                  <span title="Ctrl + Y or Command + Y" data-command="export-tree">Export (Y)</span>
      </button>
      <button>
        &nbsp;New&nbsp;<span title="Ctrl + B or Command + B" data-command="new-file"><u>B</u>ookmark</span>&nbsp;
                 <span title="Ctrl + D or Command + D" data-command="new-directory"><u>D</u>irectory</span>
      </button>
      <button class="view-2">
        &nbsp;Move&nbsp;<span title="Ctrl + ArrowLeft or Command + ArrowLeft" data-command="move-left">Left (&#x2190;)</span>&nbsp;
                  <span title="Ctrl + ArrowRight or Command + ArrowRight" data-command="move-right">Right (&#x2192;)</span>
      </button>
      <button>
        &nbsp;Tools&nbsp;<span title="Ctrl + S or Command + S" data-command="commands">CMD (<u>S</u>)</span>&nbsp;
                   <span title="Both panes: Ctrl + O or Command + O&#013;Active pane: Ctrl + Shift + O or Command + Shift + O" data-command="root">R<u>o</u>ot</span>&nbsp;
                   <div class="view-2"><span title="Ctrl + M or Command + M" data-command="mirror"><u>M</u>irror</span>&nbsp;</div>
                   <span title="Ctrl + Delete, Ctrl + Backspace, Command + Delete, or Command + Backspace" data-command="trash">Delete</span>&nbsp;
                   <span title="Search for a query: Ctrl + F or Command + F&#013;Find duplicates: Ctrl + Shift + F or Command + Shift + F" data-command="search">Search (<u>F</u>)</span>&nbsp;
                   <span title="A-Z: Ctrl + J or Command + J&#013;Z-A: Ctrl + Shift + J or Command + Shift + J&#013;Custom Sorting (A-Z): Alt + J&#013;Custom Sorting (Z-A): Alt + Shift + J" data-command="sort">Sort (<u>J</u>)</span>
      </button>
    `;
    this.shadow.addEventListener('click', e => {
      const command = e.target.dataset.command;
      if (command === 'commands') {
        this.command(new KeyboardEvent('keydown', {
          code: 'KeyS',
          ctrlKey: true
        }));
      }
      else if (command) {
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
  command(e, callback = () => {}) {
    const meta = e.ctrlKey || e.metaKey;
    let command = '';
    if (e.code === 'KeyC' && meta) {
      command = 'copy-link';
    }
    else if (e.code === 'KeyP' && meta) {
      command = 'import-tree';
    }
    else if (e.code === 'KeyY' && meta) {
      command = 'export-tree';
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
    else if (e.code === 'KeyJ' && (meta || e.altKey)) {
      command = 'sort';
    }
    // command box
    if (e.code === 'KeyS' && meta) {
      engine.user.ask(`Enter a Command:

icon=[default|light|dark]
theme=[default|dark|light]
font-size=[number]px
font-family=[font-name]
views=[1|2]
column-widths=[name]px, [added]px, [modified]px`).then(command => {
        if (command.startsWith('icon=')) {
          const path = command.replace('icon=', '') || 'default';
          chrome.storage.local.set({
            'custom-icon': path === 'default' ? '' : path
          });
        }
        else if (command.startsWith('theme=')) {
          const path = command.replace('theme=', '') || 'default';
          chrome.storage.local.set({
            'theme': path === 'default' ? '' : path
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
        else if (command.startsWith('views=')) {
          const views = Math.min(2, Math.max(1, Number(command.replace('views=', ''))));
          chrome.storage.local.set({
            views
          });
        }
        else if (command.startsWith('column-widths=')) {
          const widths = [...command.replace('column-widths=', '').split(/\s*,\s*/).map(s => parseInt(s))].slice(0, 3);
          widths[0] = widths[0] ? Math.min(1000, Math.max(32, widths[0])) : 200;
          widths[1] = widths[1] ? Math.min(1000, Math.max(32, widths[1])) : 90;
          widths[2] = widths[2] ? Math.min(1000, Math.max(32, widths[2])) : 90;

          chrome.storage.local.set({
            widths: {
              name: widths[0],
              added: widths[1],
              modified: widths[2]
            }
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
