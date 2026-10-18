import { useCallback, useEffect, useState } from 'react';
import { ObjetivosAPI, PainelAPI, TransacoesAPI, UsuariosAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Barra, Carregando, Modal, Topo, brl, dataCurta, useEnvio } from '../components/ui';

const ICONE_TIPO = { 'Depósito': '⬇️', Saque: '🛍️', 'Transferência': '🔁', Mesada: '💰', 'Poupança': '🐷' };

export default function PainelResponsavel() {
  const { sessao, sair } = useAuth();
  const [painel, setPainel] = useState(null);
  const [erro, setErro] = useState(null);
  const [modal, setModal] = useState(null); // { tipo, filho }
  const [detalhe, setDetalhe] = useState(null);

  const carregar = useCallback(() => PainelAPI.responsavel().then(setPainel).catch((e) => setErro(e.message)), []);
  useEffect(() => { carregar(); }, [carregar]);

  const fechar = (recarregar) => { setModal(null); if (recarregar) { carregar(); if (detalhe) setDetalhe({ ...detalhe }); } };

  return (
    <div className="app">
      <Topo subtitulo="Painel do responsável">
        <span className="ola">Olá, {sessao.usuario.nome.split(' ')[0]}</span>
        <button className="btn btn-fantasma" onClick={sair}>Sair</button>
      </Topo>
      <main className="conteudo">
        {erro && <div className="alerta">{erro}</div>}
        {!painel ? <Carregando /> : (
          <>
            <section className="kpis">
              <Kpi rotulo="Crianças" valor={painel.totais.criancas} />
              <Kpi rotulo="Saldo nas contas" valor={brl(painel.totais.saldo_total)} />
              <Kpi rotulo="Guardado em metas" valor={brl(painel.totais.guardado_total)} destaque />
              <Kpi rotulo="Metas concluídas" valor={painel.totais.metas_concluidas} />
              <Kpi rotulo="Mesadas pendentes" valor={painel.totais.mesadas_pendentes} alerta={painel.totais.mesadas_pendentes > 0} />
            </section>

            <div className="secao-topo">
              <h2>Meus filhos</h2>
              <button className="btn btn-primario" onClick={() => setModal({ tipo: 'novoFilho' })}>+ Cadastrar criança</button>
            </div>

            {painel.filhos.length === 0 ? (
              <div className="vazio">Nenhuma criança cadastrada ainda. Comece cadastrando seu filho ou filha.</div>
            ) : (
              <section className="grade-filhos">
                {painel.filhos.map((f) => (
                  <article key={f.id_usuario} className="card filho" data-testid={`filho-${f.apelido}`}>
                    <div className="filho-topo">
                      <div className="avatar">{f.nome[0]}</div>
                      <div>
                        <h3>{f.nome}</h3>
                        <small className="mudo">{f.idade} anos · @{f.apelido}</small>
                      </div>
                      <span className="selo">Nível {f.gamificacao.nivel}</span>
                    </div>
                    <div className="filho-saldo">
                      <span className="mudo">Saldo disponível</span>
                      <strong>{brl(f.conta.saldo)}</strong>
                    </div>
                    <div className="filho-linha"><span>Guardado em metas</span><b>{brl(f.resumo.total_guardado)}</b></div>
                    <div className="filho-linha"><span>Metas</span><b>{f.resumo.metas_em_andamento} em andamento · {f.resumo.metas_concluidas} concluídas</b></div>
                    <div className="filho-linha"><span>Mesada mensal</span>
                      <b>{brl(f.conta.limite_mesada)} {f.conta.limite_mesada > 0 && (f.resumo.mesada_paga_neste_mes ? <em className="ok">paga</em> : <em className="pend">pendente</em>)}</b>
                    </div>
                    <div className="filho-acoes">
                      <button className="btn btn-sec" onClick={() => setModal({ tipo: 'deposito', filho: f })}>Depositar</button>
                      <PagarMesada filho={f} aoPagar={carregar} abrirEdicao={() => setModal({ tipo: 'mesada', filho: f })} />
                      <button className="btn btn-fantasma" onClick={() => setDetalhe(f)}>Ver detalhes</button>
                    </div>
                  </article>
                ))}
              </section>
            )}

            <h2>Atividades recentes</h2>
            <section className="card">
              {painel.atividades_recentes.length === 0 ? <p className="mudo">Nenhuma movimentação ainda.</p> : (
                <ul className="extrato">
                  {painel.atividades_recentes.map((a) => (
                    <li key={a.id_transacao}>
                      <span className="ext-icone">{ICONE_TIPO[a.tipo_transacao]}</span>
                      <div><b>{a.crianca}</b> · {a.tipo_transacao}<small>{a.categoria} · {dataCurta(a.data_transacao)}</small></div>
                      <span className="ext-valor">{brl(a.valor)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>

      <Modal titulo="Cadastrar criança" aberto={modal?.tipo === 'novoFilho'} aoFechar={() => fechar(false)}>
        <NovoFilho aoSalvar={() => fechar(true)} />
      </Modal>
      <Modal titulo={`Depositar para ${modal?.filho?.nome || ''}`} aberto={modal?.tipo === 'deposito'} aoFechar={() => fechar(false)}>
        {modal?.filho && <Deposito filho={modal.filho} irmaos={painel?.filhos || []} aoSalvar={() => fechar(true)} />}
      </Modal>
      <Modal titulo={`Mesada de ${modal?.filho?.nome || ''}`} aberto={modal?.tipo === 'mesada'} aoFechar={() => fechar(false)}>
        {modal?.filho && <EditarMesada filho={modal.filho} aoSalvar={() => fechar(true)} />}
      </Modal>
      <Modal titulo={detalhe ? `Detalhes de ${detalhe.nome}` : ''} aberto={!!detalhe} aoFechar={() => setDetalhe(null)}>
        {detalhe && <DetalheFilho filho={detalhe} aoMudar={carregar} />}
      </Modal>
    </div>
  );
}

function Kpi({ rotulo, valor, destaque, alerta }) {
  return <div className={`kpi ${destaque ? 'kpi-destaque' : ''} ${alerta ? 'kpi-alerta' : ''}`}><span>{rotulo}</span><strong>{valor}</strong></div>;
}

function PagarMesada({ filho, aoPagar, abrirEdicao }) {
  const { enviando, enviar } = useEnvio();
  if (filho.conta.limite_mesada <= 0) return <button className="btn btn-sec" onClick={abrirEdicao}>Definir mesada</button>;
  return (
    <span className="grupo-btn">
      <button className="btn btn-sec" disabled={enviando || filho.resumo.mesada_paga_neste_mes}
        onClick={async () => { if (await enviar(() => UsuariosAPI.pagarMesada(filho.id_usuario), (r) => `Mesada de ${r.referencia} paga: ${brl(r.transacao.valor)}`)) aoPagar(); }}>
        {filho.resumo.mesada_paga_neste_mes ? 'Mesada paga ✓' : 'Pagar mesada'}
      </button>
      <button className="btn-icone" title="Alterar valor da mesada" onClick={abrirEdicao}>✎</button>
    </span>
  );
}

function NovoFilho({ aoSalvar }) {
  const { enviando, enviar } = useEnvio();
  const [f, setF] = useState({ nome: '', idade: '', apelido: '', pin: '', limite_mesada: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submeter = async (e) => {
    e.preventDefault();
    const dados = { ...f, idade: Number(f.idade), limite_mesada: f.limite_mesada ? Number(f.limite_mesada) : 0 };
    if (await enviar(() => UsuariosAPI.criar(dados), (r) => `${r.nome} cadastrado(a)! Login: ${r.apelido}`)) aoSalvar();
  };
  return (
    <form className="form" onSubmit={submeter}>
      <label>Nome<input value={f.nome} onChange={set('nome')} required /></label>
      <div className="duas">
        <label>Idade<input type="number" min={1} max={17} value={f.idade} onChange={set('idade')} required /></label>
        <label>Mesada mensal (R$)<input type="number" min={0} step="0.01" value={f.limite_mesada} onChange={set('limite_mesada')} /></label>
      </div>
      <div className="duas">
        <label>Apelido (login)<input value={f.apelido} onChange={(e) => setF({ ...f, apelido: e.target.value.toLowerCase() })} required /></label>
        <label>PIN (4 números)<input inputMode="numeric" maxLength={4} value={f.pin} onChange={set('pin')} required /></label>
      </div>
      <button className="btn btn-primario" disabled={enviando}>Cadastrar</button>
    </form>
  );
}

function Deposito({ filho, irmaos, aoSalvar }) {
  const { enviando, enviar } = useEnvio();
  const [modo, setModo] = useState('Depósito');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('');
  const outros = irmaos.filter((i) => i.id_usuario !== filho.id_usuario);
  const [destino, setDestino] = useState(outros[0]?.conta.id_conta || '');
  const submeter = async (e) => {
    e.preventDefault();
    const dados = { id_conta: filho.conta.id_conta, tipo_transacao: modo, valor: Number(valor), categoria };
    if (modo === 'Transferência') dados.id_conta_destino = Number(destino);
    if (await enviar(() => TransacoesAPI.registrar(dados), (r) => `${modo} registrado. Novo saldo: ${brl(r.saldo)}`)) aoSalvar();
  };
  return (
    <form className="form" onSubmit={submeter}>
      <div className="abas pequenas">
        {['Depósito', 'Saque', ...(outros.length ? ['Transferência'] : [])].map((m) => (
          <button type="button" key={m} className={modo === m ? 'ativa' : ''} onClick={() => setModo(m)}>{m}</button>
        ))}
      </div>
      <p className="mudo">Saldo atual: <b>{brl(filho.conta.saldo)}</b></p>
      <label>Valor (R$)<input type="number" min="0.01" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} required autoFocus /></label>
      {modo === 'Transferência' && (
        <label>Para<select value={destino} onChange={(e) => setDestino(e.target.value)}>
          {outros.map((o) => <option key={o.id_usuario} value={o.conta.id_conta}>{o.nome}</option>)}
        </select></label>
      )}
      <label>Descrição<input value={categoria} maxLength={50} onChange={(e) => setCategoria(e.target.value)} placeholder="ex.: presente de aniversário" /></label>
      <button className="btn btn-primario" disabled={enviando}>Confirmar</button>
    </form>
  );
}

function EditarMesada({ filho, aoSalvar }) {
  const { enviando, enviar } = useEnvio();
  const [valor, setValor] = useState(filho.conta.limite_mesada || '');
  const submeter = async (e) => {
    e.preventDefault();
    if (await enviar(() => UsuariosAPI.definirMesada(filho.id_usuario, Number(valor)), 'Valor da mesada atualizado.')) aoSalvar();
  };
  return (
    <form className="form" onSubmit={submeter}>
      <label>Valor mensal (R$)<input type="number" min={0} max={1000} step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} required autoFocus /></label>
      <p className="mudo">A mesada pode ser paga uma vez por mês.</p>
      <button className="btn btn-primario" disabled={enviando}>Salvar</button>
    </form>
  );
}

function DetalheFilho({ filho, aoMudar }) {
  const { enviando, enviar } = useEnvio();
  const [extrato, setExtrato] = useState(null);
  const [metas, setMetas] = useState(null);
  const [nova, setNova] = useState({ descricao: '', valor_meta: '' });

  const carregar = useCallback(() => {
    TransacoesAPI.listar(filho.conta.id_conta).then(setExtrato);
    ObjetivosAPI.listar(filho.id_usuario).then(setMetas);
  }, [filho]);
  useEffect(() => { carregar(); }, [carregar]);

  const criarMeta = async (e) => {
    e.preventDefault();
    const r = await enviar(() => ObjetivosAPI.criar({ id_usuario: filho.id_usuario, descricao: nova.descricao, valor_meta: Number(nova.valor_meta) }), 'Meta criada.');
    if (r) { setNova({ descricao: '', valor_meta: '' }); carregar(); aoMudar(); }
  };

  return (
    <div className="detalhe">
      <h4>Metas de poupança</h4>
      {!metas ? <Carregando /> : metas.length === 0 ? <p className="mudo">Nenhuma meta.</p> : metas.map((m) => (
        <div key={m.id_objetivo} className="meta-linha">
          <div className="meta-info"><b>{m.descricao}</b><small>{brl(m.valor_atual)} de {brl(m.valor_meta)} · {m.status}</small></div>
          <Barra valor={m.percentual} cor={m.status === 'Concluído' ? 'var(--verde)' : undefined} />
        </div>
      ))}
      <form className="form linha" onSubmit={criarMeta}>
        <input placeholder="Nova meta (ex.: patins)" value={nova.descricao} onChange={(e) => setNova({ ...nova, descricao: e.target.value })} required />
        <input type="number" min="0.01" step="0.01" placeholder="Valor" value={nova.valor_meta} onChange={(e) => setNova({ ...nova, valor_meta: e.target.value })} required />
        <button className="btn btn-sec" disabled={enviando}>Criar</button>
      </form>
      <h4>Extrato</h4>
      {!extrato ? <Carregando /> : (
        <ul className="extrato compacto">
          {extrato.transacoes.map((t) => (
            <li key={t.id_transacao}>
              <span className="ext-icone">{ICONE_TIPO[t.tipo_transacao]}</span>
              <div>{t.tipo_transacao}<small>{t.categoria || '—'} · {dataCurta(t.data_transacao)}</small></div>
              <span className={`ext-valor ${t.direcao}`}>{t.direcao === 'entrada' ? '+' : '−'} {brl(t.valor)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
