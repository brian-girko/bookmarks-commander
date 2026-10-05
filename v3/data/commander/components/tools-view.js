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
        <span data-command="copy-title">Title<span class="ha"> (<u>X</u>)</span></span>
        <span data-command="copy-link">Link<span class="ha"> (C)</span></span>
        <span data-command="copy-id" class="hi"><u>I</u>D</span>
        <span data-command="duplicate" class="ha">D<u>u</u>p</span>
        <u title="Edit" class="ja">Edit</u>
        <span data-command="edit-title">Titl<u>e</u></span>
        <span data-command="edit-link"><u>L</u>ink</span>
        <u title="JSON" class="ja">JSON</u>
        <span data-command="import-tree">Im<u>p</u>ort</span>
        <span data-command="export-tree">Export<span class="ha"> (Y)</span></span>
        <u title="New" class="ja">New</u>
        <span data-command="new-file"><u>B</u>ookmark</span>
        <span data-command="new-directory"><u>D</u>irectory</span>
        <u title="Focus" class="ja">Focus</u>
        <span data-command="move-left">Left<span class="ha"> (&#x2190;)</span></span>
        <span data-command="move-right">Right<span class="ha"> (&#x2192;)</span></span>
        <u title="Move" class="hi">Move</u>
        <span class="hi" data-command="move-top">Top<span class="ha"></span></span>
        <span class="hi" data-command="move-up">Up<span class="ha"></span></span>
        <span class="hi" data-command="move-down">Down<span class="ha"></span></span>
        <span class="hi" data-command="move-bottom">Last<span class="ha"></span></span>
        <u title="Tools" class="ja">Tools</u>
        <span data-command="commands">CMD<span class="ha"> (<u>S</u>)</span></span>
        <span data-command="root">R<u>o</u>ot</span>
        <span class="view-2" data-command="mirror"><u>M</u>irror</span>
        <span class="view-2" data-command="sync"><u>S</u>ync</span>
        <span data-command="trash">Delete</span>
        <span data-command="sort">Sort<span class="ha"> (<u>J</u>)</span></span>
        <span data-command="shortcuts" class="ha"><u>H</u>elp</span>
      </div>
      <input type=search id="search" placeholder="Search active pane">
    `;
    this.commands = [];

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
        document.querySelector('settings-view').open();
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
    // since the command does not exist, map it to sometime close to pass validation
    if (name === 'open-in-new-tab') {
      name = 'copy-link';
    }
    else if (name === 'open-folder') {
      name = 'mirror';
    }
    else if (name === 'select-previous' || name === 'select-next') {
      return 1;
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
    const parts = [];
    if (e.altKey) {
      parts.push('Alt');
    }
    if (e.ctrlKey) {
      parts.push('Ctrl');
    }
    else if (e.metaKey) {
      parts.push('Command');
    }
    if (e.shiftKey) {
      parts.push('Shift');
    }
    parts.push(e.code);
    const cmd = parts.join(' + ');
    let command = (() => {
      for (const {name, shortcuts} of this.commands) {
        for (const o of shortcuts) {
          for (const key of o.keys) {
            if (cmd === key) {
              return o.name || name;
            }
          }
        }
      }
      return '';
    })();

    const meta = e.ctrlKey || e.metaKey;

    if (e.code === 'KeyF' && meta) {
      command = 'ignore';
      const o = this.shadow.getElementById('search');

      if (e.shiftKey) {
        o.value = 'duplicates';
      }
      o.focus();
      o.select();
    }
    // settings box
    if (e.code === 'KeyS' && meta && e.shiftKey === false) {
      document.querySelector('settings-view').open();
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
  load(es) {
    this.commands = es;

    for (const {name, shortcuts} of es) {
      const e = this.shadow.querySelector(`[data-command=${name}]`) || this.shadow.getElementById(name);
      if (e) {
        e.title = shortcuts.map(({keys, description}) => {
          return keys.join(' or ') + ' ➝ ' + description;
        }).join('\n\n');
      }
    }
  }
}
window.customElements.define('tools-view', ToolsView);
