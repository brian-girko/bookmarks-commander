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
        div {
          display: flex;
          align-items: center;
          flex-flow: wrap;
          margin-top: -5px;
        }
        div > * {
          margin-top: 5px !important;
        }
        div > u {
          text-decoration: none;
          margin: 0 5px;
        }
        div > span {
          margin-right: 2px;
          white-space: nowrap;
          background-color: var(--bg-light, #dadada);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          height: 28px;
          padding: 0 10px;
        }
        div > span:hover {
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
        .ha {
          white-space: pre;
        }
        @media screen and (max-width: 1200px) {
          .ha {
            display: none;
          }
        }
        @media screen and (max-width: 800px) {
          span[data-enabled=false] {
            display: none;
          }
          .ja {
            display: none;
          }
        }
        @media screen and (max-width: 600px) {
          span[data-command="copy-id"],
          span[data-command="commands"],
          span[data-command="root"],
          span[data-command="mirror"] {
            display: none;
          }
        }
        u + u {
          color: red
        }
      </style>

      <div>
        <u title="Copy">C<span class="ja">opy</span></u>
        <span title="Ctrl + X or Command + X ➝ Copy bookmark's title to the clipboard" data-command="copy-title">Title<span class="ha"> (<u>X</u>)</span></span>
        <span title="Ctrl + C or Command + C ➝ Copy bookmark's link to the clipboard" data-command="copy-link">Link<span class="ha"> (C)</span></span>
        <span title="Ctrl + I or Command + I ➝ Copy bookmark's internal ID to the clipboard" data-command="copy-id"><u>I</u>D</span>
        <u title="Edit">E<span class="ja">dit</span></u>
        <span title="Ctrl + E or Command + E ➝ Change bookmark's title" data-command="edit-title">Titl<u>e</u></span>
        <span title="Ctrl + L or Command + L ➝ Change bookmark's link" data-command="edit-link"><u>L</u>ink</span>
        <u title="JSON">J<span class="ja">SON</span></u>
        <span title="Ctrl + P or Command + P ➝ Paste the current bookmark tree inside a directory or next to the current bookmark" data-command="import-tree">Im<u>p</u>ort</span>
        <span title="Ctrl + Y or Command + Y ➝ Copy the selected bookmarks to the clipboard&#013;Ctrl + Shift + Y or Command + Shift + Y ➝ Export selected bookmarks to a JSON file" data-command="export-tree">Export<span class="ha"> (Y)</span></span>
        <u title="New">N<span class="ja">ew</span></u>
        <span title="Ctrl + B or Command + B ➝ Create a new bookmark" data-command="new-file"><u>B</u>ookmark</span>
        <span title="Ctrl + D or Command + D ➝ Create a new empty directory" data-command="new-directory"><u>D</u>irectory</span>
        <u title="Move">M<span class="ja">ove</span></u>
        <span title="Ctrl + ArrowLeft or Command + ArrowLeft ➝ Move selected bookmarks to the left pane" data-command="move-left">Left<span class="ha"> (&#x2190;)</span></span>
        <span title="Ctrl + ArrowRight or Command + ArrowRight ➝ Move the selected bookmarks to the right pane" data-command="move-right">Right<span class="ha"> (&#x2192;)</span></span>
        <u title="Tools">T<span class="ja">ools</span></u>
        <span title="Ctrl + S or Command + S ➝ Open commands box" data-command="commands">CMD<span class="ha"> (<u>S</u>)</span></span>
        <span title="Ctrl + O or Command + O ➝ Reset both panes&#013;Ctrl + Shift + O or Command + Shift + O ➝ Reset only the active pane" data-command="root">R<u>o</u>ot</span>
        <span class="view-2" title="Ctrl + M or Command + M ➝ Mirror the inactive pane&#013;Ctrl + Shift + M or Command + Shift + M ➝ Navigate inactive pane into the first selected Dir&#013;Al + M ➝ Open path folder in opposite pane" data-command="mirror"><u>M</u>irror</span>
        <span title="Ctrl + Delete, Ctrl + Backspace, Command + Delete, or Command + Backspace ➝ Delete the active bookmarks and directories" data-command="trash">Delete</span>
        <span title="Ctrl + F or Command + F ➝ Search inside the active directory&#013;Ctrl + Shift + F or Command + Shift + F ➝ Search for duplicates inside the active directory" data-command="search">Search<span class="ha"> (<u>F</u>)</span></span>
        <span title="Ctrl + J or Command + J ➝ Sort A-Z&#013;Ctrl + Shift + J or Command + Shift + J ➝ Sort Z-A&#013;Alt + J ➝ Custom Sorting (A-Z)&#013;Alt + Shift + J ➝ Custom Sorting (Z-A)" data-command="sort">Sort<span class="ha"> (<u>J</u>)</span></span>
      </div>
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
    // commands without buttons
    else if (['first', 'last'].some(s => s === name)) {
      return 1;
    }
    return -1;
  }
  command(e, callback = () => {}) {
    const meta = e.ctrlKey || e.metaKey;
    let command = '';
    if (e.key === 'Home') {
      command = 'first';
    }
    else if (e.key === 'End') {
      command = 'last';
    }
    else if (e.code === 'KeyC' && meta) {
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
    else if (e.code === 'KeyM' && e.altKey) {
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
