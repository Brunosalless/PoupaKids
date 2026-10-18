import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Carregando } from './components/ui';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import PainelResponsavel from './pages/PainelResponsavel';
import PainelCrianca from './pages/PainelCrianca';

// Rotas protegidas por perfil: o perfil vem do JWT validado pelo backend (/auth/me).
function Protegida({ perfil, children }) {
  const { sessao, carregando } = useAuth();
  if (carregando) return <Carregando texto="Verificando sessão…" />;
  if (!sessao) return <Navigate to="/" replace />;
  if (sessao.perfil !== perfil) return <Navigate to={sessao.perfil === 'RESPONSAVEL' ? '/responsavel' : '/crianca'} replace />;
  return children;
}

export default function App() {
  const { sessao, carregando } = useAuth();
  const inicio = sessao ? (sessao.perfil === 'RESPONSAVEL' ? '/responsavel' : '/crianca') : null;
  return (
    <Routes>
      <Route path="/" element={carregando ? <Carregando /> : inicio ? <Navigate to={inicio} replace /> : <Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/responsavel" element={<Protegida perfil="RESPONSAVEL"><PainelResponsavel /></Protegida>} />
      <Route path="/crianca" element={<Protegida perfil="CRIANCA"><PainelCrianca /></Protegida>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
