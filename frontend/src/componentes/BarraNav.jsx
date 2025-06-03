import React, { useState } from 'react';
import LoginModal from './LoginModal'; // ajuste caminho se necessário
import Perfil from './Perfil'; // novo: importar o componente Perfil

import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import logo from '../images/logo.png';
import '../styles/BarraNav.css';

function BarraNav() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPerfilOpen, setIsPerfilOpen] = useState(false); // novo estado para o perfil

  return (
    <nav className={`barra-nav ${isHome ? 'home-style' : 'outra-pagina-style'}`}>
      <div className="logo">
        <Link to="/">
          <img src={logo} alt="Logo BoraLá" style={{ height: '40px' }} />
        </Link>
      </div>
      <ul className="menu">
        <li><Link to="/sobre-nos">Sobre Nós</Link></li>
        <li><Link to="/mapa">🗺️ Mapa de Eventos</Link></li>
        <li>
          <button onClick={() => setIsLoginOpen(true)} className="link-btn">
            Login | Registrar
          </button>
        </li>
        <li>
          <button onClick={() => setIsPerfilOpen(true)} className="link-btn perfil-btn">
            <FontAwesomeIcon icon={faUserCircle} size="2x" />
          </button>
        </li>
      </ul>

      {/* Modais */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <Perfil isOpen={isPerfilOpen} onClose={() => setIsPerfilOpen(false)} />
    </nav>
  );
}

export default BarraNav;
