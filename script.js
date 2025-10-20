// state
const DATA_API_URL = 'https://api.disneyapi.dev/character?films='; // keep as before
const searchedFilms = new Set(); // tracks normalized film titles already searched
let isFetching = false;

// helpers
function normalize(text = '') {
  return text.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function setLoading(text) {
  const loading = document.getElementById('loading');
  if (loading) loading.textContent = text || '';
}

function removeTemporaryWarnings(container) {
  // remove any single-line aviso paragraphs previously appended
  Array.from(container.querySelectorAll('.tmp-aviso')).forEach(el => el.remove());
}

// scroll to section
function scrollToFilmSection(normalized) {
  const id = `film-${normalized}`;
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// create film section id-safe
function filmSectionIdFor(filmName) {
  return `film-${normalize(filmName).replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')}`;
}

// main function
async function buscarPersonagens(filme) {
  const results = document.getElementById('results');
  const btn = document.getElementById('searchBtn');
  const input = document.getElementById('movieInput');

  if (!filme || !filme.trim()) return;

  const normalized = normalize(filme);

  // prevent duplicate searches
  if (searchedFilms.has(normalized)) {
    // scroll to existing section instead of adding another
    scrollToFilmSection(normalized);
    return;
  }

  // prevent multiple concurrent fetches
  if (isFetching) return;

  try {
    isFetching = true;
    btn.disabled = true;
    setLoading('🔎 Buscando personagens...');

    // perform request
    const res = await fetch(`${DATA_API_URL}${encodeURIComponent(filme)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();

    setLoading('');

    // if no results
    if (!payload.data || payload.data.length === 0) {
      const aviso = document.createElement('p');
      aviso.className = 'tmp-aviso';
      aviso.textContent = `Nenhum personagem encontrado para o filme "${filme}" 😢`;
      aviso.style.marginTop = '20px';
      results.appendChild(aviso);
      // ensure user can search again
      input.focus();
      return;
    }

    // build section and guard against duplicates
    const sectionId = filmSectionIdFor(filme);
    if (document.getElementById(sectionId)) {
      // already exists (race condition fallback) — scroll to it
      scrollToFilmSection(normalized);
      return;
    }

    const section = document.createElement('div');
    section.className = 'filme-section';
    section.id = sectionId;

    const titulo = document.createElement('h2');
    titulo.textContent = `🎞️ ${filme}`;
    section.appendChild(titulo);

    const grid = document.createElement('div');
    grid.className = 'grid';

    // create cards from payload.data
    payload.data.forEach(personagem => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${personagem.imageUrl || ''}" alt="${personagem.name || ''}">
        <h3>${personagem.name || '—'}</h3>
      `;
      grid.appendChild(card);
    });

    section.appendChild(grid);
    results.appendChild(section);

    // mark this film as searched
    searchedFilms.add(normalized);

    // focus input so user can type next movie
    input.focus();
    input.select();
  } catch (err) {
    console.error('Erro ao buscar personagens:', err);
    setLoading('Erro ao carregar dados. Tente novamente.');
  } finally {
    isFetching = false;
    btn.disabled = false;
  }
}

// UI wiring
document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('searchBtn');
  const input = document.getElementById('movieInput');
  const results = document.getElementById('results');

  // click
  searchBtn.addEventListener('click', () => {
    const filme = input.value.trim();
    if (!filme) {
      alert('Por favor, digite o nome de um filme!');
      return;
    }
    // remove old temporary warnings
    removeTemporaryWarnings(results);
    buscarPersonagens(filme);
    input.value = ''; // optional: clear input after starting search
  });

  // Enter key
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchBtn.click();
    }
  });

  // OPTIONAL: if you added a "Limpar resultados" button with id="clearBtn"
  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      results.innerHTML = '';
      searchedFilms.clear();
      setLoading('');
      input.focus();
    });
  }
});
