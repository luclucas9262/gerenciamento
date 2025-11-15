// src/components/store.js
// "Banco" local baseado em LocalStorage — simples e reutilizável

const KEYS = {
  patients: 'psico_patients',
  professionals: 'psico_professionals',
  appointments: 'psico_appointments',
  queue: 'psico_queue',
  feedbacks: 'psico_feedbacks',
  counters: 'psico_counters', // ids/tickets por dia
};

function load(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function loadObj(key) {
  try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; }
}
function saveObj(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// IDs simples
function nextId(prefix = 'id') {
  const counters = loadObj(KEYS.counters);
  counters[prefix] = (counters[prefix] || 0) + 1;
  saveObj(KEYS.counters, counters);
  return `${prefix}_${counters[prefix]}`;
}

// Ticket (senha) por dia: A001, A002...
function nextTicket(dateStr) {
  const dayKey = `ticket_${dateStr}`;
  const counters = loadObj(KEYS.counters);
  counters[dayKey] = (counters[dayKey] || 0) + 1;
  saveObj(KEYS.counters, counters);
  const n = counters[dayKey].toString().padStart(3, '0');
  return `A${n}`;
}

// Seed de profissionais (se não existir)
function ensureProfessionals() {
  let pros = load(KEYS.professionals);
  if (pros.length) return pros;
  pros = [
    { id: nextId('pro'), name: 'Dra. Ana Lima', specialty: 'Psiquiatra', workDays: [1,2,3,4,5], start: '08:00', end: '12:00', slotMinutes: 30 },
    { id: nextId('pro'), name: 'Dr. Bruno Souza', specialty: 'Psicólogo',  workDays: [1,2,3,4,5], start: '13:30', end: '18:00', slotMinutes: 30 },
    { id: nextId('pro'), name: 'Dra. Carla Nogueira', specialty: 'Terapeuta', workDays: [2,4,6], start: '09:00', end: '13:00', slotMinutes: 30 },
    { id: nextId('pro'), name: 'Dr. Diego Santos', specialty: 'Psiquiatra', workDays: [1,3,5], start: '14:00', end: '19:00', slotMinutes: 30 },
  ];
  save(KEYS.professionals, pros);
  return pros;
}

function getPatients() { return load(KEYS.patients); }
function upsertPatient(p) {
  const list = getPatients();
  const idx = list.findIndex(x => x.cpf === p.cpf || x.email === p.email);
  if (idx >= 0) { list[idx] = { ...list[idx], ...p }; }
  else { p.id = nextId('pac'); list.push(p); }
  save(KEYS.patients, list);
  return list.find(x => x.cpf === p.cpf || x.email === p.email);
}
function findPatientByDoc(docOrEmail) {
  return getPatients().find(x => x.cpf === docOrEmail || x.email === docOrEmail);
}

function getProfessionals() { return ensureProfessionals(); }
function filterProfessionalsBySpecialty(s) { return getProfessionals().filter(x => x.specialty === s); }

function getAppointments() { return load(KEYS.appointments); }
function saveAppointments(list) { save(KEYS.appointments, list); }

function isSlotBusy(professionalId, dateStr, timeStr) {
  const appts = getAppointments();
  return appts.some(a =>
    a.professionalId === professionalId &&
    a.date === dateStr &&
    a.time === timeStr &&
    a.status !== 'cancelada'
  );
}

function listSlots(pro, dateStr) {
  // pro: {start,end,slotMinutes, workDays}
  const date = new Date(dateStr + 'T00:00:00');
  const weekday = date.getDay(); // 0=Dom, 1=Seg ...
  if (!pro.workDays.includes(weekday)) return [];

  const toMin = t => {
    const [h,m] = t.split(':').map(Number);
    return h*60 + m;
  };
  const toStr = m => `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;

  const start = toMin(pro.start);
  const end = toMin(pro.end);
  const step = pro.slotMinutes || 30;
  const out = [];
  for (let m = start; m + step <= end; m += step) {
    const time = toStr(m);
    if (!isSlotBusy(pro.id, dateStr, time)) out.push(time);
  }
  return out;
}

function createAppointment({ patientId, specialty, date, time, professionalId, type='consulta' }) {
  const appts = getAppointments();
  const id = nextId('apt');
  const status = 'agendada';
  const rec = { id, patientId, specialty, date, time, professionalId, type, status, createdAt: new Date().toISOString() };
  appts.push(rec);
  saveAppointments(appts);
  return rec;
}

function updateAppointmentStatus(appointmentId, status) {
  const appts = getAppointments();
  const idx = appts.findIndex(a => a.id === appointmentId);
  if (idx >= 0) { appts[idx].status = status; saveAppointments(appts); return appts[idx]; }
  return null;
}

function getQueue() { return load(KEYS.queue); }
function saveQueue(list) { save(KEYS.queue, list); }

function checkIn(appointment) {
  const q = getQueue();
  const dateStr = appointment.date;
  const ticket = nextTicket(dateStr);
  const rec = {
    id: nextId('q'),
    ticket,
    appointmentId: appointment.id,
    patientId: appointment.patientId,
    professionalId: appointment.professionalId,
    status: 'aguardando', // aguardando | chamado | em_atendimento | finalizado | no_show
    createdAt: new Date().toISOString()
  };
  q.push(rec);
  saveQueue(q);
  updateAppointmentStatus(appointment.id, 'checkin');
  return rec;
}

function setQueueStatus(queueId, status) {
  const q = getQueue();
  const idx = q.findIndex(x => x.id === queueId);
  if (idx >= 0) { q[idx].status = status; saveQueue(q); }
  return q[idx] || null;
}

function removeFromQueue(queueId) {
  const q = getQueue().filter(x => x.id !== queueId);
  saveQueue(q);
}

function getFeedbacks() { return load(KEYS.feedbacks); }
function addFeedback({ appointmentId, patientId, rating, comment }) {
  // Classificação NPS
  let label = 'Neutro';
  if (rating >= 9) label = 'Promotor';
  else if (rating <= 6) label = 'Detrator';
  const list = getFeedbacks();
  list.push({
    id: nextId('fb'),
    appointmentId, patientId, rating, comment, label,
    createdAt: new Date().toISOString()
  });
  save(KEYS.feedbacks, list);
  return label;
}

export const db = {
  KEYS,
  getPatients, upsertPatient, findPatientByDoc,
  getProfessionals, filterProfessionalsBySpecialty, listSlots,
  getAppointments, createAppointment, updateAppointmentStatus,
  getQueue, checkIn, setQueueStatus, removeFromQueue,
  getFeedbacks, addFeedback
};