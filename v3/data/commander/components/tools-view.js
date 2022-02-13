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
          flex-flow: nowrap;
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
        div > span * {
          pointer-events: none;
        }
        div > span:hover {
          background-color: var(--bg-command, rgba(0, 0, 0, 0.15));
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
        #search {
          flex: 1;
          color: var(--color, #3e3e3e);
          background-color: var(--bg-light, #dadada);
          border: none;
          height: 28px;
          padding: 0 10px;
          outline: none;
        }
        #search:focus {
          background-color: var(--bg-active, #fff);
        }
        :host-context(body[data-views="1"]) .view-2 {
          display: none;
        }
        .hi {
          display: none;
        }
        .ha {
          white-space: pre;
        }
        @media screen and (max-width: 1600px) {
          .ha {
            display: none;
          }
        }
        @media screen and (max-width: 1400px) {
          .ja {
            display: none;
          }
        }
        @media screen and (max-width: 1200px) {
          span[data-enabled=false] {
            display: none;
          }
        }
        @media screen and (max-width: 1000px) {
          span[data-command="copy-title"],
          span[data-command="copy-link"],
          span[data-command="copy-id"],
          span[data-command="commands"],
          span[data-command="sort"],
          span[data-command="edit-title"],
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
        <u title="Copy" class="ja">Copy</u>
        <span title="Ctrl + X or Command + X ➝ Copy bookmark's title to the clipboard" data-command="copy-title">Title<span class="ha"> (<u>X</u>)</span></span>
        <span title="Ctrl + C or Command + C ➝ Copy bookmark's link to the clipboard" data-command="copy-link">Link<span class="ha"> (C)</span></span>
        <span title="Ctrl + I or Command + I ➝ Copy bookmark's internal ID to the clipboard" data-command="copy-id" class="hi"><u>I</u>D</span>
        <span title="Ctrl + U or Command + U ➝ Duplicate bookmark to the other pane" data-command="duplicate" class="ha">D<u>u</u>p</span>
        <u title="Edit" class="ja">Edit</u>
        <span title="Ctrl + E or Command + E ➝ Change bookmark's title" data-command="edit-title">Titl<u>e</u></span>
        <span title="Ctrl + L or Command + L ➝ Change bookmark's link" data-command="edit-link"><u>L</u>ink</span>
        <u title="JSON" class="ja">JSON</u>
        <span title="Ctrl + P or Command + P ➝ Paste the current bookmark tree inside a directory or next to the current bookmark" data-command="import-tree">Im<u>p</u>ort</span>
        <span title="Ctrl + Y or Command + Y ➝ Copy the selected bookmarks to the clipboard&#013;Ctrl + Shift + Y or Command + Shift + Y ➝ Export selected bookmarks to a JSON file" data-command="export-tree">Export<span class="ha"> (Y)</span></span>
        <u title="New" class="ja">New</u>
        <span title="Ctrl + B or Command + B ➝ Create a new bookmark" data-command="new-file"><u>B</u>ookmark</span>
        <span title="Ctrl + D or Command + D ➝ Create a new empty directory" data-command="new-directory"><u>D</u>irectory</span>
        <u title="Focus" class="ja">Focus</u>
        <span title="Ctrl + ArrowLeft or Command + ArrowLeft ➝ Move selected bookmarks to the left pane" data-command="move-left">Left<span class="ha"> (&#x2190;)</span></span>
        <span title="Ctrl + ArrowRight or Command + ArrowRight ➝ Move the selected bookmarks to the right pane" data-command="move-right">Right<span class="ha"> (&#x2192;)</span></span>
        <u title="Move" class="hi">Move</u>
        <span class="hi" title="Alt + Home ➝ Move to the top of the list" data-command="move-top">Top<span class="ha"></span></span>
        <span class="hi" title="Alt + ArrowUp ➝ Move one-level up" data-command="move-up">Up<span class="ha"></span></span>
        <span class="hi" title="Alt + ArrowDown ➝ Move one-level down" data-command="move-down">Down<span class="ha"></span></span>
        <span class="hi" title="Alt + End ➝ Move to the end of the list" data-command="move-bottom">Last<span class="ha"></span></span>
        <u title="Tools" class="ja">Tools</u>
        <span title="Ctrl + S or Command + S ➝ Open commands box" data-command="commands">CMD<span class="ha"> (<u>S</u>)</span></span>
        <span title="Ctrl + O or Command + O ➝ Reset both panes&#013;Ctrl + Shift + O or Command + Shift + O ➝ Reset only the active pane" data-command="root">R<u>o</u>ot</span>
        <span class="view-2" title="Ctrl + M or Command + M ➝ Mirror the inactive pane&#013;Ctrl + Shift + M or Command + Shift + M ➝ Navigate inactive pane into the first selected Dir&#013;Alt + M ➝ Open path folder in opposite pane&#013;Alt + Shift + M ➝ Open path folder" data-command="mirror"><u>M</u>irror</span>
        <span class="view-2" title="Ctrl + Shift + S or Command + Shift + S ➝ Sync bookmarks (not directories) of two panes" data-command="sync"><u>S</u>ync</span>
        <span title="Ctrl + Delete, Ctrl + Backspace, Command + Delete, or Command + Backspace ➝ Delete the active bookmarks and directories" data-command="trash">Delete</span>
        <span title="Ctrl + J or Command + J ➝ Sort A-Z&#013;Ctrl + Shift + J or Command + Shift + J ➝ Sort Z-A&#013;Alt + J ➝ Custom Sorting (A-Z)&#013;Alt + Shift + J ➝ Custom Sorting (Z-A)" data-command="sort">Sort<span class="ha"> (<u>J</u>)</span></span>
        <span title="Ctrl + H or Command + H ➝ View shortcuts" data-command="shortcuts" class="ha"><u>H</u>elp</span>
      </div>
      <input type=search id="search" placeholder="Search active pane" title="Ctrl + F or Command + F ➝ Search inside the active directory&#013;Ctrl + Shift + F or Command + Shift + F ➝ Search for duplicates inside the active directory&#013;Escape ➝ Focus active pane">
    `;

    this.shadow.getElementById('search').addEventListener('keyup', e => {
      if (e.key === 'Enter') {
        this.emit('tools-view:command', {
          command: 'search',
          query: e.target.value
        });
      }
    });
    this.shadow.getElementById('search').addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this.emit('tools-view:blur');
      }
    });
    this.shadow.addEventListener('click', e => {
      const command = e.target?.dataset?.command;
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
      // allow the search box to get focused
      else if (e.target.id === 'search') {
        e.stopPropagation();
      }
    });
  }
  emit(name, detail = {}) {
    return this.dispatchEvent(new CustomEvent(name, {
      bubbles: true,
      detail
    }));
  }
  validate(name) {
    if (name === 'ignore') {
      return -1;
    }
    if (name === 'open-folder') {
      name = 'mirror';
    }
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
    if (e.key === 'Home' && e.altKey) {
      command = 'move-top';
    }
    else if (e.key === 'End' && e.altKey) {
      command = 'move-bottom';
    }
    else if (e.key === 'ArrowUp' && e.altKey) {
      command = 'move-up';
    }
    else if (e.key === 'ArrowDown' && e.altKey) {
      command = 'move-down';
    }
    else if (e.key === 'Home') {
      command = 'first';
    }
    else if (e.key === 'End') {
      command = 'last';
    }
    else if (e.code === 'KeyC' && meta) {
      command = 'copy-link';
    }
    else if (e.code === 'KeyU' && meta) {
      command = 'duplicate';
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
    else if (e.code === 'KeyM' && e.altKey && e.shiftKey) {
      command = 'open-folder';
    }
    else if (e.code === 'KeyM' && e.altKey) {
      command = 'mirror';
    }
    else if (e.code === 'KeyM' && meta) {
      command = 'mirror';
    }
    else if (e.code === 'KeyH' && meta) {
      command = 'shortcuts';
    }
    else if (e.code === 'KeyF' && meta) {
      command = 'ignore';
      const o = this.shadow.getElementById('search');

      if (e.shiftKey) {
        o.value = 'duplicates';
      }
      o.focus();
    }
    else if (e.code === 'KeyJ' && (meta || e.altKey)) {
      command = 'sort';
    }
    else if (e.code === 'KeyS' && meta && e.shiftKey) {
      command = 'sync';
    }
    // command box
    if (e.code === 'KeyS' && meta && e.shiftKey === false) {
      engine.user.ask(`Enter a Command:

icon=[default|light|dark]
theme=[default|dark|light]
font-size=[number]px
font-family=[font-name]
views=[1|2]
column-widths=[name]px, [added]px, [modified]px
ask-before-delete=[true|false]
ask-before-directory-delete=[true|false]`, '', [
        'icon=default',
        'icon=light',
        'icon=dark',
        'theme=default',
        'theme=dark',
        'theme=light',
        'font-family=',
        'views=1',
        'views=2',
        'column-widths=',
        'ask-before-delete=true',
        'ask-before-delete=false',
        'ask-before-directory-delete=true',
        'ask-before-directory-delete=false'
      ]).then(command => {
        if (command.startsWith('icon=')) {
          const path = command.replace('icon=', '') || 'default';
          engine.storage.set({
            'custom-icon': path === 'default' ? '' : path
          });
        }
        else if (command.startsWith('theme=')) {
          const path = command.replace('theme=', '') || 'default';
          engine.storage.set({
            'theme': path === 'default' ? '' : path
          });
        }
        else if (command.startsWith('font-size=')) {
          const px = /font-size=(\d+)px/.exec(command);
          engine.storage.set({
            'font-size': px && px.length ? px[1] : ''
          });
        }
        else if (command.startsWith('font-family=')) {
          engine.storage.set({
            'font-family': command.replace('font-family=', '')
          });
        }
        else if (command.startsWith('ask-before-delete=')) {
          engine.storage.set({
            'ask-before-delete': command.replace('ask-before-delete=', '') === 'false' ? false : true
          });
        }
        else if (command.startsWith('ask-before-directory-delete=')) {
          engine.storage.set({
            'ask-before-directory-delete': command.replace('ask-before-directory-delete=', '') === 'false' ? false : true
          });
        }
        else if (command.startsWith('views=')) {
          const views = Math.min(2, Math.max(1, Number(command.replace('views=', ''))));
          engine.storage.set({
            views
          });
        }
        else if (command.startsWith('column-widths=')) {
          const widths = [...command.replace('column-widths=', '').split(/\s*,\s*/).map(s => parseInt(s))].slice(0, 3);
          widths[0] = widths[0] ? Math.min(1000, Math.max(32, widths[0])) : 200;
          widths[1] = widths[1] ? Math.min(1000, Math.max(32, widths[1])) : 90;
          widths[2] = widths[2] ? Math.min(1000, Math.max(32, widths[2])) : 90;

          engine.storage.set({
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
      if (code === 0 || code === 1 || code === -1) {
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
