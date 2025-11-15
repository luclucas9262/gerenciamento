// src/components/Filas.jsx
import './Queue.css';
import { useEffect, useMemo, useState } from 'react';
import { db } from './store';
import { useNavigate } from 'react-router-dom';

const SPECIALTIES = ['Psiquiatra', 'Psicólogo', 'Terapeuta'];


function Section({ id, title, desc, children }) {
  return (
    <section id={id}>
      <div className="section-head">
        <h2 className="section-title">{title}</h2>
        {desc && <p className="section-desc">{desc}</p>}
      </div>
      {children}
    </section>
  );
}

function PatientForm({ onSubmit, defaultValues }) {
  const [form, setForm] = useState(defaultValues || {
    name: '', cpf: '', email: '', phone: ''
  });

  return (
    <div className="card compact-form">{/* <-- Classe para escopo dos estilos */}
      <span className="badge">Cadastro do Paciente</span>

      <div className="grid-2">
        <div className="field">
          <label>Nome</label>
          <div className="control">
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Digite o nome"
            />
          </div>
        </div>

        <div className="field">
          <label>CPF</label>
          <div className="control">
            <input
              value={form.cpf}
              onChange={e => setForm({ ...form, cpf: e.target.value })}
              placeholder="000.000.000-00"
            />
          </div>
        </div>

        <div className="field">
          <label>E-mail</label>
          <div className="control">
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="nome@exemplo.com"
            />
          </div>
        </div>

        <div className="field">
          <label>Telefone</label>
          <div className="control">
            <input
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>
      </div>

      <div className="actions">
        <button className="btn primary" onClick={() => onSubmit(form)}>Salvar / Continuar</button>
      </div>
    </div>
  );
}

