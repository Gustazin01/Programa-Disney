const DATA_PATH = 'personagens.json';
let data = [];

// Normaliza texto (remove acentos e coloca em minúsculo)
function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Carrega o JSON
async function loadData() {
  const response = await fetch(DATA_PATH);
  data = await response.json();
}

// Atualiza sugestões em tempo real
function updateSuggestions(query) {
  const container = document.getElementById('suggestions');
  container.innerHTML = '';

  if (query.trim().length < 2) return; // evita mostrar tudo com 1 letra

  const q = normalize(query);
  const matches = data.filter(f =>
    f.titulos.some(t => normalize(t).includes(q))
  );

  matches.slice(0, 9).forEach(film => {
    const div = document.createElement('div');
    div.classList.add('suggestion');
    div.textContent = film.titulos[0];
    div.onclick = () => {
      document.getElementById('searchInput').value = film.titulos[0];
      container.innerHTML = '';
      showFilm(film.titulos[0]);
    };
    container.appendChild(div);
  });
}

// Mostra personagens do filme
function showFilm(query) {
  const resultContainer = document.getElementById('resultContainer');
  resultContainer.innerHTML = '';
  const q = normalize(query);

  const film = data.find(f =>
    f.titulos.some(t => normalize(t) === q)
  );

  if (!film) {
    resultContainer.innerHTML = '<p>Nenhum filme encontrado 😢</p>';
    return;
  }

  if (film.personagens.length < 5) {
    resultContainer.innerHTML = `<p>O filme <strong>${film.titulos[0]}</strong> não tem nem 5 personagens cadastrados.</p>`;
    return;
  }

  const title = `<h2>${film.titulos[0]}</h2>`;
  const chars = film.personagens.map(c => `<div class="character">${c}</div>`).join('');
  resultContainer.innerHTML = title + chars;
}

// Evento de digitação
const input = document.getElementById('searchInput');
input.addEventListener('input', (e) => updateSuggestions(e.target.value));

// Evento Enter
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') showFilm(e.target.value);
});

loadData();
