// --- CONFIGURAÇÃO ---
const SUPABASE_URL = 'https://yyblrudvyhbvcssqtsja.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5YmxydWR2eWhidmNzc3F0c2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODM5NDAsImV4cCI6MjA4MTU1OTk0MH0.dMuERb-F1G9Jd4ef0Xp5AixhNb6__uFoiYM9fJALmA8'; 

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Data no cabeçalho
document.getElementById('dataHoje').innerText =
  new Date().toLocaleDateString('pt-BR');

async function carregarCheckinsDoDia() {
    const corpoTabela = document.getElementById('corpoTabela');
    const totalRodape = document.getElementById('totalRodape');

    corpoTabela.innerHTML =
      '<tr><td colspan="3">Carregando...</td></tr>';

    const hoje = new Date().toISOString().split('T')[0];

    const { data, error } = await supabaseClient
        .from('checkins')
        .select('*')
        .gte('created_at', `${hoje}T00:00:00`)
        .lte('created_at', `${hoje}T23:59:59`)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
        alert('Erro ao carregar dados');
        return;
    }

    corpoTabela.innerHTML = '';

    if (!data || data.length === 0) {
        corpoTabela.innerHTML =
          '<tr><td colspan="3" style="text-align:center">Nenhum check-in hoje.</td></tr>';
        totalRodape.innerText = '';
        return;
    }

    data.forEach(item => {
        const tr = document.createElement('tr');
        const hora = new Date(item.created_at)
          .toLocaleTimeString('pt-BR');

        const linkMapa = item.coordenadas
          ? `<a href="https://maps.google.com/?q=${item.coordenadas}" target="_blank">Ver Mapa</a>`
          : 'Sem GPS';

        tr.innerHTML = `
          <td>${hora}</td>
          <td style="font-weight:bold">${item.nome}</td>
          <td>${linkMapa}</td>
        `;

        corpoTabela.appendChild(tr);
    });

    totalRodape.innerText =
      `Total de registros: ${data.length}`;
}

// Exportar imagem
function exportarImagem() {
    const elemento = document.getElementById("areaRelatorio");

    html2canvas(elemento).then(canvas => {
        const link = document.createElement('a');
        link.download =
          `Relatorio-Checkin-${new Date().toISOString().split('T')[0]}.jpg`;
        link.href = canvas.toDataURL("image/jpeg");
        link.click();
    });
}

// Executa ao abrir
carregarCheckinsDoDia();
