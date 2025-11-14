import './Home.css';

import './Home.css';
import { useNavigate } from 'react-router-dom';


function Home() {
      const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate('/'); // Volta para a tela de login
  };
  return (
    <div className="home-container">
      <h1>Bem-vindo ao PsicoSoft!</h1>
      <p>Esta é a tela inicial. Em breve adicionaremos conteúdo.</p>
      <button className="back-btn" onClick={handleBackToLogin}>
        Voltar para Login
      </button>
    </div>
  );
}

export default Home;