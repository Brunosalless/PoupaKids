import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useEnvio } from '../components/ui';

export default function Login() {
  const { entrar } = useAuth();
  const { enviando, enviar } = useEnvio();
  const [aba, setAba] = useState('crianca');
  const [f, setF] = useState({ email: '', senha: '', apelido: '', pin: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submeter = async (e) => {
    e.preventDefault();
    const r = await enviar(() => (aba === 'crianca' ? AuthAPI.loginCrianca(f.apelido, f.pin) : AuthAPI.login(f.email, f.senha)));
    if (r) entrar(r);
  };

  return (
    <main className="tela-login">
      <section className="login-hero">
        <div className="marca grande"><span className="marca-icone">🐷</span><strong>PoupaKids</strong></div>
        <h1>Aprender sobre dinheiro pode ser divertido.</h1>
        <p>Mesada virtual, cofrinhos com metas, conteúdos e conquistas — com os pais acompanhando tudo.</p>
        <ul className="hero-lista">
          <li>🎯 Metas de poupança com progresso</li>
          <li>📚 Conteúdos por nível</li>
          <li>🏆 Pontos, níveis e conquistas</li>
        </ul>
      </section>
      <section className="login-card">
        <div className="abas" role="tablist">
          <button role="tab" aria-selected={aba === 'crianca'} className={aba === 'crianca' ? 'ativa' : ''} onClick={() => setAba('crianca')}>Sou criança</button>
          <button role="tab" aria-selected={aba === 'responsavel'} className={aba === 'responsavel' ? 'ativa' : ''} onClick={() => setAba('responsavel')}>Sou responsável</button>
        </div>
        <form onSubmit={submeter} className="form">
          {aba === 'crianca' ? (
            <>
              <label>Apelido<input autoComplete="username" value={f.apelido} onChange={set('apelido')} placeholder="ex.: joaozinho" required /></label>
              <label>PIN (4 números)<input inputMode="numeric" type="password" maxLength={4} value={f.pin} onChange={set('pin')} placeholder="••••" required /></label>
            </>
          ) : (
            <>
              <label>E-mail<input type="email" autoComplete="email" value={f.email} onChange={set('email')} required /></label>
              <label>Senha<input type="password" autoComplete="current-password" value={f.senha} onChange={set('senha')} required /></label>
            </>
          )}
          <button className="btn btn-primario" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
        </form>
        {aba === 'responsavel' && <p className="mudo centro">Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link></p>}
        <details className="demo">
          <summary>Contas de demonstração</summary>
          <p>Responsável: <code>carlos@poupakids.com</code> / <code>poupa123</code></p>
          <p>Criança: <code>joaozinho</code> / PIN <code>1234</code> · <code>aninha</code> / <code>4321</code></p>
        </details>
      </section>
    </main>
  );
}
