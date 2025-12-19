// ======================================================
// 1. CONFIGURAÇÕES INICIAIS
// ======================================================
const SUPABASE_URL = 'https://yyblrudvyhbvcssqtsja.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5YmxydWR2eWhidmNzc3F0c2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODM5NDAsImV4cCI6MjA4MTU1OTk0MH0.dMuERb-F1G9Jd4ef0Xp5AixhNb6__uFoiYM9fJALmA8';

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// ======================================================
// 2. VERIFICAR USUÁRIO + PERFIL (NOME + CARGO)
// ======================================================
async function verificarUsuario() {
    const { data: sessionData, error: sessionError } =
        await supabaseClient.auth.getSession();

    if (sessionError || !sessionData.session) {
        window.location.href = "index.html";
        return;
    }

    const user = sessionData.session.user;

    const { data: perfil, error } = await supabaseClient
        .from('perfis')
        .select('nome, cargo')
        .eq('id', user.id)
        .single();

    if (error || !perfil) {
        console.error(error);
        alert("Perfil inválido. Contate o administrador.");
        await supabaseClient.auth.signOut();
        window.location.href = "index.html";
        return;
    }

    // Nome exibido
    document.getElementById('nomeFuncionario').value =
        perfil.nome || user.email;

    // Painel admin (SEGURANÇA REAL)
    if (perfil.cargo === 'admin') {
        document.getElementById('painelAdmin').style.display = 'block';
    }
}

// Executa ao carregar
verificarUsuario();

// ======================================================
// 3. MOSTRAR / ESCONDER MOTIVO (EXTERNO)
// ======================================================
function toggleMotivo() {
    const checkbox = document.getElementById('foraDaUnidade');
    const campoMotivo = document.getElementById('campoMotivo');
    const textoMotivo = document.getElementById('textoMotivo');

    if (checkbox.checked) {
        campoMotivo.style.display = 'block';
        textoMotivo.focus();
    } else {
        campoMotivo.style.display = 'none';
        textoMotivo.value = '';
    }
}

// ======================================================
// 4. FAZER CHECK-IN
// ======================================================
async function fazerCheckIn() {
    const nome = document.getElementById('nomeFuncionario').value;
    const btn = document.getElementById('btnCheckIn');
    const status = document.getElementById('status');

    const isExterno = document.getElementById('foraDaUnidade').checked;
    const motivo = document.getElementById('textoMotivo').value;

    if (!nome) {
        alert("Nome não carregado.");
        return;
    }

    if (isExterno && !motivo) {
        alert("Informe o local ou motivo do trabalho externo.");
        return;
    }

    btn.disabled = true;
    btn.innerText = "Obtendo localização...";

    const { data: sessionData } =
        await supabaseClient.auth.getSession();

    const user = sessionData.session.user;

    if (!navigator.geolocation) {
        alert("Geolocalização não suportada.");
        btn.disabled = false;
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        btn.innerText = "Registrando...";

        const dados = {
            user_id: user.id,
            nome,
            coordenadas: `${latitude}, ${longitude}`,
            motivo_externo: isExterno ? motivo : null
        };

        const { error } = await supabaseClient
            .from('checkins')
            .insert(dados);

        if (error) {
            console.error(error);
            status.innerText = "Erro ao registrar check-in.";
            status.style.color = "red";
        } else {
            status.innerText = "✅ Check-in registrado com sucesso!";
            status.style.color = "green";
            document.getElementById('foraDaUnidade').checked = false;
            toggleMotivo();
        }

        btn.disabled = false;
        btn.innerText = "Fazer Check-in";
    }, () => {
        alert("Permita o acesso à localização.");
        btn.disabled = false;
        btn.innerText = "Fazer Check-in";
    });
}

// ======================================================
// 5. ATUALIZAR NOME (SEM ALTERAR CARGO)
// ======================================================
async function atualizarNome() {
    const novoNome = prompt("Como deseja ser chamado?");
    if (!novoNome) return;

    const { data: sessionData } =
        await supabaseClient.auth.getSession();

    const user = sessionData.session.user;

    const { error } = await supabaseClient
        .from('perfis')
        .update({ nome: novoNome })
        .eq('id', user.id);

    if (error) {
        alert("Erro ao atualizar nome.");
        console.error(error);
    } else {
        document.getElementById('nomeFuncionario').value = novoNome;
        alert("Nome atualizado com sucesso!");
    }
}

// ======================================================
// 6. LOGOUT
// ======================================================
async function sair() {
    await supabaseClient.auth.signOut();
    window.location.href = "index.html";
}
