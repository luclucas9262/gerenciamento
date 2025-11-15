import "./Home.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;
const APP_NAME = import.meta.env.VITE_APP_NAME || "PsicoSoft MGF";

function Home() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setMe(data))
      .catch(() => {});
  }, []);

  const goToFilas = () => navigate("/filas");
  const goToHome = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const goToAnchor = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleBackToLogin = () => navigate("/");

  const toggleTheme = () => {
    const html = document.documentElement;
    html.dataset.theme = html.dataset.theme === "dark" ? "light" : "dark";
  };

  return (
    <div className="page">
      {/* NAVBAR */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="brand" onClick={goToHome} style={{cursor:'pointer'}}>
            <div className="brand-logo" aria-hidden="true"></div>
            <div>
              {APP_NAME}{" "}
              <span className="muted">— módulo de gerenciamento de filas</span>
            </div>
          </div>

          <div className="nav-center">
            <button className="linkbtn" onClick={() => goToAnchor("home")}>Home / Dashboard</button>
            <button className="linkbtn" onClick={() => goToAnchor("modulos")}>Módulos</button>
            <button className="linkbtn" onClick={() => goToAnchor("sobre")}>Sobre</button>
            <button className="linkbtn" onClick={() => goToAnchor("time")}>Time</button>
            <button className="linkbtn" onClick={() => goToAnchor("contato")}>Contato</button>
            {/* NEW: acesso direto ao módulo de filas */}
            <button className="linkbtn" onClick={goToFilas}>Filas</button>
          </div>

          <div className="nav-right">
            <button className="btn btn-ghost" onClick={toggleTheme}>Tema</button>

            {me?.user ? (
              <div className="user-chip" title={me.user.email}>
                <img src={me.user.picture} alt="avatar" />
                <span>{me.user.name}</span>
              </div>
            ) : (
              <button className="btn" onClick={handleBackToLogin}>Sair</button>
            )}
          </div>
        </div>
      </nav>

      <main id="home" className="container">

        {/* HERO */}
        <section className="hero" id="home">
          <div className="hero-grid">
            <div>
              <div className="eyebrow">Apresentação do Projeto</div>
              <h1 className="title">PsicoSoft – Módulo de Gerenciamento de Filas &amp; NPS</h1>
              <p className="subtitle">
                Otimize o atendimento com filas inteligentes e mensure a satisfação com NPS integrado — simples, visual e acessível.
              </p>
              <div className="hero-actions">
                {/* CTA: vai direto para o módulo de Filas */}
                <button className="btn primary" onClick={goToFilas}>Ir para o Gerenciamento de Filas</button>
                <button className="btn ghost" onClick={() => goToAnchor("modulos")}>Explorar Módulos</button>
              </div>
            </div>

            <div className="hero-media" aria-label="Mockup do sistema">
              <div className="media-placeholder">
                <img
                  src="/vista-superior-no-conceito-de-psicologo-online.jpg"
                  alt="Mockup do sistema"
                  className="hero-image"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SOBRE */}
        <section id="sobre">
          <div className="section-head">
            <h2 className="section-title">Sobre o Projeto</h2>
            <p className="section-desc">
              {/* Texto explicativo opcional */}
            </p>
          </div>

          <div className="grid-2">
            <div className="card">
              <span className="badge">Contexto</span>
              <h3>Desafio</h3>
              <p className="muted"></p>

              <h3>Objetivos</h3>
              <ul className="muted">
                <li>Reduzir tempo médio de espera</li>
                <li>Melhorar visibilidade das filas</li>
                <li>Mensurar satisfação com NPS</li>
              </ul>
            </div>

            <div className="card">
              <span className="badge">Imagem</span>
              <div className="media-placeholder" style={{ height: 280 }}>
                [ Espaço para diagrama/fluxo ]
              </div>
            </div>
          </div>
        </section>

        {/* MÓDULOS */}
        <section id="modulos">
          <div className="section-head">
            <h2 className="section-title">Módulos</h2>
          </div>

          <div className="grid-2">
            <div className="card">
              <span className="badge">Módulo</span>
              <h3>Gerenciamento de Filas</h3>
              <p className="muted"></p>
              {/* LINK: agora usa navigate para /filas */}
              <button className="link asbtn" onClick={goToFilas}>Ir para o módulo →</button>
            </div>

            <div className="card">
              <span className="badge">Módulo</span>
              <h3>NPS</h3>
              <p className="muted"></p>
              <button className="link asbtn" onClick={() => goToAnchor('galeria')}>Explorar relatórios →</button>
            </div>
          </div>
        </section>

        {/* GALERIA */}
        <section id="galeria">
          <div className="section-head">
            <h2 className="section-title">Galeria</h2>
            <p className="section-desc">Insira aqui capturas de tela do sistema.</p>
          </div>

          <div className="gallery">
            <div className="shot">[ Screenshot 1 ]</div>
            <div className="shot">[ Screenshot 2 ]</div>
            <div className="shot">[ Screenshot 3 ]</div>
            <div className="shot">[ Screenshot 4 ]</div>
          </div>
        </section>

        {/* TIME */}
        <section id="time">
          <div className="section-head">
            <h2 className="section-title">Time</h2>
            <p className="section-desc">Conheça os envolvidos no projeto.</p>
          </div>

          <div className="grid-4">
            <div className="card member">
              <div className="avatar"></div>
              <h3>Ana Beatriz</h3>
              <div className="role"></div>
            </div>

            <div className="card member">
              <div className="avatar"></div>
              <h3>Carlos Yuichi</h3>
              <div className="role"></div>
            </div>

            <div className="card member">
              <div className="avatar"></div>
              <h3>Lucas Eleuterio</h3>
              <div className="role"></div>
            </div>

            <div className="card member">
              <div className="avatar"></div>
              <h3>Sabrina Arfelli</h3>
              <div className="role"></div>
            </div>
          </div>
        </section>

        {/* CONTATO */}
        <section id="contato">
          <div className="card">
            <h3>Contato</h3>
            <p className="muted">
              Email: lucaseleuterio95@gmail.com
            </p>
          </div>
        </section>
      </main>

      <footer>
        <div className="container footer-inner">
          <div>© {new Date().getFullYear()} PsicoSoft - Módulo de Gerenciamento de Filas &amp; NPS</div>
          <div>
            <span className="muted">Fam - Faculdade das Américas</span> ·{" "}
            <span className="muted">Ciência da Computação </span> ·{" "}
            <span className="muted">8º Semestre</span> ·{" "}
            <span className="muted">Trabalho de Conclusão de Curso</span> ·{" "}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;