import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faSearch, faClock } from '@fortawesome/free-solid-svg-icons'; // Ícones do Font Awesome
import '../styles/SobreNos.css';

function SobreNos() {


  return (
    <div className="sobre-nos">
      <header className="sobre-nos-header">
        
        
        <p>
          O <strong>BoraLá</strong> é uma plataforma digital pensada para quem ama viver experiências. Seja um show, uma peça de teatro, uma balada ou um festival, o BoraLá facilita a sua vida na hora de descobrir eventos, comprar ingressos e garantir que você não vai perder nada do que está rolando por aí.
        </p>
        <p>
          No BoraLá, acreditamos que experiências ao vivo são inesquecíveis – e que ninguém deve perder um bom evento por falta de informação ou dificuldade na compra. Por isso, criamos uma plataforma que aproxima você da cena cultural da sua cidade, com facilidade, estilo e agilidade. 
        </p>
       
      </header>

      <section className="sobre-nos-features">
        <div className="feature">
          <FontAwesomeIcon icon={faCreditCard} size="3x" color="#ff8c00" />
          <h3>Compra rápida e segura de ingressos</h3>
          <p>Esqueça filas e complicações.</p>
        </div>
        <div className="feature">
          <FontAwesomeIcon icon={faSearch} size="3x" color="#ff8c00" />
          <h3>Busca Inteligente</h3>
          <p>Encontre eventos por tipo, data, ou local.</p>
        </div>
        <div className="feature">
          <FontAwesomeIcon icon={faClock} size="3x" color="#ff8c00" />
          <h3>Reserva temporária</h3>
          <p>Agente segura seu ingresso por 24 horas.</p>
        </div>
      </section>

      <footer className="sobre-nos-footer">
        <p>Se tem evento, tem BoraLá. Bora curtir juntos?</p>
      </footer>
    </div>
  );
}

export default SobreNos;
