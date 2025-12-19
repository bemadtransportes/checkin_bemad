// --- CONFIGURAÇÃO ---
const SUPABASE_URL = 'https://yyblrudvyhbvcssqtsja.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_cc5_WY8jZIck_ey3fzVuYg_BYSluNjQ';

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Formatar data para exibir no cabeçalho
document.getElementById('dataHoje').innerText = new Date().toLocaleDateString('pt-BR');

async function carregarCheckinsDoDia() {
    const corpoTabela = document.getElementById('corpoTabela');
    const totalRodape = document.getElementById('totalRodape');
    
    corpoTabela.innerHTML = '<tr><td colspan="3">Carregando...</td></tr>';

    // Pega a data de hoje no formato YYYY-MM-DD
    const hoje = new Date().toISOString().split('T')[0];

    // Consulta no Supabase: checkins criados MAIOR ou IGUAL a hoje 00:00 e MENOR que hoje 23:59
    const { data, error } = await supabase
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

    corpoTabela.innerHTML = ''; // Limpa

    if (data.length === 0) {
        corpoTabela.innerHTML = '<tr><td colspan="3" style="text-align:center">Nenhum check-in hoje.</td></tr>';
        totalRodape.innerText = '';
        return;
    }

    data.forEach(item => {
        const tr = document.createElement('tr');
        
        // Formata hora
        const hora = new Date(item.created_at).toLocaleTimeString('pt-BR');
        
        // Link do Google Maps nas coordenadas
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

    totalRodape.innerText = `Total de registros: ${data.length}`;
}

// Função para baixar como Imagem (JPG)
function exportarImagem() {
    const elemento = document.getElementById("areaRelatorio");
    
    html2canvas(elemento).then(canvas => {
        // Cria um link falso para download
        const link = document.createElement('a');
        link.download = `Relatorio-Checkin-${new Date().toISOString().split('T')[0]}.jpg`;
        link.href = canvas.toDataURL("image/jpeg");
        link.click();
    });
}

// Carrega ao abrir a página
carregarCheckinsDoDia();