function Scheduler({ patient, onCreated }) {
  const [specialty, setSpecialty] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const professionals = useMemo(
    () => specialty ? db.filterProfessionalsBySpecialty(specialty) : db.getProfessionals(),
    [specialty]
  );
  const [professionalId, setProfessionalId] = useState('');
  const slots = useMemo(() => {
    if (!date || !professionalId) return [];
    const pro = professionals.find(p => p.id === professionalId);
    if (!pro) return [];
    return db.listSlots(pro, date);
  }, [date, professionalId, professionals]);

  useEffect(() => { setTime(''); }, [professionalId, date]);

  const handleCreate = () => {
    if (!patient?.id) return alert('Cadastre o paciente.');
    if (!specialty || !date || !time || !professionalId) return alert('Preencha todos os passos.');
    const apt = db.createAppointment({
      patientId: patient.id, specialty, date, time, professionalId, type: 'consulta'
    });
    onCreated(apt);
  };

  const timesForProfessional = useMemo(() => {
    if (!date || !professionalId) return [];
    const pro = professionals.find(p => p.id === professionalId);
    return db.listSlots(pro, date);
  }, [date, professionalId, professionals]);

  return (
    <div className="card">
      <span className="badge">Agendamento</span>

      <div className="grid-3">
        <div>
          <label>Especialidade</label>
          <select value={specialty} onChange={e => setSpecialty(e.target.value)}>
            <option value="">Selecione...</option>
            {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label>Data</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        <div>
          <label>Profissional</label>
          <select value={professionalId} onChange={e => setProfessionalId(e.target.value)} disabled={!specialty}>
            <option value="">Selecione...</option>
            {professionals.filter(p => p.specialty === specialty).map(p =>
              <option key={p.id} value={p.id}>{p.name} — {p.specialty}</option>
            )}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label>Horário disponível</label>
        <div className="chips">
          {date && professionalId && timesForProfessional.length === 0 && (
            <div className="muted">Sem horários livres nesta data.</div>
          )}
          {timesForProfessional.map(t => (
            <button
              key={t}
              className={`chip ${time === t ? 'active' : ''}`}
              onClick={() => setTime(t)}
            >{t}</button>
          ))}
        </div>
      </div>

      <div className="actions">
        <button className="btn primary" onClick={handleCreate}>Agendar</button>
      </div>
    </div>
  );
}

function AppointmentCard({ appointment, onCheckIn }) {
  const pros = db.getProfessionals();
  const pro = pros.find(p => p.id === appointment.professionalId);
  return (
    <div className="card">
      <span className="badge">Consulta agendada</span>
      <h3>{appointment.date} às {appointment.time}</h3>
      <p className="muted">{pro?.name} — {pro?.specialty}</p>
      <div className="actions">
        <button className="btn primary" onClick={() => onCheckIn(appointment)}>Fazer Check-in</button>
      </div>
    </div>
  );
}

function NpsWidget({ appointment, onClose }) {
  const [rating, setRating] = useState(10);
  const [comment, setComment] = useState('');
  const handleSubmit = () => {
    const label = db.addFeedback({
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      rating: Number(rating),
      comment
    });
    alert(`Obrigado pelo feedback! Classificação NPS: ${label}`);
    onClose?.();
  };
  return (
    <div className="card">
      <span className="badge">NPS</span>
      <h3>Avalie sua experiência</h3>
      <p className="muted">De 0 a 10, qual a probabilidade de você recomendar nossa clínica?</p>
      <input type="range" min="0" max="10" value={rating} onChange={e => setRating(e.target.value)} />
      <div className="nps-number">Nota: {rating}</div>
      <textarea placeholder="Deixe um comentário (opcional)" value={comment} onChange={e => setComment(e.target.value)} />
      <div className="actions"><button className="btn primary" onClick={handleSubmit}>Enviar</button></div>
    </div>
  );
}

function QueuePanel() {
  const [queue, setQueue] = useState(db.getQueue());
  const [showNpsFor, setShowNpsFor] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => setQueue(db.getQueue()), 800);
    return () => clearInterval(interval);
  }, []);

  const pros = db.getProfessionals();
  const appts = db.getAppointments();

  const enrich = (q) => {
    const a = appts.find(x => x.id === q.appointmentId);
    const p = db.getPatients().find(x => x.id === q.patientId);
    const pro = pros.find(x => x.id === q.professionalId);
    return { ...q, appointment: a, patient: p, pro };
  };

  const byStatus = (status) => queue.filter(q => q.status === status).map(enrich);
  const aguardando = byStatus('aguardando');
  const chamados = byStatus('chamado');
  const emAtendimento = byStatus('em_atendimento');
  const finalizados = byStatus('finalizado');

  const setStatus = (id, status) => {
    const rec = db.setQueueStatus(id, status);
    if (rec && status === 'finalizado') {
      const ap = db.updateAppointmentStatus(rec.appointmentId, 'finalizada');
      setShowNpsFor(ap);
    }
    setQueue(db.getQueue());
  };

  return (
    <div className="grid-4">
      <div className="card">
        <h3>Aguardando</h3>
        <ul className="list">
          {aguardando.map(q => (
            <li key={q.id}>
              <div className="ticket">{q.ticket}</div>
              <div>
                <strong>{q.patient?.name}</strong>
                <div className="muted">{q.pro?.name} · {q.appointment?.time}</div>
              </div>
              <div className="row-actions">
                <button className="btn" onClick={() => setStatus(q.id, 'chamado')}>Chamar</button>
                <button className="btn ghost" onClick={() => setStatus(q.id, 'no_show')}>No-show</button>
              </div>
            </li>
          ))}
          {aguardando.length === 0 && <li className="muted">Sem pacientes aguardando.</li>}
        </ul>
      </div>

      <div className="card">
        <h3>Chamados</h3>
        <ul className="list">
          {chamados.map(q => (
            <li key={q.id}>
              <div className="ticket">{q.ticket}</div>
              <div>
                <strong>{q.patient?.name}</strong>
                <div className="muted">{q.pro?.name} · {q.appointment?.time}</div>
              </div>
              <div className="row-actions">
                <button className="btn primary" onClick={() => setStatus(q.id, 'em_atendimento')}>Iniciar</button>
              </div>
            </li>
          ))}
          {chamados.length === 0 && <li className="muted">Nenhum chamado no momento.</li>}
        </ul>
      </div>

      <div className="card">
        <h3>Em atendimento</h3>
        <ul className="list">
          {emAtendimento.map(q => (
            <li key={q.id}>
              <div className="ticket">{q.ticket}</div>
              <div>
                <strong>{q.patient?.name}</strong>
                <div className="muted">{q.pro?.name}</div>
              </div>
              <div className="row-actions">
                <button className="btn primary" onClick={() => setStatus(q.id, 'finalizado')}>Finalizar</button>
              </div>
            </li>
          ))}
          {emAtendimento.length === 0 && <li className="muted">Sem atendimentos em curso.</li>}
        </ul>
      </div>

      <div className="card">
        <h3>Finalizados</h3>
        <ul className="list">
          {finalizados.map(q => (
            <li key={q.id}>
              <div className="ticket">{q.ticket}</div>
              <div>
                <strong>{q.patient?.name}</strong>
                <div className="muted">{q.pro?.name}</div>
              </div>
              <div className="row-actions">
                <button className="btn ghost" onClick={() => db.removeFromQueue(q.id) || setQueue(db.getQueue())}>Remover</button>
              </div>
            </li>
          ))}
          {finalizados.length === 0 && <li className="muted">Nenhum finalizado hoje.</li>}
        </ul>
      </div>

      {showNpsFor && (
        <div className="overlay">
          <div className="overlay-content">
            <NpsWidget appointment={showNpsFor} onClose={() => setShowNpsFor(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Filas() {
    
  const navigate = useNavigate();                 // <-- ADICIONE
  const goHome = () => navigate('/home'); 

  const [patient, setPatient] = useState(null);
  const [appointment, setAppointment] = useState(null);

  const toggleTheme = () => {
    const html = document.documentElement;
    html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
  };

  const [role, setRole] = useState('Paciente');

  const pros = db.getProfessionals();

  const handlePatientSubmit = (form) => {
    if (!form.name || !form.cpf || !form.email) return alert('Preencha nome, CPF e e-mail.');
    const saved = db.upsertPatient(form);
    setPatient(saved);
  };

  const handleCheckIn = (apt) => {
    const q = db.checkIn(apt);
    alert(`Check-in realizado! Sua senha: ${q.ticket}`);
    setAppointment(apt);
  };

  return (
    <div className="page">
      <nav className="nav">
        <div className="nav-inner">
          <div className="brand">
            <div className="brand-logo" aria-hidden="true"></div>
            <div>PsicoSoft MGF <span className="muted">— gerenciamento de filas</span></div>
          </div>

          <div className="nav-center">
            {/* CORRIGIDO */}
            
            <a href="/filas">Filas</a>
            <a className="btn ghost" onClick={goHome}>← Voltar para Home</a>
          </div>

          <div className="nav-right">
            
            <select className="role-switch" value={role} onChange={e => setRole(e.target.value)}>
              <option>Paciente</option>
              <option>Recepcionista</option>
              <option>Médico</option>
            </select>
            <button className="btn btn-ghost" onClick={toggleTheme}>Tema</button>
          </div>
        </div>
      </nav>

      <main className="recep-layout">
        <header className="hero small">
          <h1 className="title">Sistema de Gerenciamento de Filas & Agendamentos</h1>
          <p className="subtitle">Fluxo completo com dados locais: cadastro, agendamento, check-in e fila em tempo real.</p>
        </header>

        {role === 'Paciente' && (
          <>
            <Section id="cadastro" title="1) Cadastro do Paciente" desc="Preencha seus dados para continuar o agendamento.">
              <PatientForm onSubmit={handlePatientSubmit} defaultValues={patient || {}} />
            </Section>

            <Section id="agendamento" title="2) Agendar Consulta" desc="Escolha a especialidade, a data, o horário e o profissional disponível.">
              {patient
                ? <Scheduler patient={patient} onCreated={(apt) => setAppointment(apt)} />
                : <div className="muted">Cadastre-se primeiro.</div>}
            </Section>

            <Section id="checkin" title="3) Check-in" desc="Confirme sua presença para entrar na fila de atendimento.">
              {appointment
                ? <AppointmentCard appointment={appointment} onCheckIn={handleCheckIn} />
                : <div className="muted">Agende uma consulta para liberar o check-in.</div>}
            </Section>
          </>
        )}

        {role === 'Recepcionista' && (
          <>
            <Section id="fila" title="Fila de Atendimento" desc="Gerencie os pacientes aguardando, chame e finalize atendimentos.">
              <QueuePanel />
            </Section>

            <Section id="hoje" title="Agendados de Hoje" desc="Consultas agendadas para hoje (para auxiliar check-ins presenciais).">
              <div className="card">
                <ul className="list">
                  {db.getAppointments()
                    .filter(a => a.date === (new Date()).toISOString().slice(0,10))
                    .map(a => {
                      const p = db.getPatients().find(x => x.id === a.patientId);
                      const pro = pros.find(x => x.id === a.professionalId);
                      return (
                        <li key={a.id}>
                          <div><strong>{p?.name}</strong> — {a.time}</div>
                          <div className="muted">{pro?.name} · {pro?.specialty}</div>
                          <div className="row-actions">
                            <button className="btn" onClick={() => handleCheckIn(a)}>Check-in</button>
                          </div>
                        </li>
                      );
                    })}
                </ul>
              </div>
            </Section>
          </>
        )}

        {role === 'Médico' && (
  <Section
    id="meus"
    title="Meus Atendimentos (Hoje)"
    desc="Acompanhe e finalize seus atendimentos."
  >
    <div className="card">
      <ul className="list">
        {db
          .getQueue()
          .filter(q => ['chamado', 'em_atendimento'].includes(q.status))
          .map(q => {
            const ap = db.getAppointments().find(a => a.id === q.appointmentId);
            const p = db.getPatients().find(x => x.id === q.patientId);
            const pro = pros.find(x => x.id === q.professionalId);

            return (
              <li key={q.id}>
                <div className="ticket">{q.ticket}</div>

                <div>
                  <div className="item-header">
                    <strong>{p?.name ?? 'Paciente'}</strong>
                  </div>

                  <div className="muted">
                    {ap?.time ?? '--:--'} · {pro?.name ?? 'Profissional'}
                  </div>
                </div>

                <div className="row-actions">
                  <button
                    className="btn primary"
                    onClick={() => db.setQueueStatus(q.id, 'em_atendimento')}
                  >
                    Atender
                  </button>

                  <button
                    className="btn"
                    onClick={() => db.setQueueStatus(q.id, 'finalizado')}
                  >
                    Finalizar
                  </button>
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  </Section>
)}

      </main>
    </div>
  );
}
