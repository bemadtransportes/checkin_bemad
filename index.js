const SUPABASE_URL = 'https://yyblrudvyhbvcssqtsja.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5YmxydWR2eWhidmNzc3F0c2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODM5NDAsImV4cCI6MjA4MTU1OTk0MH0.dMuERb-F1G9Jd4ef0Xp5AixhNb6__uFoiYM9fJALmA8'; 
const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

async function fazerLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('senha').value;
    const btn = document.getElementById('btnEntrar');
    const msg = document.getElementById('msgErro');

    msg.innerText = "";

    if (!email || !password) {
        msg.innerText = "Informe email e senha.";
        return;
    }

    btn.disabled = true;
    btn.innerText = "Verificando...";

    // 1️⃣ Tenta login
    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

    // 2️⃣ Erro explícito
    if (error) {
        msg.innerText = "Email ou senha inválidos.";
        btn.disabled = false;
        btn.innerText = "Entrar";
        return;
    }

    // 3️⃣ Validação EXTRA (importante)
    if (!data || !data.user) {
        msg.innerText = "Conta não encontrada. Cadastre-se primeiro.";
        await supabaseClient.auth.signOut();
        btn.disabled = false;
        btn.innerText = "Entrar";
        return;
    }

    // 4️⃣ Confirma sessão válida
    const { data: sessionData } =
        await supabaseClient.auth.getSession();

    if (!sessionData.session) {
        msg.innerText = "Sessão inválida. Tente novamente.";
        btn.disabled = false;
        btn.innerText = "Entrar";
        return;
    }

    // ✅ LOGIN REALMENTE VÁLIDO
    window.location.href = "checkin.html";
}
