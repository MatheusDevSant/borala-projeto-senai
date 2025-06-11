import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';

import Home from './pages/Home';
import DetalhesEvento from './pages/DetalhesEvento';
import Perfil from './componentes/Perfil';
import SobreNos from './pages/SobreNos';

import AdminDashboard from './pages/AdminDashboard';

import Compra from './pages/Compra';
import Mapa from './pages/Mapa';
import ReservaModal from './pages/ReservaModal';
import BarraNav from './componentes/BarraNav';
import AtualizarDados from './pages/AtualizarDados';
import MeusIngressos from './pages/MeusIngressos';
import MomentosVivi from './pages/Momentos';

function App() {
  return (
    <Router>
      <BarraNav></BarraNav>

      <Routes>
        <Route path="/detalhes-evento" element={<DetalhesEvento />} />
        <Route path="/momentos" element={<MomentosVivi />} />
        <Route path="/meus-ingressos" element={<MeusIngressos />} />
        <Route path="/atualizar-dados" element={<AtualizarDados />} />
        <Route path="/" element={<Home />} />
        <Route path="/mapa" element={<Mapa />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/sobre-nos" element={<SobreNos />} />

        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/compra/:idEvento" element={<Compra />} />
        <Route path="/mapa/:idEvento" element={<Mapa />} />
        <Route path="/reserva/:idEvento" element={<ReservaModal />} />
      </Routes>
    </Router>
  );
}

export default App;

