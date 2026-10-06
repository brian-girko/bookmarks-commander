/* global engine */
class SortView extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({
      mode: 'open'
    });
    this.shadow = shadow;

    // persisted sort configuration; 'sort-rules' is an ordered list of keys
    this.defaults = {
      'sort-rules': ['name'],
      'sort-direction': 'asc',
      'sort-dirs-top': true,
      'sort-recursive': false
    };
    // keys a pane can be sorted by; the chain is Primary, then Secondary, ...
    this.keys = [
      ['domain', 'Domain'],
      ['link', 'Link'],
      ['name', 'Name'],
      ['date', 'Date']
    ];
    // the selected chain; '' means not configured; kept outside of the selects
    // so that rebuilding the options cannot lose the state
    this.rules = ['', '', ''];

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
        label[hidden] {
          display: none;
        }
        label > span:first-child {
          flex: 1;
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
        input[type=submit]:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
            <legend>Sort By</legend>
            <label><span>Primary</span>
              <select id="primary"></select>
            </label>
            <label id="secondary-row"><span>Secondary</span>
              <select id="secondary"></select>
            </label>
            <label id="tertiary-row"><span>Tertiary</span>
              <select id="tertiary"></select>
            </label>
          </fieldset>
          <fieldset>
            <legend>Options</legend>
            <label><span>Direction</span>
              <select id="direction">
                <option value="asc">Ascending (A-Z)</option>
                <option value="desc">Descending (Z-A)</option>
              </select>
            </label>
            <label><input type="checkbox" id="dirs-top">Place directories on top</label>
            <label><input type="checkbox" id="recursive">Sort recursively (include all subdirectories)</label>
          </fieldset>
          <div id="actions">
            <input type="button" name="cancel" value="Cancel">
            <input type="submit" value="OK">
          </div>
        </form>
      </dialog>
    `;
  }
  keyOptions(selected = '', excluded = []) {
    return [
      ['', 'None'],
      ...this.keys
    ].filter(([value]) => value === selected || excluded.indexOf(value) === -1)
      .map(([value, label]) => `<option value="${value}"${value === selected ? ' selected' : ''}>${label}</option>`)
      .join('');
  }
  refresh() {
    const shadow = this.shadow;
    // a key can appear only once in the chain; a duplicate resets to None
    const clean = [];
    for (const value of this.rules) {
      clean.push(value === '' || clean.indexOf(value) !== -1 ? '' : value);
    }
    this.rules = clean;
    ['primary', 'secondary', 'tertiary'].forEach((id, i) => {
      const select = shadow.getElementById(id);
      select.innerHTML = this.keyOptions(clean[i], clean.slice(0, i));
      select.value = clean[i];
    });
    // a level shows up only when the one above it is configured
    shadow.getElementById('secondary-row').hidden = clean[0] === '';
    shadow.getElementById('tertiary-row').hidden = clean[0] === '' || clean[1] === '';
    // at least one key is required to sort
    shadow.querySelector('input[type=submit]').disabled = clean[0] === '';
  }
  async open(preset = {}) {
    const dialog = this.shadow.querySelector('dialog');
    const form = this.shadow.querySelector('form');
    if (dialog.open) {
      return null;
    }
    const prefs = await engine.storage.get(this.defaults);
    // pad to three levels; missing or unknown levels mean "not configured"
    const keys = this.keys.map(([value]) => value);
    this.rules = (prefs['sort-rules'] || [])
      .map(value => keys.indexOf(value) === -1 ? '' : value)
      .concat(['', '']).slice(0, 3);
    // an explicit direction comes from the key press (Alt + J or Alt + Shift + J)
    this.shadow.getElementById('direction').value = preset.direction || prefs['sort-direction'];
    this.shadow.getElementById('dirs-top').checked = prefs['sort-dirs-top'];
    this.shadow.getElementById('recursive').checked = prefs['sort-recursive'];
    this.refresh();

    return new Promise(resolve => {
      let done = false;
      form.onsubmit = async e => {
        e.preventDefault();
        // keys count in order; the first not-configured level ends the chain
        const rules = [];
        for (const rule of this.rules) {
          if (rule === '') {
            break;
          }
          rules.push(rule);
        }
        const config = {
          rules,
          direction: this.shadow.getElementById('direction').value,
          dirsTop: this.shadow.getElementById('dirs-top').checked,
          recursive: this.shadow.getElementById('recursive').checked
        };
        await engine.storage.set({
          'sort-rules': config.rules,
          'sort-direction': config.direction,
          'sort-dirs-top': config.dirsTop,
          'sort-recursive': config.recursive
        });
        done = true;
        dialog.close();
        resolve(config);
      };
      dialog.onclose = () => {
        this.dispatchEvent(new CustomEvent('sort-view:close', {
          bubbles: true
        }));
        if (done === false) {
          resolve(null);
        }
      };
      form.querySelector('input[name=cancel]').onclick = () => dialog.close();
      dialog.showModal();
    });
  }
  connectedCallback() {
    ['primary', 'secondary', 'tertiary'].forEach((id, i) => {
      this.shadow.getElementById(id).addEventListener('change', e => {
        this.rules[i] = e.target.value;
        this.refresh();
      });
    });
    // do not let global key handlers (Tab view toggle, Ctrl + S, ...) fire inside the dialog
    this.addEventListener('keypress', e => e.stopPropagation());
    this.addEventListener('keyup', e => e.stopPropagation());
    this.addEventListener('keydown', e => e.stopPropagation());
  }
}
window.customElements.define('sort-view', SortView);
