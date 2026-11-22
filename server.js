// THE DETECTIVE ROOM — server lokal tanpa dependensi. Jalankan: node server.js
const http = require('http'), fs = require('fs'), os = require('os');
const PORT = process.env.PORT || 3000, DUR = 40 * 60e3, ASK = 90e3;

// ===== DATA KASUS (tambah kasus baru dengan pola yang sama) =====
const C = {
  title: 'CASE 01 — THE LAST TRANSMISSION',
  brief: 'Dr. Hendra Wirawan (54), kepala Arsip Pertanahan Kota, ditemukan tewas Senin pagi di ruang arsip B1 yang terkunci dari dalam. CCTV lorong menunjukkan tak seorang pun masuk sejak malam. Namun pukul 22:40 sebuah pesan suara dari ekstensi kantor korban diterima ponsel pengembang properti Bram Santoso. Temukan pelaku, motif, metode, dan susunan waktunya. Tidak ada satu dokumen pun yang cukup: gabungkan bukti antar-pemain.',
  suspects: [
    { id: 'laras', n: 'Laras Sekar', d: 'Asisten arsiparis 6 tahun. Punya akses admin sistem telepon & arsip. Dikenal sangat loyal pada korban.' },
    { id: 'bram', n: 'Bram Santoso', d: 'Pengembang properti proyek Menteng. Berselisih dengan korban soal sertifikat tanah.' },
    { id: 'rina', n: 'Rina Wirawan', d: 'Adik kandung korban dan ahli waris. Hidup boros.' },
    { id: 'dimas', n: 'Dimas Pratama', d: 'Satpam malam. Pernah ditegur korban karena sering meninggalkan pos.' }
  ],
  mot: [['a', 'Menutupi penjualan berkas tanah ilegal sebelum audit dikirim'], ['b', 'Mewarisi harta korban untuk melunasi utang'], ['c', 'Mencegah laporan yang merusak proyek properti'], ['d', 'Dendam pribadi karena teguran atasan']],
  met: [['a', 'Meracuni teh di termos sebelum korban mengunci diri; pesan suara dijadwalkan otomatis dari rekaman rapat'], ['b', 'Menyelinap lewat ventilasi saat CCTV mati'], ['c', 'Menggandakan kartu akses dan masuk pukul 22:14'], ['d', 'Menyuntik korban lewat jendela lorong']],
  tl: [
    { k: 't4', t: 'Pintu arsip dikunci dari dalam', pos: 4 }, { k: 't6', t: 'Pesan suara terkirim ke Bram', pos: 6 },
    { k: 't2', t: 'Panggilan terjadwal dibuat di sistem telepon', pos: 2 }, { k: 't1', t: 'Laras masuk arsip membawa termos', pos: 1 },
    { k: 't5', t: 'Dimas meninggalkan pos jaga', pos: 5 }, { k: 't3', t: 'Laras keluar dari gedung', pos: 3 }
  ],
  ev: [
    { id: 'E1', k: 'fisik', t: 'Laporan forensik', x: 'Penyebab: keracunan aconitine. Konsentrasi tertinggi di sisa teh dalam termos korban. Racun bekerja 30–90 menit setelah diminum. Perkiraan waktu kematian 21:30–22:15.' },
    { id: 'E2', k: 'digital', t: 'Log kunci & CCTV B1', x: 'Pintu arsip dikunci dari dalam dengan kartu Hendra pukul 21:10. Tidak ada kartu lain dipakai. CCTV lorong B1 21:10–07:00: tak ada yang masuk atau keluar.' },
    { id: 'E3', k: 'digital', t: 'Pesan suara 22:40', x: 'Diterima ponsel Bram 22:40 dari ekstensi 214 (ruang arsip), 14 detik: "Bram, besok kita bicara. Aku sudah tahu semuanya." Suara dikenali sebagai Hendra.' },
    { id: 'E4', k: 'kesaksian', t: 'Kesaksian Dimas', x: '"Saya di pos sepanjang malam. Jam 22:40 saya dengar Pak Hendra menelepon dari dalam, suaranya jelas sekali."' },
    { id: 'E5', k: 'kesaksian', t: 'Kesaksian Laras', x: '"Saya pulang jam 20:30 dan tidak kembali ke arsip. Pak Hendra masih sehat saat saya pergi."' },
    { id: 'E6', k: 'digital', t: 'Log badge gedung', x: 'Laras keluar lobi 21:05. Dimas keluar lewat pintu belakang (area merokok) 22:14, masuk lagi 22:26.' },
    { id: 'E7', k: 'digital', t: 'Pesan Bram ke Hendra', x: '19:00: "Kalau berkas itu kamu laporkan, kamu akan menyesal."' },
    { id: 'E8', k: 'dokumen', t: 'Surat & tagihan Rina', x: 'Rina ahli waris tunggal Hendra. Tagihan utang Rina Rp400 juta jatuh tempo bulan ini.' },
    { id: 'E9', k: 'dokumen', t: 'Draf audit RAHASIA', x: '12 berkas sertifikat tanah hilang/diubah. Semua akses lewat akun "arsip_asst". Laporan dijadwalkan dikirim ke inspektorat Senin pagi.' },
    { id: 'E10', k: 'fisik', t: 'Termos teh', x: 'Tutup termos bersidik jari Laras dan Hendra. Laras memang biasa menyiapkan teh korban tiap malam.' },
    { id: 'E11', k: 'digital', t: '[TERSEMBUNYI] Log sistem telepon', x: 'Panggilan 22:40 ke Bram adalah "panggilan terjadwal" yang dibuat 20:55 lewat akun admin "arsip_asst". Tidak ada sesi dua arah; hanya memutar rekaman 14 detik.', h: 1 },
    { id: 'E12', k: 'digital', t: '[TERSEMBUNYI] Analisis audio', x: 'Kalimat pada pesan suara identik dengan potongan rekaman rapat internal 12 Nov. File rekaman diedit di workstation Laras.', h: 1 },
    { id: 'E13', k: 'digital', t: '[TERSEMBUNYI] CCTV lorong 20:52', x: 'Laras masuk ruang arsip 20:52 membawa termos, keluar 21:03, lalu meninggalkan gedung 21:05.', h: 1 },
    { id: 'E14', k: 'digital', t: '[TERSEMBUNYI] Kamera ruang jaga', x: 'Pos Dimas kosong 22:14–22:26. Ia mengarang kesaksian karena takut ketahuan meninggalkan pos.', h: 1 },
    { id: 'Q1', k: 'kesaksian', t: 'Tanya Laras: terakhir bertemu?', x: 'Laras: "Sekitar 20:30 saya pamit. Beliau masih sehat di mejanya."', h: 1, ask: ['laras', 'Kapan terakhir kamu bertemu Hendra?'] },
    { id: 'Q2', k: 'kesaksian', t: 'Tanya Laras: siapa buat teh?', x: 'Laras: "Biasanya saya, tapi malam itu Pak Hendra membuat sendiri."', h: 1, ask: ['laras', 'Siapa yang menyiapkan teh Hendra malam itu?'] },
    { id: 'Q3', k: 'kesaksian', t: 'Tanya Dimas: meninggalkan pos?', x: 'Dimas: "Tidak sekali pun. Saya duduk di pos sejak jam 8 malam."', h: 1, ask: ['dimas', 'Apakah kamu meninggalkan pos?'] },
    { id: 'Q4', k: 'kesaksian', t: 'Tanya Dimas: lihat orang?', x: 'Dimas: "Tidak ada siapa pun di lorong. Hanya lampu di bawah pintu menyala."', h: 1, ask: ['dimas', 'Apakah ada orang di lorong B1?'] },
    { id: 'Q5', k: 'kesaksian', t: 'Tanya Bram: maksud pesanmu?', x: 'Bram: "Itu gertakan bisnis. Jam 21 sampai 23 saya makan malam dengan klien di Menteng."', h: 1, ask: ['bram', 'Apa maksud pesanmu ke Hendra?'] },
    { id: 'Q6', k: 'kesaksian', t: 'Tanya Bram: soal pesan suara', x: 'Bram: "Saya baru dengar tengah malam. Anehnya nomornya telepon kantor, bukan ponsel Hendra, dan suaranya seperti tidak menjawab apa pun yang saya bilang."', h: 1, ask: ['bram', 'Bagaimana kamu menerima pesan suara itu?'] },
    { id: 'Q7', k: 'kesaksian', t: 'Tanya Rina: soal utang', x: 'Rina: "Ya, 400 juta. Tapi Hendra sudah janji membantu. Tidak ada alasan saya mencelakainya."', h: 1, ask: ['rina', 'Benarkah kamu berutang besar?'] },
    { id: 'Q8', k: 'kesaksian', t: 'Tanya Rina: di mana malam itu?', x: 'Rina: "Di kereta ke Bandung, berangkat 21:00 sampai tiba 23:30."', h: 1, ask: ['rina', 'Di mana kamu malam itu?'] }
  ],
  combos: { 'E2|E3': 'E11', 'E11|E3': 'E12', 'E5|E6': 'E13', 'E4|E6': 'E14' },
  sol: 'PELAKU: Laras Sekar. MOTIF: menutupi penjualan 12 berkas tanah ilegal (akun arsip_asst) sebelum audit Hendra dikirim Senin. METODE: pukul 20:52 Laras membawa termos teh beracun aconitine ke Hendra, keluar 21:03/21:05. Hendra mengunci diri 21:10 dan meninggal ±21:45 — CCTV memang benar, pelaku sudah pergi sebelum jendela waktu itu. Pukul 20:55 Laras menjadwalkan panggilan otomatis yang memutar potongan rekaman rapat bersuara Hendra ke Bram jam 22:40 agar korban tampak hidup. Dimas bersaksi palsu karena meninggalkan pos 22:14–22:26. Bram dan Rina pengecoh (alibi kuat).'
};
const A = { culprit: 'laras', motive: 'a', method: 'a', liar: 'dimas', fake: ['E3', 'E4', 'E5', 'E7', 'E8'] };
const EV = Object.fromEntries(C.ev.map(e => [e.id, e]));
const BASE = C.ev.filter(e => !e.h).map(e => e.id);

