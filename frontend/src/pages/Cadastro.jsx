import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useEnvio } from '../components/ui';

export default function Cadastro() {
  const { entrar } = useAuth();
  const nav = useNavigate();
  const { enviando, enviar } = useEnvio();
  const [f, setF] = useState({ nome: '', cpf: '', email: '', telefone: '', senha: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submeter = async (e) => {
    e.preventDefault();
    const r = await enviar(() => AuthAPI.registrar(f), 'Conta criada! Agora cadastre seus filhos.');
    if (r) { entrar(r); nav('/responsavel'); }
  };

  return (
    <main className="tela-login so-card">
      <section className="login-card">
        <div className="marca"><span className="marca-icone">🐷</span><div><strong>PoupaKids</strong><small>Cadastro do responsável</small></div></div>
        <form onSubmit={submeter} className="form">
          <label>Nome completo<input value={f.nome} onChange={set('nome')} required /></label>
          <label>CPF<input value={f.cpf} onChange={set('cpf')} placeholder="000.000.000-00" required /></label>
          <label>E-mail<input type="email" value={f.email} onChange={set('email')} required /></label>
          <label>Telefone<input value={f.telefone} onChange={set('telefone')} /></label>
          <label>Senha (mín. 6 caracteres)<input type="password" minLength={6} value={f.senha} onChange={set('senha')} required /></label>
          <button className="btn btn-primario" disabled={enviando}>{enviando ? 'Criando…' : 'Criar conta'}</button>
        </form>
        <p className="mudo centro"><Link to="/">Voltar ao login</Link></p>
      </section>
    </main>
  );
}
