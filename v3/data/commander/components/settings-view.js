/* global engine */
class SettingsView extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({
      mode: 'open'
    });
    this.shadow = shadow;

    // selectable font stacks; value '' means the app default
    this.fonts = [
      ['', 'Default'],
      ['system-ui, sans-serif', 'System UI'],
      ['Helvetica, Arial, sans-serif', 'Helvetica'],
      ['"Times New Roman", Times, serif', 'Serif'],
      ['Georgia, serif', 'Georgia'],
      ['Verdana, Geneva, sans-serif', 'Verdana'],
      ['"Courier New", Courier, monospace', 'Monospace']
    ];
    // visible (and ordered) columns; 'name' is always present
    this.order = ['icon', 'name', 'path', 'link', 'added', 'modified'];
    this.defaults = {
      'theme': '',
      'custom-icon': '',
      'font-size': 13,
      'font-family': '',
      'views': 2,
      'columns': this.order.slice(),
      'widths': {
        name: 100,
        added: 90,
        modified: 90
      },
      'ask-before-delete': true,
      'ask-before-directory-delete': true,
      'show-count': false,
      'context-menu-open': false,
      'context-menu-copy': true,
      'context-menu-move': true,
      'context-menu-import': true,
      'commands-mapping': 'default'
    };

    const fontOptions = this.fonts.map(([, label]) => `<option>${label}</option>`).join('');
    shadow.innerHTML = `
      <style>
        :host {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        dialog {
          padding: 2px;
        }
        form {
          padding: 10px;
          color: var(--color, #3e3e3e);
          background-color: var(--bg-active, #fff);
          display: flex;
          flex-direction: column;
          width: 420px;
          max-width: calc(100vw - 60px);
          max-height: calc(100vh - 60px);
          overflow: auto;
        }
        fieldset {
          border: solid 1px var(--border, #ccc);
          margin: 0 0 10px;
          padding: 5px 10px;
        }
        label {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 3px 0;
        }
        label > span:first-child {
          flex: 1;
        }
        output {
          min-width: 45px;
          text-align: right;
        }
        input[type=range] {
          flex: 1;
          min-width: 60px;
        }
        select {
          color: var(--color, #3e3e3e);
          background-color: var(--bg-light, #eee);
          border: none;
          padding: 3px;
          outline: none;
          max-width: 170px;
        }
        input[type=button],
        input[type=submit] {
          cursor: pointer;
          color: var(--color, #3e3e3e);
          background-color: var(--bg-light, #dadada);
          border: none;
          padding: 5px;
        }
        input[type=button]:hover,
        input[type=submit]:hover {
          background-color: var(--bg-command, rgba(0, 0, 0, 0.15));
        }
        #actions {
          display: flex;
          justify-content: flex-end;
          gap: 5px;
        }
      </style>
      <dialog>
        <form>
          <fieldset>
            <legend>Appearance</legend>
            <label><span>Theme</span>
              <select id="theme" name="theme">
                <option value="">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
            <label><span>Toolbar Icon</span>
              <select id="icon" name="custom-icon">
                <option value="">Default</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
            <label><span>Font Size</span>
              <input type="range" id="font-size" name="font-size" min="10" max="20" step="1">
              <output id="font-size-out"></output>
            </label>
            <label><span>Font Family</span>
              <select id="font-family" name="font-family">${fontOptions}</select>
            </label>
          </fieldset>
          <fieldset>
            <legend>Columns</legend>
            <div>
              <label><input type="checkbox" name="column" value="icon">Icon</label>
              <label><input type="checkbox" checked disabled>Name</label>
              <label title="Visible in search results only"><input type="checkbox" name="column" value="path">Path</label>
              <label><input type="checkbox" name="column" value="link">Link</label>
              <label><input type="checkbox" name="column" value="added">Date Added</label>
              <label><input type="checkbox" name="column" value="modified">Date Modified</label>
            </div>
            <label><span>Name Width</span>
              <input type="range" id="width-name" name="width-name" min="32" max="1000" step="1">
              <output id="width-name-out"></output>
            </label>
            <label><span>Added Width</span>
              <input type="range" id="width-added" name="width-added" min="32" max="1000" step="1">
              <output id="width-added-out"></output>
            </label>
            <label><span>Modified Width</span>
              <input type="range" id="width-modified" name="width-modified" min="32" max="1000" step="1">
              <output id="width-modified-out"></output>
            </label>
          </fieldset>
          <fieldset>
            <legend>Layout</legend>
            <label><span>Panes</span>
              <select id="views" name="views">
                <option value="1">One Pane</option>
                <option value="2">Two Panes</option>
              </select>
            </label>
          </fieldset>
          <fieldset>
            <legend>Context Menu</legend>
            <label><input type="checkbox" id="context-menu-open" name="context-menu-open">Group Open commands in a submenu</label>
            <label><input type="checkbox" id="context-menu-copy" name="context-menu-copy">Group Copy commands in a submenu</label>
            <label><input type="checkbox" id="context-menu-move" name="context-menu-move">Group Move commands in a submenu</label>
            <label><input type="checkbox" id="context-menu-import" name="context-menu-import">Group Import/Export commands in a submenu</label>
          </fieldset>
          <fieldset>
            <legend>Behavior</legend>
            <label><input type="checkbox" id="show-count" name="show-count">Show bookmark count on folder icons</label>
            <label><input type="checkbox" id="ask-before-delete" name="ask-before-delete">Ask before deleting bookmarks</label>
            <label><input type="checkbox" id="ask-before-directory-delete" name="ask-before-directory-delete">Ask before deleting non-empty directories</label>
            <label><span>Shortcut Mapping</span>
              <select id="commands-mapping" name="commands-mapping">
                <option value="default">default</option>
                <option value="vim">vim (not ready)</option>
              </select>
            </label>
          </fieldset>
          <div id="actions">
            <input type="button" name="reset" value="Reset">
            <input type="button" name="close" value="Close">
          </div>
        </form>
      </dialog>
    `;
  }
  async open() {
    const dialog = this.shadow.querySelector('dialog');
    if (dialog.open) {
      return;
    }
    dialog.onclose = () => {
      this.dispatchEvent(new CustomEvent('settings-view:close', {
        bubbles: true
      }));
    };
    await this.load();
    dialog.showModal();
  }
  async load() {
    const prefs = await engine.storage.get(this.defaults);
    // 'default' (legacy stored value) and '' both mean system theme
    this.shadow.getElementById('theme').value = prefs.theme === 'default' ? '' : prefs.theme;
    this.shadow.getElementById('icon').value = prefs['custom-icon'];
    this.shadow.getElementById('font-size').value = prefs['font-size'];
    this.shadow.getElementById('font-size-out').textContent = prefs['font-size'] + 'px';
    // unknown stored font stack falls back to the default option
    const index = this.fonts.findIndex(([value]) => value === prefs['font-family']);
    this.shadow.getElementById('font-family').selectedIndex = index === -1 ? 0 : index;
    this.shadow.getElementById('views').value = String(prefs.views);
    for (const input of this.shadow.querySelectorAll('input[name=column]')) {
      input.checked = prefs.columns.indexOf(input.value) !== -1;
    }
    for (const key of ['name', 'added', 'modified']) {
      const input = this.shadow.getElementById('width-' + key);
      input.value = prefs.widths[key];
      this.shadow.getElementById('width-' + key + '-out').textContent = prefs.widths[key] + 'px';
    }
    this.shadow.getElementById('show-count').checked = prefs['show-count'];
    this.shadow.getElementById('ask-before-delete').checked = prefs['ask-before-delete'];
    this.shadow.getElementById('ask-before-directory-delete').checked = prefs['ask-before-directory-delete'];
    for (const key of ['context-menu-open', 'context-menu-copy', 'context-menu-move', 'context-menu-import']) {
      this.shadow.getElementById(key).checked = prefs[key];
    }
    this.shadow.getElementById('commands-mapping').value = prefs['commands-mapping'];
  }
  apply(e) {
    const target = e.target;
    if (target.name === 'column') {
      const columns = this.order.filter(id => {
        if (id === 'name') {
          return true;
        }
        const input = this.shadow.querySelector(`input[name=column][value="${id}"]`);
        return input.checked;
      });
      engine.storage.set({
        columns
      });
    }
    else if (target.name && target.name.startsWith('width-')) {
      engine.storage.set({
        widths: {
          name: Number(this.shadow.getElementById('width-name').value),
          added: Number(this.shadow.getElementById('width-added').value),
          modified: Number(this.shadow.getElementById('width-modified').value)
        }
      });
    }
    else {
      switch (target.name) {
        case 'theme':
          engine.storage.set({
            theme: target.value
          });
          break;
        case 'custom-icon':
          engine.storage.set({
            'custom-icon': target.value
          });
          break;
        case 'font-size':
          engine.storage.set({
            'font-size': Number(target.value)
          });
          break;
        case 'font-family':
          engine.storage.set({
            'font-family': this.fonts[target.selectedIndex][0]
          });
          break;
        case 'views':
          engine.storage.set({
            views: Number(target.value)
          });
          break;
        case 'show-count':
          engine.storage.set({
            'show-count': target.checked
          });
          break;
        case 'ask-before-delete':
          engine.storage.set({
            'ask-before-delete': target.checked
          });
          break;
        case 'ask-before-directory-delete':
          engine.storage.set({
            'ask-before-directory-delete': target.checked
          });
          break;
        case 'context-menu-open':
        case 'context-menu-copy':
        case 'context-menu-move':
        case 'context-menu-import':
          engine.storage.set({
            [target.name]: target.checked
          });
          break;
        case 'commands-mapping':
          engine.storage.set({
            'commands-mapping': target.value
          }).then(() => location.reload());
          break;
      }
    }
  }
  connectedCallback() {
    const form = this.shadow.querySelector('form');
    form.addEventListener('input', e => {
      if (e.target.type === 'range') {
        e.target.nextElementSibling.textContent = e.target.value + 'px';
      }
      this.apply(e);
    });
    form.addEventListener('submit', e => e.preventDefault());
    this.shadow.querySelector('input[name=reset]').addEventListener('click', async () => {
      await engine.storage.set(JSON.parse(JSON.stringify(this.defaults)));
      location.reload();
    });
    this.shadow.querySelector('input[name=close]').addEventListener('click', () => {
      this.shadow.querySelector('dialog').close();
    });
    // do not let global key handlers (Tab view toggle, Ctrl + S, ...) fire inside the dialog
    this.addEventListener('keypress', e => e.stopPropagation());
    this.addEventListener('keyup', e => e.stopPropagation());
    this.addEventListener('keydown', e => e.stopPropagation());
  }
}
window.customElements.define('settings-view', SettingsView);