// ===== STATE =====
const rooms = {};
const shuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
const log = (r, t) => r.log.push(t);

function view(r, pid) {
  const me = r.players[pid];
  return {
    code: r.code, phase: r.phase, now: Date.now(), deadline: r.deadline,
    players: Object.entries(r.players).map(([id, p]) => ({ id, name: p.name, ready: p.ready, voted: id in r.votes, locked: r.locks.includes(id) })),
    board: r.board.map(id => EV[id]), links: r.links, log: r.log.slice(-8), draft: r.draft, res: r.res,
    c: { title: C.title, brief: C.brief, suspects: C.suspects, mot: C.mot, met: C.met, tl: C.tl, ask: C.ev.filter(e => e.ask).map(e => ({ id: e.id, s: e.ask[0], q: e.ask[1] })) },
    mine: me ? me.ev.map(id => EV[id]) : [], asked: r.asked
  };
}
function bcast(r) { for (const c of r.cl) c.res.write('data:' + JSON.stringify(view(r, c.pid)) + '\n\n'); }

function score(r) {
  const d = r.draft, s = {};
  s['Pelaku'] = d.culprit == A.culprit ? 25 : 0;
  s['Motif'] = d.motive == A.motive ? 15 : 0;
  s['Metode'] = d.method == A.method ? 15 : 0;
  s['Saksi palsu'] = d.liar == A.liar ? 10 : 0;
  const f = d.fake || [], ok = f.filter(x => A.fake.includes(x)).length - f.filter(x => !A.fake.includes(x)).length;
  s['Bukti palsu'] = Math.max(0, Math.round(10 * ok / A.fake.length));
  s['Kronologi'] = Math.round(10 * C.tl.filter(e => d.time[e.k] == e.pos).length / C.tl.length);
  s['Petunjuk ditemukan'] = Math.round(15 * r.board.filter(id => id[0] == 'E').length / 14);
  const pen = d.culprit == A.culprit ? 0 : 10;
  const total = Math.max(0, Object.values(s).reduce((a, b) => a + b, 0) - pen);
  const rank = total >= 90 ? 'S — Detektif Legendaris' : total >= 75 ? 'A — Detektif Senior' : total >= 55 ? 'B — Detektif' : total >= 35 ? 'C — Magang' : 'D — Kasus Dingin';
  return { parts: s, pen, total, rank, sol: C.sol, mins: Math.round((Date.now() - r.t0) / 6e4) };
}

