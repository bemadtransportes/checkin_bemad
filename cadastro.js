// --- CONFIGURAÇÃO ---
const SUPABASE_URL = 'https://yyblrudvyhbvcssqtsja.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5YmxydWR2eWhidmNzc3F0c2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODM5NDAsImV4cCI6MjA4MTU1OTk0MH0.dMuERb-F1G9Jd4ef0Xp5AixhNb6__uFoiYM9fJALmA8'; // anon public

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

async function fazerCadastro() {
    const nome = document.getElementById('novoNome').value;
    const email = document.getElementById('novoEmail').value;
    const senha = document.getElementById('novaSenha').value;
    const btn = document.getElementById('btnCadastrar');
    const msg = document.getElementById('msgErro');

    if (!nome || !email || !senha) {
        msg.innerText = "Preencha todos os campos.";
        return;
    }

    if (senha.length < 6) {
        msg.innerText = "A senha deve ter pelo menos 6 caracteres.";
        return;
    }

    btn.disabled = true;
    btn.innerText = "Criando conta...";
    msg.innerText = "";

    // 1️⃣ CRIA USUÁRIO
    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password: senha,
    });

    console.log('signup:', data, error);

    if (error) {
        msg.innerText = error.message;
        btn.disabled = false;
        btn.innerText = "Criar Conta";
        return;
    }

    // 2️⃣ ATUALIZA PERFIL
    if (data.user) {
        const { error: errorUpdate } = await supabaseClient
            .from('perfis')
            .update({ nome })
            .eq('id', data.user.id);

        if (errorUpdate) {
            console.error(errorUpdate);
            alert("Conta criada, mas erro ao salvar nome.");
        }

        alert("Conta criada com sucesso!");
        window.location.href = "index.html";
    }
}
