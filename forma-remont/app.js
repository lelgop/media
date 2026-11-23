const get = id => document.getElementById(id);
const rates = {
  cosmetic: { label: 'Косметический', work: [6500, 9500], materials: [1400, 2200] },
  capital: { label: 'Капитальный', work: [12500, 17500], materials: [3200, 5000] },
  design: { label: 'По дизайн-проекту', work: [18500, 27000], materials: [4400, 7000] }
};
const area = get('area');
const range = get('area-range');
const kind = get('kind');
const materials = get('materials');
const currency = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
const format = values => values.map(value => currency.format(value)).join(' – ');
let estimate;

function updateEstimate() {
  const rate = rates[kind.value];
  get('enquiry').disabled = !area.validity.valid;
  if (!area.validity.valid) {
    get('price').textContent = 'Уточните площадь';
    get('breakdown').textContent = 'Введите целое число от 15 до 300 м².';
    estimate = null;
    return;
  }
  const size = area.valueAsNumber;
  range.value = size;
  const unit = rate.work.map((value, index) => value + (materials.checked ? rate.materials[index] : 0));
  const total = format(unit.map(value => value * size));
  const scope = materials.checked ? 'Работы и черновые материалы' : 'Только работы';
  get('price').textContent = total;
  get('breakdown').textContent = scope + ' · ' + format(unit) + ' за м²';
  estimate = rate.label + ' ремонт · ' + size + ' м² · ' + scope + ' · ' + total;
}

get('calculator').addEventListener('submit', event => event.preventDefault());
for (const control of [area, kind, materials]) control.addEventListener('input', updateEstimate);
range.addEventListener('input', () => {
  area.value = range.value;
  updateEstimate();
});
document.querySelectorAll('[data-type]').forEach(link => link.addEventListener('click', () => {
  kind.value = link.dataset.type;
  updateEstimate();
}));
updateEstimate();

const projects = [
  {
    room: 'гостиной',
    before: './images/living-room-before.webp',
    after: './images/living-room-renovated.jpg', caption: 'Визуализация ремонта на основе исходного фото гостиной.'
  },
  {
    room: 'кухни',
    before: 'https://autocad-specialist.ru/images/uroki-blog/program-design/03-realnaya-kvartira-do-dizayn-proekta.jpg',
    after: './images/kitchen-after.jpg', caption: 'Примеры черновой и чистовой отделки на разных объектах.'
  }
];
const split = get('split');
const updateSplit = () => get('comparison').style.setProperty('--split', split.value + '%');
split.addEventListener('input', updateSplit);
const tabs = document.querySelectorAll('[data-project]');
tabs.forEach(tab => tab.addEventListener('click', () => {
  const project = projects[Number(tab.dataset.project)];
  tabs.forEach(button => button.setAttribute('aria-pressed', String(button === tab)));
  get('before').src = project.before;
  get('before').alt = 'Пример чернового помещения под отделку';
  get('after').src = project.after;
  get('after').alt = 'Пример отделки ' + project.room;
  get('project-caption').textContent = project.caption;
  split.value = 50;
  updateSplit();
}));

const dialog = get('lead');
get('enquiry').addEventListener('click', () => {
  if (!estimate) return;
  get('lead-summary').textContent = estimate;
  get('lead-status').textContent = '';
  dialog.showModal();
});
dialog.querySelector('.close').addEventListener('click', () => dialog.close());
const phone = get('phone');
const name = get('name');
for (const field of [name, phone]) field.addEventListener('input', () => field.setCustomValidity(''));
get('lead-form').addEventListener('submit', event => {
  event.preventDefault();
  const cleanName = name.value.trim();
  name.setCustomValidity(cleanName ? '' : 'Введите имя.');
  phone.setCustomValidity(/^[+\d\s().-]+$/.test(phone.value) && phone.value.replace(/\D/g, '').length >= 7 ? '' : 'Укажите номер телефона.');
  if (!event.currentTarget.reportValidity()) return;
  const content = ['ФОРМА · Заявка на замер (превью)', estimate, 'Имя: ' + cleanName, 'Телефон: ' + phone.value.trim()].join('\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF', content], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'forma-zayavka.txt';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  get('lead-status').textContent = 'Заявка подготовлена к скачиванию.';
});
