// --- CONFIGURAÇÃO ---
const SUPABASE_URL = 'https://yyblrudvyhbvcssqtsja.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5YmxydWR2eWhidmNzc3F0c2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODM5NDAsImV4cCI6MjA4MTU1OTk0MH0.dMuERb-F1G9Jd4ef0Xp5AixhNb6__uFoiYM9fJALmA8'; 

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
