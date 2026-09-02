import './form-controls.css';

const pad = value => String(value).padStart(2, '0');
const isoDate = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function enhanceSelect(select) {
  if (select.dataset.customControl) return;
  select.dataset.customControl = 'true';
  select.classList.add('native-control-hidden');

  const root = document.createElement('div');
  root.className = 'pretty-select';
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'pretty-control pretty-select__trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  const menu = document.createElement('div');
  menu.className = 'pretty-select__menu';
  menu.setAttribute('role', 'listbox');
  root.append(trigger, menu);
  select.after(root);

  const close = () => {
    root.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
  };

  const render = () => {
    const options = [...select.options];
    const selected = options.find(option => option.value === select.value) || options[0];
    trigger.textContent = selected?.textContent.trim() || 'Selecciona una opción';
    trigger.disabled = select.disabled;
    trigger.classList.toggle('is-placeholder', !select.value);
    menu.innerHTML = '';
    options.forEach(option => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'pretty-select__option';
      item.textContent = option.textContent.trim();
      item.dataset.value = option.value;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', String(option.value === select.value));
      item.disabled = option.disabled;
      item.addEventListener('click', () => {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        render();
        close();
        trigger.focus();
      });
      menu.append(item);
    });
  };

  trigger.addEventListener('click', () => {
    const open = !root.classList.contains('is-open');
    document.querySelectorAll('.pretty-select.is-open,.pretty-date.is-open').forEach(control => control.classList.remove('is-open'));
    root.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
  });
  select.addEventListener('change', render);
  new MutationObserver(render).observe(select, { childList: true, attributes: true });
  render();
}

function enhanceDate(input) {
  if (input.dataset.customControl) return;
  input.dataset.customControl = 'true';
  input.classList.add('native-control-hidden');

  const root = document.createElement('div');
  root.className = 'pretty-date';
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'pretty-control pretty-date__trigger is-placeholder';
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-expanded', 'false');
  const panel = document.createElement('div');
  panel.className = 'pretty-date__panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Seleccionar fecha');
  panel.innerHTML = `<div class="pretty-date__nav"><button type="button" data-prev aria-label="Mes anterior">←</button><strong></strong><button type="button" data-next aria-label="Mes siguiente">→</button></div><div class="pretty-date__week"><span>LU</span><span>MA</span><span>MI</span><span>JU</span><span>VI</span><span>SA</span><span>DO</span></div><div class="pretty-date__days"></div><div class="pretty-date__footer"><button type="button" data-clear>Borrar</button><button type="button" data-today>Hoy</button></div>`;
  root.append(trigger, panel);
  input.after(root);

  let view = input.value ? new Date(`${input.value}T12:00:00`) : new Date();
  const minimum = () => input.min ? new Date(`${input.min}T00:00:00`) : null;
  const close = () => {
    root.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
  };
  const updateTrigger = () => {
    if (!input.value) {
      trigger.textContent = 'dd / mm / aaaa';
      trigger.classList.add('is-placeholder');
      return;
    }
    const value = new Date(`${input.value}T12:00:00`);
    trigger.textContent = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }).format(value);
    trigger.classList.remove('is-placeholder');
  };
  const render = () => {
    panel.querySelector('strong').textContent = new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' }).format(view);
    const days = panel.querySelector('.pretty-date__days');
    days.innerHTML = '';
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const start = new Date(view.getFullYear(), view.getMonth(), 1 - offset);
    const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    const visibleCells = Math.ceil((offset + daysInMonth) / 7) * 7;
    for (let index = 0; index < visibleCells; index++) {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const value = isoDate(date);
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = date.getDate();
      button.className = 'pretty-date__day';
      button.classList.toggle('is-outside', date.getMonth() !== view.getMonth());
      button.classList.toggle('is-today', value === isoDate(new Date()));
      button.classList.toggle('is-selected', value === input.value);
      const min = minimum();
      button.disabled = Boolean(min && date < min);
      button.addEventListener('click', () => {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        updateTrigger();
        close();
        trigger.focus();
      });
      days.append(button);
    }
  };

  trigger.addEventListener('click', () => {
    const open = !root.classList.contains('is-open');
    document.querySelectorAll('.pretty-select.is-open,.pretty-date.is-open').forEach(control => control.classList.remove('is-open'));
    root.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
    if (open) render();
  });
  panel.querySelector('[data-prev]').addEventListener('click', () => { view.setMonth(view.getMonth() - 1); render(); });
  panel.querySelector('[data-next]').addEventListener('click', () => { view.setMonth(view.getMonth() + 1); render(); });
  panel.querySelector('[data-clear]').addEventListener('click', () => { input.value = ''; input.dispatchEvent(new Event('change', { bubbles: true })); updateTrigger(); close(); });
  panel.querySelector('[data-today]').addEventListener('click', () => { view = new Date(); render(); });
  input.addEventListener('change', updateTrigger);
  updateTrigger();
}

export function initCustomFormControls(scope = document) {
  scope.querySelectorAll('.contact-form select,.meeting-booking__form select').forEach(enhanceSelect);
  scope.querySelectorAll('.meeting-booking__form input[type="date"]').forEach(enhanceDate);
  document.addEventListener('pointerdown', event => {
    document.querySelectorAll('.pretty-select.is-open,.pretty-date.is-open').forEach(control => {
      if (!control.contains(event.target)) control.classList.remove('is-open');
    });
  });
}
