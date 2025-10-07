async function buscarPersonagens() {
    const filme = document.getElementById('filmeInput').value.trim().toLowerCase();
    const container = document.getElementById('charactersList');
    const loading = document.getElementById('loading');
    
    container.innerHTML = '';
    loading.textContent = '';
  
    if (!filme) {
      container.innerHTML = '<p>Por favor, digite o nome de um filme.</p>';
      return;
    }
  
    loading.textContent = '🔎 Buscando personagens...';
  
    try {
      const resposta = await fetch('personagens.json');
      if (!resposta.ok) throw new Error('Erro ao carregar o JSON');
      
      const dados = await resposta.json();
  
      const filtrados = dados.filter(p =>
        p.films.some(f => f.toLowerCase().includes(filme))
      );
  
      loading.textContent = '';
  
      if (filtrados.length === 0) {
        container.innerHTML = '<p>Nenhum personagem encontrado para esse filme.</p>';
        return;
      }
  
      filtrados.forEach(p => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <img src="${p.imageUrl}" alt="${p.name}">
          <h3>${p.name}</h3>
        `;
        container.appendChild(card);
      });
  
    } catch (erro) {
      console.error(erro);
      loading.textContent = '❌ Erro ao carregar os dados.';
    }
  }
  