function api(path, m) {
  if (path === '/api/create') {
    let code; do code = Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.random() * 24 | 0]).join(''); while (rooms[code]);
    rooms[code] = { code, phase: 'lobby', players: {}, board: [], links: [], log: [], votes: {}, locks: [], draft: { time: {}, fake: [] }, unl: [], asked: [], cl: new Set(), res: null };
    return { code, pid: 'host' };
  }
  const r = rooms[(m.code || '').toUpperCase()];
  if (!r) return { err: 'Ruangan tidak ditemukan' };
  if (path === '/api/join') {
    if (r.phase !== 'lobby') return { err: 'Permainan sudah dimulai' };
    if (Object.keys(r.players).length >= 8) return { err: 'Ruangan penuh (maks 8)' };
    const pid = Math.random().toString(36).slice(2, 8);
    r.players[pid] = { name: String(m.name || 'Detektif').slice(0, 16), ready: false, ev: [] };
    bcast(r); return { code: r.code, pid };
  }
  const pid = m.pid, P = r.players, p = P[pid], ids = Object.keys(P);
  switch (m.type) {
    case 'ready': if (p && r.phase === 'lobby') p.ready = !!m.v; break;
    case 'start':
      if (!p || r.phase !== 'lobby' || !ids.length || !ids.every(i => P[i].ready)) break;
      shuffle(BASE).forEach((id, i) => P[ids[i % ids.length]].ev.push(id));
      r.phase = 'play'; r.deadline = Date.now() + DUR; r.t0 = Date.now(); log(r, 'Kasus dibuka. Waktu berjalan.'); break;
    case 'share':
      if (p && r.phase === 'play' && p.ev.includes(m.id) && !r.board.includes(m.id)) { r.board.push(m.id); log(r, `${p.name} menempelkan "${EV[m.id].t}" ke papan.`); } break;
    case 'link': {
      if (!p || r.phase !== 'play' || m.a === m.b || !r.board.includes(m.a) || !r.board.includes(m.b)) break;
      r.links.push({ a: m.a, b: m.b, text: String(m.text || '').slice(0, 120), by: p.name });
      log(r, `${p.name} menghubungkan ${m.a} ↔ ${m.b}.`);
      const un = C.combos[[m.a, m.b].sort().join('|')];
      if (un && !r.unl.includes(un)) { r.unl.push(un); p.ev.push(un); log(r, `📞 ${p.name} menemukan petunjuk tersembunyi!`); }
      break;
    }
    case 'ask': {
      const e = EV[m.id];
      if (!p || r.phase !== 'play' || !e || !e.ask || p.ev.includes(m.id)) break;
      p.ev.push(m.id);
      if (!r.asked.includes(m.id)) { r.asked.push(m.id); r.deadline -= ASK; log(r, `${p.name} menginterogasi ${e.ask[0]} (−90 detik).`); }
      break;
    }
    case 'startvote': if (r.phase === 'play') { r.phase = 'vote'; log(r, 'Voting tersangka dimulai.'); } break;
    case 'vote':
      if (p && r.phase === 'vote' && C.suspects.some(s => s.id === m.s)) {
        r.votes[pid] = m.s;
        if (ids.every(i => i in r.votes)) {
          const cnt = {}; Object.values(r.votes).forEach(v => cnt[v] = (cnt[v] || 0) + 1);
          r.draft.culprit = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0]; r.phase = 'accuse';
        }
      } break;
    case 'draft': {
      if (!p || r.phase !== 'accuse') break;
      const [a, b] = String(m.k).split('.');
      if (!['culprit', 'motive', 'method', 'liar', 'fake', 'time'].includes(a)) break;
      if (b) r.draft.time[b] = +m.v; else r.draft[a] = m.v;
      r.locks = []; break;
    }
    case 'lock':
      if (p && r.phase === 'accuse') {
        if (!r.locks.includes(pid)) r.locks.push(pid);
        if (ids.every(i => r.locks.includes(i))) { r.res = score(r); r.phase = 'done'; }
      } break;
  }
  bcast(r); return { ok: 1 };
}

