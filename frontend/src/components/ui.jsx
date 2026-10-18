import { createContext, useCallback, useContext, useState } from 'react';

export const brl = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const dataCurta = (d) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

const ToastCtx = createContext(() => {});
export function ToastProvider({ children }) {
  const [itens, setItens] = useState([]);
  const mostrar = useCallback((texto, tipo = 'ok') => {
    const id = Math.random();
    setItens((l) => [...l, { id, texto, tipo }]);
    setTimeout(() => setItens((l) => l.filter((i) => i.id !== id)), 4200);
  }, []);
  return (
    <ToastCtx.Provider value={mostrar}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {itens.map((i) => <div key={i.id} className={`toast toast-${i.tipo}`}>{i.texto}</div>)}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

export function Modal({ titulo, aberto, aoFechar, children }) {
  if (!aberto) return null;
  return (
    <div className="modal-fundo" onMouseDown={(e) => e.target === e.currentTarget && aoFechar()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="modal-topo">
          <h3>{titulo}</h3>
          <button className="btn-icone" onClick={aoFechar} aria-label="Fechar">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Barra({ valor, cor }) {
  return (
    <div className="barra" aria-valuenow={valor} aria-valuemin={0} aria-valuemax={100} role="progressbar">
      <div className="barra-preench" style={{ width: `${Math.min(100, valor)}%`, background: cor }} />
    </div>
  );
}

export function Carregando({ texto = 'Carregando…' }) {
  return <div className="carregando"><span className="spinner" />{texto}</div>;
}

export function Topo({ subtitulo, children }) {
  return (
    <header className="topo">
      <div className="marca"><span className="marca-icone">🐷</span><div><strong>PoupaKids</strong><small>{subtitulo}</small></div></div>
      <div className="topo-acoes">{children}</div>
    </header>
  );
}

/** Hook para formulários que chamam a API: controla envio e mostra o erro do backend. */
export function useEnvio() {
  const toast = useToast();
  const [enviando, setEnviando] = useState(false);
  const enviar = useCallback(async (fn, msgOk) => {
    setEnviando(true);
    try {
      const r = await fn();
      if (msgOk) toast(typeof msgOk === 'function' ? msgOk(r) : msgOk, 'ok');
      return r;
    } catch (e) {
      toast(e.message, 'erro');
      return undefined;
    } finally {
      setEnviando(false);
    }
  }, [toast]);
  return { enviando, enviar };
}
