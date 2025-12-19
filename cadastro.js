// --- CONFIGURAÇÃO ---
const SUPABASE_URL = 'SUA_URL_DO_SUPABASE_AQUI'; 
const SUPABASE_KEY = 'SUA_KEY_ANON_PUBLIC_AQUI';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function fazerCadastro() {
    const nome = document.getElementById('novoNome').value;
    const email = document.getElementById('novoEmail').value;
    const senha = document.getElementById('novaSenha').value;
    const btn = document.getElementById('btnCadastrar');
    const msg = document.getElementById('msgErro');

    // Validação simples
    if (!nome || !email || !senha) {
        msg.innerText = "Preencha todos os campos.";
        return;
    }
    if (senha.length < 6) {
        msg.innerText = "A senha deve ter pelo menos 6 dígitos.";
        return;
    }

    btn.disabled = true;
    btn.innerText = "Criando conta...";
    msg.innerText = "";

    // 1. Cria o usuário no Auth (Login)
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: senha
    });

    if (error) {
        console.error(error);
        msg.innerText = "Erro: " + error.message;
        btn.disabled = false;
        btn.innerText = "Criar Conta";
        return;
    }

    // 2. Atualiza o nome na tabela 'perfis'
    // O gatilho automático que criamos já criou a linha, agora vamos só atualizar o nome
    if (data.user) {
        const { errorUpdate } = await supabase
            .from('perfis')
            .update({ nome: nome })
            .eq('id', data.user.id);

        if (errorUpdate) {
            console.error(errorUpdate);
            // Não impede o cadastro, mas avisa
            alert("Conta criada, mas houve erro ao salvar o nome.");
        }

        alert("Conta criada com sucesso! Faça login.");
        window.location.href = "index.html"; // Manda de volta pro login
    }
}