http.createServer((q, res) => {
  const u = new URL(q.url, 'http://x');
  if (u.pathname === '/') { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); return res.end(fs.readFileSync(__dirname + '/index.html')); }
  if (u.pathname === '/api/info') { res.writeHead(200); return res.end(JSON.stringify({ ip: lan(), all: lans() })); }
  if (u.pathname === '/state') {
    const r = rooms[u.searchParams.get('code')];
    res.writeHead(r ? 200 : 404, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    return res.end(r ? JSON.stringify(view(r, u.searchParams.get('pid'))) : '{}');
  }
  if (u.pathname === '/events') {
    const r = rooms[u.searchParams.get('code')]; if (!r) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    const c = { res, pid: u.searchParams.get('pid') }; r.cl.add(c);
    res.write('data:' + JSON.stringify(view(r, c.pid)) + '\n\n'); q.on('close', () => r.cl.delete(c)); return;
  }
  if (q.method === 'POST') {
    let b = ''; q.on('data', d => b += d);
    q.on('end', () => { let j = {}; try { j = JSON.parse(b); } catch { } res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(api(u.pathname, j))); });
  } else { res.writeHead(404); res.end(); }
}).listen(PORT, () => console.log(`THE DETECTIVE ROOM siap.\nHost (PC): http://localhost:${PORT}\nPemain (HP, satu WiFi), coba salah satu: ${lans().map(i => `http://${i}:${PORT}`).join('  |  ') || 'tidak ada jaringan terdeteksi'}`));

function lans() {
  const a = []; for (const n of Object.values(os.networkInterfaces())) for (const i of n) if ((i.family === 'IPv4' || i.family === 4) && !i.internal) a.push(i.address);
  const w = x => x.startsWith('192.168.') ? 0 : x.startsWith('10.') ? 1 : 2; return a.sort((p, q) => w(p) - w(q));
}
function lan() { return lans()[0] || 'localhost'; }
setInterval(() => { for (const r of Object.values(rooms)) if (r.phase === 'play' && Date.now() > r.deadline) { r.phase = 'vote'; log(r, 'Waktu habis! Voting dimulai.'); bcast(r); } }, 1000);
setInterval(() => { for (const r of Object.values(rooms)) for (const c of r.cl) c.res.write(': ping\n\n'); }, 20000); // heartbeat agar koneksi tidak diputus proxy
