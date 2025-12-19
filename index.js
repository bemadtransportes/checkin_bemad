const SUPABASE_URL = 'https://yyblrudvyhbvcssqtsja.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_cc5_WY8jZIck_ey3fzVuYg_BYSluNjQ';
const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

async function fazerLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('senha').value;
    const btn = document.getElementById('btnEntrar');
    const msg = document.getElementById('msgErro');

    if (!email || !password) {
        msg.innerText = "Preencha tudo.";
        return;
    }

    btn.disabled = true;
    btn.innerText = "Verificando...";

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        msg.innerText = "Dados incorretos.";
        btn.disabled = false;
        btn.innerText = "Entrar";
    } else {
        // SUCESSO: Vai para a tela de check-in
        window.location.href = "checkin.html";
    }
}
