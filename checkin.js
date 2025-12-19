// --- 1. CONFIGURAÇÕES INICIAIS ---
// Substitua pelos seus dados do Supabase
const SUPABASE_URL = 'https://yyblrudvyhbvcssqtsja.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5YmxydWR2eWhidmNzc3F0c2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODM5NDAsImV4cCI6MjA4MTU1OTk0MH0.dMuERb-F1G9Jd4ef0Xp5AixhNb6__uFoiYM9fJALmA8';

// Coloque aqui o SEU email de administrador para ver o botão secreto
const EMAIL_CHEFE = 'seu_email_admin@exemplo.com';

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// --- 2. VERIFICAÇÃO DE SEGURANÇA E CARREGAMENTO DE PERFIL ---
async function verificarUsuario() {
    // Verifica se tem alguém logado
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // Se não tiver logado, chuta para a tela de login
        window.location.href = "index.html";
        return;
    }

    // --- Busca o nome na tabela 'perfis' ---
    let nomeExibicao = user.email; // Começa com o email como padrão

    const { data: perfil, error } = await supabase
        .from('perfis')
        .select('nome')
        .eq('id', user.id)
        .single();

    if (perfil && perfil.nome) {
        nomeExibicao = perfil.nome;
    }

    // Preenche o campo na tela
    document.getElementById('nomeFuncionario').value = nomeExibicao;

    // --- Verifica se é o Chefe ---
    if (user.email === EMAIL_CHEFE) {
        document.getElementById('painelAdmin').style.display = 'block';
    }
}

// Executa assim que a página abre
verificarUsuario();

// --- 3. FUNÇÃO AUXILIAR: MOSTRAR/ESCONDER CAMPO MOTIVO ---
function toggleMotivo() {
    const checkbox = document.getElementById('foraDaUnidade');
    const divMotivo = document.getElementById('campoMotivo');
    
    if (checkbox.checked) {
        divMotivo.style.display = 'block';
        document.getElementById('textoMotivo').focus();
    } else {
        divMotivo.style.display = 'none';
        document.getElementById('textoMotivo').value = ''; // Limpa
    }
}

// --- 4. FUNÇÃO PRINCIPAL: FAZER CHECK-IN ---
async function fazerCheckIn() {
    const nome = document.getElementById('nomeFuncionario').value;
    const btn = document.getElementById('btnCheckIn');
    const status = document.getElementById('status');
    
    // Elementos de "Fora da Unidade"
    const isExterno = document.getElementById('foraDaUnidade').checked;
    const motivo = document.getElementById('textoMotivo').value;

    if (!nome) { 
        alert("Erro: Nome não carregado."); 
        return; 
    }

    // Validação: Se marcou externo, TEM que dizer o motivo
    if (isExterno && !motivo) {
        alert("Por favor, informe o motivo ou local do trabalho externo.");
        document.getElementById('textoMotivo').focus();
        return;
    }

    // Bloqueia botão para evitar duplo clique
    btn.disabled = true;
    btn.innerText = "Obtendo Localização...";

    // Verifica suporte a GPS
    if (!navigator.geolocation) {
        alert("Erro: Seu navegador não suporta geolocalização.");
        btn.disabled = false;
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        btn.innerText = "Registrando...";
        
        // Prepara os dados
        const dadosParaSalvar = { 
            nome: nome, 
            coordenadas: `${latitude}, ${longitude}`,
            motivo_externo: isExterno ? motivo : null 
        };

        // Envia para o Supabase
        const { error } = await supabase
            .from('checkins')
            .insert(dadosParaSalvar);

        if (error) {
            console.error(error);
            status.innerText = "Erro ao registrar no sistema.";
            status.style.color = "red";
        } else {
            status.innerText = "✅ Ponto registrado com sucesso!";
            status.style.color = "green";
            
            // Limpar campos de exceção após sucesso
            document.getElementById('foraDaUnidade').checked = false;
            toggleMotivo(); 
        }
        
        btn.disabled = false;
        btn.innerText = "Fazer Check-in";

    }, (erro) => {
        console.error(erro);
        alert("É necessário permitir a localização para bater o ponto.");
        btn.disabled = false;
        btn.innerText = "Fazer Check-in";
    });
}

// --- 5. FUNÇÃO: ATUALIZAR NOME DO PERFIL ---
async function atualizarNome() {
    const novoNome = prompt("Como deseja ser chamado?");
    
    if (!novoNome) return;

    // Pega o ID do usuário logado
    const { data: { user } } = await supabase.auth.getUser();

    // Atualiza na tabela 'perfis'
    const { error } = await supabase
        .from('perfis')
        .update({ nome: novoNome })
        .eq('id', user.id);

    if (error) {
        alert("Erro ao atualizar nome no banco de dados.");
        console.error(error);
    } else {
        alert("Nome atualizado com sucesso!");
        document.getElementById('nomeFuncionario').value = novoNome;
    }
}

// --- 6. FUNÇÃO: LOGOUT / SAIR ---
async function sair() {
    await supabase.auth.signOut();
    window.location.href = "index.html";
}
