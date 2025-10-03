import React, { useState, useEffect } from "react";
import './App.css';

function App() {
  const [lembretes, setLembretes] = useState([]);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaData, setNovaData] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

function formatarData(valor) {
  if (!valor) return "";
  const [ano, mes, dia] = valor.split("-");
  return `${dia}/${mes}/${ano}`;
}

  async function getLembretes() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("http://localhost:8081/reminder");
      if (!res.ok) throw new Error("Erro ao buscar lembretes.");
      const data = await res.json();
      setLembretes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addLembrete() {
    if (!novoTitulo || !novaData) {
      setError("Preencha todos os campos!");
      return;
    }
    try {
      setError("");
      const res = await fetch("http://localhost:8081/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: novoTitulo,
          date: novaData,
        }),
      });

      if (!res.ok) throw new Error("Erro ao adicionar lembrete. Verifique se a data é futura");

      const novoLembrete = await res.json();
      setLembretes(prev => [...prev, novoLembrete]);
      setNovoTitulo("");
      setNovaData("");
      setSuccess("Lembrete adicionado com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  }


  async function deleteLembrete(id) {
    try {
      const res = await fetch(`http://localhost:8081/reminder/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao excluir lembrete.");
      setLembretes(prev => prev.filter(l => l.id !== id));
      setSuccess("Lembrete excluído com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    getLembretes();
  }, []);

  return (
    <div className="App">
      <h1>Lembretes</h1>

      <div className="input-group">
        <input
          type="text"
          value={novoTitulo}
          onChange={(e) => setNovoTitulo(e.target.value)}
          placeholder="Título do lembrete"
        />
        <input
          type="date"
          value={novaData}
          onChange={(e) => setNovaData(e.target.value)}
        />
        <button onClick={addLembrete}>Adicionar</button>
      </div>

      {loading && <p className="loading">Carregando lembretes...</p>}
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {lembretes.length === 0 && !loading ? (
        <p>Nenhum lembrete encontrado.</p>
      ) : (
        <ul>
          {lembretes.map((lem) => (
            <li key={lem.id} className="reminder-card">
              <span>
                <strong>{lem.title}</strong> — {formatarData(lem.date)}
              </span>
              <button onClick={() => deleteLembrete(lem.id)}>Excluir</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
