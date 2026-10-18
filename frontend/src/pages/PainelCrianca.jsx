import { useCallback, useEffect, useState } from 'react';
import { ConteudosAPI, GamificacaoAPI, ObjetivosAPI, TransacoesAPI, UsuariosAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Barra, Carregando, Modal, Topo, brl, dataCurta, useEnvio } from '../components/ui';

const NIVEIS = ['Iniciante', 'Intermediário', 'Avançado'];

export default function PainelCrianca() {
  const { sessao, sair } = useAuth();
  const id = sessao.usuario.id_usuario;
  const [eu, setEu] = useState(null);
  const [metas, setMetas] = useState([]);
  const [game, setGame] = useState(null);
  const [extrato, setExtrato] = useState(null);
  const [aba, setAba] = useState('metas');
  const [modal, setModal] = useState(null);

  const carregar = useCallback(async () => {
    const u = await UsuariosAPI.buscar(id);
    setEu(u);
    const [m, g, e] = await Promise.all([ObjetivosAPI.listar(id), GamificacaoAPI.obter(id), TransacoesAPI.listar(u.conta.id_conta)]);
    setMetas(m); setGame(g); setExtrato(e);
  }, [id]);
  useEffect(() => { carregar(); }, [carregar]);

  if (!eu || !game) return <Carregando />;

  return (
    <div className="app crianca">
      <Topo subtitulo="Meu cantinho">
        <button className="btn btn-fantasma" onClick={sair}>Sair</button>
      </Topo>
      <main className="conteudo">
        <section className="hero-crianca">
          <div className="saldo-card">
            <span>Oi, {eu.nome.split(' ')[0]}! Seu saldo é</span>
            <strong data-testid="saldo">{brl(eu.conta.saldo)}</strong>
            <small>Guardado nos cofrinhos: {brl(eu.resumo.total_guardado)}</small>
            <button className="btn btn-claro" onClick={() => setModal('gastar')}>🛍️ Registrar um gasto</button>
          </div>
          <div className="nivel-card">
            <div className="nivel-num">Nível <b>{game.nivel}</b></div>
            <Barra valor={game.progresso_nivel} cor="var(--amarelo)" />
            <small>{game.pontos} pontos · faltam {game.pontos_para_proximo_nivel} para o próximo nível</small>
            <div className="conquistas">
              {game.conquistas_disponiveis.map((c) => (
                <span key={c.codigo} className={`conquista ${c.obtida ? 'obtida' : ''}`} title={`${c.titulo}: ${c.descricao}`}>{c.icone}</span>
              ))}
            </div>
          </div>
        </section>

        <div className="abas grandes" role="tablist">
          {[['metas', '🐷 Cofrinhos'], ['aprender', '📚 Aprender'], ['extrato', '🧾 Extrato']].map(([k, r]) => (
            <button key={k} role="tab" aria-selected={aba === k} className={aba === k ? 'ativa' : ''} onClick={() => setAba(k)}>{r}</button>
          ))}
        </div>

        {aba === 'metas' && <Cofrinhos metas={metas} saldo={eu.conta.saldo} aoMudar={carregar} />}
        {aba === 'aprender' && <Aprender aoMudar={carregar} />}
        {aba === 'extrato' && extrato && (
          <section className="card">
            <ul className="extrato">
              {extrato.transacoes.map((t) => (
                <li key={t.id_transacao}>
                  <span className="ext-icone">{{ 'Depósito': '⬇️', Saque: '🛍️', 'Transferência': '🔁', Mesada: '💰', 'Poupança': '🐷' }[t.tipo_transacao]}</span>
                  <div>{t.tipo_transacao}<small>{t.categoria || '—'} · {dataCurta(t.data_transacao)}</small></div>
                  <span className={`ext-valor ${t.direcao}`}>{t.direcao === 'entrada' ? '+' : '−'} {brl(t.valor)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <Modal titulo="Registrar um gasto" aberto={modal === 'gastar'} aoFechar={() => setModal(null)}>
        <Gasto conta={eu.conta} aoSalvar={() => { setModal(null); carregar(); }} />
      </Modal>
    </div>
  );
}

function Cofrinhos({ metas, saldo, aoMudar }) {
  const { enviando, enviar } = useEnvio();
  const [nova, setNova] = useState({ descricao: '', valor_meta: '' });
  const [valores, setValores] = useState({});

  const criar = async (e) => {
    e.preventDefault();
    if (await enviar(() => ObjetivosAPI.criar({ descricao: nova.descricao, valor_meta: Number(nova.valor_meta) }), 'Cofrinho criado! 🎯')) {
      setNova({ descricao: '', valor_meta: '' }); aoMudar();
    }
  };
  const guardar = async (m) => {
    const valor = Number(valores[m.id_objetivo]);
    const r = await enviar(() => ObjetivosAPI.adicionar(m.id_objetivo, valor), (res) => (res.meta_concluida
      ? `🏆 Meta "${m.descricao}" concluída! +${res.pontos_ganhos} pontos`
      : `Guardou ${brl(valor)}! +${res.pontos_ganhos} pontos`));
    if (r) { setValores({ ...valores, [m.id_objetivo]: '' }); aoMudar(); }
  };

  return (
    <>
      <section className="grade-metas">
        {metas.map((m) => (
          <article key={m.id_objetivo} className={`card meta ${m.status === 'Concluído' ? 'concluida' : ''}`}>
            <div className="meta-cab"><h3>{m.descricao}</h3>{m.status === 'Concluído' && <span className="selo verde">Concluída 🏆</span>}</div>
            <div className="meta-valores"><strong>{brl(m.valor_atual)}</strong><span>de {brl(m.valor_meta)}</span></div>
            <Barra valor={m.percentual} cor={m.status === 'Concluído' ? 'var(--verde)' : undefined} />
            <small className="mudo">{m.percentual}% · {m.status === 'Concluído' ? 'Parabéns!' : `faltam ${brl(m.falta)}`}</small>
            {m.status !== 'Concluído' && (
              <div className="form linha">
                <input type="number" min="0.01" step="0.01" placeholder="R$" aria-label={`Valor para ${m.descricao}`}
                  value={valores[m.id_objetivo] || ''} onChange={(e) => setValores({ ...valores, [m.id_objetivo]: e.target.value })} />
                <button className="btn btn-primario" disabled={enviando || !valores[m.id_objetivo]} onClick={() => guardar(m)}>Guardar</button>
              </div>
            )}
          </article>
        ))}
        <article className="card meta nova">
          <h3>Novo cofrinho</h3>
          <p className="mudo">Para o que você quer juntar dinheiro?</p>
          <form className="form" onSubmit={criar}>
            <input placeholder="ex.: patins" value={nova.descricao} onChange={(e) => setNova({ ...nova, descricao: e.target.value })} required />
            <input type="number" min="0.01" step="0.01" placeholder="Quanto custa? (R$)" value={nova.valor_meta} onChange={(e) => setNova({ ...nova, valor_meta: e.target.value })} required />
            <button className="btn btn-sec" disabled={enviando}>Criar cofrinho</button>
          </form>
        </article>
      </section>
      <p className="mudo centro">Você tem {brl(saldo)} disponível para guardar.</p>
    </>
  );
}

function Aprender({ aoMudar }) {
  const { enviar } = useEnvio();
  const [nivel, setNivel] = useState('Iniciante');
  const [lista, setLista] = useState(null);
  const [aberto, setAberto] = useState(null);

  const carregar = useCallback(() => ConteudosAPI.listar({ nivel }).then(setLista), [nivel]);
  useEffect(() => { setLista(null); carregar(); }, [carregar]);

  const concluir = async (c) => {
    const r = await enviar(() => ConteudosAPI.concluir(c.id_conteudo), (res) => (res.ja_concluido ? 'Você já tinha concluído este conteúdo.' : `Muito bem! +${res.pontos_ganhos} pontos 📚`));
    if (r) { carregar(); aoMudar(); }
  };

  return (
    <section>
      <div className="abas pequenas">{NIVEIS.map((n) => <button key={n} className={nivel === n ? 'ativa' : ''} onClick={() => setNivel(n)}>{n}</button>)}</div>
      {!lista ? <Carregando /> : (
        <div className="lista-conteudos">
          {lista.map((c) => (
            <article key={c.id_conteudo} className={`card conteudo-item ${c.concluido ? 'feito' : ''}`}>
              <button className="conteudo-titulo" onClick={() => setAberto(aberto === c.id_conteudo ? null : c.id_conteudo)} aria-expanded={aberto === c.id_conteudo}>
                <span>{c.concluido ? '✅' : '📘'} {c.titulo}</span><small>+{c.pontos} pts</small>
              </button>
              {aberto === c.id_conteudo && (
                <div className="conteudo-corpo">
                  <p>{c.descricao}</p>
                  {!c.concluido && <button className="btn btn-primario" onClick={() => concluir(c)}>Li e aprendi!</button>}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function Gasto({ conta, aoSalvar }) {
  const { enviando, enviar } = useEnvio();
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('');
  const submeter = async (e) => {
    e.preventDefault();
    const r = await enviar(() => TransacoesAPI.registrar({ id_conta: conta.id_conta, tipo_transacao: 'Saque', valor: Number(valor), categoria }),
      (res) => `Gasto registrado. Saldo: ${brl(res.saldo)}`);
    if (r) aoSalvar();
  };
  return (
    <form className="form" onSubmit={submeter}>
      <p className="mudo">Saldo disponível: <b>{brl(conta.saldo)}</b></p>
      <label>Quanto você gastou? (R$)<input type="number" min="0.01" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} required autoFocus /></label>
      <label>Com o quê?<input value={categoria} maxLength={50} onChange={(e) => setCategoria(e.target.value)} placeholder="ex.: lanche" /></label>
      <button className="btn btn-primario" disabled={enviando}>Registrar</button>
    </form>
  );
}
