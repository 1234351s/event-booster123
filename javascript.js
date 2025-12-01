

const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('closeModal');
const grid = document.querySelector('.grid');

let currentPage = 1;
const LIMIT = 20;


function openModal(titleText) {

  const modalLeft = document.querySelector('.modal-left');
  const modalRight = document.querySelector('.modal-right');
  const modalHeader = document.getElementById('modal-header');
  const modalPoster = document.getElementById('modal-poster');

  if (modalLeft) modalLeft.style.display = 'none';
  if (modalRight) modalRight.style.display = 'none';


  if (modalHeader) modalHeader.textContent = titleText;
  if (modalPoster) modalPoster.textContent = titleText;


  let onlyTitle = document.getElementById('modal-only-title');
  if (!onlyTitle) {
    onlyTitle = document.createElement('div');
    onlyTitle.id = 'modal-only-title';
    onlyTitle.style.textAlign = 'center';
    onlyTitle.style.fontSize = '28px';
    onlyTitle.style.fontWeight = '700';
    onlyTitle.style.color = '#DC56C5';
    onlyTitle.style.padding = '40px 20px';
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) modalContent.insertBefore(onlyTitle, modalContent.firstChild.nextSibling);
  }
  onlyTitle.textContent = titleText;

  modal.style.display = 'block';
}

function closeModal() {

  const modalLeft = document.querySelector('.modal-left');
  const modalRight = document.querySelector('.modal-right');
  if (modalLeft) modalLeft.style.display = '';
  if (modalRight) modalRight.style.display = '';

  modal.style.display = 'none';
}

closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', e => { if (e.target === modal) closeModal(); });


async function loadPage(page = 1) {
 
  grid.innerHTML = '';
  const count = 12; 
  for (let i = 0; i < count; i++) {
    const card = document.createElement('div');
    card.className = 'grid-card';
    card.innerHTML = `
      <div class="grid-text-title">Eurovision 2021 finals!</div>
      <div class="grid-text-date">2021-05-13</div>
      <div class="grid-event-venue">
        <p class="grid-event-venue-p">Palace of Ukraine</p>
      </div>
    `;
    card.addEventListener('click', () => openModal('Eurovision 2021 finals!'));
    grid.appendChild(card);
  }
}


loadPage(currentPage);
