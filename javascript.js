const API_KEY = 'GxDzkfGCFz900fvLiCUzjO4VEZhSzI0Z'; 
const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';

const grid = document.querySelector('.grid');
const spinner = document.querySelector('.spinner');
const searchInput = document.querySelector('.header_input') || document.querySelector('#search');
const FALLBACK = 'https://via.placeholder.com/400x300?text=No+Image';


const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('closeModal');
const modalTitle = document.getElementById('modal-title');
const modalImg = document.getElementById('modal-img');
const modalInfo = document.getElementById('modal-info');
const modalWhen = document.getElementById('modal-when');
const modalWhere = document.getElementById('modal-where');

function escapeHtml(s = '') {
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

function pickImage(images = []) {
  if (!images || !images.length) return null;

  for (const img of images) {
    if (img.width && img.width > 400) return img.url;
  }
  return images[0].url || null;
}

async function fetchEvents({ keyword = '', country = '', page = 0, size = 12 } = {}) {

  if (spinner) spinner.classList.add('spinner-show');

  const params = new URLSearchParams({
    apikey: API_KEY,
    size: String(size),
    page: String(page)
  });
  if (keyword) params.set('keyword', keyword);
  if (country) params.set('countryCode', country);

  const url = `${BASE_URL}?${params.toString()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {

      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    const events = data._embedded?.events || [];
    const pageInfo = data.page || null;
    return { events, pageInfo };
  } catch (err) {
    console.error('fetchEvents error', err);
    showError(`Ошибка загрузки: ${err.message}`);
    return { events: [], pageInfo: null };
  } finally {
    if (spinner) spinner.classList.remove('spinner-show');
  }
}

async function fetchInfoEvent(eventId) {
  if (spinner) spinner.classList.add('spinner-show');
  const url = `https://app.ticketmaster.com/discovery/v2/events/${encodeURIComponent(eventId)}.json?apikey=${API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('fetchInfoEvent error', err);
    showError('Не удалось загрузить детали события');
    return null;
  } finally {
    if (spinner) setTimeout(() => spinner.classList.remove('spinner-show'), 600);
  }
}

function showError(msg) {

  if (!grid) return;
  grid.innerHTML = `<div style="color:#f66;padding:20px">${escapeHtml(msg)}</div>`;
}

function mapApiEvent(apiEv) {
  return {
    id: apiEv.id,
    title: apiEv.name || 'Untitled',
    date: apiEv.dates?.start?.localDate || '',
    time: apiEv.dates?.start?.localTime || '',
    venue: apiEv._embedded?.venues?.[0]?.name || '',
    city: apiEv._embedded?.venues?.[0]?.city?.name || '',
    country: apiEv._embedded?.venues?.[0]?.country?.name || '',
    img: pickImage(apiEv.images) || null,
    info: apiEv.info || apiEv.pleaseNote || ''
  };
}

function renderCards(events) {
  if (!grid) return;
  grid.innerHTML = '';
  if (!events.length) {
    grid.innerHTML = `<p style="color:#ccc;padding:20px">Событий не найдено.</p>`;
    return;
  }

  events.forEach(ev => {
    const e = mapApiEvent(ev);
    const card = document.createElement('div');
    card.className = 'grid-card';
    card.dataset.id = e.id;
    card.innerHTML = `
      <div class="card-img-wrap">
        ${e.img ? `<img class="grid-img" src="${escapeHtml(e.img)}" alt="${escapeHtml(e.title)}">` : `<div class="grid-img placeholder"></div>`}
      </div>
      <div class="grid-event-name">${escapeHtml(e.title)}</div>
      <div class="grid-event-date">${escapeHtml(e.date)} ${escapeHtml(e.time)}</div>
      <div class="grid-event-venue"><p class="grid-event-venue-p">${escapeHtml(e.venue)}</p></div>
    `;
    card.addEventListener('click', () => onCardClick(e.id));
    grid.appendChild(card);
  });
}

async function onCardClick(eventId) {
  const data = await fetchInfoEvent(eventId);
  if (!data) return;
  const ev = mapApiEvent(data);
  openModal(ev);
}

function openModal(ev) {
  if (!modal) {
    alert(`${ev.title}\n${ev.date} ${ev.time}\n${ev.venue}`);
    return;
  }
  if (modalTitle) modalTitle.textContent = ev.title;
  if (modalImg) modalImg.src = ev.img || FALLBACK;
  if (modalInfo) modalInfo.textContent = ev.info || '';
  if (modalWhen) modalWhen.textContent = `${ev.date} ${ev.time}`;
  if (modalWhere) modalWhere.textContent = `${ev.venue} — ${ev.city || ''} ${ev.country || ''}`;
  modal.style.display = 'block';
}

function closeModal() {
  if (!modal) return;
  modal.style.display = 'none';
}

if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', e => { if (e.target === modal) closeModal(); });


async function init() {

  const { events } = await fetchEvents({ size: 20, page: 0 });
  renderCards(events);


  if (searchInput) {
    let t;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(t);
      t = setTimeout(async () => {
        const q = e.target.value.trim();
        const { events } = await fetchEvents({ keyword: q, size: 12, page: 0 });
        renderCards(events);
      }, 500);
    });
  }
}

init();
