const SUPABASE_URL = 'https://yyblrudvyhbvcssqtsja.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5YmxydWR2eWhidmNzc3F0c2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODM5NDAsImV4cCI6MjA4MTU1OTk0MH0.dMuERb-F1G9Jd4ef0Xp5AixhNb6__uFoiYM9fJALmA8'; 
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

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        msg.innerText = "Dados incorretos.";
        btn.disabled = false;
        btn.innerText = "Entrar";
    } else {
        window.location.href = "checkin.html";
    }
}
