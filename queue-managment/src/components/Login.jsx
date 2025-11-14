import "./Login.css";
import { FaUser, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Login() {

    const navigate = useNavigate();

const handleLogin = (e) => {
  e.preventDefault(); // Evita recarregar a página
  navigate('/home');  // Redireciona para a rota /home
};
  return (
    <div className="page-container">
      <div className="login-card">

        {/* Faixa superior */}
        <div className="card-header"></div>

        {/* Conteúdo do card */}
        <h2>Entrar no PsicoSoft</h2>
        <p>Acesse sua conta para continuar</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <FaUser className="icon" />
            <input type="email" placeholder="Endereço de e-mail" />
          </div>

          <div className="input-group">
            <FaLock className="icon" />
            <input type="password" placeholder="Senha" />
          </div>

          <div className="options">
            <label>
              <input type="checkbox" /> Lembrar-me
            </label>
            <a href="#" className="forgot">Esqueci minha senha</a>
          </div>

          <button type="submit" className="login-btn">Entrar</button>
        </form>

        {/* Botão Google */}
        <div className="social-login">
          <button className="google-btn">
            <img 
              src="https://www.svgrepo.com/show/355037/google.svg" 
              alt="Login com Google" 
            />
            <span>Entrar com Google</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default Login;
