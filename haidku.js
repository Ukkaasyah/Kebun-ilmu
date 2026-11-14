/* =====================================================================
   MESIN HUKUM DARAH WANITA (Mazhab Syafi'i)
   Rujukan utama: Al-Ibanah wal-Ifadhah (syarah Ukkaasyah Abdurrahman),
   Tuhfah, Nihayah, Mughni, Asna al-Mathalib.
   Satuan waktu: milidetik (ms). Semua hitungan berbasis jam.
   ===================================================================== */
(function (root) {
  'use strict';
  const MIN = 60e3, H = 3600e3, D = 24 * H;
  const HAID_MIN = 24 * H;        // sehari semalam
  const HAID_MAX = 15 * D;        // 15 hari 15 malam
  const SUCI_MIN = 15 * D;        // suci di antara dua haid
  const NIFAS_MAX = 60 * D;
  const GAP_TOL = 2 * MIN;        // jeda <= 2 menit dianggap bersambung
  const HIJRI_YEAR = 354.367 * D;

  const COLORS = { hitam: 5, merah: 4, asyqar: 3, kuning: 2, keruh: 1 };
  const COLOR_NAME = { hitam: 'hitam', merah: 'merah', asyqar: 'merah kekuningan (asyqar)', kuning: 'kuning', keruh: 'keruh (kudrah)' };

  /* ---------- Kekuatan darah ----------
     Pembanding berpasangan: sifat kuat = warna lebih kuat, kental, berbau.
     Yang sifat kuatnya lebih banyak, dialah yang lebih kuat. Jika sama: setara. */
  function cmp(a, b) {
    const ra = COLORS[a.color] || 4, rb = COLORS[b.color] || 4;
    const pa = (ra > rb ? 1 : 0) + (a.kental ? 1 : 0) + (a.bau ? 1 : 0);
    const pb = (rb > ra ? 1 : 0) + (b.kental ? 1 : 0) + (b.bau ? 1 : 0);
    return pa - pb;
  }
  const keyOf = u => (u.color || 'merah') + (u.kental ? '+k' : '') + (u.bau ? '+b' : '');
  function sifatText(u) {
    let t = COLOR_NAME[u.color] || u.color;
    if (u.kental) t += ', kental';
    if (u.bau) t += ', berbau';
    return t;
  }

  /* ---------- Persiapan data ---------- */
  function prepare(segments, now) {
    return segments
      .filter(s => s && s.start != null)
      .map(s => ({
        id: s.id, start: +s.start, end: s.end == null ? Math.max(+s.start, now) : +s.end,
        ongoing: s.end == null, color: s.color || 'merah', kental: !!s.kental, bau: !!s.bau, thalq: !!s.thalq
      }))
      .filter(s => s.end > s.start || s.ongoing)
      .sort((a, b) => a.start - b.start);
  }

  // potong satu potongan darah pada rentang [a,b)
  function clip(p, a, b) {
    const s = Math.max(p.start, a), e = Math.min(p.end, b);
    if (e <= s) return null;
    return Object.assign({}, p, { start: s, end: e });
  }

  /* ---------- Kelompok darah "bersambung" (stretch) ---------- */
  function contiguousFrom(pieces, i0) {
    // ambil potongan berturut-turut tanpa jeda
    let end = pieces[i0].end, j = i0 + 1;
    while (j < pieces.length && pieces[j].start - end <= GAP_TOL) { end = Math.max(end, pieces[j].end); j++; }
    return { end, next: j };
  }

  /* ---------- Run (deret sifat sama) ---------- */
  function toRuns(units) {
    const runs = [];
    for (const u of units) {
      const last = runs[runs.length - 1];
      if (last && keyOf(last) === keyOf(u) && u.start - last.end <= GAP_TOL) { last.end = u.end; last.ongoing = u.ongoing; }
      else runs.push(Object.assign({}, u));
    }
    return runs;
  }
  // gabungkan run yang setara kekuatannya (cmp==0) dan bersambung
  function strengthBlocks(runs) {
    const blocks = [];
    for (const r of runs) {
      const last = blocks[blocks.length - 1];
      if (last && cmp(last.rep, r) === 0 && r.start - last.end <= GAP_TOL) { last.end = r.end; last.parts.push(r); }
      else blocks.push({ start: r.start, end: r.end, rep: r, parts: [r] });
    }
    return blocks;
  }
  function strongestRep(blocks) {
    // pemenang terbanyak (Copeland); seri: yang paling awal
    let best = null, bestScore = -1e9;
    blocks.forEach(b => {
      let sc = 0; blocks.forEach(c => { if (b !== c) sc += Math.sign(cmp(b.rep, c.rep)); });
      if (sc > bestScore) { bestScore = sc; best = b; }
    });
    return best ? best.rep : null;
  }

  /* ---------- TAMYIZ untuk satu daur ----------
     Mengembalikan {ok, haid:[s,e], nextStrong, reason, khilaf} */
  function tamyiz(units, pos, stretchEnd, opts, ctx) {
    const isNifas = ctx && ctx.nifas;
    const LIM = isNifas ? NIFAS_MAX : HAID_MAX;
    const look = units.filter(u => u.start < pos + LIM + 30 * D);
    const runs = toRuns(look);
    const blocks = strengthBlocks(runs);
    if (blocks.length < 2) return { ok: false, reason: 'Darahnya hanya satu sifat, tidak bisa dibedakan kuat dan lemahnya.' };
    const top = strongestRep(blocks);
    if (!top) return { ok: false, reason: 'Tidak ada darah yang lebih kuat.' };
    const isStrong = b => cmp(b.rep, top) >= 0;
    const firstIdx = blocks.findIndex(isStrong);
    let R = blocks[firstIdx];
    if (cmp(blocks[0].rep, top) < 0 && blocks.slice(0, firstIdx).every(b => cmp(b.rep, top) < 0)) { /* lemah mendahului */ }
    const weakBefore = R.start - pos;
    let hs = R.start, he = R.end, khilaf = null, merged = false;

    if (isNifas) {
      // Nifas: darah lemah sebelum darah kuat yang >= 15 hari ikut nifas
      if (weakBefore >= SUCI_MIN) hs = pos;
      if (he - ctx.birth > NIFAS_MAX + GAP_TOL) return { ok: false, reason: 'Darah kuatnya melewati 60 hari, tamyiz gugur.' };
      if (he - hs <= 0) return { ok: false, reason: 'Darah kuat tidak ada.' };
      const after = blocks.slice(blocks.indexOf(R) + 1);
      return { ok: true, haid: [hs, he], reason: 'Darah kuat (' + sifatText(R.rep) + ') dihukumi nifas, darah lemah sesudahnya suci (istihadhah).', after };
    }

    // Syarat 1 & 2
    if (R.end - R.start < HAID_MIN) return { ok: false, reason: 'Syarat tamyiz pertama tidak terpenuhi: darah kuat kurang dari sehari semalam.' };
    if (R.end - R.start > HAID_MAX + GAP_TOL) return { ok: false, reason: 'Syarat tamyiz kedua tidak terpenuhi: darah kuat lebih dari 15 hari.' };

    const iR = blocks.indexOf(R);
    const W1 = blocks[iR + 1], W2 = blocks[iR + 2];
    // Satu darah kuat diikuti dua darah lemah
    if (W1 && W2 && !isStrong(W1) && !isStrong(W2) && W1.end - R.start <= HAID_MAX + GAP_TOL && W1.start - R.end <= GAP_TOL) {
      const c = cmp(W1.rep, W2.rep);
      if (c > 0) { he = W1.end; merged = true; }
      else if (c < 0) {
        khilaf = { masalah: 'Darah kuat diikuti darah yang lebih lemah, lalu darah yang lebih kuat darinya',
          ibnuHajar: 'Haidnya darah kuat ditambah darah sesudahnya (' + Math.round((W1.end - R.start) / D) + ' hari), selama jumlahnya tidak lebih dari 15 hari (Tuhfah 1/403).',
          ramli: 'Haidnya darah kuat saja (' + Math.round((R.end - R.start) / D) + ' hari). Demikian pula Al-Khathib (Nihayah 1/342, Mughni 1/113).' };
        if (opts.khilaf === 'ibnuhajar') { he = W1.end; merged = true; }
      }
    }

    // Syarat 3 & 4: darah sesudah haid
    const rest = blocks.slice(blocks.indexOf(R) + 1).filter(b => b.end > he);
    const strongAfter = rest.filter(isStrong);
    // Kasus bergantian di dalam 15 hari, lalu darah lemah terus
    let lastStrongInside = null;
    for (const b of strongAfter) { if (b.end <= R.start + HAID_MAX + GAP_TOL) lastStrongInside = b; else break; }
    if (lastStrongInside) {
      const later = strongAfter.filter(b => b.start >= lastStrongInside.end);
      const nxt = later[0];
      if (!nxt || nxt.start - lastStrongInside.end >= SUCI_MIN) {
        return { ok: true, haid: [R.start, lastStrongInside.end], nextStrong: nxt ? nxt.start : null,
          reason: 'Darah kuat dan lemah bergantian di dalam 15 hari, lalu darah lemah. Dari darah kuat pertama sampai darah kuat terakhir adalah haid.' };
      }
    }
    const S2 = strongAfter[0];
    if (!S2) {
      return { ok: true, haid: [hs, he], nextStrong: null, khilaf,
        reason: (merged ? 'Darah kuat digabung dengan darah lemah yang lebih kuat sesudahnya (jumlahnya tidak lebih dari 15 hari). ' : 'Darah kuat (' + sifatText(R.rep) + ') adalah haid. ') +
          (weakBefore > GAP_TOL ? 'Darah lemah sebelumnya istihadhah. ' : '') + 'Darah lemah sesudahnya istihadhah.' };
    }
    const gap = S2.start - he;
    if (gap >= SUCI_MIN - GAP_TOL) {
      return { ok: true, haid: [hs, he], nextStrong: S2.start, khilaf,
        reason: 'Darah kuat adalah haid. Darah lemah sesudahnya 15 hari atau lebih, jadi layak menjadi masa suci.' };
    }
    // darah kuat datang lagi sebelum 15 hari
    const S2run = contiguousStrong(blocks, S2, isStrong);
    const stops = S2run.end >= stretchEnd - GAP_TOL && !S2run.ongoing;
    if (S2run.end - S2run.start >= SUCI_MIN - GAP_TOL || (S2run.ongoing && S2run.end - S2run.start >= SUCI_MIN - GAP_TOL)) {
      return { ok: false, reason: 'Syarat tamyiz ketiga tidak terpenuhi: darah lemah kurang dari 15 hari, lalu darah kuat datang lagi dan berlanjut.' };
    }
    if (S2run.ongoing && !stops) {
      return { ok: true, pending: true, haid: [hs, he], reason: 'Darah kuat datang lagi sebelum genap 15 hari darah lemah. Status tamyiz ditentukan setelah darah kuat ini berhenti atau genap 15 hari.' };
    }
    const third = rest.filter(isStrong).find(b => b.start >= S2run.end && b.start - S2run.end < SUCI_MIN);
    if (third) return { ok: false, reason: 'Syarat tamyiz keempat tidak terpenuhi: darah kuat dan lemah terus bergantian melewati 15 hari.' };
    // 7-7-7 / 8-8-8 / 10-5-5
    let h2 = he; let kh = khilaf;
    if (S2.start - R.start <= HAID_MAX + GAP_TOL) {
      kh = { masalah: 'Darah kuat, lemah, lalu kuat lagi (seperti hitam 7, merah 7, hitam 7)',
        ibnuHajar: 'Haidnya darah kuat pertama saja (Tuhfah).',
        ramli: 'Haidnya darah kuat pertama ditambah darah lemah sesudahnya, selama tidak lebih dari 15 hari (mengikuti Ibnu Suraij).' };
      if (opts.khilaf === 'ramli') h2 = S2.start;
    }
    return { ok: true, haid: [hs, h2], nextStrong: null, khilaf: kh,
      reason: 'Darah kuat kedua kurang dari 15 hari lalu berhenti, sehingga syarat ketiga tidak dipakai. Ia tetap mumayyizah.' };
  }
  function contiguousStrong(blocks, S, isStrong) {
    let i = blocks.indexOf(S), s = S.start, e = S.end, og = S.rep.ongoing;
    while (blocks[i + 1] && isStrong(blocks[i + 1]) && blocks[i + 1].start - e <= GAP_TOL) { i++; e = blocks[i].end; og = blocks[i].rep.ongoing; }
    return { start: s, end: e, ongoing: og };
  }

  /* =====================================================================
     ANALISIS UTAMA
     input: {segments, births, profile:{birthDate, status, adah:{haidH,suciH}, adahNifasH}, opts:{khilaf}, now}
     output: {blocks:[{start,end,kind,title,detail,khilaf}], haids:[...], status, adah}
     kind: haid | haid_sementara | nifas | istihadhah | fasad | ragu
     ===================================================================== */
  function analyze(input) {
    const now = input.now || Date.now();
    const opts = Object.assign({ khilaf: 'ibnuhajar' }, input.opts || {});
    const prof = input.profile || {};
    const pieces = prepare(input.segments || [], now);
    const births = (input.births || []).map(b => +b.time).sort((a, b) => a - b);
    const out = [];
    const haids = [];
    let adah = prof.adah && prof.adah.haidH ? { haid: prof.adah.haidH * H, suci: (prof.adah.suciH || 24 * 24) * H, source: 'isian' } : null;
    let adahNifas = prof.adahNifasH ? prof.adahNifasH * H : null;
    let lastHaidEnd = null;     // akhir haid terakhir (pagar suci 15 hari)
    let lastNifas = null;       // {birth, end}
    const minAge = prof.birthDate ? +prof.birthDate + 9 * HIJRI_YEAR - 16 * D : null;
    const status = { kind: 'suci', title: 'Suci', detail: '' };

    const push = (start, end, kind, title, detail, extra) => {
      if (end <= start && kind !== 'nifas') return;
      out.push(Object.assign({ start, end, kind, title, detail }, extra || {}));
    };
    const pushBlood = (a, b, kind, title, detail, extra) => {
      // tandai hanya bagian yang benar-benar berdarah (selain haid/nifas yang memakai sahb)
      pieces.forEach(p => { const c = clip(p, a, b); if (c) push(c.start, c.end, kind, title, detail, Object.assign({ ongoing: c.ongoing }, extra || {})); });
    };

    let i = 0, cursor = -Infinity;
    while (i < pieces.length) {
      let p = pieces[i];
      if (p.end <= cursor) { i++; continue; }
      if (p.start < cursor) p = Object.assign({}, p, { start: cursor });
      const S0 = p.start;

      // 0) darah kontraksi menjelang melahirkan
      if (p.thalq) { push(p.start, p.end, 'fasad', 'Dam thalq (darah kontraksi)', 'Darah yang keluar karena kontraksi menjelang melahirkan bukan haid dan bukan nifas, melainkan dam fasad. Ia tetap wajib shalat (Asna 1/114).'); cursor = p.end; i++; continue; }

      // 1) usia belum mungkin haid
      if (minAge && S0 < minAge) {
        const e = Math.min(p.end, minAge);
        push(S0, e, 'fasad', 'Darah sebelum usia haid', 'Usia paling muda haid adalah 9 tahun hijriyah (taqribi, kurang dari 16 hari masih dimaafkan). Darah sebelum itu dam fasad.');
        cursor = e; continue;
      }

      // 2) nifas?
      const B = births.filter(b => b <= S0 + GAP_TOL).pop();
      if (B != null && S0 - B < SUCI_MIN && S0 < B + NIFAS_MAX && !(lastNifas && lastNifas.birth === B)) {
        const res = nifasCase(B, S0);
        cursor = res.cursor; continue;
      }
      // darah kembali setelah nifas yang berhenti (masih di dalam 60 hari, jeda < 15 hari)
      if (lastNifas && S0 < lastNifas.birth + NIFAS_MAX && S0 - lastNifas.end < SUCI_MIN) {
        const res = nifasCase(lastNifas.birth, lastNifas.start, true);
        cursor = res.cursor; continue;
      }

      // 3) pagar suci 15 hari
      if (lastHaidEnd != null && S0 < lastHaidEnd + SUCI_MIN) {
        const fence = lastHaidEnd + SUCI_MIN;
        const e = Math.min(p.end, fence);
        push(S0, e, 'fasad', 'Dam fasad (menggenapkan suci)', 'Darah ini keluar sebelum genap 15 hari suci sejak haid sebelumnya berhenti. Ia dipakai untuk menggenapkan masa suci, jadi bukan haid (Tuhfah 1/399). Shalat dan puasa tetap wajib.', { ongoing: p.ongoing && p.end >= now - GAP_TOL && e === p.end });
        cursor = e; continue;
      }

      // 4) cluster 15 hari
      const S = S0, W = S + HAID_MAX;
      const win = [];
      let k = i, crossing = false;
      while (k < pieces.length && pieces[k].start < W) {
        const c = clip(pieces[k], Math.max(S, cursor), Infinity);
        if (c) { if (c.end > W + GAP_TOL) crossing = true; win.push(c); }
        k++;
      }
      if (!crossing && win.length) {
        // darah yang bersambung tepat melewati batas 15 hari juga dihitung melewati
        const le = Math.max(...win.map(c => c.end));
        if (le >= W - GAP_TOL && pieces[k] && pieces[k].start - le <= GAP_TOL) crossing = true;
      }
      if (!crossing) {
        const blood = win.reduce((a, c) => a + (c.end - c.start), 0);
        const lastEnd = Math.max(...win.map(c => c.end));
        const ongoing = win.some(c => c.ongoing) && now < W;
        if (blood >= HAID_MIN) {
          const prevEnd = lastHaidEnd;
          const naqa = win.length > 1;
          push(S, lastEnd, 'haid', ongoing ? 'Haid (sedang berlangsung)' : 'Haid',
            'Darah ' + (naqa ? 'terputus-putus tetapi jumlahnya ' : '') + 'tidak kurang dari sehari semalam dan tidak melewati 15 hari, jadi semuanya haid' + (naqa ? ', termasuk masa bersih di sela-selanya (qaul as-sahb).' : '.') +
            (win.some(c => c.color === 'kuning' || c.color === 'keruh') ? ' Darah kuning dan keruh di masa yang mungkin haid juga dihukumi haid menurut al-ashahh.' : ''),
            { ongoing, sahb: naqa });
          haids.push({ start: S, end: lastEnd, ongoing });
          if (!ongoing) {
            if (prevEnd != null && !(lastNifas && lastNifas.end > prevEnd)) adah = { haid: lastEnd - S, suci: S - prevEnd, source: 'catatan' };
            else adah = { haid: lastEnd - S, suci: adah ? adah.suci : null, source: 'catatan' };
          }
          lastHaidEnd = lastEnd; cursor = lastEnd; i = k; continue;
        }
        if (ongoing || (now < W && now - lastEnd < HAID_MAX)) {
          if (now < W) {
            push(S, lastEnd, 'haid_sementara', 'Kemungkinan haid (belum genap 24 jam)',
              'Darah sudah keluar di masa yang mungkin haid, maka ia meninggalkan shalat sejak darah keluar. Jika jumlah darahnya sampai 15 hari ke depan tidak mencapai 24 jam, ternyata bukan haid dan shalat yang ditinggalkan wajib diqadha.', { ongoing });
            cursor = lastEnd; i = k; continue;
          }
        }
        win.forEach(c => push(c.start, c.end, 'fasad', 'Dam fasad (kurang dari 24 jam)', 'Jumlah darah dalam 15 hari kurang dari sehari semalam, jadi bukan haid. Shalat yang ditinggalkan karenanya wajib diqadha.'));
        cursor = lastEnd; i = k; continue;
      }

      // 5) Melewati 15 hari: istihadhah dalam haid
      const st = stretchFrom(i, S);
      const res = istihadhahHaid(S, st.end, st.ongoing);
      cursor = st.end; i = st.next;
      continue;
    }

    function stretchFrom(i0, S) {
      // dari S: semua potongan di jendela 15 hari + kelanjutan yang bersambung
      let end = pieces[i0].end, j = i0 + 1, og = pieces[i0].ongoing;
      while (j < pieces.length && (pieces[j].start < S + HAID_MAX || pieces[j].start - end <= GAP_TOL)) {
        end = Math.max(end, pieces[j].end); og = pieces[j].ongoing; j++;
      }
      return { end, next: j, ongoing: og };
    }

    function unitsIn(a, b) { return pieces.map(p => clip(p, a, b)).filter(Boolean); }

    function istihadhahHaid(S, E, ongoing) {
      let pos = S, daur = 1;
      const units = unitsIn(S, E);
      while (pos < E - GAP_TOL) {
        const u = units.map(x => clip(x, pos, E)).filter(Boolean);
        if (!u.length) break;
        const firstMonth = daur === 1;
        const t = tamyiz(u, pos, E, opts);
        let hs, he, next, how, kh = null;
        const bulanTxt = firstMonth ? 'Bulan pertama: selama darah belum melewati 15 hari ia menahan diri seperti wanita haid. Setelah jelas melewati 15 hari, ia mengqadha shalat di luar masa haidnya.' : 'Bulan kedua dan seterusnya: begitu masa haidnya selesai, ia langsung mandi lalu shalat dan puasa.';
        if (t.ok && !t.pending) {
          [hs, he] = t.haid; kh = t.khilaf || null;
          const isMutadah = !!adah || prof.status === 'mutadah';
          // Mu'tadah: kebiasaan dan tamyiz diselingi suci minimal
          if (isMutadah && adah && hs - pos >= adah.haid + SUCI_MIN - GAP_TOL) {
            push(pos, pos + adah.haid, 'haid', 'Haid (mengikuti kebiasaan)', 'Mu\'tadah: antara kebiasaan dan darah kuat diselingi 15 hari, maka kebiasaannya tetap haid, 15 hari sesudahnya suci, dan darah kuat itu haid baru (Bentuk 3).');
            haids.push({ start: pos, end: pos + adah.haid });
            pushBlood(pos + adah.haid, hs, 'istihadhah', 'Istihadhah', 'Darah di luar masa haid. Hukumnya seperti wanita suci: shalat, puasa, wudhu setiap fardhu.');
          } else if (hs > pos) {
            pushBlood(pos, hs, 'istihadhah', 'Istihadhah (darah lemah sebelum darah kuat)', 'Darah lemah yang mendahului darah kuat dihukumi istihadhah.' + (firstMonth ? ' Shalat yang ditinggalkan di masa ini wajib diqadha.' : ''));
          }
          how = (isMutadah ? 'Mu\'tadah mumayyizah: ia mengikuti tamyiz, bukan kebiasaan (Mughni 1/288). ' : 'Mubtada\'ah mumayyizah. ') + t.reason;
          next = t.nextStrong != null ? Math.max(t.nextStrong, he + SUCI_MIN) : E;
        } else if (t.pending) {
          [hs, he] = t.haid;
          push(hs, he, 'haid', 'Haid (sementara, menunggu)', t.reason + ' ' + bulanTxt, { ongoing: false });
          haids.push({ start: hs, end: he });
          pushBlood(he, E, 'haid_sementara', 'Menunggu kejelasan', t.reason + ' Selama menunggu, ia menahan diri seperti wanita haid.', { ongoing });
          lastHaidEnd = he; return;
        } else if (prof.status === 'nasiyah') {
          push(pos, E, 'ragu', 'Mutahayyirah: ihtiyath', 'Ia lupa kebiasaannya dan darahnya tidak bisa dibedakan. Wajib ihtiyath: seperti wanita haid dalam enam hal (bersenang-senang antara pusar dan lutut, membaca Al-Qur\'an di luar shalat, menyentuh dan membawa mushaf, berdiam di masjid, melewati masjid), dan seperti wanita suci dalam shalat, thawaf, puasa, talak, serta mandi untuk setiap fardhu (Bentuk 5). Sebaiknya tanyakan langsung kepada ustadz/ustadzah.', { ongoing });
          return;
        } else if (adah) {
          hs = pos; he = pos + adah.haid; next = he + (adah.suci || 24 * D);
          how = 'Mu\'tadah ghair mumayyizah: ' + t.reason + ' Maka ia dikembalikan kepada kebiasaan haid dan sucinya (daur ' + Math.round(adah.haid / D * 10) / 10 + ' hari haid + ' + Math.round((adah.suci || 24 * D) / D) + ' hari suci).';
        } else {
          hs = pos; he = pos + HAID_MIN; next = pos + 30 * D;
          how = 'Mubtada\'ah ghair mumayyizah: ' + t.reason + ' Haidnya sehari semalam dari awal darah (yang yakin), sucinya 29 hari. Pendapat kedua: 6 atau 7 hari (Nihayah 1/343).';
        }
        push(hs, he, 'haid', 'Haid', how + ' ' + bulanTxt, { khilaf: kh, istihadhah: true });
        haids.push({ start: hs, end: he, istihadhah: true });
        lastHaidEnd = he;
        adah = { haid: he - hs, suci: adah && adah.suci ? adah.suci : null, source: 'istihadhah' };
        if (t.ok && t.nextStrong != null) adah.suci = Math.max(t.nextStrong, he + SUCI_MIN) - he;
        else if (!t.ok && next) adah.suci = next - he;
        const upto = Math.min(next, E);
        pushBlood(he, upto, 'istihadhah', 'Istihadhah',
          'Darah di luar masa haid. Ia dihukumi suci: wajib shalat dan puasa, boleh digauli, dan berwudhu untuk setiap shalat fardhu setelah masuk waktu (membasuh, menyumbat, mengikat, lalu segera shalat).' + (firstMonth ? ' Shalat yang ia tinggalkan pada hari-hari ini di bulan pertama wajib diqadha.' : ''),
          { ongoing });
        if (next >= E - GAP_TOL) break;
        pos = next; daur++;
        if (daur > 40) break;
      }
    }

    function nifasCase(B, S, resume) {
      const END = B + NIFAS_MAX;
      // kumpulkan darah dalam jendela nifas, berhenti di jeda >= 15 hari
      const idx = pieces.findIndex(p => p.end > S);
      let j = idx, lastEnd = S, crossing = false, list = [];
      while (j < pieces.length && pieces[j].start < END) {
        const c = clip(pieces[j], S, Infinity);
        if (c) {
          if (list.length && c.start - lastEnd >= SUCI_MIN) break;
          list.push(c); lastEnd = Math.max(lastEnd, c.end);
          if (c.end > END + GAP_TOL) crossing = true;
        }
        j++;
      }
      if (!crossing && pieces[j] && lastEnd >= END - GAP_TOL && pieces[j].start - lastEnd <= GAP_TOL) crossing = true;
      if (!crossing) {
        const og = list.some(c => c.ongoing);
        push(S, lastEnd, 'nifas', og ? 'Nifas (sedang berlangsung)' : 'Nifas',
          'Darah setelah melahirkan, sebelum lewat 15 hari dari kelahiran dan tidak melewati 60 hari. Paling sedikit sekejap, umumnya 40 hari, paling lama 60 hari (dihitung sejak bayi keluar).' + (list.length > 1 ? ' Darah yang berhenti lalu kembali sebelum 15 hari, semuanya nifas.' : ''), { ongoing: og });
        if (!og) adahNifas = lastEnd - S;
        lastNifas = { birth: B, start: S, end: lastEnd };
        lastHaidEnd = null;
        return { cursor: lastEnd };
      }
      // melewati 60 hari: istihadhah dalam nifas
      let E = lastEnd; let og = list.some(c => c.ongoing);
      // lanjutkan kelanjutan yang bersambung
      let jj = j; while (jj < pieces.length && pieces[jj].start - E <= GAP_TOL) { E = Math.max(E, pieces[jj].end); og = pieces[jj].ongoing; jj++; }
      const units = unitsIn(S, E);
      const t = tamyiz(units, S, E, opts, { nifas: true, birth: B });
      let ne, how;
      if (t.ok) { ne = t.haid[1]; if (t.haid[0] > S) pushBlood(S, t.haid[0], 'istihadhah', 'Istihadhah (sebelum darah kuat)', 'Darah lemah sebelum darah kuat yang kurang dari 15 hari dihukumi istihadhah.'); how = 'Mumayyizah dalam nifas: ' + t.reason; push(t.haid[0], ne, 'nifas', 'Nifas', how); }
      else if (adahNifas) { ne = S + adahNifas; how = 'Mu\'tadah ghair mumayyizah dalam nifas: ikut kebiasaan nifasnya (' + Math.round(adahNifas / D) + ' hari). ' + t.reason; push(S, ne, 'nifas', 'Nifas', how); }
      else { ne = S + MIN; how = 'Ghair mumayyizah dalam nifas: nifasnya paling sedikit, yaitu sekejap (majjah), karena itulah yang yakin. ' + t.reason; push(S, ne, 'nifas', 'Nifas (sekejap)', how); }
      lastNifas = { birth: B, start: S, end: ne };
      // sesudah nifas: suci & haid
      let pos = ne;
      const suci = adah && adah.suci ? adah.suci : 29 * D;
      const hd = adah ? adah.haid : HAID_MIN;
      if (t.ok) {
        pushBlood(ne, E, 'istihadhah', 'Istihadhah (setelah nifas)', 'Darah lemah sesudah nifas dihukumi suci (istihadhah), sedikit atau banyak. Dalam nifas tidak ada syarat 15 hari untuk darah lemah (Tuhfah 1/414).', { ongoing: og });
        lastHaidEnd = null; return { cursor: E };
      }
      let guard = 0;
      while (pos < E && guard++ < 40) {
        const hs = pos + suci, he = hs + hd;
        pushBlood(pos, Math.min(hs, E), 'istihadhah', 'Istihadhah', (guard === 1 ? 'Sesudah nifas ia suci ' + Math.round(suci / D) + ' hari' + (adah ? ' sesuai kebiasaan sucinya' : '') + ', lalu haid ' + (adah ? 'sesuai kebiasaannya' : 'sehari semalam') + ' (Tuhfah). ' : '') + 'Hukumnya seperti wanita suci.', { ongoing: og });
        if (hs >= E) break;
        push(hs, Math.min(he, Math.max(he, hs)), 'haid', 'Haid (daur setelah nifas)', 'Haid dalam istihadhah setelah nifas: ' + (adah ? 'mengikuti kebiasaan haidnya.' : 'sehari semalam, seperti mubtada\'ah ghair mumayyizah.'), { istihadhah: true });
        haids.push({ start: hs, end: he, istihadhah: true });
        lastHaidEnd = he; pos = he;
      }
      return { cursor: E };
    }

    out.sort((a, b) => a.start - b.start);

    // ---------- Status sekarang ----------
    const curr = out.filter(b => b.start <= now && (b.end >= now - GAP_TOL)).pop();
    const bleedingNow = pieces.some(p => p.ongoing);
    if (curr && bleedingNow) {
      Object.assign(status, { kind: curr.kind, title: curr.title, detail: curr.detail, since: curr.start, block: curr });
    } else {
      const lh = haids.filter(h => h.end <= now).pop();
      status.kind = 'suci'; status.title = 'Suci';
      if (lh) {
        status.lastHaid = lh;
        status.suciUntilFence = lh.end + SUCI_MIN;
        if (adah && adah.suci) status.estimate = lh.start + adah.haid + adah.suci;
      }
      status.detail = 'Tidak ada darah yang sedang keluar. Wajib shalat dan ibadah lainnya seperti biasa.';
      if (lastNifas && now < lastNifas.birth + NIFAS_MAX && now - lastNifas.end < SUCI_MIN) status.detail += ' Jika darah kembali sebelum 60 hari dari kelahiran dan jedanya kurang dari 15 hari, darah itu masih nifas.';
    }
    return { blocks: out, haids, status, adah, adahNifas, now };
  }

  const api = { analyze, cmp, COLORS, COLOR_NAME, sifatText, H, D, MIN };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.HaidEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);

/* Waktu shalat — parameter Kemenag RI: Subuh 20°, Isya 18°, Ashar bayangan 1x (Syafi'i), ihtiyath +2 menit */
(function (root) {
  const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
  const sin = d => Math.sin(rad(d)), cos = d => Math.cos(rad(d)), tan = d => Math.tan(rad(d));
  const asin = x => deg(Math.asin(x)), acos = x => deg(Math.acos(Math.max(-1, Math.min(1, x)))), atan2 = (y, x) => deg(Math.atan2(y, x));
  const fix = (a, b) => { a = a - b * Math.floor(a / b); return a < 0 ? a + b : a; };
  const fixAngle = a => fix(a, 360), fixHour = a => fix(a, 24);

  function julian(y, m, d) {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  }
  function sunPos(jd) {
    const D = jd - 2451545.0;
    const g = fixAngle(357.529 + 0.98560028 * D), q = fixAngle(280.459 + 0.98564736 * D);
    const L = fixAngle(q + 1.915 * sin(g) + 0.020 * sin(2 * g));
    const e = 23.439 - 0.00000036 * D;
    const RA = atan2(cos(e) * sin(L), cos(L)) / 15;
    return { decl: asin(sin(e) * sin(L)), eqt: q / 15 - fixHour(RA) };
  }

  // date: {y,m,d}; lat,lng; tz (jam, mis. 7)
  function compute(date, lat, lng, tz) {
    const jd0 = julian(date.y, date.m, date.d) - lng / (15 * 24);
    const mid = t => fixHour(12 - sunPos(jd0 + t / 24).eqt);
    const angleTime = (angle, t, ccw) => {
      const decl = sunPos(jd0 + t / 24).decl, noon = mid(t);
      const T = acos((-sin(angle) - sin(decl) * sin(lat)) / (cos(decl) * cos(lat))) / 15;
      return noon + (ccw ? -T : T);
    };
    const asrTime = (factor, t) => {
      const decl = sunPos(jd0 + t / 24).decl;
      const angle = -deg(Math.atan(1 / (factor + tan(Math.abs(lat - decl)))));
      return angleTime(angle, t, false);
    };
    let t = { fajr: 5, sunrise: 6, dhuha: 7, dhuhr: 12, asr: 15, maghrib: 18, isha: 19 };
    for (let it = 0; it < 2; it++) {
      t = {
        fajr: angleTime(20, t.fajr, true),
        sunrise: angleTime(0.833, t.sunrise, true),
        dhuha: angleTime(-4.5, t.dhuha, true),
        dhuhr: mid(t.dhuhr),
        asr: asrTime(1, t.asr),
        maghrib: angleTime(0.833, t.maghrib, false),
        isha: angleTime(18, t.isha, false)
      };
    }
    const adj = tz - lng / 15;
    const ihtiyat = { fajr: 2, sunrise: -2, dhuha: 2, dhuhr: 3, asr: 2, maghrib: 2, isha: 2 };
    const res = {};
    for (const k in t) res[k] = t[k] + adj + ihtiyat[k] / 60;
    res.imsak = res.fajr - 10 / 60;
    return res; // jam desimal waktu setempat
  }

  // kembalikan Date (ms) untuk tanggal lokal tertentu; tz dipakai untuk konversi
  function forDate(dateMs, loc) {
    const tz = loc.tz;
    const local = new Date(dateMs + tz * 3600e3); // geser ke "jam lokal" dalam UTC
    const y = local.getUTCFullYear(), m = local.getUTCMonth() + 1, d = local.getUTCDate();
    const h = compute({ y, m, d }, loc.lat, loc.lng, tz);
    const base = Date.UTC(y, m - 1, d) - tz * 3600e3; // tengah malam lokal (ms)
    const out = { y, m, d, base };
    for (const k in h) out[k] = base + Math.round(h[k] * 3600) * 1000 - (Math.round(h[k] * 3600) * 1000 % 60000);
    return out;
  }

  const NAMES = { imsak: 'Imsak', fajr: 'Subuh', sunrise: 'Terbit', dhuha: 'Dhuha', dhuhr: 'Zhuhur', asr: 'Ashar', maghrib: 'Maghrib', isha: 'Isya' };
  const RAKAAT = { fajr: 2, dhuhr: 4, asr: 4, maghrib: 3, isha: 4 };

  // jendela waktu shalat fardhu yang memuat t
  function windowAt(t, loc) {
    const today = forDate(t, loc), yest = forDate(t - 86400e3, loc), tom = forDate(t + 86400e3, loc);
    const wins = [
      { k: 'isha', s: yest.isha, e: today.fajr },
      { k: 'fajr', s: today.fajr, e: today.sunrise },
      { k: 'dhuhr', s: today.dhuhr, e: today.asr },
      { k: 'asr', s: today.asr, e: today.maghrib },
      { k: 'maghrib', s: today.maghrib, e: today.isha },
      { k: 'isha', s: today.isha, e: tom.fajr }
    ];
    return wins.find(w => t >= w.s && t < w.e) || null;
  }

  // Kewajiban shalat saat haid/nifas DATANG (qadha) dan BERHENTI (wajib dikerjakan)
  function obligations(startMs, endMs, loc) {
    const res = { atStart: null, atEnd: null };
    if (startMs) {
      const w = windowAt(startMs, loc);
      if (w) {
        const need = (RAKAAT[w.k] + 3) * 60e3; // perkiraan wudhu + shalat
        const el = startMs - w.s;
        res.atStart = { prayer: NAMES[w.k], since: w.s, elapsedMin: Math.round(el / 60e3), wajibQadha: el >= need, needMin: need / 60e3 };
      }
    }
    if (endMs) {
      const w = windowAt(endMs, loc);
      if (w) {
        const list = [NAMES[w.k]];
        if (w.k === 'asr') list.unshift('Zhuhur');
        if (w.k === 'isha') list.unshift('Maghrib');
        res.atEnd = { prayer: NAMES[w.k], wajib: list, until: w.e };
      }
    }
    return res;
  }

  const api = { compute, forDate, windowAt, obligations, NAMES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.PrayTimes = api;
})(typeof window !== 'undefined' ? window : globalThis);

/* Dzikir pagi-petang, setelah shalat, dan doa harian.
   Dipilih yang sahih/hasan. Rujukan derajat mengikuti tahqiq Syaikh Al-Albani dan ulama hadits. */
window.DZIKIR = {
  catatanHaid: 'Bagi wanita yang sedang haid atau nifas: menurut mazhab Syafi\'i, ayat Al-Qur\'an yang ada di dalam dzikir (Ayat Kursi, Al-Ikhlas, Al-Falaq, An-Nas, dua ayat terakhir Al-Baqarah) boleh dibaca dengan niat dzikir, bukan niat membaca Al-Qur\'an. Dzikir dan doa lainnya boleh dibaca seperti biasa.',
  pagipetang: [
    { id: 'kursi', n: 1, waktu: 'both', judul: 'Ayat Kursi',
      ar: 'أَعُوذُ بِاللّٰهِ مِنَ الشَّيْطَانِ الرَّجِيمِ. اللّٰهُ لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
      lat: "A'ūdzu billāhi minasy-syaithānir-rajīm. Allāhu lā ilāha illā huwal-ḥayyul-qayyūm, lā ta'khudzuhū sinatuw wa lā naum, lahū mā fis-samāwāti wa mā fil-arḍ, man dzal-ladzī yasyfa'u 'indahū illā bi-idznih, ya'lamu mā baina aidīhim wa mā khalfahum, wa lā yuḥīṭūna bisyai'im min 'ilmihī illā bimā syā', wasi'a kursiyyuhus-samāwāti wal-arḍ, wa lā ya'ūduhū ḥifẓuhumā, wa huwal-'aliyyul-'aẓīm.",
      arti: 'Allah, tidak ada ilah yang berhak disembah selain Dia, Yang Mahahidup lagi terus-menerus mengurus makhluk-Nya. Dia tidak mengantuk dan tidak tidur. Milik-Nya apa yang ada di langit dan di bumi. Siapa yang dapat memberi syafaat di sisi-Nya tanpa izin-Nya? Dia mengetahui apa yang di hadapan mereka dan di belakang mereka, sedangkan mereka tidak mengetahui sedikit pun dari ilmu-Nya kecuali apa yang Dia kehendaki. Kursi-Nya meliputi langit dan bumi, dan Dia tidak merasa berat memelihara keduanya. Dialah Yang Mahatinggi lagi Mahaagung. (QS. Al-Baqarah: 255)',
      fadhilah: 'Siapa yang membacanya di pagi hari, ia dilindungi dari gangguan jin sampai sore; dan siapa yang membacanya di sore hari, ia dilindungi sampai pagi.',
      src: 'HR. An-Nasa\'i dalam \'Amal al-Yaum wal-Lailah dan Al-Hakim; dishahihkan Al-Albani dalam Shahih at-Targhib.' },
    { id: 'muawwidzat', n: 3, waktu: 'both', judul: 'Al-Ikhlas, Al-Falaq, An-Nas',
      ar: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ. قُلْ هُوَ اللّٰهُ أَحَدٌ ۝ اللّٰهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ\n\nبِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ. قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِنْ شَرِّ مَا خَلَقَ ۝ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ\n\nبِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ. قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلٰهِ النَّاسِ ۝ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ',
      lat: "Qul huwallāhu aḥad. Allāhuṣ-ṣamad. Lam yalid wa lam yūlad. Wa lam yakul lahū kufuwan aḥad.\n\nQul a'ūdzu birabbil-falaq. Min syarri mā khalaq. Wa min syarri ghāsiqin idzā waqab. Wa min syarrin-naffātsāti fil-'uqad. Wa min syarri ḥāsidin idzā ḥasad.\n\nQul a'ūdzu birabbin-nās. Malikin-nās. Ilāhin-nās. Min syarril-waswāsil-khannās. Alladzī yuwaswisu fī ṣudūrin-nās. Minal-jinnati wan-nās.",
      arti: 'Katakanlah: Dialah Allah Yang Maha Esa. Allah tempat bergantung segala sesuatu. Dia tidak beranak dan tidak diperanakkan, dan tidak ada sesuatu pun yang setara dengan-Nya.\n\nKatakanlah: Aku berlindung kepada Rabb yang menguasai waktu subuh, dari kejahatan makhluk yang Dia ciptakan, dari kejahatan malam apabila telah gelap gulita, dari kejahatan para penyihir yang meniup pada buhul-buhul, dan dari kejahatan orang yang dengki apabila ia dengki.\n\nKatakanlah: Aku berlindung kepada Rabb manusia, Raja manusia, Ilah manusia, dari kejahatan bisikan setan yang bersembunyi, yang membisikkan ke dalam dada manusia, dari golongan jin dan manusia.',
      fadhilah: 'Dibaca tiga kali di pagi dan sore hari, cukup baginya dari segala sesuatu.',
      src: 'HR. Abu Dawud no. 5082 dan At-Tirmidzi no. 3575; At-Tirmidzi berkata: hasan shahih.' },
    { id: 'ashbahna', n: 1, waktu: 'both', judul: 'Kerajaan milik Allah',
      ar: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلّٰهِ، وَالْحَمْدُ لِلّٰهِ، لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هٰذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هٰذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
      arP: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلّٰهِ، وَالْحَمْدُ لِلّٰهِ، لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هٰذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هٰذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
      lat: "Aṣbaḥnā wa aṣbaḥal-mulku lillāh, wal-ḥamdu lillāh, lā ilāha illallāhu waḥdahū lā syarīka lah, lahul-mulku wa lahul-ḥamdu wa huwa 'alā kulli syai'in qadīr. Rabbi as'aluka khaira mā fī hādzal-yaumi wa khaira mā ba'dah, wa a'ūdzu bika min syarri mā fī hādzal-yaumi wa syarri mā ba'dah. Rabbi a'ūdzu bika minal-kasali wa sū'il-kibar. Rabbi a'ūdzu bika min 'adzābin fin-nāri wa 'adzābin fil-qabr.",
      latP: "Amsainā wa amsal-mulku lillāh, wal-ḥamdu lillāh, lā ilāha illallāhu waḥdahū lā syarīka lah, lahul-mulku wa lahul-ḥamdu wa huwa 'alā kulli syai'in qadīr. Rabbi as'aluka khaira mā fī hādzihil-lailati wa khaira mā ba'dahā, wa a'ūdzu bika min syarri mā fī hādzihil-lailati wa syarri mā ba'dahā. Rabbi a'ūdzu bika minal-kasali wa sū'il-kibar. Rabbi a'ūdzu bika min 'adzābin fin-nāri wa 'adzābin fil-qabr.",
      arti: 'Kami memasuki waktu pagi dan kerajaan pun milik Allah. Segala puji bagi Allah. Tidak ada ilah yang berhak disembah selain Allah semata, tidak ada sekutu bagi-Nya. Milik-Nya kerajaan dan pujian, dan Dia Mahakuasa atas segala sesuatu. Wahai Rabbku, aku memohon kebaikan hari ini dan kebaikan sesudahnya, dan aku berlindung kepada-Mu dari keburukan hari ini dan keburukan sesudahnya. Wahai Rabbku, aku berlindung kepada-Mu dari kemalasan dan buruknya masa tua. Wahai Rabbku, aku berlindung kepada-Mu dari azab di neraka dan azab di kubur.',
      artiP: 'Kami memasuki waktu sore dan kerajaan pun milik Allah ... aku memohon kebaikan malam ini dan kebaikan sesudahnya, dan aku berlindung kepada-Mu dari keburukan malam ini dan keburukan sesudahnya ...',
      src: 'HR. Muslim no. 2723 dari Abdullah bin Mas\'ud.' },
    { id: 'bika', n: 1, waktu: 'both', judul: 'Dengan-Mu kami hidup',
      ar: 'اللّٰهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
      arP: 'اللّٰهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
      lat: "Allāhumma bika aṣbaḥnā, wa bika amsainā, wa bika naḥyā, wa bika namūtu, wa ilaikan-nusyūr.",
      latP: "Allāhumma bika amsainā, wa bika aṣbaḥnā, wa bika naḥyā, wa bika namūtu, wa ilaikal-maṣīr.",
      arti: 'Ya Allah, dengan-Mu kami memasuki pagi, dengan-Mu kami memasuki sore, dengan-Mu kami hidup, dengan-Mu kami mati, dan kepada-Mu kebangkitan.',
      artiP: 'Ya Allah, dengan-Mu kami memasuki sore, dengan-Mu kami memasuki pagi, dengan-Mu kami hidup, dengan-Mu kami mati, dan kepada-Mu tempat kembali.',
      src: 'HR. At-Tirmidzi no. 3391 dan Abu Dawud no. 5068; dishahihkan Al-Albani.' },
    { id: 'sayyid', n: 1, waktu: 'both', judul: 'Sayyidul Istighfar',
      ar: 'اللّٰهُمَّ أَنْتَ رَبِّي لَا إِلٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
      lat: "Allāhumma anta rabbī lā ilāha illā anta, khalaqtanī wa ana 'abduka, wa ana 'alā 'ahdika wa wa'dika mastaṭa'tu, a'ūdzu bika min syarri mā ṣana'tu, abū'u laka bini'matika 'alayya, wa abū'u bidzanbī, faghfir lī fa innahū lā yaghfirudz-dzunūba illā anta.",
      arti: 'Ya Allah, Engkau Rabbku, tidak ada ilah yang berhak disembah selain Engkau. Engkau menciptakanku dan aku hamba-Mu. Aku berada di atas perjanjian dan janji-Mu semampuku. Aku berlindung kepada-Mu dari keburukan perbuatanku. Aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku, maka ampunilah aku, karena tidak ada yang mengampuni dosa selain Engkau.',
      fadhilah: 'Siapa membacanya di siang hari dengan yakin lalu wafat sebelum sore, ia termasuk penghuni surga. Begitu pula bila dibaca di malam hari.',
      src: 'HR. Al-Bukhari no. 6306 dari Syaddad bin Aus.' },
    { id: 'afwa', n: 1, waktu: 'both', judul: 'Memohon afiat',
      ar: 'اللّٰهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللّٰهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللّٰهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللّٰهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي، وَعَنْ يَمِينِي وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي',
      lat: "Allāhumma innī as'alukal-'afwa wal-'āfiyata fid-dunyā wal-ākhirah. Allāhumma innī as'alukal-'afwa wal-'āfiyata fī dīnī wa dunyāya wa ahlī wa mālī. Allāhummastur 'aurātī wa āmin rau'ātī. Allāhummaḥfaẓnī min baini yadayya wa min khalfī, wa 'an yamīnī wa 'an syimālī, wa min fauqī, wa a'ūdzu bi'aẓamatika an ughtāla min taḥtī.",
      arti: 'Ya Allah, aku memohon ampunan dan keselamatan di dunia dan akhirat. Ya Allah, aku memohon ampunan dan keselamatan dalam agamaku, duniaku, keluargaku, dan hartaku. Ya Allah, tutuplah auratku dan tenteramkan rasa takutku. Ya Allah, jagalah aku dari depan, dari belakang, dari kanan, dari kiri, dan dari atasku. Aku berlindung dengan keagungan-Mu agar tidak dibinasakan dari bawahku.',
      fadhilah: 'Ibnu Umar berkata, Rasulullah ﷺ tidak pernah meninggalkan doa-doa ini pada waktu sore dan pagi.',
      src: 'HR. Abu Dawud no. 5074 dan Ibnu Majah no. 3871; shahih.' },
    { id: 'alimal', n: 1, waktu: 'both', judul: 'Berlindung dari keburukan diri',
      ar: 'اللّٰهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ، فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي، وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءًا أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ',
      lat: "Allāhumma 'ālimal-ghaibi wasy-syahādah, fāṭiras-samāwāti wal-arḍ, rabba kulli syai'in wa malīkah, asyhadu al lā ilāha illā anta, a'ūdzu bika min syarri nafsī, wa min syarrisy-syaiṭāni wa syirkih, wa an aqtarifa 'alā nafsī sū'an au ajurrahū ilā muslim.",
      arti: 'Ya Allah, Yang Mengetahui yang gaib dan yang nyata, Pencipta langit dan bumi, Rabb dan Penguasa segala sesuatu. Aku bersaksi tidak ada ilah yang berhak disembah selain Engkau. Aku berlindung kepada-Mu dari keburukan diriku, dari keburukan setan dan ajakannya kepada syirik, dan dari berbuat keburukan terhadap diriku atau menimpakannya kepada seorang muslim.',
      src: 'HR. At-Tirmidzi no. 3392 dan Abu Dawud no. 5067; shahih.' },
    { id: 'bismillah', n: 3, waktu: 'both', judul: 'Dengan nama Allah',
      ar: 'بِسْمِ اللّٰهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
      lat: "Bismillāhil-ladzī lā yaḍurru ma'asmihī syai'un fil-arḍi wa lā fis-samā', wa huwas-samī'ul-'alīm.",
      arti: 'Dengan nama Allah, yang bersama nama-Nya tidak ada sesuatu pun di bumi maupun di langit yang dapat membahayakan. Dialah Yang Maha Mendengar lagi Maha Mengetahui.',
      fadhilah: 'Siapa membacanya tiga kali di pagi dan sore hari, tidak ada sesuatu pun yang membahayakannya.',
      src: 'HR. Abu Dawud no. 5088 dan At-Tirmidzi no. 3388; hasan shahih.' },
    { id: 'hayyu', n: 1, waktu: 'both', judul: 'Ya Hayyu ya Qayyum',
      ar: 'يَا حَيُّ يَا قَيُّومُ، بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ',
      lat: "Yā ḥayyu yā qayyūm, biraḥmatika astaghīts, aṣliḥ lī sya'nī kullah, wa lā takilnī ilā nafsī ṭarfata 'ain.",
      arti: 'Wahai Yang Mahahidup, wahai Yang terus-menerus mengurus makhluk-Nya, dengan rahmat-Mu aku memohon pertolongan. Perbaikilah seluruh urusanku dan jangan Engkau serahkan aku kepada diriku sendiri walau sekejap mata.',
      fadhilah: 'Nabi ﷺ mewasiatkannya kepada Fathimah untuk dibaca pagi dan sore.',
      src: 'HR. An-Nasa\'i dalam as-Sunan al-Kubra dan Al-Hakim; dihasankan Al-Albani dalam Shahih at-Targhib.' },
    { id: 'fithrah', n: 1, waktu: 'both', judul: 'Di atas fitrah Islam',
      ar: 'أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ ﷺ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا، وَمَا كَانَ مِنَ الْمُشْرِكِينَ',
      arP: 'أَمْسَيْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ ﷺ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا، وَمَا كَانَ مِنَ الْمُشْرِكِينَ',
      lat: "Aṣbaḥnā 'alā fiṭratil-islām, wa 'alā kalimatil-ikhlāṣ, wa 'alā dīni nabiyyinā Muḥammadin ṣallallāhu 'alaihi wa sallam, wa 'alā millati abīnā Ibrāhīma ḥanīfam muslimā, wa mā kāna minal-musyrikīn.",
      latP: "Amsainā 'alā fiṭratil-islām, wa 'alā kalimatil-ikhlāṣ, wa 'alā dīni nabiyyinā Muḥammadin ṣallallāhu 'alaihi wa sallam, wa 'alā millati abīnā Ibrāhīma ḥanīfam muslimā, wa mā kāna minal-musyrikīn.",
      arti: 'Kami memasuki pagi di atas fitrah Islam, di atas kalimat ikhlas, di atas agama Nabi kami Muhammad ﷺ, dan di atas millah bapak kami Ibrahim yang lurus lagi berserah diri, dan ia bukan termasuk orang-orang musyrik.',
      src: 'HR. Ahmad; dishahihkan Al-Albani dalam Shahih al-Jami\'.' },
    { id: 'afini', n: 3, waktu: 'both', judul: 'Memohon kesehatan badan',
      ar: 'اللّٰهُمَّ عَافِنِي فِي بَدَنِي، اللّٰهُمَّ عَافِنِي فِي سَمْعِي، اللّٰهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلٰهَ إِلَّا أَنْتَ. اللّٰهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلٰهَ إِلَّا أَنْتَ',
      lat: "Allāhumma 'āfinī fī badanī, Allāhumma 'āfinī fī sam'ī, Allāhumma 'āfinī fī baṣarī, lā ilāha illā anta. Allāhumma innī a'ūdzu bika minal-kufri wal-faqr, wa a'ūdzu bika min 'adzābil-qabr, lā ilāha illā anta.",
      arti: 'Ya Allah, berilah kesehatan pada badanku. Ya Allah, berilah kesehatan pada pendengaranku. Ya Allah, berilah kesehatan pada penglihatanku. Tidak ada ilah yang berhak disembah selain Engkau. Ya Allah, aku berlindung kepada-Mu dari kekufuran dan kefakiran, dan aku berlindung kepada-Mu dari azab kubur. Tidak ada ilah yang berhak disembah selain Engkau.',
      src: 'HR. Abu Dawud no. 5090 dan Al-Bukhari dalam al-Adab al-Mufrad no. 701; dihasankan Al-Albani dalam Shahih al-Adab al-Mufrad.' },
    { id: 'tasbihadad', n: 3, waktu: 'pagi', judul: 'Tasbih seberat Arsy',
      ar: 'سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ',
      lat: "Subḥānallāhi wa biḥamdih, 'adada khalqih, wa riḍā nafsih, wa zinata 'arsyih, wa midāda kalimātih.",
      arti: 'Mahasuci Allah dan dengan memuji-Nya, sebanyak jumlah makhluk-Nya, sesuai keridhaan-Nya, seberat Arsy-Nya, dan sebanyak tinta kalimat-kalimat-Nya.',
      fadhilah: 'Nabi ﷺ mengucapkannya kepada Juwairiyah selepas Subuh, dan beliau mengabarkan bahwa empat kalimat ini, diucapkan tiga kali, lebih berat timbangannya daripada dzikir Juwairiyah sejak Subuh hingga Dhuha.',
      src: 'HR. Muslim no. 2726.' },
    { id: 'kalimat', n: 3, waktu: 'petang', judul: 'Berlindung dengan kalimat Allah',
      ar: 'أَعُوذُ بِكَلِمَاتِ اللّٰهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
      lat: "A'ūdzu bikalimātillāhit-tāmmāti min syarri mā khalaq.",
      arti: 'Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari keburukan makhluk yang Dia ciptakan.',
      fadhilah: 'Siapa membacanya di sore hari tiga kali, tidak akan membahayakannya sengatan binatang berbisa pada malam itu.',
      src: 'HR. Muslim no. 2709 dan At-Tirmidzi no. 3604 (dengan tiga kali); shahih.' },
    { id: 'akhirbaqarah', n: 1, waktu: 'petang', judul: 'Dua ayat terakhir Al-Baqarah (malam)',
      ar: 'آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللّٰهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِنْ رُسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝ لَا يُكَلِّفُ اللّٰهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِنْ قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
      lat: "Āmanar-rasūlu bimā unzila ilaihi mir rabbihī wal-mu'minūn, kullun āmana billāhi wa malā'ikatihī wa kutubihī wa rusulih, lā nufarriqu baina aḥadim mir rusulih, wa qālū sami'nā wa aṭa'nā ghufrānaka rabbanā wa ilaikal-maṣīr. Lā yukallifullāhu nafsan illā wus'ahā, lahā mā kasabat wa 'alaihā maktasabat, rabbanā lā tu'ākhidznā in nasīnā au akhṭa'nā, rabbanā wa lā taḥmil 'alainā iṣran kamā ḥamaltahū 'alal-ladzīna min qablinā, rabbanā wa lā tuḥammilnā mā lā ṭāqata lanā bih, wa'fu 'annā, waghfir lanā, warḥamnā, anta maulānā fanṣurnā 'alal-qaumil-kāfirīn.",
      arti: 'Rasul telah beriman kepada apa yang diturunkan kepadanya dari Rabbnya, demikian pula orang-orang mukmin. Semuanya beriman kepada Allah, malaikat-malaikat-Nya, kitab-kitab-Nya, dan rasul-rasul-Nya. (Mereka berkata,) "Kami tidak membeda-bedakan seorang pun dari rasul-rasul-Nya." Mereka berkata, "Kami dengar dan kami taat. Ampunilah kami, wahai Rabb kami, dan kepada-Mu tempat kembali." Allah tidak membebani seseorang melainkan sesuai kesanggupannya ... Engkaulah Penolong kami, maka tolonglah kami menghadapi orang-orang kafir. (QS. Al-Baqarah: 285-286)',
      fadhilah: 'Siapa membaca dua ayat terakhir surat Al-Baqarah pada suatu malam, keduanya mencukupinya.',
      src: 'HR. Al-Bukhari no. 5009 dan Muslim no. 808.' },
    { id: 'tahlil10', n: 10, waktu: 'pagi', judul: 'Tahlil',
      ar: 'لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
      lat: "Lā ilāha illallāhu waḥdahū lā syarīka lah, lahul-mulku wa lahul-ḥamdu wa huwa 'alā kulli syai'in qadīr.",
      arti: 'Tidak ada ilah yang berhak disembah selain Allah semata, tidak ada sekutu bagi-Nya. Milik-Nya kerajaan dan milik-Nya segala pujian, dan Dia Mahakuasa atas segala sesuatu.',
      fadhilah: 'Seratus kali dalam sehari: pahalanya seperti memerdekakan sepuluh budak, ditulis seratus kebaikan, dihapus seratus keburukan, dan menjadi penjaga dari setan hari itu sampai sore. Sepuluh kali di pagi hari: setiap kalimat ditulis sepuluh kebaikan, dihapus sepuluh keburukan, dan ia terjaga sampai sore.',
      src: 'Seratus kali: HR. Al-Bukhari no. 3293 dan Muslim no. 2691. Sepuluh kali di pagi hari: HR. An-Nasa\'i dalam \'Amal al-Yaum wal-Lailah; dishahihkan Al-Albani dalam Shahih at-Targhib.' },
    { id: 'subhan100', n: 100, waktu: 'both', judul: 'Tasbih dan tahmid',
      ar: 'سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ',
      lat: "Subḥānallāhi wa biḥamdih.",
      arti: 'Mahasuci Allah dan dengan memuji-Nya.',
      fadhilah: 'Siapa mengucapkannya seratus kali di pagi dan sore hari, tidak ada seorang pun yang datang pada hari kiamat dengan amalan lebih utama darinya, kecuali orang yang mengucapkan seperti itu atau lebih.',
      src: 'HR. Muslim no. 2692.' },
    { id: 'istighfar100', n: 100, waktu: 'pagi', judul: 'Istighfar (dalam sehari)',
      ar: 'أَسْتَغْفِرُ اللّٰهَ وَأَتُوبُ إِلَيْهِ',
      lat: "Astaghfirullāha wa atūbu ilaih.",
      arti: 'Aku memohon ampun kepada Allah dan bertaubat kepada-Nya.',
      fadhilah: 'Nabi ﷺ beristighfar dan bertaubat kepada Allah seratus kali dalam sehari.',
      src: 'HR. Muslim no. 2702 dan Al-Bukhari no. 6307.' }
  ],
  setelahShalat: [
    { id: 'istighfar3', n: 1, judul: 'Istighfar dan pujian keselamatan',
      ar: 'أَسْتَغْفِرُ اللّٰهَ، أَسْتَغْفِرُ اللّٰهَ، أَسْتَغْفِرُ اللّٰهَ. اللّٰهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
      lat: "Astaghfirullāh (3x). Allāhumma antas-salām wa minkas-salām, tabārakta yā dzal-jalāli wal-ikrām.",
      arti: 'Aku memohon ampun kepada Allah (tiga kali). Ya Allah, Engkaulah As-Salam, dan dari-Mu keselamatan. Mahaberkah Engkau, wahai Pemilik keagungan dan kemuliaan.',
      src: 'HR. Muslim no. 591 dari Tsauban.' },
    { id: 'lamani', n: 1, judul: 'Tidak ada yang menghalangi pemberian-Mu',
      ar: 'لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللّٰهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ',
      lat: "Lā ilāha illallāhu waḥdahū lā syarīka lah, lahul-mulku wa lahul-ḥamdu wa huwa 'alā kulli syai'in qadīr. Allāhumma lā māni'a limā a'ṭaita, wa lā mu'ṭiya limā mana'ta, wa lā yanfa'u dzal-jaddi minkal-jadd.",
      arti: 'Tidak ada ilah yang berhak disembah selain Allah semata ... Ya Allah, tidak ada yang dapat menghalangi apa yang Engkau berikan, dan tidak ada yang dapat memberi apa yang Engkau halangi. Tidak bermanfaat kekayaan orang yang kaya di hadapan-Mu.',
      src: 'HR. Al-Bukhari no. 844 dan Muslim no. 593 dari Al-Mughirah bin Syu\'bah.' },
    { id: 'lahawla', n: 1, judul: 'Tahlil Ibnu Zubair',
      ar: 'لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ، لَا إِلٰهَ إِلَّا اللّٰهُ، وَلَا نَعْبُدُ إِلَّا إِيَّاهُ، لَهُ النِّعْمَةُ وَلَهُ الْفَضْلُ، وَلَهُ الثَّنَاءُ الْحَسَنُ، لَا إِلٰهَ إِلَّا اللّٰهُ مُخْلِصِينَ لَهُ الدِّينَ وَلَوْ كَرِهَ الْكَافِرُونَ',
      lat: "Lā ilāha illallāhu waḥdahū lā syarīka lah, lahul-mulku wa lahul-ḥamdu wa huwa 'alā kulli syai'in qadīr. Lā ḥaula wa lā quwwata illā billāh. Lā ilāha illallāh, wa lā na'budu illā iyyāh, lahun-ni'matu wa lahul-faḍlu wa lahuts-tsanā'ul-ḥasan. Lā ilāha illallāhu mukhliṣīna lahud-dīna walau karihal-kāfirūn.",
      arti: '... Tidak ada daya dan kekuatan kecuali dengan pertolongan Allah. Tidak ada ilah yang berhak disembah selain Allah, dan kami tidak menyembah kecuali kepada-Nya. Milik-Nya nikmat, karunia, dan pujian yang baik. Tidak ada ilah yang berhak disembah selain Allah, kami memurnikan agama untuk-Nya walaupun orang-orang kafir membencinya.',
      src: 'HR. Muslim no. 594 dari Abdullah bin Az-Zubair.' },
    { id: 'tasbih33', n: 33, judul: 'Tasbih, tahmid, takbir',
      ar: 'سُبْحَانَ اللّٰهِ\nالْحَمْدُ لِلّٰهِ\nاللّٰهُ أَكْبَرُ\nلَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
      lat: "Subḥānallāh (33x), Al-ḥamdu lillāh (33x), Allāhu akbar (33x). Penutup: Lā ilāha illallāhu waḥdahū lā syarīka lah, lahul-mulku wa lahul-ḥamdu wa huwa 'alā kulli syai'in qadīr.",
      arti: 'Mahasuci Allah, segala puji bagi Allah, Allah Mahabesar, masing-masing tiga puluh tiga kali, lalu digenapkan seratus dengan tahlil.',
      fadhilah: 'Diampuni kesalahannya walaupun sebanyak buih di lautan.',
      src: 'HR. Muslim no. 597 dari Abu Hurairah.' },
    { id: 'kursiShalat', n: 1, judul: 'Ayat Kursi setiap selesai shalat',
      ar: 'اللّٰهُ لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ... وَهُوَ الْعَلِيُّ الْعَظِيمُ',
      lat: "Allāhu lā ilāha illā huwal-ḥayyul-qayyūm ... (lihat teks lengkap di dzikir pagi).",
      arti: 'Lihat teks lengkap Ayat Kursi di menu dzikir pagi petang.',
      fadhilah: 'Siapa membacanya setiap selesai shalat wajib, tidak ada yang menghalanginya masuk surga selain kematian.',
      src: 'HR. An-Nasa\'i dalam as-Sunan al-Kubra; dishahihkan Al-Albani dalam Shahih al-Jami\'.' },
    { id: 'muawShalat', n: 1, judul: 'Al-Ikhlas, Al-Falaq, An-Nas',
      ar: 'قُلْ هُوَ اللّٰهُ أَحَدٌ ... قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ... قُلْ أَعُوذُ بِرَبِّ النَّاسِ ...',
      lat: "Dibaca sekali setiap selesai shalat. Setelah Subuh dan Maghrib dibaca tiga kali (masuk dalam dzikir pagi dan petang).",
      arti: 'Teks lengkap ada di menu dzikir pagi petang.',
      src: 'HR. Abu Dawud no. 1523 dan An-Nasa\'i dari \'Uqbah bin \'Amir; shahih.' },
    { id: 'ainni', n: 1, judul: 'Wasiat Nabi kepada Mu\'adz',
      ar: 'اللّٰهُمَّ أَعِنِّي عَلَى ذِكْرِكَ، وَشُكْرِكَ، وَحُسْنِ عِبَادَتِكَ',
      lat: "Allāhumma a'innī 'alā dzikrika, wa syukrika, wa ḥusni 'ibādatik.",
      arti: 'Ya Allah, tolonglah aku untuk berdzikir kepada-Mu, bersyukur kepada-Mu, dan beribadah kepada-Mu dengan baik.',
      src: 'HR. Abu Dawud no. 1522 dan An-Nasa\'i no. 1303; shahih.' },
    { id: 'qini', n: 1, judul: 'Lindungi aku dari azab-Mu',
      ar: 'رَبِّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
      lat: "Rabbi qinī 'adzābaka yauma tab'atsu 'ibādak.",
      arti: 'Wahai Rabbku, lindungilah aku dari azab-Mu pada hari Engkau membangkitkan hamba-hamba-Mu.',
      src: 'HR. Muslim no. 709 dari Al-Bara\' bin \'Azib: para sahabat mendengar Nabi ﷺ membacanya selepas shalat.' },
    { id: 'tahlilSubuh', n: 10, judul: 'Tahlil setelah Subuh dan Maghrib',
      ar: 'لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
      lat: "Lā ilāha illallāhu waḥdahū lā syarīka lah, lahul-mulku wa lahul-ḥamdu yuḥyī wa yumītu wa huwa 'alā kulli syai'in qadīr.",
      arti: 'Tidak ada ilah yang berhak disembah selain Allah semata, tidak ada sekutu bagi-Nya. Milik-Nya kerajaan dan pujian. Dia yang menghidupkan dan mematikan, dan Dia Mahakuasa atas segala sesuatu.',
      src: 'HR. At-Tirmidzi no. 3474 dan Ahmad; dihasankan Al-Albani dalam Shahih at-Targhib.' },
    { id: 'ilmuNafi', n: 1, judul: 'Setelah salam shalat Subuh',
      ar: 'اللّٰهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
      lat: "Allāhumma innī as'aluka 'ilman nāfi'ā, wa rizqan ṭayyibā, wa 'amalan mutaqabbalā.",
      arti: 'Ya Allah, aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang baik, dan amal yang diterima.',
      src: 'HR. Ibnu Majah no. 925 dari Ummu Salamah; dishahihkan Al-Albani.' }
  ],
  harian: [
    { kat: 'Tidur', judul: 'Bangun tidur', ar: 'الْحَمْدُ لِلّٰهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', lat: "Al-ḥamdu lillāhil-ladzī aḥyānā ba'da mā amātanā wa ilaihin-nusyūr.", arti: 'Segala puji bagi Allah yang menghidupkan kami setelah mematikan kami, dan kepada-Nya kebangkitan.', src: 'HR. Al-Bukhari no. 6312.' },
    { kat: 'Tidur', judul: 'Sebelum tidur', ar: 'بِاسْمِكَ اللّٰهُمَّ أَمُوتُ وَأَحْيَا', lat: "Bismikallāhumma amūtu wa aḥyā.", arti: 'Dengan nama-Mu, ya Allah, aku mati dan aku hidup.', src: 'HR. Al-Bukhari no. 6324 dari Hudzaifah.' },
    { kat: 'Tidur', judul: 'Sebelum tidur (meniup kedua telapak tangan)', ar: 'قُلْ هُوَ اللّٰهُ أَحَدٌ، قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، قُلْ أَعُوذُ بِرَبِّ النَّاسِ', lat: "Mengumpulkan kedua telapak tangan, meniupnya, membaca Al-Ikhlas, Al-Falaq, dan An-Nas, lalu mengusapkannya ke tubuh semampunya, dimulai dari kepala dan wajah. Dilakukan tiga kali.", arti: 'Amalan Nabi ﷺ setiap malam ketika hendak tidur.', src: 'HR. Al-Bukhari no. 5017 dari Aisyah.' },
    { kat: 'Bersuci', judul: 'Masuk kamar mandi', ar: 'بِسْمِ اللّٰهِ. اللّٰهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ', lat: "Bismillāh. Allāhumma innī a'ūdzu bika minal-khubutsi wal-khabā'its.", arti: 'Dengan nama Allah. Ya Allah, aku berlindung kepada-Mu dari setan laki-laki dan setan perempuan.', src: 'Basmalah: HR. At-Tirmidzi no. 606 (shahih). Doa: HR. Al-Bukhari no. 142 dan Muslim no. 375.' },
    { kat: 'Bersuci', judul: 'Keluar kamar mandi', ar: 'غُفْرَانَكَ', lat: "Ghufrānak.", arti: 'Aku memohon ampunan-Mu.', src: 'HR. Abu Dawud no. 30 dan At-Tirmidzi no. 7; shahih.' },
    { kat: 'Bersuci', judul: 'Sebelum wudhu', ar: 'بِسْمِ اللّٰهِ', lat: "Bismillāh.", arti: 'Dengan nama Allah.', src: 'HR. Abu Dawud no. 101 dan Ibnu Majah no. 399; dihasankan dengan jalan-jalannya.' },
    { kat: 'Bersuci', judul: 'Setelah wudhu', ar: 'أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ. اللّٰهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ، وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ', lat: "Asyhadu al lā ilāha illallāhu waḥdahū lā syarīka lah, wa asyhadu anna Muḥammadan 'abduhū wa rasūluh. Allāhummaj'alnī minat-tawwābīna waj'alnī minal-mutaṭahhirīn.", arti: 'Aku bersaksi tidak ada ilah yang berhak disembah selain Allah semata, tidak ada sekutu bagi-Nya, dan aku bersaksi bahwa Muhammad adalah hamba dan utusan-Nya. Ya Allah, jadikanlah aku termasuk orang-orang yang bertaubat dan orang-orang yang menyucikan diri.', src: 'HR. Muslim no. 234; tambahan doa: HR. At-Tirmidzi no. 55 (shahih).' },
    { kat: 'Rumah', judul: 'Keluar rumah', ar: 'بِسْمِ اللّٰهِ، تَوَكَّلْتُ عَلَى اللّٰهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ', lat: "Bismillāh, tawakkaltu 'alallāh, wa lā ḥaula wa lā quwwata illā billāh.", arti: 'Dengan nama Allah, aku bertawakal kepada Allah. Tidak ada daya dan kekuatan kecuali dengan pertolongan Allah.', src: 'HR. Abu Dawud no. 5095 dan At-Tirmidzi no. 3426; shahih.' },
    { kat: 'Rumah', judul: 'Masuk rumah', ar: 'بِسْمِ اللّٰهِ\nالسَّلَامُ عَلَيْكُمْ', lat: "Menyebut nama Allah ketika masuk, lalu mengucapkan salam kepada penghuni rumah.", arti: 'Jika seseorang menyebut nama Allah ketika masuk rumah dan ketika makan, setan berkata kepada teman-temannya: tidak ada tempat bermalam dan tidak ada makan malam bagi kalian.', src: 'HR. Muslim no. 2018 dari Jabir; dan QS. An-Nur: 61 tentang salam.' },
    { kat: 'Masjid', judul: 'Masuk masjid', ar: 'أَعُوذُ بِاللّٰهِ الْعَظِيمِ، وَبِوَجْهِهِ الْكَرِيمِ، وَسُلْطَانِهِ الْقَدِيمِ، مِنَ الشَّيْطَانِ الرَّجِيمِ. بِسْمِ اللّٰهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللّٰهِ. اللّٰهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', lat: "A'ūdzu billāhil-'aẓīm, wa biwajhihil-karīm, wa sulṭānihil-qadīm, minasy-syaiṭānir-rajīm. Bismillāh, waṣ-ṣalātu was-salāmu 'alā rasūlillāh. Allāhummaftaḥ lī abwāba raḥmatik.", arti: 'Aku berlindung kepada Allah Yang Mahaagung, dengan wajah-Nya yang mulia dan kekuasaan-Nya yang terdahulu, dari setan yang terkutuk. Dengan nama Allah, shalawat dan salam atas Rasulullah. Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.', src: 'HR. Abu Dawud no. 466 (shahih) dan Muslim no. 713.' },
    { kat: 'Masjid', judul: 'Keluar masjid', ar: 'بِسْمِ اللّٰهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللّٰهِ، اللّٰهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ', lat: "Bismillāh, waṣ-ṣalātu was-salāmu 'alā rasūlillāh. Allāhumma innī as'aluka min faḍlik.", arti: 'Dengan nama Allah, shalawat dan salam atas Rasulullah. Ya Allah, aku memohon kepada-Mu dari karunia-Mu.', src: 'HR. Muslim no. 713 dan Ibnu Majah no. 773.' },
    { kat: 'Makan', judul: 'Sebelum makan', ar: 'بِسْمِ اللّٰهِ', lat: "Bismillāh. Jika lupa di awal: Bismillāhi awwalahū wa ākhirah.", arti: 'Dengan nama Allah. (Jika lupa: Dengan nama Allah, di awal dan di akhirnya.)', src: 'HR. Abu Dawud no. 3767 dan At-Tirmidzi no. 1858; shahih.' },
    { kat: 'Makan', judul: 'Setelah makan', ar: 'الْحَمْدُ لِلّٰهِ الَّذِي أَطْعَمَنِي هٰذَا، وَرَزَقَنِيهِ، مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ', lat: "Al-ḥamdu lillāhil-ladzī aṭ'amanī hādzā, wa razaqanīhi, min ghairi ḥaulim minnī wa lā quwwah.", arti: 'Segala puji bagi Allah yang memberiku makanan ini dan merezekikannya kepadaku tanpa daya dan kekuatan dariku.', fadhilah: 'Diampuni dosanya yang telah lalu.', src: 'HR. Abu Dawud no. 4023 dan At-Tirmidzi no. 3458; hasan.' },
    { kat: 'Pakaian', judul: 'Memakai pakaian', ar: 'الْحَمْدُ لِلّٰهِ الَّذِي كَسَانِي هٰذَا الثَّوْبَ، وَرَزَقَنِيهِ، مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ', lat: "Al-ḥamdu lillāhil-ladzī kasānī hādzats-tsauba, wa razaqanīhi, min ghairi ḥaulim minnī wa lā quwwah.", arti: 'Segala puji bagi Allah yang memberiku pakaian ini dan merezekikannya kepadaku tanpa daya dan kekuatan dariku.', src: 'HR. Abu Dawud no. 4023; hasan.' },
    { kat: 'Perjalanan', judul: 'Naik kendaraan', ar: 'بِسْمِ اللّٰهِ، الْحَمْدُ لِلّٰهِ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ. الْحَمْدُ لِلّٰهِ، اللّٰهُ أَكْبَرُ، سُبْحَانَكَ اللّٰهُمَّ إِنِّي ظَلَمْتُ نَفْسِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ', lat: "Bismillāh, al-ḥamdu lillāh, subḥānal-ladzī sakhkhara lanā hādzā wa mā kunnā lahū muqrinīn, wa innā ilā rabbinā lamunqalibūn. Al-ḥamdu lillāh (3x), Allāhu akbar (3x), subḥānakallāhumma innī ẓalamtu nafsī faghfir lī fa innahū lā yaghfirudz-dzunūba illā anta.", arti: 'Dengan nama Allah, segala puji bagi Allah. Mahasuci Allah yang telah menundukkan kendaraan ini untuk kami, padahal kami sebelumnya tidak mampu menguasainya, dan sesungguhnya kami akan kembali kepada Rabb kami ... Mahasuci Engkau ya Allah, sungguh aku telah menzalimi diriku, maka ampunilah aku.', src: 'HR. Abu Dawud no. 2602 dan At-Tirmidzi no. 3446; shahih.' },
    { kat: 'Cuaca', judul: 'Ketika turun hujan', ar: 'اللّٰهُمَّ صَيِّبًا نَافِعًا', lat: "Allāhumma ṣayyiban nāfi'ā.", arti: 'Ya Allah, jadikanlah hujan ini hujan yang bermanfaat.', src: 'HR. Al-Bukhari no. 1032.' },
    { kat: 'Cuaca', judul: 'Setelah hujan', ar: 'مُطِرْنَا بِفَضْلِ اللّٰهِ وَرَحْمَتِهِ', lat: "Muṭirnā bifaḍlillāhi wa raḥmatih.", arti: 'Kami diberi hujan karena karunia Allah dan rahmat-Nya.', src: 'HR. Al-Bukhari no. 846 dan Muslim no. 71.' },
    { kat: 'Perasaan', judul: 'Ketika marah', ar: 'أَعُوذُ بِاللّٰهِ مِنَ الشَّيْطَانِ الرَّجِيمِ', lat: "A'ūdzu billāhi minasy-syaiṭānir-rajīm.", arti: 'Aku berlindung kepada Allah dari setan yang terkutuk.', src: 'HR. Al-Bukhari no. 3282 dan Muslim no. 2610.' },
    { kat: 'Perasaan', judul: 'Ketika sedih dan gelisah', ar: 'لَا إِلٰهَ إِلَّا اللّٰهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلٰهَ إِلَّا اللّٰهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلٰهَ إِلَّا اللّٰهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ', lat: "Lā ilāha illallāhul-'aẓīmul-ḥalīm, lā ilāha illallāhu rabbul-'arsyil-'aẓīm, lā ilāha illallāhu rabbus-samāwāti wa rabbul-arḍi wa rabbul-'arsyil-karīm.", arti: 'Tidak ada ilah yang berhak disembah selain Allah Yang Mahaagung lagi Maha Penyantun. Tidak ada ilah yang berhak disembah selain Allah, Rabb Arsy yang agung. Tidak ada ilah yang berhak disembah selain Allah, Rabb langit, Rabb bumi, dan Rabb Arsy yang mulia.', src: 'HR. Al-Bukhari no. 6346 dan Muslim no. 2730.' },
    { kat: 'Perasaan', judul: 'Ketika tertimpa musibah', ar: 'إِنَّا لِلّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللّٰهُمَّ أْجُرْنِي فِي مُصِيبَتِي، وَأَخْلِفْ لِي خَيْرًا مِنْهَا', lat: "Innā lillāhi wa innā ilaihi rāji'ūn. Allāhumma'jurnī fī muṣībatī, wa akhlif lī khairan minhā.", arti: 'Sesungguhnya kami milik Allah dan kepada-Nya kami kembali. Ya Allah, berilah aku pahala dalam musibahku dan gantikanlah untukku yang lebih baik darinya.', fadhilah: 'Ummu Salamah membacanya ketika Abu Salamah wafat, lalu Allah menggantikan untuknya Rasulullah ﷺ.', src: 'HR. Muslim no. 918.' },
    { kat: 'Sosial', judul: 'Ketika bersin', ar: 'الْحَمْدُ لِلّٰهِ\nيَرْحَمُكِ اللّٰهُ\nيَهْدِيكُمُ اللّٰهُ وَيُصْلِحُ بَالَكُمْ', lat: "Yang bersin: Al-ḥamdu lillāh. Yang mendengar: Yarḥamukillāh (kepada perempuan) / Yarḥamukallāh (kepada laki-laki). Yang bersin membalas: Yahdīkumullāhu wa yuṣliḥu bālakum.", arti: 'Segala puji bagi Allah. Semoga Allah merahmatimu. Semoga Allah memberimu petunjuk dan memperbaiki keadaanmu.', src: 'HR. Al-Bukhari no. 6224.' },
    { kat: 'Sosial', judul: 'Menjenguk orang sakit', ar: 'لَا بَأْسَ، طَهُورٌ إِنْ شَاءَ اللّٰهُ', lat: "Lā ba's, ṭahūrun in syā'allāh.", arti: 'Tidak mengapa, semoga sakit ini menyucikan (dari dosa), insya Allah.', src: 'HR. Al-Bukhari no. 3616.' },
    { kat: 'Sosial', judul: 'Mendoakan pengantin', ar: 'بَارَكَ اللّٰهُ لَكَ، وَبَارَكَ عَلَيْكَ، وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ', lat: "Bārakallāhu laka, wa bāraka 'alaika, wa jama'a bainakumā fī khair. (Kepada pengantin perempuan: laki, 'alaiki.)", arti: 'Semoga Allah memberkahimu, melimpahkan keberkahan atasmu, dan mengumpulkan kalian berdua dalam kebaikan.', src: 'HR. Abu Dawud no. 2130 dan At-Tirmidzi no. 1091; shahih.' },
    { kat: 'Shalat', judul: 'Setelah mendengar azan', ar: 'اللّٰهُمَّ رَبَّ هٰذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ', lat: "Allāhumma rabba hādzihid-da'watit-tāmmah, waṣ-ṣalātil-qā'imah, āti Muḥammadanil-wasīlata wal-faḍīlah, wab'atshu maqāmam maḥmūdanil-ladzī wa'adtah.", arti: 'Ya Allah, Rabb seruan yang sempurna ini dan shalat yang akan didirikan, berikanlah kepada Muhammad wasilah dan keutamaan, dan bangkitkanlah beliau pada kedudukan terpuji yang telah Engkau janjikan.', fadhilah: 'Wanita yang sedang haid tetap boleh menjawab azan dan membaca doa ini.', src: 'HR. Al-Bukhari no. 614 dari Jabir.' },
    { kat: 'Umum', judul: 'Kebaikan dunia dan akhirat', ar: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً، وَفِي الْآخِرَةِ حَسَنَةً، وَقِنَا عَذَابَ النَّارِ', lat: "Rabbanā ātinā fid-dunyā ḥasanah, wa fil-ākhirati ḥasanah, wa qinā 'adzāban-nār.", arti: 'Wahai Rabb kami, berikanlah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari azab neraka.', fadhilah: 'Doa yang paling sering dibaca Nabi ﷺ.', src: 'HR. Al-Bukhari no. 6389 dan Muslim no. 2690 dari Anas.' }
  ]
};

/* Tambahan doa harian pilihan dari Hisnul Muslim (Sa'id bin Wahf Al-Qahthani). */
window.DZIKIR.harian.push(
  { kat: 'Tidur', judul: 'Ketika merebahkan badan', ar: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ', lat: "Bismika rabbī waḍa'tu janbī, wa bika arfa'uh, fa in amsakta nafsī farḥamhā, wa in arsaltahā faḥfaẓhā bimā taḥfaẓu bihī 'ibādakaṣ-ṣāliḥīn.", arti: 'Dengan nama-Mu, wahai Rabbku, aku merebahkan lambungku, dan dengan-Mu aku mengangkatnya. Jika Engkau menahan jiwaku, rahmatilah ia. Jika Engkau melepaskannya, jagalah ia sebagaimana Engkau menjaga hamba-hamba-Mu yang shalih.', src: 'HR. Al-Bukhari no. 6320 dan Muslim no. 2714. Hisnul Muslim bab 28.' },
  { kat: 'Tidur', judul: 'Tasbih Fathimah sebelum tidur', ar: 'سُبْحَانَ اللّٰهِ، الْحَمْدُ لِلّٰهِ، اللّٰهُ أَكْبَرُ', lat: "Subḥānallāh (33x), Al-ḥamdu lillāh (33x), Allāhu akbar (34x).", arti: 'Mahasuci Allah, segala puji bagi Allah, Allah Mahabesar.', fadhilah: 'Fathimah meminta pembantu kepada Nabi ﷺ karena lelah bekerja di rumah. Beliau bersabda, "Maukah aku tunjukkan yang lebih baik bagi kalian berdua daripada pembantu?" lalu mengajarkan dzikir ini.', src: 'HR. Al-Bukhari no. 3705 dan Muslim no. 2727. Hisnul Muslim bab 28.' },
  { kat: 'Tidur', judul: 'Ayat Kursi sebelum tidur', ar: 'اللّٰهُ لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ... وَهُوَ الْعَلِيُّ الْعَظِيمُ', lat: "Teks lengkap ada di menu dzikir pagi.", arti: 'Siapa membacanya ketika hendak tidur, ia terus dijaga oleh Allah dan setan tidak mendekatinya sampai pagi.', src: 'HR. Al-Bukhari no. 2311 dari Abu Hurairah. Hisnul Muslim bab 28.' },
  { kat: 'Tidur', judul: 'Gelisah atau takut ketika tidur', ar: 'أَعُوذُ بِكَلِمَاتِ اللّٰهِ التَّامَّةِ مِنْ غَضَبِهِ وَعِقَابِهِ، وَشَرِّ عِبَادِهِ، وَمِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَنْ يَحْضُرُونِ', lat: "A'ūdzu bikalimātillāhit-tāmmati min ghaḍabihī wa 'iqābih, wa syarri 'ibādih, wa min hamazātisy-syayāṭīni wa an yaḥḍurūn.", arti: 'Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari murka dan siksa-Nya, dari keburukan hamba-hamba-Nya, dari bisikan setan, dan dari kehadiran mereka.', src: 'HR. Abu Dawud no. 3893 dan At-Tirmidzi no. 3528; hasan. Hisnul Muslim bab 30.' },
  { kat: 'Tidur', judul: 'Mimpi buruk', ar: 'أَعُوذُ بِاللّٰهِ مِنَ الشَّيْطَانِ الرَّجِيمِ', lat: "Meludah ringan ke kiri tiga kali, berlindung kepada Allah dari setan dan dari keburukan mimpi itu tiga kali, tidak menceritakannya kepada siapa pun, lalu berpindah posisi tidur. Boleh juga bangun lalu shalat (bagi yang tidak haid).", arti: 'Aku berlindung kepada Allah dari setan yang terkutuk.', fadhilah: 'Mimpi itu tidak akan membahayakannya.', src: 'HR. Muslim no. 2261, 2262, 2263. Hisnul Muslim bab 31.' },
  { kat: 'Perasaan', judul: 'Ketika sedih dan banyak pikiran', ar: 'اللّٰهُمَّ إِنِّي أَمَتُكَ، بِنْتُ عَبْدِكَ، بِنْتُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ، أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ، سَمَّيْتَ بِهِ نَفْسَكَ، أَوْ أَنْزَلْتَهُ فِي كِتَابِكَ، أَوْ عَلَّمْتَهُ أَحَدًا مِنْ خَلْقِكَ، أَوِ اسْتَأْثَرْتَ بِهِ فِي عِلْمِ الْغَيْبِ عِنْدَكَ، أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي، وَنُورَ صَدْرِي، وَجَلَاءَ حُزْنِي، وَذَهَابَ هَمِّي', lat: "Allāhumma innī amatuk, bintu 'abdik, bintu amatik, nāṣiyatī biyadik, māḍin fiyya ḥukmuk, 'adlun fiyya qaḍā'uk, as'aluka bikulli ismin huwa lak, sammaita bihī nafsak, au anzaltahū fī kitābik, au 'allamtahū aḥadam min khalqik, awista'tsarta bihī fī 'ilmil-ghaibi 'indak, an taj'alal-qur'āna rabī'a qalbī, wa nūra ṣadrī, wa jalā'a ḥuznī, wa dzahāba hammī.", arti: 'Ya Allah, aku hamba-Mu (perempuan), putri hamba laki-laki-Mu dan hamba perempuan-Mu. Ubun-ubunku di tangan-Mu, hukum-Mu berlaku atasku, keputusan-Mu adil bagiku. Aku memohon dengan setiap nama milik-Mu yang Engkau namai diri-Mu dengannya, atau Engkau turunkan dalam kitab-Mu, atau Engkau ajarkan kepada salah seorang makhluk-Mu, atau Engkau simpan dalam ilmu gaib di sisi-Mu, agar Engkau jadikan Al-Qur\'an penyejuk hatiku, cahaya dadaku, pelipur sedihku, dan penghilang gundahku.', fadhilah: 'Tidaklah seseorang membacanya melainkan Allah hilangkan kesedihannya dan menggantinya dengan kegembiraan. Lafaz asli hadits untuk laki-laki ("\'abduka, ibnu \'abdika, ibnu amatika"); di sini disesuaikan untuk perempuan.', src: 'HR. Ahmad no. 3712; dishahihkan Al-Albani. Hisnul Muslim bab 34.' },
  { kat: 'Perasaan', judul: 'Berlindung dari gundah dan lemah', ar: 'اللّٰهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ', lat: "Allāhumma innī a'ūdzu bika minal-hammi wal-ḥazan, wal-'ajzi wal-kasal, wal-bukhli wal-jubn, wa ḍala'id-daini wa ghalabatir-rijāl.", arti: 'Ya Allah, aku berlindung kepada-Mu dari rasa gundah dan sedih, dari lemah dan malas, dari kikir dan penakut, dari lilitan utang, dan dari dikuasai orang lain.', fadhilah: 'Nabi ﷺ sering membaca doa ini.', src: 'HR. Al-Bukhari no. 6369. Hisnul Muslim bab 34.' },
  { kat: 'Perasaan', judul: 'Ketika dalam kesulitan', ar: 'اللّٰهُمَّ رَحْمَتَكَ أَرْجُو، فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ، وَأَصْلِحْ لِي شَأْنِي كُلَّهُ، لَا إِلٰهَ إِلَّا أَنْتَ', lat: "Allāhumma raḥmataka arjū, falā takilnī ilā nafsī ṭarfata 'ain, wa aṣliḥ lī sya'nī kullah, lā ilāha illā ant.", arti: 'Ya Allah, rahmat-Mu yang aku harapkan, maka jangan Engkau serahkan aku kepada diriku walau sekejap mata, dan perbaikilah seluruh urusanku. Tidak ada ilah yang berhak disembah selain Engkau.', src: 'HR. Abu Dawud no. 5090; hasan. Hisnul Muslim bab 35.' },
  { kat: 'Perasaan', judul: 'Doa Nabi Yunus', ar: 'لَا إِلٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ', lat: "Lā ilāha illā anta subḥānaka innī kuntu minaẓ-ẓālimīn.", arti: 'Tidak ada ilah yang berhak disembah selain Engkau. Mahasuci Engkau, sungguh aku termasuk orang-orang yang zalim.', fadhilah: 'Tidaklah seorang muslim berdoa dengannya untuk suatu urusan melainkan Allah mengabulkannya.', src: 'HR. At-Tirmidzi no. 3505; shahih. Hisnul Muslim bab 35.' },
  { kat: 'Perasaan', judul: 'Ketika urusan terasa sulit', ar: 'اللّٰهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا', lat: "Allāhumma lā sahla illā mā ja'altahū sahlā, wa anta taj'alul-ḥazna idzā syi'ta sahlā.", arti: 'Ya Allah, tidak ada yang mudah kecuali yang Engkau jadikan mudah, dan Engkau menjadikan yang sulit, jika Engkau kehendaki, menjadi mudah.', src: 'HR. Ibnu Hibban dan Ibnu As-Sunni; dishahihkan para ulama. Hisnul Muslim bab 43.' },
  { kat: 'Perasaan', judul: 'Ketika terjadi hal yang tidak disukai', ar: 'قَدَّرَ اللّٰهُ وَمَا شَاءَ فَعَلَ', lat: "Qaddarallāhu wa mā syā'a fa'al.", arti: 'Allah telah menakdirkan, dan apa yang Dia kehendaki, Dia lakukan.', fadhilah: 'Jangan berkata "seandainya aku berbuat begini", karena kata "seandainya" membuka pintu perbuatan setan.', src: 'HR. Muslim no. 2664. Hisnul Muslim bab 46.' },
  { kat: 'Perasaan', judul: 'Mendapat kabar menyenangkan atau tidak', ar: 'الْحَمْدُ لِلّٰهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ\nالْحَمْدُ لِلّٰهِ عَلَى كُلِّ حَالٍ', lat: "Ketika senang: Al-ḥamdu lillāhil-ladzī bini'matihī tatimmuṣ-ṣāliḥāt. Ketika tidak menyenangkan: Al-ḥamdu lillāhi 'alā kulli ḥāl.", arti: 'Segala puji bagi Allah yang dengan nikmat-Nya sempurnalah segala kebaikan. — Segala puji bagi Allah dalam setiap keadaan.', src: 'HR. Ibnu Majah no. 3803 dan Al-Hakim; dihasankan Al-Albani. Hisnul Muslim bab 106.' },
  { kat: 'Kesehatan', judul: 'Ketika merasa sakit di badan (termasuk nyeri haid)', ar: 'بِسْمِ اللّٰهِ\nأَعُوذُ بِاللّٰهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ', lat: "Letakkan tangan pada bagian yang sakit, ucapkan: Bismillāh (3x), lalu: A'ūdzu billāhi wa qudratihī min syarri mā ajidu wa uḥādzir (7x).", arti: 'Dengan nama Allah. Aku berlindung kepada Allah dan kekuasaan-Nya dari keburukan yang aku rasakan dan yang aku khawatirkan.', src: 'HR. Muslim no. 2202 dari \'Utsman bin Abil \'Ash. Hisnul Muslim bab 124.' },
  { kat: 'Kesehatan', judul: 'Mendoakan orang sakit', ar: 'أَسْأَلُ اللّٰهَ الْعَظِيمَ، رَبَّ الْعَرْشِ الْعَظِيمِ، أَنْ يَشْفِيَكِ', lat: "As'alullāhal-'aẓīm, rabbal-'arsyil-'aẓīm, an yasyfiyak (kepada laki-laki) / an yasyfiyaki (kepada perempuan). Dibaca tujuh kali.", arti: 'Aku memohon kepada Allah Yang Mahaagung, Rabb Arsy yang agung, agar menyembuhkanmu.', fadhilah: 'Tidaklah seorang muslim menjenguk orang sakit yang belum datang ajalnya lalu membacanya tujuh kali, melainkan Allah menyembuhkannya.', src: 'HR. Abu Dawud no. 3106 dan At-Tirmidzi no. 2083; shahih. Hisnul Muslim bab 49.' },
  { kat: 'Kesehatan', judul: 'Melihat sesuatu yang mengagumkan (menjaga dari \'ain)', ar: 'اللّٰهُمَّ بَارِكْ عَلَيْهِ', lat: "Allāhumma bārik 'alaih (atau: 'alaihā untuk perempuan / bārakallāhu fīh).", arti: 'Ya Allah, berkahilah dia.', fadhilah: 'Jika salah seorang dari kalian melihat sesuatu yang mengagumkan pada saudaranya, dirinya, atau hartanya, hendaklah ia mendoakan keberkahan, karena \'ain itu benar adanya.', src: 'HR. Ahmad dan Ibnu Majah no. 3509; dishahihkan Al-Albani. Hisnul Muslim bab 125.' },
  { kat: 'Kesehatan', judul: 'Melihat orang yang tertimpa ujian', ar: 'الْحَمْدُ لِلّٰهِ الَّذِي عَافَانِي مِمَّا ابْتَلَاكَ بِهِ، وَفَضَّلَنِي عَلَى كَثِيرٍ مِمَّنْ خَلَقَ تَفْضِيلًا', lat: "Al-ḥamdu lillāhil-ladzī 'āfānī mimmabtalāka bih, wa faḍḍalanī 'alā katsīrim mimman khalaqa tafḍīlā. (Dibaca pelan, tidak didengarkan kepadanya.)", arti: 'Segala puji bagi Allah yang menyelamatkanku dari ujian yang menimpamu, dan melebihkanku di atas banyak makhluk-Nya.', fadhilah: 'Ia tidak akan ditimpa ujian itu.', src: 'HR. At-Tirmidzi no. 3432; hasan. Hisnul Muslim bab 83.' },
  { kat: 'Keluarga', judul: 'Memohon perlindungan untuk anak', ar: 'أُعِيذُكَ بِكَلِمَاتِ اللّٰهِ التَّامَّةِ، مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ', lat: "U'īdzuka (anak laki-laki) / u'īdzuki (anak perempuan) / u'īdzukumā (dua anak) / u'īdzukum (banyak anak) bikalimātillāhit-tāmmah, min kulli syaiṭānin wa hāmmah, wa min kulli 'ainin lāmmah.", arti: 'Aku memohonkan perlindungan untukmu dengan kalimat-kalimat Allah yang sempurna dari setiap setan, binatang berbisa, dan dari setiap mata yang jahat.', fadhilah: 'Dengan doa ini Nabi ﷺ memohonkan perlindungan untuk Al-Hasan dan Al-Husain, dan beliau bersabda bahwa Ibrahim memohonkan perlindungan untuk Isma\'il dan Ishaq dengannya.', src: 'HR. Al-Bukhari no. 3371. Hisnul Muslim bab 48.' },
  { kat: 'Keluarga', judul: 'Sebelum berhubungan suami istri', ar: 'بِسْمِ اللّٰهِ، اللّٰهُمَّ جَنِّبْنَا الشَّيْطَانَ، وَجَنِّبِ الشَّيْطَانَ مَا رَزَقْتَنَا', lat: "Bismillāh, Allāhumma jannibnasy-syaiṭān, wa jannibisy-syaiṭāna mā razaqtanā.", arti: 'Dengan nama Allah. Ya Allah, jauhkanlah kami dari setan, dan jauhkanlah setan dari anak yang Engkau rezekikan kepada kami.', fadhilah: 'Jika ditakdirkan lahir anak dari hubungan itu, setan tidak akan bisa membahayakannya selamanya.', src: 'HR. Al-Bukhari no. 6388 dan Muslim no. 1434. Hisnul Muslim bab 81.' },
  { kat: 'Keluarga', judul: 'Menghibur keluarga yang berduka (ta\'ziyah)', ar: 'إِنَّ لِلّٰهِ مَا أَخَذَ، وَلَهُ مَا أَعْطَى، وَكُلُّ شَيْءٍ عِنْدَهُ بِأَجَلٍ مُسَمًّى، فَلْتَصْبِرْ وَلْتَحْتَسِبْ', lat: "Inna lillāhi mā akhadz, wa lahū mā a'ṭā, wa kullu syai'in 'indahū bi'ajalim musammā, faltaṣbir waltaḥtasib.", arti: 'Sesungguhnya milik Allah apa yang Dia ambil dan milik-Nya apa yang Dia berikan. Segala sesuatu di sisi-Nya ada batas waktunya, maka bersabarlah dan harapkanlah pahala.', src: 'HR. Al-Bukhari no. 1284 dan Muslim no. 923. Hisnul Muslim bab 57.' },
  { kat: 'Sosial', judul: 'Penutup majelis (kaffaratul majlis)', ar: 'سُبْحَانَكَ اللّٰهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ', lat: "Subḥānakallāhumma wa biḥamdik, asyhadu al lā ilāha illā ant, astaghfiruka wa atūbu ilaik.", arti: 'Mahasuci Engkau ya Allah dan dengan memuji-Mu. Aku bersaksi tidak ada ilah yang berhak disembah selain Engkau. Aku memohon ampun dan bertaubat kepada-Mu.', fadhilah: 'Diampuni kesalahan yang terjadi di majelis itu.', src: 'HR. At-Tirmidzi no. 3433 dan Abu Dawud no. 4858; shahih. Hisnul Muslim bab 85.' },
  { kat: 'Sosial', judul: 'Kepada orang yang berbuat baik', ar: 'جَزَاكَ اللّٰهُ خَيْرًا', lat: "Jazākallāhu khairā (kepada laki-laki) / Jazākillāhu khairā (kepada perempuan).", arti: 'Semoga Allah membalasmu dengan kebaikan.', fadhilah: 'Siapa yang diberi kebaikan lalu mengucapkan ini kepada pelakunya, ia telah sungguh-sungguh memujinya.', src: 'HR. At-Tirmidzi no. 2035; shahih. Hisnul Muslim bab 87.' },
  { kat: 'Sosial', judul: 'Tamu mendoakan tuan rumah', ar: 'اللّٰهُمَّ بَارِكْ لَهُمْ فِيمَا رَزَقْتَهُمْ، وَاغْفِرْ لَهُمْ وَارْحَمْهُمْ', lat: "Allāhumma bārik lahum fīmā razaqtahum, waghfir lahum warḥamhum.", arti: 'Ya Allah, berkahilah mereka pada rezeki yang Engkau berikan, ampunilah mereka, dan rahmatilah mereka.', src: 'HR. Muslim no. 2042. Hisnul Muslim bab 71.' },
  { kat: 'Sosial', judul: 'Kepada yang memberi makan atau minum', ar: 'اللّٰهُمَّ أَطْعِمْ مَنْ أَطْعَمَنِي، وَاسْقِ مَنْ سَقَانِي', lat: "Allāhumma aṭ'im man aṭ'amanī, wasqi man saqānī.", arti: 'Ya Allah, berilah makan orang yang memberiku makan, dan berilah minum orang yang memberiku minum.', src: 'HR. Muslim no. 2055. Hisnul Muslim bab 72.' },
  { kat: 'Ibadah', judul: 'Doa istikharah', ar: 'اللّٰهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ، فَإِنَّكَ تَقْدِرُ وَلَا أَقْدِرُ، وَتَعْلَمُ وَلَا أَعْلَمُ، وَأَنْتَ عَلَّامُ الْغُيُوبِ. اللّٰهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هٰذَا الْأَمْرَ (…) خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي، فَاقْدُرْهُ لِي، وَيَسِّرْهُ لِي، ثُمَّ بَارِكْ لِي فِيهِ. وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هٰذَا الْأَمْرَ شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي، فَاصْرِفْهُ عَنِّي، وَاصْرِفْنِي عَنْهُ، وَاقْدُرْ لِيَ الْخَيْرَ حَيْثُ كَانَ، ثُمَّ أَرْضِنِي بِهِ', lat: "Allāhumma innī astakhīruka bi'ilmik, wa astaqdiruka biqudratik, wa as'aluka min faḍlikal-'aẓīm, fa innaka taqdiru wa lā aqdir, wa ta'lamu wa lā a'lam, wa anta 'allāmul-ghuyūb. Allāhumma in kunta ta'lamu anna hādzal-amra (sebutkan urusannya) khairul lī fī dīnī wa ma'āsyī wa 'āqibati amrī, faqdurhu lī wa yassirhu lī tsumma bārik lī fīh. Wa in kunta ta'lamu anna hādzal-amra syarrul lī fī dīnī wa ma'āsyī wa 'āqibati amrī, faṣrifhu 'annī waṣrifnī 'anh, waqdur liyal-khaira ḥaitsu kān, tsumma arḍinī bih.", arti: 'Ya Allah, aku memohon pilihan kepada-Mu dengan ilmu-Mu, memohon kemampuan dengan kekuasaan-Mu, dan memohon karunia-Mu yang agung. Engkau Mahakuasa sedang aku tidak, Engkau Maha Mengetahui sedang aku tidak, dan Engkaulah Yang Maha Mengetahui perkara gaib. Ya Allah, jika Engkau tahu urusan ini baik bagiku dalam agamaku, kehidupanku, dan akibat urusanku, takdirkanlah, mudahkanlah, lalu berkahilah untukku. Jika Engkau tahu urusan ini buruk bagiku ..., palingkanlah ia dariku dan palingkanlah aku darinya, takdirkanlah kebaikan untukku di mana pun adanya, lalu jadikan aku ridha dengannya.', fadhilah: 'Dibaca setelah shalat dua rakaat selain shalat wajib. Wanita yang sedang haid tidak shalat, tetapi menurut sebagian ulama boleh membaca doanya saja bila urusannya mendesak.', src: 'HR. Al-Bukhari no. 1162 dari Jabir. Hisnul Muslim bab 26.' },
  { kat: 'Ibadah', judul: 'Berlindung dari syirik', ar: 'اللّٰهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أُشْرِكَ بِكَ وَأَنَا أَعْلَمُ، وَأَسْتَغْفِرُكَ لِمَا لَا أَعْلَمُ', lat: "Allāhumma innī a'ūdzu bika an usyrika bika wa ana a'lam, wa astaghfiruka limā lā a'lam.", arti: 'Ya Allah, aku berlindung kepada-Mu dari menyekutukan-Mu sedangkan aku mengetahuinya, dan aku memohon ampun kepada-Mu dari apa yang tidak aku ketahui.', fadhilah: 'Syirik pada umat ini lebih samar daripada langkah semut. Inilah doa yang diajarkan Nabi ﷺ untuk menghapusnya.', src: 'HR. Ahmad dan Al-Bukhari dalam al-Adab al-Mufrad; dishahihkan Al-Albani. Hisnul Muslim bab 92.' },
  { kat: 'Ibadah', judul: 'Ketika berbuka puasa', ar: 'ذَهَبَ الظَّمَأُ، وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللّٰهُ', lat: "Dzahabaẓ-ẓama'u, wabtallatil-'urūq, wa tsabatal-ajru in syā'allāh.", arti: 'Telah hilang rasa haus, urat-urat telah basah, dan pahala telah tetap, insya Allah.', fadhilah: 'Cocok juga ketika berbuka puasa qadha Ramadhan setelah haid.', src: 'HR. Abu Dawud no. 2357; hasan. Hisnul Muslim bab 68.' },
  { kat: 'Ibadah', judul: 'Melihat hilal (awal bulan)', ar: 'اللّٰهُمَّ أَهِلَّهُ عَلَيْنَا بِالْيُمْنِ وَالْإِيمَانِ، وَالسَّلَامَةِ وَالْإِسْلَامِ، رَبِّي وَرَبُّكَ اللّٰهُ', lat: "Allāhumma ahillahū 'alainā bil-yumni wal-īmān, was-salāmati wal-islām, rabbī wa rabbukallāh.", arti: 'Ya Allah, terbitkanlah bulan ini atas kami dengan keberkahan dan keimanan, keselamatan dan keislaman. Rabbku dan Rabbmu adalah Allah.', src: 'HR. At-Tirmidzi no. 3451; hasan. Hisnul Muslim bab 67.' },
  { kat: 'Cuaca', judul: 'Ketika angin bertiup kencang', ar: 'اللّٰهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّهَا', lat: "Allāhumma innī as'aluka khairahā, wa a'ūdzu bika min syarrihā.", arti: 'Ya Allah, aku memohon kepada-Mu kebaikannya dan aku berlindung kepada-Mu dari keburukannya.', src: 'HR. Abu Dawud no. 5097 dan Ibnu Majah no. 3727; shahih. Hisnul Muslim bab 61.' },
  { kat: 'Cuaca', judul: 'Ketika mendengar petir', ar: 'سُبْحَانَ الَّذِي يُسَبِّحُ الرَّعْدُ بِحَمْدِهِ وَالْمَلَائِكَةُ مِنْ خِيفَتِهِ', lat: "Subḥānal-ladzī yusabbiḥur-ra'du biḥamdihī wal-malā'ikatu min khīfatih.", arti: 'Mahasuci Allah yang guruh bertasbih dengan memuji-Nya, demikian pula para malaikat karena takut kepada-Nya.', src: 'Atsar Abdullah bin Az-Zubair, diriwayatkan Malik dalam al-Muwaththa\' dan Al-Bukhari dalam al-Adab al-Mufrad; sanadnya shahih (mauquf). Hisnul Muslim bab 62.' },
  { kat: 'Perjalanan', judul: 'Doa safar', ar: 'اللّٰهُ أَكْبَرُ، اللّٰهُ أَكْبَرُ، اللّٰهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ. اللّٰهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هٰذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى، اللّٰهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هٰذَا وَاطْوِ عَنَّا بُعْدَهُ، اللّٰهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَلِيفَةُ فِي الْأَهْلِ، اللّٰهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْظَرِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالْأَهْلِ', lat: "Allāhu akbar (3x), subḥānal-ladzī sakhkhara lanā hādzā wa mā kunnā lahū muqrinīn, wa innā ilā rabbinā lamunqalibūn. Allāhumma innā nas'aluka fī safarinā hādzal-birra wat-taqwā, wa minal-'amali mā tarḍā. Allāhumma hawwin 'alainā safaranā hādzā waṭwi 'annā bu'dah. Allāhumma antaṣ-ṣāḥibu fis-safar, wal-khalīfatu fil-ahl. Allāhumma innī a'ūdzu bika min wa'tsā'is-safar, wa ka'ābatil-manẓar, wa sū'il-munqalabi fil-māli wal-ahl.\n\nKetika pulang ditambah: Āyibūna tā'ibūna 'ābidūna lirabbinā ḥāmidūn.", arti: 'Allah Mahabesar (3x). Mahasuci Allah yang menundukkan kendaraan ini untuk kami ... Ya Allah, kami memohon dalam perjalanan ini kebaikan, takwa, dan amal yang Engkau ridhai. Ya Allah, mudahkanlah perjalanan ini dan dekatkanlah jaraknya. Ya Allah, Engkaulah teman dalam perjalanan dan pengganti yang menjaga keluarga. Ya Allah, aku berlindung kepada-Mu dari letihnya perjalanan, pemandangan yang menyedihkan, dan kepulangan yang buruk pada harta dan keluarga. (Ketika pulang: Kami kembali, bertaubat, beribadah, dan memuji Rabb kami.)', src: 'HR. Muslim no. 1342 dari Ibnu Umar. Hisnul Muslim bab 96 dan 105.' },
  { kat: 'Perjalanan', judul: 'Singgah di suatu tempat', ar: 'أَعُوذُ بِكَلِمَاتِ اللّٰهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', lat: "A'ūdzu bikalimātillāhit-tāmmāti min syarri mā khalaq.", arti: 'Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari keburukan makhluk yang Dia ciptakan.', fadhilah: 'Tidak ada sesuatu pun yang membahayakannya sampai ia pergi dari tempat itu.', src: 'HR. Muslim no. 2708 dari Khaulah binti Hakim. Hisnul Muslim bab 104.' },
  { kat: 'Perjalanan', judul: 'Masuk pasar', ar: 'لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ وَهُوَ حَيٌّ لَا يَمُوتُ، بِيَدِهِ الْخَيْرُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', lat: "Lā ilāha illallāhu waḥdahū lā syarīka lah, lahul-mulku wa lahul-ḥamd, yuḥyī wa yumītu wa huwa ḥayyun lā yamūt, biyadihil-khair, wa huwa 'alā kulli syai'in qadīr.", arti: 'Tidak ada ilah yang berhak disembah selain Allah semata, tidak ada sekutu bagi-Nya. Milik-Nya kerajaan dan pujian. Dia menghidupkan dan mematikan, dan Dia Mahahidup tidak akan mati. Di tangan-Nya segala kebaikan, dan Dia Mahakuasa atas segala sesuatu.', src: 'HR. At-Tirmidzi no. 3428 dan Ibnu Majah no. 2235; dihasankan Al-Albani (sebagian ahli hadits melemahkannya). Hisnul Muslim bab 98.' }
);

/* Materi fikih darah wanita, tanya jawab (dengan khilaf), dan mutiara salaf.
   Penyusun: Ukkaasyah Abdurrahman */
window.MATERI = [
  { id: 'kenal', judul: 'Tiga Darah Wanita', ikon: 'drop',
    isi: [
      ['p', 'Darah yang keluar dari rahim wanita ada tiga: haid, nifas, dan istihadhah. Masing-masing punya hukum sendiri, sehingga seorang muslimah perlu mengenali ketiganya agar tahu kapan ia meninggalkan shalat dan kapan tetap wajib shalat.'],
      ['h', 'Haid'],
      ['p', 'Darah tabiat yang keluar dari pangkal rahim wanita yang sudah baligh, dalam keadaan sehat, pada waktu-waktu tertentu. Ia bukan karena sakit dan bukan karena melahirkan. Allah menyebutnya adza (sesuatu yang mengganggu) dalam QS. Al-Baqarah: 222, dan Nabi ﷺ bersabda tentangnya, "Ini adalah perkara yang Allah tetapkan atas putri-putri Adam" (HR. Al-Bukhari dan Muslim).'],
      ['h', 'Nifas'],
      ['p', 'Darah yang keluar setelah rahim kosong dari kehamilan, sebelum lewat 15 hari dari kelahiran. Darah yang keluar karena kontraksi menjelang melahirkan bukan nifas, melainkan dam fasad, sehingga ibu tetap wajib shalat semampunya (Asna al-Mathalib 1/114).'],
      ['h', 'Istihadhah'],
      ['p', 'Darah yang keluar di luar waktu haid dan nifas karena penyakit, dari urat di bagian bawah rahim yang disebut \'adzil. Nabi ﷺ bersabda kepada Fathimah binti Abi Hubaisy, "Itu hanyalah darah urat, bukan haid" (HR. Al-Bukhari dan Muslim). Wanita mustahadhah tetap shalat, puasa, dan boleh digauli suaminya.'],
      ['note', 'Termasuk istihadhah dalam pengertian luas: darah sebelum usia haid, darah yang kurang dari sehari semalam, dan darah yang keluar sebelum genap 15 hari suci. Sebagian ulama menamainya dam fasad.']
    ] },
  { id: 'batas', judul: 'Usia dan Batas Waktu', ikon: 'clock',
    isi: [
      ['p', 'Semua hitungan haid dalam mazhab Syafi\'i diambil dari istiqra\' (penelitian) Imam Asy-Syafi\'i terhadap keadaan para wanita. Angka-angka ini adalah pagar yang dipakai untuk membedakan haid dari istihadhah.'],
      ['table', [['', 'Paling sedikit', 'Umumnya', 'Paling lama'],
        ['Usia haid', '9 tahun hijriyah', '-', 'Tidak ada batas'],
        ['Haid', 'Sehari semalam (24 jam)', '6 atau 7 hari', '15 hari 15 malam'],
        ['Suci di antara dua haid', '15 hari', '23 atau 24 hari', 'Tidak ada batas'],
        ['Nifas', 'Sekejap', '40 hari', '60 hari']]],
      ['p', 'Usia 9 tahun dihitung dengan tahun hijriyah dan sifatnya perkiraan. Jika darah keluar kurang dari 16 hari sebelum genap 9 tahun, ia tetap bisa dihukumi haid (Raudhah ath-Thalibin).'],
      ['p', 'Haid paling sedikit sehari semalam artinya jumlah darah 24 jam, walaupun terputus-putus, selama masih di dalam 15 hari. Contoh: darah keluar 10 jam, berhenti dua hari, lalu keluar lagi 20 jam. Jumlahnya 30 jam, maka semuanya haid, termasuk dua hari bersih di tengahnya. Inilah yang disebut qaul as-sahb, pendapat yang dipegang dalam mazhab.'],
      ['note', 'Jika seorang wanita terbiasa haid kurang dari sehari semalam atau lebih dari 15 hari, kebiasaan itu tidak dianggap. Menurut al-ashahh yang dipakai tetap batas-batas di atas (Raudhah).']
    ] },
  { id: 'warna', judul: 'Warna dan Sifat Darah', ikon: 'palette',
    isi: [
      ['p', 'Mengenali warna darah penting terutama ketika darah keluar melewati 15 hari. Di saat itulah kuat dan lemahnya darah dipakai untuk menentukan mana haid dan mana istihadhah (tamyiz).'],
      ['colors', [['hitam', 'Hitam', 'Paling kuat. Darah merah yang ada garis-garis hitamnya termasuk hitam.'], ['merah', 'Merah', 'Lebih lemah dari hitam, lebih kuat dari yang di bawahnya.'], ['asyqar', 'Merah kekuningan (asyqar)', 'Di antara merah dan kuning.'], ['kuning', 'Kuning (shufrah)', 'Seperti nanah yang kekuningan.'], ['keruh', 'Keruh (kudrah)', 'Seperti air kotor, antara putih dan hitam.']]],
      ['h', 'Selain warna'],
      ['p', 'Darah yang kental lebih kuat daripada yang encer, dan darah yang berbau tidak sedap lebih kuat daripada yang tidak berbau. Cara menimbangnya: hitung sifat kuat yang ada pada masing-masing darah (warna yang lebih kuat, kental, berbau). Yang sifat kuatnya lebih banyak, itulah yang lebih kuat. Karena itu darah merah yang kental dan berbau lebih kuat daripada darah hitam yang tidak kental dan tidak berbau. Jika jumlahnya sama, seperti hitam kental dan hitam berbau, yang lebih dahulu keluar dianggap lebih kuat (Tuhfah 1/402).'],
      ['h', 'Kuning dan keruh'],
      ['p', 'Menurut al-ashahh dalam mazhab Syafi\'i, darah kuning dan keruh yang keluar di masa yang mungkin haid adalah haid, baik di awal, di tengah, maupun di akhir. Jadi jika setelah darah merah keluar cairan kekuningan, ia masih haid sampai benar-benar bersih, selama belum melewati 15 hari.']
    ] },
  { id: 'suci', judul: 'Tanda Sudah Suci', ikon: 'sparkle',
    isi: [
      ['p', 'Haid selesai ketika darah benar-benar berhenti. Tandanya ada dua: keluarnya cairan putih (al-qashshah al-baidha\') atau keringnya tempat keluar darah. Cara mengeceknya, masukkan kapas atau kain bersih ke tempat keluar darah. Jika kapas keluar bersih tanpa bekas merah, kuning, atau keruh, ia sudah suci.'],
      ['p', 'Para wanita di masa sahabat mengirim kapas yang ada bekas kekuningan kepada Aisyah radhiyallahu \'anha, lalu beliau berkata, "Jangan terburu-buru sampai kalian melihat cairan putih" (diriwayatkan Al-Bukhari secara mu\'allaq dan Malik dalam al-Muwaththa\').'],
      ['note', 'Setelah suci ia wajib mandi, lalu mengerjakan shalat yang waktunya masih ada. Jangan menunda mandi sampai waktu shalat habis. Lihat bab "Shalat ketika Haid Datang dan Berhenti".']
    ] },
  { id: 'larangan', judul: 'Larangan bagi Wanita Haid dan Nifas', ikon: 'ban',
    isi: [
      ['p', 'Dalam mazhab Syafi\'i, wanita haid dan nifas dilarang melakukan semua yang dilarang bagi orang junub, ditambah beberapa perkara lain. Berikut rinciannya.'],
      ['list', [
        'Shalat, baik wajib maupun sunnah, termasuk sujud tilawah dan sujud syukur. Shalat yang ditinggalkan tidak diqadha.',
        'Thawaf di Ka\'bah, wajib maupun sunnah.',
        'Puasa. Puasa wajib yang ditinggalkan wajib diqadha.',
        'Menyentuh dan membawa mushaf.',
        'Membaca Al-Qur\'an dengan niat membaca Al-Qur\'an, walaupun satu ayat. Dzikir dan doa yang berasal dari Al-Qur\'an boleh dibaca dengan niat dzikir.',
        'Berdiam di masjid. Melewati masjid juga haram jika khawatir darahnya mengotori masjid.',
        'Jima\' (bersetubuh) dengan suami. Ini haram dengan ijma\'.',
        'Bersentuhan (mubasyarah) dengan bagian antara pusar dan lutut tanpa penghalang. Dengan penghalang seperti kain, boleh selain jima\' (Tuhfah 1/391, Nihayah 1/331).',
        'Ditalak oleh suaminya. Talak di masa haid hukumnya haram (talak bid\'i), walaupun tetap jatuh.',
        'Bersuci dengan niat ibadah, seperti mandi sunnah atau wudhu, kecuali mandi sunnah untuk ihram dan wuquf yang memang dianjurkan bagi wanita haid.'
      ]],
      ['p', 'Ketika darah sudah berhenti tetapi ia belum mandi, larangan-larangan ini tetap berlaku kecuali puasa, talak, dan bersuci. Puasa sudah boleh, talak tidak lagi haram, dan ia tentu boleh bersuci (Raudhah ath-Thalibin).'],
      ['note', 'Wanita haid tidak najis badannya. Ia boleh memasak, menyusui, bersalaman, tidur bersama suami, berdzikir, berdoa, mendengarkan kajian, dan menjawab azan. Nabi ﷺ pernah bersabda kepada Aisyah, "Sesungguhnya haidmu tidak ada di tanganmu" (HR. Muslim).']
    ] },
  { id: 'shalat', judul: 'Shalat ketika Haid Datang dan Berhenti', ikon: 'mosque',
    isi: [
      ['h', 'Ketika haid datang'],
      ['p', 'Jika haid datang setelah masuk waktu shalat, dan sejak awal waktu sampai darah keluar ia sempat mengerjakan shalat itu (beserta bersucinya bila tidak bisa didahulukan), maka shalat tersebut wajib diqadha setelah ia suci. Contoh: azan Zhuhur pukul 12.10, haid datang pukul 13.00, padahal ia belum shalat. Maka setelah suci ia wajib mengqadha Zhuhur.'],
      ['h', 'Ketika haid berhenti'],
      ['p', 'Jika haid berhenti sementara waktu shalat masih tersisa, walaupun hanya seukuran takbiratul ihram, maka shalat itu wajib baginya. Bahkan jika ia suci di waktu Ashar, ia wajib mengerjakan Zhuhur juga. Jika ia suci di waktu Isya (sampai sebelum Subuh), ia wajib mengerjakan Maghrib juga, karena Zhuhur-Ashar dan Maghrib-Isya bisa dijamak pada waktu uzur.'],
      ['p', 'Syaratnya, setelah suci ia bebas dari penghalang (seperti haid lagi atau gila) selama waktu yang cukup untuk bersuci dan mengerjakan shalat-shalat itu.'],
      ['note', 'Di menu Kalender, aplikasi ini menghitung otomatis shalat apa yang wajib diqadha ketika haid datang dan shalat apa yang wajib dikerjakan ketika haid berhenti, berdasarkan waktu shalat di kota Anda.']
    ] },
  { id: 'mandi', judul: 'Mandi Haid', ikon: 'water',
    isi: [
      ['p', 'Rukun mandi hanya dua: niat dan meratakan air ke seluruh tubuh, termasuk rambut dan kulit di bawahnya, serta bagian yang tampak dari kemaluan ketika duduk.'],
      ['p', 'Niatnya di dalam hati, misalnya: "Aku niat mandi untuk menghilangkan hadats haid" atau "untuk menghilangkan hadats besar". Tidak ada lafaz khusus yang wajib diucapkan.'],
      ['h', 'Sunnah-sunnahnya'],
      ['list', ['Membaca basmalah.', 'Mencuci kedua tangan, lalu membersihkan kemaluan.', 'Berwudhu seperti wudhu shalat.', 'Menyiram kepala tiga kali sambil menyela-nyela pangkal rambut.', 'Menyiram badan bagian kanan, lalu kiri.', 'Menggosok badan.', 'Mengusapkan kapas yang diberi wewangian ke bekas darah. Nabi ﷺ mengajarkan ini kepada seorang wanita Anshar: "Ambillah sepotong kapas yang diberi minyak wangi, lalu bersucilah dengannya" (HR. Al-Bukhari dan Muslim).']],
      ['note', 'Rambut yang dikepang tidak wajib dibuka jika air bisa sampai ke kulit kepala dan seluruh rambut. Jika air tidak bisa sampai, kepangan wajib dibuka.']
    ] },
  { id: 'istihadhah', judul: 'Kewajiban Wanita Mustahadhah', ikon: 'shield',
    isi: [
      ['p', 'Wanita mustahadhah hukumnya seperti orang yang beser kencing: hadatsnya terus-menerus, tetapi ia tetap wajib shalat dan puasa, dan suaminya boleh menggaulinya. Hanya saja darah yang keluar membatalkan wudhu, sehingga ia punya cara bersuci khusus.'],
      ['h', 'Enam hal untuk setiap shalat fardhu'],
      ['list', ['Membasuh kemaluan dari darah.', 'Menyumbat (hasyw) dengan kapas atau sejenisnya, kecuali jika menyakitkan, atau ia sedang berpuasa di siang hari.', 'Mengikat (\'ashb) jika sumbatan saja belum cukup menahan darah.', 'Berwudhu setelah masuk waktu shalat, karena ini bersuci darurat.', 'Muwalat: semua dilakukan beruntun lalu segera shalat. Menunda hanya boleh untuk kepentingan shalat itu, seperti menutup aurat, menunggu jamaah, menjawab azan, atau shalat rawatib qabliyah.', 'Mengulang semua langkah ini untuk setiap shalat fardhu, termasuk shalat nadzar dan qadha.']],
      ['p', 'Satu wudhu hanya untuk satu shalat fardhu, ditambah shalat sunnah sebanyak yang ia mau. Darah yang tetap keluar setelah ia melakukan semua itu tidak membatalkan shalatnya.'],
      ['note', 'Rincian dan khilaf para ulama mutaakhirin Syafi\'iyyah tentang bab ini ada dalam materi "Istihadhah dalam Haid dan Nifas" (syarah kitab Al-Ibanah wal-Ifadhah) karya penyusun.']
    ] },
  { id: 'tujuh', judul: 'Tujuh Bentuk Istihadhah', ikon: 'layers',
    isi: [
      ['p', 'Jika darah keluar melewati 15 hari, haidnya bercampur dengan istihadhah. Untuk memilahnya, para ulama membagi wanita mustahadhah menjadi tujuh bentuk. Urutan rujukannya: tamyiz (sifat darah) dahulu, lalu kebiasaan (\'adah), lalu ihtiyath.'],
      ['table', [['Bentuk', 'Hukumnya dalam haid'],
        ['1. Mubtada\'ah mumayyizah', 'Darah kuat haid, darah lemah istihadhah, jika empat syarat tamyiz terpenuhi.'],
        ['2. Mubtada\'ah ghair mumayyizah', 'Haid sehari semalam dari awal darah, suci 29 hari.'],
        ['3. Mu\'tadah mumayyizah', 'Mengikuti tamyiz, bukan kebiasaan.'],
        ['4. Mu\'tadah ghair mumayyizah', 'Mengikuti kebiasaan haid dan sucinya (daur).'],
        ['5. Mutahayyirah muthlaqah', 'Ihtiyath: seperti wanita haid dalam enam hal, seperti wanita suci dalam lima hal.'],
        ['6. Ingat waktu, lupa kadar', 'Ada masa yakin haid, yakin suci, dan masa ragu.'],
        ['7. Ingat kadar, lupa waktu', 'Seperti bentuk 6, dengan syarat tahu panjang dan awal daurnya.']]],
      ['h', 'Empat syarat tamyiz'],
      ['list', ['Darah kuat tidak kurang dari sehari semalam.', 'Darah kuat tidak lebih dari 15 hari.', 'Darah lemah tidak kurang dari 15 hari (berlaku bila setelah darah lemah datang lagi darah kuat yang terus berlanjut).', 'Darah lemah bersambung, tidak diselingi darah kuat.']],
      ['h', 'Bulan pertama dan bulan berikutnya'],
      ['p', 'Di bulan pertama, selama darah mungkin berhenti sebelum 15 hari, ia menahan diri seperti wanita haid. Setelah jelas melewati 15 hari, barulah ia tahu bagian mana yang haid, lalu mengqadha shalat yang ia tinggalkan di luar masa haidnya. Di bulan kedua dan seterusnya ia tidak perlu menunggu: begitu darah kuat atau masa kebiasaannya selesai, ia langsung mandi dan shalat (Majmu\' 2/430).'],
      ['note', 'Contoh-contoh lengkap dengan bagan hari ada di materi syarah Al-Ibanah karya penyusun. Mesin penanggalan di aplikasi ini disusun mengikuti kaidah-kaidah tersebut.']
    ] },
  { id: 'nifas', judul: 'Seputar Nifas', ikon: 'baby',
    isi: [
      ['p', 'Nifas dihitung sejak bayi keluar, bukan sejak darah keluar. Paling sedikit sekejap: setetes darah pun sudah nifas. Umumnya 40 hari, dan paling lama 60 hari menurut mazhab Syafi\'i.'],
      ['p', 'Jika darah berhenti di tengah masa nifas lalu kembali sebelum genap 60 hari: bila jedanya kurang dari 15 hari, semuanya nifas termasuk masa bersih di tengahnya. Bila jedanya 15 hari atau lebih, darah yang kembali itu haid.'],
      ['p', 'Keguguran yang mengeluarkan \'alaqah (gumpalan darah) atau mudhghah (gumpalan daging) juga melahirkan nifas menurut mazhab, walaupun belum berbentuk manusia (Asna al-Mathalib 1/114).'],
      ['p', 'Jika darah nifas berhenti sebelum 40 hari, ia wajib mandi lalu shalat dan puasa, dan suami boleh menggaulinya. Tidak ada kewajiban menunggu 40 hari.'],
      ['note', 'Jika darah melewati 60 hari, ia mustahadhah dalam nifas. Kaidahnya sama dengan istihadhah dalam haid, dengan penyesuaian: angka 15 hari menjadi 60 hari, dan kadar yang yakin sehari semalam menjadi sekejap.']
    ] },
  { id: 'catat', judul: 'Mengapa Haid Perlu Dicatat', ikon: 'note',
    isi: [
      ['p', 'Banyak hukum bergantung pada catatan: kebiasaan haid (\'adah), waktu mulai dan berhentinya darah, warnanya, dan jarak antara dua haid. Ketika suatu hari darah keluar lebih lama dari biasa, catatan inilah yang menentukan mana haid dan mana istihadhah. Tanpa catatan, seorang wanita bisa jatuh ke keadaan mutahayyirah (lupa kebiasaan) yang hukumnya paling berat.'],
      ['p', 'Para ulama menyebut faidah ini ketika membahas kebiasaan yang berpindah: yang dipakai selalu kebiasaan terakhir. "Inilah sebabnya wanita dianjurkan mencatat haidnya setiap bulan."'],
      ['note', 'Catat jam mulai dan jam berhenti. Dalam mazhab Syafi\'i hitungan haid dengan jam, bukan sekadar tanggal: sehari semalam artinya 24 jam.']
    ] }
];

/* ========== TANYA JAWAB (rencana 50 soal) ========== */
window.TANYA = [
  { id: 1, q: 'Bolehkah wanita haid membaca Al-Qur\'an?',
    jawab: 'Ini masalah yang diperselisihkan sejak dulu. Dalam mazhab Syafi\'i hukumnya haram jika diniatkan membaca Al-Qur\'an. Pendapat lain membolehkan selama tidak menyentuh mushaf.',
    pendapat: [
      { nama: 'Haram', siapa: 'Jumhur: Hanafiyah, Syafi\'iyah, dan Hanabilah', isi: 'Wanita haid tidak boleh membaca Al-Qur\'an walaupun satu ayat dengan niat membaca. Yang boleh adalah dzikir dan doa yang berasal dari Al-Qur\'an dengan niat dzikir, seperti basmalah sebelum makan atau "Rabbana atina fid dunya hasanah".', dalil: 'Hadits Ibnu Umar: "Wanita haid dan orang junub tidak boleh membaca sesuatu pun dari Al-Qur\'an" (HR. At-Tirmidzi dan Ibnu Majah). Juga qiyas kepada orang junub, karena hadats haid lebih berat.' },
      { nama: 'Boleh tanpa menyentuh mushaf', siapa: 'Malikiyah (dalam pendapat yang masyhur), Ibnu Hazm, Ibnu Taimiyah; dirajihkan Ibnu Baz, Ibnu Utsaimin, dan Al-Albani', isi: 'Wanita haid boleh membaca Al-Qur\'an dari hafalan atau dari layar, terutama jika khawatir lupa hafalan, sedang mengajar, atau belajar.', dalil: 'Hadits Ibnu Umar di atas dinilai lemah oleh para ahli hadits karena riwayat Isma\'il bin \'Ayyasy dari orang Hijaz. Tidak ada dalil shahih yang melarang, padahal haid berulang setiap bulan dan masanya panjang. Nabi ﷺ bersabda kepada Aisyah yang haid saat haji, "Lakukanlah apa yang dilakukan orang yang berhaji, hanya saja jangan thawaf di Ka\'bah" (HR. Al-Bukhari dan Muslim).' }
    ],
    penutup: 'Yang memilih pendapat kedua hendaknya tetap tidak menyentuh mushaf, karena hukum menyentuh mushaf berbeda dengan membaca.' },
  { id: 2, q: 'Bolehkah wanita haid menyentuh atau membawa mushaf?',
    jawab: 'Empat mazhab sepakat wanita haid tidak boleh menyentuh mushaf. Yang menyelisihi adalah Azh-Zhahiriyah.',
    pendapat: [
      { nama: 'Haram', siapa: 'Empat mazhab', isi: 'Haram menyentuh dan membawa mushaf. Dalam mazhab Syafi\'i, boleh membawanya bersama barang lain jika yang dimaksud adalah barang tersebut, dan boleh menyentuh kitab tafsir yang tafsirnya lebih banyak daripada ayatnya.', dalil: 'Firman Allah, "Tidak menyentuhnya kecuali hamba-hamba yang disucikan" (QS. Al-Waqi\'ah: 79). Surat Nabi ﷺ kepada \'Amr bin Hazm: "Tidak boleh menyentuh Al-Qur\'an kecuali orang yang suci" (HR. Malik dan Ad-Daraquthni; dishahihkan Al-Albani dalam Irwa\' al-Ghalil).' },
      { nama: 'Boleh', siapa: 'Dawud Azh-Zhahiri dan Ibnu Hazm', isi: 'Boleh menyentuh mushaf karena yang dimaksud dalam ayat adalah para malaikat.', dalil: 'Tafsir ayat Al-Waqi\'ah tentang lauh mahfuzh dan para malaikat; serta surat Nabi ﷺ kepada Heraklius yang berisi ayat Al-Qur\'an.' }
    ],
    penutup: 'Banyak ulama masa kini memandang HP yang berisi aplikasi Al-Qur\'an tidak dihukumi mushaf, sehingga boleh dipegang. Namun dalam mazhab Syafi\'i, hukum membacanya tetap kembali ke soal nomor 1.' },
  { id: 3, q: 'Bolehkah wanita haid masuk masjid atau ikut kajian di masjid?',
    jawab: 'Dalam mazhab Syafi\'i, wanita haid haram berdiam di masjid. Melewatinya haram jika khawatir darahnya mengotori. Jika aman, boleh, tetapi makruh kecuali ada keperluan (Hasyiyah Qalyubi).',
    pendapat: [
      { nama: 'Haram berdiam', siapa: 'Jumhur ulama', isi: 'Ia tidak boleh duduk atau berdiam di dalam masjid. Kajian bisa diikuti dari serambi atau halaman yang bukan bagian masjid, atau dari ruangan lain.', dalil: 'Hadits: "Aku tidak menghalalkan masjid bagi wanita haid dan orang junub" (HR. Abu Dawud). Juga qiyas kepada junub dalam QS. An-Nisa\': 43.' },
      { nama: 'Boleh berdiam', siapa: 'Dawud dan Ibnu Hazm (Al-Muzani membolehkan bagi orang junub); dirajihkan Al-Albani', isi: 'Boleh berdiam di masjid dengan menjaga agar darah tidak mengotori.', dalil: 'Hadits di atas dinilai lemah oleh sebagian ahli hadits. Nabi ﷺ bersabda, "Sesungguhnya orang mukmin itu tidak najis" (HR. Al-Bukhari dan Muslim). Ada pula wanita hitam yang tinggal di dalam masjid Nabi ﷺ (HR. Al-Bukhari), dan Nabi ﷺ menyuruh Aisyah mengambilkan sajadah dari masjid sambil berkata, "Haidmu tidak ada di tanganmu" (HR. Muslim).' }
    ],
    penutup: 'Mushalla di kantor, sekolah, atau mal yang tidak diwakafkan sebagai masjid tidak dihukumi masjid.' },
  { id: 4, q: 'Apakah wanita haid wajib mengqadha shalat dan puasa?',
    jawab: 'Ulama sepakat: puasa Ramadhan yang ditinggalkan wajib diqadha, sedangkan shalat tidak.',
    pendapat: [
      { nama: 'Ijma\'', siapa: 'Seluruh ulama', isi: 'Qadha puasa wajib, qadha shalat tidak wajib.', dalil: 'Mu\'adzah bertanya kepada Aisyah, "Mengapa wanita haid mengqadha puasa tetapi tidak mengqadha shalat?" Aisyah menjawab, "Dahulu kami mengalami haid, lalu kami diperintah mengqadha puasa dan tidak diperintah mengqadha shalat" (HR. Muslim).' }
    ],
    penutup: 'Hikmahnya, shalat berulang lima kali sehari sehingga qadhanya sangat memberatkan, sedangkan puasa hanya sekali setahun.' },
  { id: 5, q: 'Bolehkah suami bermesraan dengan istri yang sedang haid, selain jima\'?',
    jawab: 'Boleh, dengan rincian. Yang haram dengan ijma\' adalah jima\'. Para ulama berbeda pendapat tentang bagian antara pusar dan lutut.',
    pendapat: [
      { nama: 'Haram antara pusar dan lutut tanpa penghalang', siapa: 'Hanafiyah, Malikiyah, dan Syafi\'iyah (mu\'tamad)', isi: 'Boleh bersenang-senang dengan bagian di atas pusar dan di bawah lutut, serta di antara keduanya bila ada penghalang seperti kain.', dalil: 'Aisyah berkata, "Rasulullah ﷺ menyuruhku memakai sarung, lalu beliau bermesraan denganku sedangkan aku haid" (HR. Al-Bukhari dan Muslim). Ketika ditanya apa yang halal dari istri yang haid, beliau menjawab, "Apa yang di atas sarung" (HR. Abu Dawud).' },
      { nama: 'Semuanya boleh kecuali jima\'', siapa: 'Hanabilah; An-Nawawi menilai dalilnya lebih kuat', isi: 'Seluruh bagian boleh selain jima\', namun lebih utama memakai penghalang.', dalil: 'Sabda Nabi ﷺ: "Lakukanlah segala sesuatu kecuali nikah (jima\')" (HR. Muslim).' }
    ],
    penutup: 'Aplikasi ini mengikuti mu\'tamad mazhab Syafi\'i, yaitu pendapat pertama.' },
  { id: 6, q: 'Apa kaffarah bagi suami yang menggauli istrinya saat haid?',
    jawab: 'Keduanya wajib bertaubat dengan sungguh-sungguh. Adapun kaffarah, para ulama berbeda pendapat.',
    pendapat: [
      { nama: 'Tidak wajib, tetapi disunnahkan sedekah', siapa: 'Syafi\'iyah (qaul jadid), Hanafiyah, Malikiyah', isi: 'Disunnahkan bersedekah satu dinar jika di awal haid ketika darah masih deras, dan setengah dinar jika di akhirnya.', dalil: 'Hadits kaffarah dinilai tidak cukup kuat untuk mewajibkan, sehingga dibawa kepada anjuran.' },
      { nama: 'Wajib kaffarah', siapa: 'Hanabilah (mu\'tamad)', isi: 'Wajib membayar satu dinar atau setengah dinar.', dalil: 'Hadits Ibnu Abbas: "Hendaklah ia bersedekah satu dinar atau setengah dinar" (HR. Abu Dawud, An-Nasa\'i, Ibnu Majah; dishahihkan sebagian ulama termasuk Al-Albani, dilemahkan yang lain).' }
    ],
    penutup: 'Satu dinar setara dengan 4,25 gram emas.' },
  { id: 7, q: 'Darah sudah berhenti, bolehkah digauli sebelum mandi?',
    jawab: 'Menurut jumhur ulama tidak boleh sampai ia mandi.',
    pendapat: [
      { nama: 'Harus mandi dahulu', siapa: 'Malikiyah, Syafi\'iyah, Hanabilah', isi: 'Jima\' baru halal setelah ia mandi. Jika tidak ada air, ia bertayammum.', dalil: 'Firman Allah, "Janganlah kalian mendekati mereka sampai mereka suci. Apabila mereka telah bersuci (mandi), campurilah mereka" (QS. Al-Baqarah: 222). Allah mensyaratkan dua hal: darah berhenti dan mandi.' },
      { nama: 'Boleh dengan rincian', siapa: 'Hanafiyah', isi: 'Jika darah berhenti tepat pada hari kesepuluh (batas maksimal haid menurut mereka), boleh digauli walau belum mandi. Jika kurang dari itu, harus mandi atau telah lewat satu waktu shalat.', dalil: 'Membaca "hatta yath-hurna" sebagai berhentinya darah.' }
    ] },
  { id: 8, q: 'Berapa lama paling sedikit dan paling lama haid?',
    jawab: 'Dalam mazhab Syafi\'i paling sedikit sehari semalam dan paling lama 15 hari. Mazhab lain berbeda.',
    pendapat: [
      { nama: 'Sehari semalam sampai 15 hari', siapa: 'Syafi\'iyah dan Hanabilah', isi: 'Kurang dari 24 jam bukan haid, lebih dari 15 hari istihadhah.', dalil: 'Istiqra\' terhadap keadaan wanita. Atha\' berkata, "Aku melihat wanita yang haid sehari dan yang haid 15 hari." Juga atsar Ali bin Abi Thalib.' },
      { nama: '3 sampai 10 hari', siapa: 'Hanafiyah', isi: 'Kurang dari tiga hari atau lebih dari sepuluh hari bukan haid.', dalil: 'Hadits Watsilah dan Anas tentang batas tiga dan sepuluh hari, yang dinilai lemah oleh para ahli hadits.' },
      { nama: 'Tidak ada batas minimal', siapa: 'Malikiyah', isi: 'Satu kali keluar darah sudah haid. Batas maksimal 15 hari dengan rincian.', dalil: 'Kemutlakan nash tentang haid.' },
      { nama: 'Tidak ada batas sama sekali', siapa: 'Ibnu Taimiyah, Ibnu Utsaimin', isi: 'Kembali kepada kebiasaan dan sifat darah, selama tidak terus-menerus.', dalil: 'Allah dan Rasul-Nya tidak menetapkan batas, dan perkara yang dimutlakkan syariat dikembalikan kepada kenyataan.' }
    ] },
  { id: 9, q: 'Berapa lama paling sedikit masa suci di antara dua haid?',
    jawab: 'Menurut mazhab Syafi\'i 15 hari, dan tidak ada batas paling lama.',
    pendapat: [
      { nama: '15 hari', siapa: 'Hanafiyah, Malikiyah, Syafi\'iyah', isi: 'Darah yang keluar sebelum genap 15 hari suci tidak dihitung haid, melainkan menggenapkan masa suci.', dalil: 'Karena paling lama haid 15 hari dan satu bulan tidak lepas dari haid dan suci, maka paling sedikit suci juga 15 hari.' },
      { nama: '13 hari', siapa: 'Hanabilah', isi: 'Suci paling sedikit 13 hari.', dalil: 'Atsar Ali dan Syuraih tentang wanita yang mengaku haid tiga kali dalam sebulan (diriwayatkan Ad-Darimi).' },
      { nama: 'Tidak ada batas', siapa: 'Ibnu Taimiyah', isi: 'Tidak ada batas minimal suci.', dalil: 'Tidak ada nash yang membatasinya.' }
    ] },
  { id: 10, q: 'Darah kuning atau keruh, haid atau bukan?',
    jawab: 'Menurut al-ashahh dalam mazhab Syafi\'i, darah kuning dan keruh yang keluar di masa yang mungkin haid (di dalam 15 hari) adalah haid.',
    pendapat: [
      { nama: 'Haid jika di masa imkan', siapa: 'Syafi\'iyah (al-ashahh)', isi: 'Selama masih di dalam 15 hari dan memenuhi syarat haid, kuning dan keruh dihukumi haid, baik di awal, tengah, maupun akhir.', dalil: 'Ucapan Aisyah, "Jangan terburu-buru sampai kalian melihat cairan putih" (Al-Bukhari secara mu\'allaq). Beliau tidak menganggap suci selama masih ada kekuningan.' },
      { nama: 'Haid hanya jika bersambung dengan masa haid', siapa: 'Hanabilah; dirajihkan Ibnu Utsaimin', isi: 'Kuning dan keruh di dalam masa haid atau bersambung dengannya adalah haid. Setelah suci, ia bukan apa-apa.', dalil: 'Ummu \'Athiyyah berkata, "Kami tidak menganggap kudrah dan shufrah setelah suci sebagai apa-apa" (HR. Abu Dawud; asalnya di Al-Bukhari tanpa kata "setelah suci").' }
    ] },
  { id: 11, q: 'Bagaimana mengetahui bahwa haid sudah selesai?',
    jawab: 'Dengan dua tanda: keluarnya cairan putih (al-qashshah al-baidha\'), atau keringnya tempat keluar darah sehingga kapas yang dimasukkan keluar bersih.',
    pendapat: [
      { nama: 'Penjelasan', siapa: 'Kesepakatan ulama secara umum', isi: 'Sebagian wanita mengenal suci dengan cairan putih, sebagian lagi dengan kering. Jika setelah darah berhenti masih ada bekas kuning atau keruh di dalam 15 hari, menurut mazhab Syafi\'i ia belum suci.', dalil: 'Atsar Aisyah ketika para wanita mengirim kapas kepadanya (Al-Bukhari secara mu\'allaq dan Malik dalam al-Muwaththa\').' }
    ] },
  { id: 12, q: 'Haid datang setelah masuk waktu shalat, apakah wajib qadha?',
    jawab: 'Dalam mazhab Syafi\'i wajib, jika sejak masuk waktu sampai haid datang ia sempat mengerjakan shalat itu.',
    pendapat: [
      { nama: 'Wajib qadha jika sempat', siapa: 'Syafi\'iyah', isi: 'Jika waktu yang berlalu cukup untuk mengerjakan shalat fardhu itu (dan bersucinya bila tidak bisa didahulukan), ia wajib mengqadhanya setelah suci.', dalil: 'Kewajiban sudah tetap atasnya ketika ia mampu mengerjakannya, lalu ia tidak mengerjakannya.' },
      { nama: 'Wajib qadha jika sempat takbir', siapa: 'Hanabilah', isi: 'Cukup sempat seukuran takbiratul ihram.', dalil: 'Ia telah mendapati bagian dari waktu dalam keadaan mukallaf.' },
      { nama: 'Tidak wajib', siapa: 'Hanafiyah', isi: 'Tidak wajib qadha, karena kewajiban terkait dengan akhir waktu.', dalil: 'Waktu shalat itu lapang, dan ia boleh menundanya ke akhir waktu.' }
    ],
    penutup: 'Pelajaran pentingnya: jangan menunda shalat di awal waktu tanpa alasan, terutama ketika mendekati jadwal haid.' },
  { id: 13, q: 'Haid berhenti di waktu Ashar, apakah wajib shalat Zhuhur juga?',
    jawab: 'Menurut jumhur ulama, ya. Ia wajib Zhuhur dan Ashar. Begitu pula jika berhenti di waktu Isya, ia wajib Maghrib dan Isya.',
    pendapat: [
      { nama: 'Wajib keduanya', siapa: 'Malikiyah, Syafi\'iyah, Hanabilah', isi: 'Karena waktu Ashar adalah waktu Zhuhur juga bagi orang yang uzur (bisa dijamak).', dalil: 'Fatwa Abdurrahman bin \'Auf dan Ibnu Abbas: wanita haid yang suci sebelum terbenam matahari mengerjakan Zhuhur dan Ashar, dan yang suci sebelum fajar mengerjakan Maghrib dan Isya (diriwayatkan Ibnu Abi Syaibah dan Al-Baihaqi).' },
      { nama: 'Hanya shalat di waktu itu', siapa: 'Hanafiyah', isi: 'Ia hanya wajib Ashar, karena waktu Zhuhur sudah habis ketika ia masih haid.', dalil: 'Kewajiban terkait dengan waktu masing-masing shalat.' }
    ] },
  { id: 14, q: 'Wanita hamil keluar darah, apakah itu haid?',
    jawab: 'Dalam mazhab Syafi\'i (qaul jadid), wanita hamil bisa haid jika darahnya memenuhi syarat haid.',
    pendapat: [
      { nama: 'Bisa haid', siapa: 'Syafi\'iyah (jadid) dan Malikiyah', isi: 'Jika darah keluar sehari semalam atau lebih dan tidak melewati 15 hari, ia haid walaupun sedang hamil. Darah karena kontraksi menjelang melahirkan bukan haid.', dalil: 'Keumuman dalil tentang haid, dan atsar Aisyah tentang wanita hamil yang melihat darah agar meninggalkan shalat (diriwayatkan Malik).' },
      { nama: 'Bukan haid', siapa: 'Hanafiyah dan Hanabilah', isi: 'Darah wanita hamil adalah dam fasad, ia tetap shalat.', dalil: 'Sabda Nabi ﷺ tentang tawanan perang: "Jangan digauli wanita hamil sampai melahirkan, dan wanita tidak hamil sampai haid sekali" (HR. Abu Dawud). Haid dijadikan tanda kosongnya rahim.' }
    ] },
  { id: 15, q: 'Berapa lama paling lama nifas?',
    jawab: 'Menurut mazhab Syafi\'i 60 hari, dengan umumnya 40 hari.',
    pendapat: [
      { nama: '60 hari', siapa: 'Syafi\'iyah dan Malikiyah', isi: '40 hari adalah kebiasaan umum, sedangkan batas maksimal 60 hari.', dalil: 'Istiqra\' dan ucapan Al-Auza\'i dan Asy-Sya\'bi tentang adanya wanita yang nifas dua bulan.' },
      { nama: '40 hari', siapa: 'Hanafiyah dan Hanabilah', isi: 'Lebih dari 40 hari adalah istihadhah, kecuali bertepatan dengan kebiasaan haid.', dalil: 'Ummu Salamah berkata, "Para wanita nifas di masa Rasulullah ﷺ duduk (tidak shalat) selama 40 hari" (HR. Abu Dawud dan At-Tirmidzi).' }
    ] },
  { id: 16, q: 'Keguguran, apakah darahnya nifas?',
    jawab: 'Dalam mazhab Syafi\'i, jika yang keluar sudah berupa \'alaqah (gumpalan darah) atau mudhghah (gumpalan daging), darah sesudahnya nifas.',
    pendapat: [
      { nama: 'Nifas walau belum berbentuk', siapa: 'Syafi\'iyah', isi: 'Bila janin berupa gumpalan darah atau gumpalan daging, darah setelahnya nifas.', dalil: 'Ia telah melahirkan sesuatu yang merupakan asal manusia (Asna al-Mathalib 1/114).' },
      { nama: 'Nifas jika sudah tampak bentuk manusia', siapa: 'Hanabilah dan lainnya', isi: 'Jika belum tampak bentuk manusia (umumnya sebelum 81 hari kehamilan), darahnya bukan nifas.', dalil: 'Hadits Ibnu Mas\'ud tentang tahapan penciptaan janin, 40 hari sebagai nutfah, 40 hari \'alaqah, 40 hari mudhghah (HR. Al-Bukhari dan Muslim).' }
    ] },
  { id: 17, q: 'Bolehkah minum obat penunda haid, misalnya agar bisa puasa penuh atau berhaji?',
    jawab: 'Boleh dengan syarat tidak membahayakan kesehatan, dan sebaiknya dengan arahan dokter.',
    pendapat: [
      { nama: 'Boleh dengan syarat', siapa: 'Imam Ahmad; Lajnah Daimah dan banyak ulama masa kini', isi: 'Boleh jika aman bagi tubuh. Jika darah benar-benar tidak keluar, ia suci dan ibadahnya sah.', dalil: 'Imam Ahmad berkata, "Tidak mengapa seorang wanita meminum obat yang menghentikan haidnya, jika obat itu dikenal" (dinukil Ibnu Qudamah dalam al-Mughni).' }
    ],
    penutup: 'Banyak ulama tetap menganjurkan membiarkan haid berjalan alami, karena haid adalah ketetapan Allah dan wanita tetap mendapat pahala dengan dzikir, doa, dan sedekah di masa itu.' },
  { id: 18, q: 'Bolehkah wanita haid berdzikir, berdoa, dan mendengarkan murattal?',
    jawab: 'Boleh dengan kesepakatan ulama. Haid tidak menghalangi dzikir dan doa.',
    pendapat: [
      { nama: 'Boleh', siapa: 'Seluruh ulama', isi: 'Ia boleh bertasbih, bertahmid, bershalawat, berdoa, beristighfar, dzikir pagi petang, mendengarkan Al-Qur\'an, dan menghadiri majelis ilmu di luar masjid.', dalil: 'Ummu \'Athiyyah berkata, Nabi ﷺ memerintahkan para wanita haid keluar pada hari raya, "mereka bertakbir bersama takbir orang-orang dan berdoa bersama doa mereka" (HR. Al-Bukhari). Aisyah berkata, "Nabi ﷺ bersandar di pangkuanku ketika aku haid, lalu beliau membaca Al-Qur\'an" (HR. Al-Bukhari).' }
    ] },
  { id: 19, q: 'Bagaimana jika haid datang ketika umrah atau haji?',
    jawab: 'Ia tetap melakukan semua manasik kecuali thawaf. Thawaf ditunda sampai ia suci dan mandi.',
    pendapat: [
      { nama: 'Menunggu suci untuk thawaf', siapa: 'Jumhur ulama', isi: 'Ihram, wuquf, mabit, dan melempar jumrah tetap sah. Thawaf ifadhah ditunda sampai suci. Thawaf wada\' gugur baginya.', dalil: 'Sabda Nabi ﷺ kepada Aisyah: "Lakukanlah apa yang dilakukan orang yang berhaji, hanya saja jangan thawaf di Ka\'bah sampai engkau suci" (HR. Al-Bukhari dan Muslim). Tentang Shafiyyah yang haid setelah thawaf ifadhah, Nabi ﷺ membolehkannya pulang tanpa thawaf wada\' (HR. Al-Bukhari dan Muslim).' },
      { nama: 'Boleh thawaf jika darurat', siapa: 'Ibnu Taimiyah dan Ibnul Qayyim', isi: 'Jika rombongan harus pulang dan ia tidak mungkin kembali, ia boleh thawaf dalam keadaan haid dengan memakai pembalut, karena darurat.', dalil: 'Kaidah syariat tentang gugurnya kewajiban yang tidak mampu dipenuhi.' }
    ] },
  { id: 20, q: 'Apakah wajib membuka kepangan rambut saat mandi haid?',
    jawab: 'Dalam mazhab Syafi\'i tidak wajib, selama air bisa sampai ke kulit kepala dan seluruh rambut.',
    pendapat: [
      { nama: 'Tidak wajib jika air sampai', siapa: 'Jumhur: Hanafiyah, Malikiyah, Syafi\'iyah', isi: 'Yang wajib adalah sampainya air. Jika air tidak sampai kecuali dengan dibuka, maka wajib dibuka.', dalil: 'Ummu Salamah bertanya apakah ia harus membuka kepangannya untuk mandi junub. Nabi ﷺ menjawab, "Tidak, cukup engkau menyiram kepalamu tiga kali" (HR. Muslim).' },
      { nama: 'Wajib membuka untuk mandi haid', siapa: 'Satu riwayat dalam mazhab Hanbali', isi: 'Untuk mandi haid wajib dibuka, sedangkan mandi junub tidak.', dalil: 'Sabda Nabi ﷺ kepada Aisyah yang haid: "Uraikan rambutmu dan bersisirlah" (HR. Al-Bukhari).' }
    ] },
  { id: 21, q: 'Jika suami menalak istri yang sedang haid, apakah talaknya jatuh?',
    jawab: 'Talak saat haid hukumnya haram dengan kesepakatan ulama. Adapun jatuh atau tidaknya, ada khilaf.',
    pendapat: [
      { nama: 'Jatuh, tetapi berdosa', siapa: 'Empat mazhab', isi: 'Talaknya terhitung. Suami diperintah untuk rujuk.', dalil: 'Ibnu Umar menalak istrinya saat haid, lalu Nabi ﷺ bersabda, "Perintahkan dia untuk merujuknya" (HR. Al-Bukhari dan Muslim). Perintah rujuk menunjukkan talaknya jatuh, dan dalam riwayat Al-Bukhari Ibnu Umar berkata talak itu dihitung satu.' },
      { nama: 'Tidak jatuh', siapa: 'Ibnu Hazm, Ibnu Taimiyah, Ibnul Qayyim', isi: 'Talak bid\'i tidak berlaku karena menyelisihi perintah Allah.', dalil: 'Sabda Nabi ﷺ: "Siapa yang melakukan amalan yang tidak ada perintah kami padanya, maka ia tertolak" (HR. Muslim).' }
    ] },
  { id: 22, q: 'Bolehkah wanita haid memasak, bersalaman, dan menyentuh keluarganya?',
    jawab: 'Boleh. Badan wanita haid tidak najis, begitu pula keringat dan air liurnya.',
    pendapat: [
      { nama: 'Boleh', siapa: 'Kesepakatan ulama', isi: 'Islam menyelisihi kebiasaan Yahudi yang mengucilkan wanita haid, tidak makan bersamanya, dan tidak tinggal serumah dengannya.', dalil: 'Ketika para sahabat mengabarkan kebiasaan Yahudi itu, Nabi ﷺ bersabda, "Lakukanlah segala sesuatu kecuali jima\'" (HR. Muslim). Aisyah minum dari gelas lalu Nabi ﷺ meletakkan mulutnya di bekas mulut Aisyah, padahal ia sedang haid (HR. Muslim).' }
    ] },
  { id: 23, q: 'Darah berhenti sebelum Subuh tapi belum sempat mandi, sahkah puasanya?',
    jawab: 'Sah menurut jumhur ulama. Ia wajib berniat puasa di malam itu, lalu mandi setelah fajar.',
    pendapat: [
      { nama: 'Sah', siapa: 'Jumhur ulama', isi: 'Syarat sahnya puasa adalah suci dari darah, bukan sudah mandi.', dalil: 'Diqiyaskan dengan orang junub. Aisyah dan Ummu Salamah berkata, Nabi ﷺ pernah masuk waktu Subuh dalam keadaan junub, lalu beliau mandi dan berpuasa (HR. Al-Bukhari dan Muslim).' },
      { nama: 'Tidak sah', siapa: 'Al-Auza\'i dan sebagian salaf', isi: 'Ia harus mandi sebelum fajar.', dalil: 'Membedakan haid dengan junub.' }
    ] },
  { id: 24, q: 'Haid datang sesaat sebelum Maghrib ketika puasa, bagaimana?',
    jawab: 'Puasanya batal dan wajib diqadha, walaupun darah keluar beberapa menit sebelum azan Maghrib.',
    pendapat: [
      { nama: 'Batal', siapa: 'Kesepakatan ulama', isi: 'Suci dari haid adalah syarat sah puasa sepanjang siang. Jika darah baru terasa akan keluar tetapi belum keluar sampai Maghrib, puasanya sah.', dalil: 'Hadits Abu Sa\'id: "Bukankah jika wanita haid ia tidak shalat dan tidak puasa?" (HR. Al-Bukhari).' }
    ] },
  { id: 25, q: 'Benarkah wanita haid tidak boleh memotong kuku dan rambut?',
    jawab: 'Tidak ada dalil yang melarangnya. Memotong kuku dan rambut ketika haid boleh.',
    pendapat: [
      { nama: 'Boleh', siapa: 'Kebanyakan ulama', isi: 'Larangan itu tidak bersumber dari Al-Qur\'an maupun hadits. Sebagian ulama hanya menyebut makruh bagi orang junub dengan alasan bagian tubuh yang terpotong akan kembali dalam keadaan junub, dan alasan ini tidak didukung dalil.', dalil: 'Hukum asalnya mubah dan tidak ada nash yang melarang. Al-Bukhari membawakan ucapan \'Atha\' secara mu\'allaq: "Orang junub boleh berbekam, memotong kukunya, dan mencukur rambutnya walaupun belum berwudhu." Nabi ﷺ juga bersabda, "Sesungguhnya orang mukmin tidak najis" (HR. Al-Bukhari dan Muslim).' }
    ],
    penutup: 'Rambut dan kuku yang terpotong tidak wajib ikut dimandikan.' }
];
/* Rencana soal 26-50 (akan dilengkapi) */
window.TANYA_RENCANA = [
  'Apa beda ciri darah haid dan darah istihadhah?', 'Bolehkah wanita mustahadhah shalat dan puasa?', 'Bagaimana cara bersuci wanita mustahadhah?', 'Bolehkah suami menggauli istri yang istihadhah?', 'Bolehkah satu wudhu mustahadhah untuk dua shalat fardhu?',
  'Flek di luar jadwal haid, apa hukumnya?', 'Haid tidak teratur setelah memakai KB', 'Darah yang keluar setelah berhubungan', 'Keputihan: najis atau suci, membatalkan wudhu atau tidak?', 'Bolehkah wanita haid ziarah kubur?',
  'Wanita haid di sepuluh malam terakhir Ramadhan', 'Santriwati haid dan setoran hafalan Al-Qur\'an', 'Usia menopause menurut para ulama', 'Darah setelah menopause', 'Haid pertama: tanda baligh dan kewajibannya',
  'Bagaimana mengajari anak perempuan tentang haid?', 'Wajibkah mencatat haid?', 'Haid datang di tengah shalat', 'Sujud tilawah dan sujud syukur bagi wanita haid', 'Membaca Al-Qur\'an lewat HP saat haid',
  'Menulis ayat Al-Qur\'an saat haid', 'Wanita haid ikut ke lapangan shalat Id', 'Nifas berhenti sebelum 40 hari: bolehkah shalat dan digauli?', 'Haid dan masa iddah (quru\')', 'Mandi haid sekaligus mandi junub'
];

/* ========== MUTIARA SALAF ========== */
window.QUOTES = [
  { ar: 'إِضَاعَةُ الْوَقْتِ أَشَدُّ مِنَ الْمَوْتِ، لِأَنَّ إِضَاعَةَ الْوَقْتِ تَقْطَعُكَ عَنِ اللّٰهِ وَالدَّارِ الْآخِرَةِ، وَالْمَوْتُ يَقْطَعُكَ عَنِ الدُّنْيَا وَأَهْلِهَا', id: 'Menyia-nyiakan waktu lebih berat daripada kematian. Menyia-nyiakan waktu memutusmu dari Allah dan negeri akhirat, sedangkan kematian hanya memutusmu dari dunia dan penghuninya.', siapa: 'Ibnul Qayyim', kitab: 'Al-Fawaid, hlm. 44 (cet. \'Atha\'at al-\'Ilm)' },
  { ar: 'فَفِي الْقَلْبِ شَعَثٌ لَا يَلُمُّهُ إِلَّا الْإِقْبَالُ عَلَى اللّٰهِ، وَفِيهِ وَحْشَةٌ لَا يُزِيلُهَا إِلَّا الْأُنْسُ بِهِ فِي خَلْوَتِهِ، وَفِيهِ حُزْنٌ لَا يُذْهِبُهُ إِلَّا السُّرُورُ بِمَعْرِفَتِهِ وَصِدْقِ مُعَامَلَتِهِ', id: 'Di dalam hati ada keretakan yang tidak bisa dirapatkan kecuali dengan menghadap kepada Allah. Ada kesepian yang tidak bisa dihilangkan kecuali dengan merasa dekat dengan-Nya dalam kesendirian. Ada kesedihan yang tidak bisa diusir kecuali dengan gembira mengenal-Nya dan jujur dalam bermuamalah dengan-Nya.', siapa: 'Ibnul Qayyim', kitab: 'Madarij as-Salikin 3/156 (cet. Dar al-Kitab al-\'Arabi)' },
  { ar: 'الْمَخْلُوقُ إِذَا خِفْتَهُ اسْتَوْحَشْتَ مِنْهُ وَهَرَبْتَ مِنْهُ، وَالرَّبُّ تَعَالَى إِذَا خِفْتَهُ أَنِسْتَ بِهِ وَقَرُبْتَ إِلَيْهِ', id: 'Makhluk, jika engkau takut kepadanya, engkau menjauh dan lari darinya. Adapun Rabb Ta\'ala, jika engkau takut kepada-Nya, engkau justru merasa tenteram dan mendekat kepada-Nya.', siapa: 'Ibnul Qayyim', kitab: 'Al-Fawaid, hlm. 44' },
  { ar: 'مَحْبُوبُ الْيَوْمِ يُعْقِبُ الْمَكْرُوهَ غَدًا، وَمَكْرُوهُ الْيَوْمِ يُعْقِبُ الْمَحْبُوبَ غَدًا', id: 'Yang disukai hari ini bisa berbuah sesuatu yang dibenci esok hari, dan yang dibenci hari ini bisa berbuah sesuatu yang disukai esok hari.', siapa: 'Ibnul Qayyim', kitab: 'Al-Fawaid, hlm. 44' },
  { ar: 'لَوْ نَفَعَ الْعِلْمُ بِلَا عَمَلٍ لَمَا ذَمَّ اللّٰهُ سُبْحَانَهُ أَحْبَارَ أَهْلِ الْكِتَابِ، وَلَوْ نَفَعَ الْعَمَلُ بِلَا إِخْلَاصٍ لَمَا ذَمَّ الْمُنَافِقِينَ', id: 'Seandainya ilmu tanpa amal itu bermanfaat, tentu Allah tidak mencela para rahib Ahli Kitab. Dan seandainya amal tanpa ikhlas itu bermanfaat, tentu Allah tidak mencela orang-orang munafik.', siapa: 'Ibnul Qayyim', kitab: 'Al-Fawaid, hlm. 44' },
  { ar: 'وَقْتُ الْإِنْسَانِ هُوَ عُمُرُهُ فِي الْحَقِيقَةِ، وَهُوَ مَادَّةُ حَيَاتِهِ الْأَبَدِيَّةِ فِي النَّعِيمِ الْمُقِيمِ، وَمَادَّةُ مَعِيشَتِهِ الضَّنْكِ فِي الْعَذَابِ الْأَلِيمِ', id: 'Waktu seseorang adalah umurnya yang sebenarnya. Waktu itulah bahan kehidupan abadinya dalam kenikmatan yang kekal, atau bahan kehidupan sempitnya dalam azab yang pedih.', siapa: 'Ibnul Qayyim', kitab: 'Ad-Da\' wad-Dawa\' (al-Jawab al-Kafi), hlm. 358 (cet. \'Atha\'at al-\'Ilm)' },
  { ar: 'وَمَنْ حَفِظَ اللّٰهَ فِي صِبَاهُ وَقُوَّتِهِ، حَفِظَهُ اللّٰهُ فِي حَالِ كِبَرِهِ وَضَعْفِ قُوَّتِهِ، وَمَتَّعَهُ بِسَمْعِهِ وَبَصَرِهِ وَحَوْلِهِ وَقُوَّتِهِ وَعَقْلِهِ', id: 'Siapa yang menjaga (hak-hak) Allah di masa muda dan kuatnya, Allah akan menjaganya di masa tua dan lemahnya, dan memberinya kenikmatan pendengaran, penglihatan, daya, kekuatan, dan akalnya.', siapa: 'Ibnu Rajab Al-Hanbali', kitab: 'Jami\' al-\'Ulum wal-Hikam 1/466 (tahqiq Al-Arna\'uth)' },
  { ar: 'لَيْسَ الْعِيدُ لِمَنْ لَبِسَ الْجَدِيدَ، إِنَّمَا الْعِيدُ لِمَنْ طَاعَاتُهُ تَزِيدُ', id: 'Hari raya bukanlah milik orang yang memakai pakaian baru. Hari raya adalah milik orang yang ketaatannya bertambah.', siapa: 'Ibnu Rajab Al-Hanbali', kitab: 'Latha\'if al-Ma\'arif, hlm. 277 (cet. Ibnu Hazm)' },
  { ar: 'يَنْبَغِي لِلْإِنْسَانِ أَنْ يَعْرِفَ شَرَفَ زَمَانِهِ وَقَدْرَ وَقْتِهِ، فَلَا يُضَيِّعُ مِنْهُ لَحْظَةً فِي غَيْرِ قُرْبَةٍ، وَيُقَدِّمُ الْأَفْضَلَ فَالْأَفْضَلَ مِنَ الْقَوْلِ وَالْعَمَلِ', id: 'Sepatutnya seseorang mengetahui mulianya masa yang ia jalani dan berharganya waktu yang ia miliki, sehingga tidak menyia-nyiakan sesaat pun untuk selain ibadah, dan mendahulukan ucapan dan amalan yang paling utama.', siapa: 'Ibnul Jauzi', kitab: 'Shaid al-Khathir, fasal "La tudhayyi\' lahzhah fi ghairi qurbah"' },
  { ar: 'مَنْ أَحَبَّ تَصْفِيَةَ الْأَحْوَالِ فَلْيَجْتَهِدْ فِي تَصْفِيَةِ الْأَعْمَالِ', id: 'Siapa yang ingin keadaan hatinya jernih, hendaklah ia bersungguh-sungguh menjernihkan amalnya.', siapa: 'Ibnul Jauzi', kitab: 'Shaid al-Khathir' }
];

/* Tanya jawab 26-50. Penyusun: Ukkaasyah Abdurrahman */
window.TANYA.push(
  { id: 26, q: 'Apa beda darah haid dan darah istihadhah, dan mana yang didahulukan: sifat darah atau kebiasaan?',
    jawab: 'Darah haid umumnya hitam atau merah tua, kental, dan berbau. Darah istihadhah umumnya merah segar, encer, dan tidak berbau. Ketika keduanya bercampur, para ulama berbeda pendapat tentang tanda mana yang didahulukan.',
    pendapat: [
      { nama: 'Sifat darah (tamyiz) didahulukan', siapa: 'Syafi\'iyah, dan satu riwayat dari Ahmad', isi: 'Jika darahnya bisa dibedakan dengan syarat-syaratnya, ia mengikuti sifat darah walaupun menyelisihi kebiasaannya. Jika tidak bisa, barulah kembali kepada kebiasaan.', dalil: 'Sabda Nabi ﷺ kepada Fathimah binti Abi Hubaisy: "Jika itu darah haid, ia berwarna hitam dan dikenali. Bila demikian, tinggalkanlah shalat" (HR. Abu Dawud dan An-Nasa\'i). Tanda yang ada pada darah itu sendiri lebih kuat daripada kebiasaan yang telah lalu (Mughni al-Muhtaj 1/288).' },
      { nama: 'Kebiasaan (\'adah) didahulukan', siapa: 'Hanafiyah dan Hanabilah (riwayat yang masyhur); dikuatkan Ibnu Taimiyah', isi: 'Wanita yang punya kebiasaan kembali kepada kebiasaannya walaupun darahnya bisa dibedakan.', dalil: 'Sabda Nabi ﷺ kepada Ummu Habibah: "Tinggallah (tidak shalat) sekadar lamanya haidmu biasa menahanmu, lalu mandilah dan shalatlah" (HR. Muslim). Kebiasaan tidak batal dalilnya, sedangkan warna bisa batal jika lebih dari 15 hari.' }
    ],
    penutup: 'Mesin penanggalan di aplikasi ini mengikuti pendapat pertama, yaitu mazhab Syafi\'i.' },
  { id: 27, q: 'Apakah wanita mustahadhah tetap wajib shalat dan puasa?',
    jawab: 'Ya, dengan kesepakatan ulama. Di luar masa haidnya, ia seperti wanita suci.',
    pendapat: [
      { nama: 'Wajib', siapa: 'Seluruh ulama', isi: 'Ia shalat, puasa, membaca Al-Qur\'an, menyentuh mushaf, dan thawaf seperti wanita suci. Hanya saja ia punya cara bersuci khusus.', dalil: 'Fathimah binti Abi Hubaisy bertanya, "Aku terkena istihadhah sehingga tidak pernah suci, apakah aku tinggalkan shalat?" Nabi ﷺ menjawab, "Tidak. Itu hanyalah darah urat, bukan haid ... lalu shalatlah" (HR. Al-Bukhari dan Muslim).' }
    ] },
  { id: 28, q: 'Bagaimana cara bersuci wanita mustahadhah, dan apakah wajib wudhu setiap shalat?',
    jawab: 'Dalam mazhab Syafi\'i ia membersihkan darah, menyumbat dan mengikat bila perlu, lalu berwudhu setelah masuk waktu untuk setiap shalat fardhu. Ulama berbeda pendapat tentang wajibnya wudhu itu.',
    pendapat: [
      { nama: 'Wajib wudhu untuk setiap shalat fardhu', siapa: 'Syafi\'iyah', isi: 'Wudhu dilakukan setelah masuk waktu, lalu segera shalat. Satu wudhu untuk satu fardhu, ditambah sunnah sebanyak yang ia mau.', dalil: 'Tambahan dalam riwayat Al-Bukhari: "Kemudian berwudhulah untuk setiap shalat." Juga hadits riwayat Abu Dawud dan At-Tirmidzi: "Ia berwudhu setiap kali shalat."' },
      { nama: 'Wajib wudhu untuk setiap waktu shalat', siapa: 'Hanafiyah dan Hanabilah', isi: 'Wudhu cukup sekali untuk satu waktu, dan dengannya ia boleh mengerjakan beberapa shalat di waktu itu, seperti shalat qadha.', dalil: 'Membawa kata "setiap shalat" kepada waktu shalat.' },
      { nama: 'Dianjurkan, tidak wajib', siapa: 'Malikiyah', isi: 'Darah istihadhah tidak membatalkan wudhu, sehingga memperbarui wudhu hanya dianjurkan.', dalil: 'Sebagian ahli hadits menilai tambahan "berwudhulah untuk setiap shalat" sebagai ucapan \'Urwah, bukan sabda Nabi ﷺ.' }
    ] },
  { id: 29, q: 'Bolehkah suami menggauli istri yang sedang istihadhah?',
    jawab: 'Boleh menurut jumhur ulama, karena istihadhah bukan haid.',
    pendapat: [
      { nama: 'Boleh', siapa: 'Jumhur: Hanafiyah, Malikiyah, Syafi\'iyah, satu riwayat Hanabilah', isi: 'Suami boleh menggaulinya kapan saja di luar masa haidnya.', dalil: '\'Ikrimah berkata, "Ummu Habibah mengalami istihadhah dan suaminya menggaulinya" (HR. Abu Dawud). Hamnah binti Jahsy juga mustahadhah dan suaminya menggaulinya (HR. Abu Dawud). Ibnu Abbas berkata, "Wanita mustahadhah boleh didatangi suaminya" (Al-Bukhari secara mu\'allaq).' },
      { nama: 'Tidak boleh kecuali khawatir terjerumus zina', siapa: 'Riwayat yang masyhur dalam mazhab Hanbali', isi: 'Karena darah adalah adza (gangguan) yang menjadi alasan larangan dalam haid.', dalil: 'Qiyas kepada haid, dengan alasan sama-sama adanya darah.' }
    ] },
  { id: 30, q: 'Bolehkah satu wudhu mustahadhah dipakai untuk dua shalat fardhu, misalnya ketika menjamak?',
    jawab: 'Dalam mazhab Syafi\'i tidak boleh. Setiap shalat fardhu butuh wudhu dan langkah-langkah bersuci yang baru, termasuk ketika menjamak.',
    pendapat: [
      { nama: 'Tidak boleh', siapa: 'Syafi\'iyah', isi: 'Wudhunya seperti tayammum: untuk satu fardhu, ditambah sunnah sebanyak yang ia mau. Shalat nadzar dan qadha juga terhitung fardhu (Asna al-Mathalib 1/102).', dalil: 'Perintah berwudhu untuk setiap shalat, dan hadatsnya terus berulang.' },
      { nama: 'Boleh di dalam satu waktu', siapa: 'Hanafiyah dan Hanabilah', isi: 'Selama waktu shalat belum habis, satu wudhu cukup untuk beberapa shalat.', dalil: 'Kata "setiap shalat" dimaknai "setiap waktu shalat".' }
    ] },
  { id: 31, q: 'Keluar flek (bercak coklat atau kuning) di luar jadwal haid, apa hukumnya?',
    jawab: 'Dalam mazhab Syafi\'i, flek dinilai dengan batas-batas haid. Bercak coklat termasuk keruh atau merah kekuningan.',
    pendapat: [
      { nama: 'Dirinci dengan batas haid', siapa: 'Syafi\'iyah', isi: 'Jika flek itu muncul setelah genap 15 hari suci, dan jumlah darahnya dalam 15 hari mencapai 24 jam, ia haid walaupun warnanya coklat atau kuning. Jika kurang dari 24 jam, atau muncul sebelum genap 15 hari suci, ia dam fasad: membatalkan wudhu, najis, tetapi shalat tetap wajib.', dalil: 'Kuning dan keruh di masa yang mungkin haid adalah haid menurut al-ashahh, berdasarkan atsar Aisyah tentang cairan putih (Al-Bukhari secara mu\'allaq).' },
      { nama: 'Flek setelah suci tidak dianggap', siapa: 'Hanabilah; dirajihkan Ibnu Utsaimin', isi: 'Flek coklat atau kuning yang tidak bersambung dengan haid bukan apa-apa. Ia cukup membersihkannya dan berwudhu.', dalil: 'Ucapan Ummu \'Athiyyah: "Kami tidak menganggap kudrah dan shufrah setelah suci sebagai apa-apa" (HR. Abu Dawud).' }
    ],
    penutup: 'Catat flek di kalender. Aplikasi akan menghitung apakah jumlahnya sudah mencapai 24 jam.' },
  { id: 32, q: 'Haid jadi tidak teratur setelah memakai KB, bagaimana hukumnya?',
    jawab: 'Tidak ada hukum khusus untuk darah karena KB. Darahnya dinilai dengan kaidah yang sama: batas 24 jam, 15 hari, dan suci 15 hari. Adapun hukum memakai KB, ada perincian.',
    pendapat: [
      { nama: 'KB sementara boleh dengan syarat', siapa: 'Jumhur ulama, diqiyaskan dengan \'azl', isi: 'Boleh jika disepakati suami istri, tidak membahayakan kesehatan, dan tidak bersifat memutus keturunan selamanya. Steril permanen tidak boleh kecuali darurat menurut keterangan dokter yang terpercaya.', dalil: 'Jabir berkata, "Kami melakukan \'azl sementara Al-Qur\'an turun" (HR. Al-Bukhari dan Muslim). Dalam riwayat Muslim: berita itu sampai kepada Nabi ﷺ dan beliau tidak melarang kami.' },
      { nama: 'Makruh atau terlarang', siapa: 'Ibnu Hazm, dan sebagian ulama', isi: 'Mencegah kehamilan menyelisihi anjuran memperbanyak keturunan.', dalil: 'Nabi ﷺ menyebut \'azl sebagai "pembunuhan yang samar" (HR. Muslim), dan sabda beliau "Nikahilah wanita yang penyayang dan subur" (HR. Abu Dawud).' }
    ],
    penutup: 'Jika setelah KB darah sering keluar sedikit-sedikit, rajinlah mencatat jam mulai dan berhentinya, karena di situlah hukumnya ditentukan.' },
  { id: 33, q: 'Keluar darah setelah berhubungan suami istri, haid atau bukan?',
    jawab: 'Jika darah itu memenuhi syarat haid (muncul setelah 15 hari suci dan jumlahnya mencapai 24 jam dalam 15 hari), ia haid. Jika tidak, ia darah luka atau dam fasad.',
    pendapat: [
      { nama: 'Dinilai dengan batas haid', siapa: 'Kaidah mazhab Syafi\'i', isi: 'Darah luka hukumnya najis dan membatalkan wudhu, tetapi tidak menghalangi shalat, puasa, dan jima\' berikutnya. Jika darah karena luka terus berulang, sebaiknya periksa ke dokter.', dalil: 'Haid adalah darah tabiat yang keluar dari pangkal rahim pada waktu tertentu, sedangkan darah karena sebab luar bukan haid.' }
    ] },
  { id: 34, q: 'Keputihan: najis atau suci, dan apakah membatalkan wudhu?',
    jawab: 'Dalam mazhab Syafi\'i, cairan apa pun yang keluar dari kemaluan membatalkan wudhu. Adapun najis atau sucinya, ada perincian.',
    pendapat: [
      { nama: 'Membatalkan wudhu, najisnya dirinci', siapa: 'Syafi\'iyah', isi: 'Cairan dari bagian luar yang wajib dibasuh hukumnya suci. Cairan dari bagian yang sangat dalam (yang tidak dicapai ketika jima\') najis. Yang di antara keduanya suci menurut al-ashahh. Semuanya membatalkan wudhu.', dalil: 'Kaidah mazhab: segala yang keluar dari qubul dan dubur membatalkan wudhu, berdasarkan firman Allah "atau salah seorang dari kalian datang dari tempat buang hajat" (QS. Al-Ma\'idah: 6).' },
      { nama: 'Suci tetapi membatalkan wudhu', siapa: 'Hanabilah', isi: 'Keputihan suci seperti keringat, tetapi membatalkan wudhu.', dalil: 'Hukum asal cairan tubuh manusia suci, kecuali yang ada dalilnya.' },
      { nama: 'Suci dan tidak membatalkan wudhu', siapa: 'Ibnu Hazm', isi: 'Tidak ada dalil yang menyebut keputihan sebagai pembatal.', dalil: 'Hukum asal wudhu tetap sah sampai ada dalil yang membatalkannya.' }
    ],
    penutup: 'Jika keputihan keluar terus-menerus, hukumnya seperti mustahadhah: berwudhu setelah masuk waktu untuk setiap shalat fardhu.' },
  { id: 35, q: 'Bolehkah wanita haid ziarah kubur?',
    jawab: 'Haid tidak menghalangi ziarah. Ia boleh mengucapkan salam dan mendoakan mayit. Yang diperselisihkan adalah hukum ziarah kubur bagi wanita secara umum.',
    pendapat: [
      { nama: 'Boleh', siapa: 'Satu pendapat dalam mazhab Hanafi dan Maliki; dirajihkan Al-Albani', isi: 'Wanita boleh ziarah selama tidak meratap dan tidak sering-sering.', dalil: 'Aisyah bertanya kepada Nabi ﷺ apa yang ia ucapkan ketika ziarah, lalu beliau mengajarkan "Assalamu \'ala ahlid diyar ..." (HR. Muslim).' },
      { nama: 'Makruh', siapa: 'Jumhur Syafi\'iyah dan Hanabilah', isi: 'Makruh karena wanita lebih mudah larut dalam kesedihan, kecuali ziarah ke makam Nabi ﷺ.', dalil: 'Gabungan dalil yang membolehkan dan yang melarang.' },
      { nama: 'Haram', siapa: 'Sebagian ulama', isi: 'Wanita tidak boleh ziarah kubur.', dalil: 'Hadits: "Allah melaknat wanita-wanita yang sering ziarah kubur" (HR. At-Tirmidzi).' }
    ],
    penutup: 'Menurut mazhab Syafi\'i ia tidak membaca Al-Qur\'an di kubur saat haid, tetapi boleh berdoa dan bershalawat.' },
  { id: 36, q: 'Haid di sepuluh malam terakhir Ramadhan, apakah masih bisa mendapat lailatul qadar?',
    jawab: 'Masih bisa, insya Allah. Ia tidak shalat dan tidak i\'tikaf di masjid, tetapi banyak amalan lain yang tetap terbuka.',
    pendapat: [
      { nama: 'Tetap berpeluang mendapatkannya', siapa: 'Para ulama salaf', isi: 'Perbanyak dzikir, istighfar, doa, sedekah, memberi makan orang berbuka, dan mendengarkan Al-Qur\'an. I\'tikaf di masjid tidak boleh menurut jumhur.', dalil: 'Juwaibir bertanya kepada Adh-Dhahhak tentang wanita nifas, wanita haid, musafir, dan orang yang tidur: apakah mereka mendapat bagian dari lailatul qadar? Ia menjawab, "Ya, setiap orang yang Allah terima amalnya akan diberi bagiannya" (dinukil Ibnu Rajab dalam Latha\'if al-Ma\'arif; sanad atsar ini lemah karena Juwaibir, tetapi maknanya sejalan dengan keluasan rahmat Allah bagi orang yang terhalang uzur). Doa yang diajarkan Nabi ﷺ kepada Aisyah: "Allahumma innaka \'afuwwun tuhibbul \'afwa fa\'fu \'anni" (HR. At-Tirmidzi).' }
    ] },
  { id: 37, q: 'Santriwati haid, bagaimana dengan setoran hafalan Al-Qur\'an?',
    jawab: 'Jawabannya kembali kepada khilaf tentang membaca Al-Qur\'an bagi wanita haid (soal nomor 1).',
    pendapat: [
      { nama: 'Tidak menyetor dengan lisan', siapa: 'Syafi\'iyah', isi: 'Ia tidak melafalkan ayat dengan niat membaca. Ia boleh mengulang hafalan di dalam hati tanpa menggerakkan lisan, mendengarkan murattal, dan melihat ayat tanpa menyentuh mushaf. Setorannya diganti setelah suci.', dalil: 'Larangan membaca Al-Qur\'an bagi wanita haid dalam mazhab, sedangkan membaca dalam hati tidak disebut membaca.' },
      { nama: 'Boleh menyetor tanpa menyentuh mushaf', siapa: 'Malikiyah dan ulama yang membolehkan', isi: 'Menghafal dan mengajar adalah kebutuhan, dan khawatir lupa hafalan menjadi alasan yang kuat.', dalil: 'Tidak ada dalil shahih yang melarang, dan haid berlangsung lama setiap bulan.' }
    ],
    penutup: 'Pihak pondok bisa menyiapkan jadwal pengganti bagi santriwati yang haid agar target hafalan tetap terjaga.' },
  { id: 38, q: 'Sampai usia berapa wanita bisa haid (menopause)?',
    jawab: 'Dalam mazhab Syafi\'i tidak ada batas usia akhir haid. Selama darah memenuhi syarat, ia haid.',
    pendapat: [
      { nama: 'Tidak ada batas', siapa: 'Syafi\'iyah; juga Ibnu Taimiyah', isi: 'Wanita bisa haid selama ia hidup. Usia 62 tahun hanya dipakai sebagai patokan umum masa putus haid dalam bab iddah.', dalil: 'Tidak ada dalil yang membatasi, sehingga dikembalikan kepada kenyataan.' },
      { nama: '50 tahun', siapa: 'Hanabilah', isi: 'Darah setelah usia 50 tahun bukan haid.', dalil: 'Ucapan Aisyah: "Jika wanita telah mencapai 50 tahun, ia keluar dari batas haid" (disebutkan Ahmad).' },
      { nama: '55 tahun', siapa: 'Hanafiyah', isi: 'Setelah usia 55 tahun, darah dianggap bukan haid kecuali sangat jelas sifatnya.', dalil: 'Kebiasaan yang umum.' },
      { nama: 'Dirinci', siapa: 'Malikiyah', isi: 'Usia 70 tahun pasti tidak haid. Antara 50 dan 70 ditanyakan kepada wanita yang berpengalaman.', dalil: 'Kenyataan dan pengalaman para wanita.' }
    ] },
  { id: 39, q: 'Keluar darah setelah lama tidak haid karena usia lanjut, apa hukumnya?',
    jawab: 'Menurut mazhab Syafi\'i, jika darah itu memenuhi syarat haid, ia haid berapa pun usianya.',
    pendapat: [
      { nama: 'Haid jika memenuhi syarat', siapa: 'Syafi\'iyah', isi: 'Jika jumlahnya mencapai 24 jam dan tidak melewati 15 hari, ia meninggalkan shalat dan puasa seperti biasa.', dalil: 'Tidak ada batas usia akhir haid dalam mazhab.' },
      { nama: 'Dam fasad', siapa: 'Hanabilah (setelah 50 tahun)', isi: 'Ia tetap shalat dan puasa.', dalil: 'Atsar Aisyah tentang usia 50 tahun.' }
    ],
    penutup: 'Darah yang keluar setelah menopause sebaiknya juga diperiksakan ke dokter.' },
  { id: 40, q: 'Haid pertama: apa tanda baligh dan apa saja kewajibannya?',
    jawab: 'Haid adalah salah satu tanda baligh bagi perempuan. Sejak itu ia menjadi mukallaf.',
    pendapat: [
      { nama: 'Tanda baligh perempuan', siapa: 'Kesepakatan ulama, dengan khilaf pada batas usia', isi: 'Tanda baligh: haid, mimpi keluar mani, hamil, atau mencapai usia tertentu. Usia baligh menurut Syafi\'iyah dan Hanabilah 15 tahun hijriyah; menurut Abu Hanifah 17 tahun; menurut Malikiyah 18 tahun. Setelah baligh ia wajib shalat lima waktu, puasa Ramadhan, menutup aurat dengan sempurna, dan mandi setiap selesai haid.', dalil: 'Sabda Nabi ﷺ: "Allah tidak menerima shalat wanita yang sudah haid (baligh) kecuali dengan kerudung" (HR. Abu Dawud dan At-Tirmidzi). Juga sabda beliau, "Pena diangkat dari tiga orang ... dari anak kecil sampai ia baligh" (HR. Abu Dawud).' }
    ] },
  { id: 41, q: 'Bagaimana mengajari anak perempuan tentang haid?',
    jawab: 'Ajarkan sebelum haid pertama datang, dengan bahasa yang lembut dan tidak menakutkan. Malu tidak boleh menghalangi belajar agama.',
    pendapat: [
      { nama: 'Bimbingan', siapa: 'Adab yang diajarkan para salaf', isi: 'Sampaikan bahwa haid adalah ketetapan Allah yang menandai ia sudah dewasa, ajarkan cara mencatat, cara mandi, apa yang dilarang dan dibolehkan, serta bahwa dzikir dan doa tetap terbuka. Siapkan pembalut dan jelaskan cara menjaga kebersihan.', dalil: 'Aisyah berkata, "Sebaik-baik wanita adalah wanita Anshar, rasa malu tidak menghalangi mereka untuk memahami agama" (HR. Muslim). Nabi ﷺ juga bersabda tentang haid, "Ini adalah perkara yang Allah tetapkan atas putri-putri Adam" (HR. Al-Bukhari dan Muslim).' }
    ] },
  { id: 42, q: 'Wajibkah mencatat haid?',
    jawab: 'Mencatat tidak wajib secara khusus, tetapi mempelajari hukum haid yang ia butuhkan adalah fardhu \'ain bagi setiap wanita. Bagi yang darahnya sering tidak teratur, mencatat menjadi jalan untuk menunaikan kewajiban itu.',
    pendapat: [
      { nama: 'Sangat dianjurkan', siapa: 'Ulama Syafi\'iyah', isi: 'Wanita yang lupa kebiasaannya bisa jatuh ke keadaan mutahayyirah yang hukumnya paling berat: mandi untuk setiap shalat dan menjauhi suaminya. Catatan yang rapi menjaganya dari keadaan itu.', dalil: 'Kaidah: sesuatu yang menjadi jalan satu-satunya untuk menunaikan kewajiban, hukumnya ikut wajib. Juga anjuran para ulama dalam bab kebiasaan yang berpindah (Majmu\' 2/448).' }
    ] },
  { id: 43, q: 'Haid datang ketika sedang shalat, bagaimana?',
    jawab: 'Shalatnya batal dan ia menghentikannya. Apakah wajib diqadha, bergantung pada waktu yang telah berlalu.',
    pendapat: [
      { nama: 'Wajib qadha jika sempat', siapa: 'Syafi\'iyah', isi: 'Jika sejak masuk waktu sampai haid datang ada waktu yang cukup untuk shalat itu, ia wajib mengqadhanya setelah suci. Jika ia baru mulai shalat di awal waktu lalu haid datang sebelum sempat menyelesaikan, tidak wajib qadha.', dalil: 'Kaidah tentang tetapnya kewajiban ketika seseorang sempat mengerjakannya (lihat soal nomor 12).' }
    ] },
  { id: 44, q: 'Bolehkah wanita haid sujud tilawah dan sujud syukur?',
    jawab: 'Dalam mazhab Syafi\'i tidak boleh, karena keduanya disyaratkan suci seperti shalat.',
    pendapat: [
      { nama: 'Tidak boleh', siapa: 'Jumhur ulama, termasuk Syafi\'iyah', isi: 'Sujud tilawah dan sujud syukur hukumnya seperti shalat: butuh suci, menutup aurat, dan menghadap kiblat.', dalil: 'Sabda Nabi ﷺ: "Allah tidak menerima shalat tanpa bersuci" (HR. Muslim), dan sujud adalah bagian dari shalat.' },
      { nama: 'Boleh', siapa: 'Ibnu Taimiyah dan sebagian salaf', isi: 'Sujud tilawah bukan shalat, sehingga tidak disyaratkan suci.', dalil: 'Ibnu Umar biasa sujud tilawah tanpa wudhu (Al-Bukhari secara mu\'allaq), dan Nabi ﷺ sujud ketika membaca An-Najm lalu orang-orang musyrik ikut sujud (HR. Al-Bukhari).' }
    ] },
  { id: 45, q: 'Bolehkah wanita haid membaca Al-Qur\'an lewat HP?',
    jawab: 'Memegang HP boleh, karena banyak ulama masa kini memandang HP tidak dihukumi mushaf. Adapun membaca ayatnya, kembali kepada khilaf soal nomor 1.',
    pendapat: [
      { nama: 'Menyentuh boleh, membaca dirinci', siapa: 'Banyak ulama masa kini', isi: 'Tulisan di layar hanya cahaya yang muncul dan hilang, bukan tulisan tetap seperti mushaf. Dalam mazhab Syafi\'i ia tetap tidak membaca dengan niat tilawah, tetapi boleh melihat, merenungkan, dan mendengarkan murattal.', dalil: 'Perbedaan antara mushaf dan perangkat elektronik; serta dalil-dalil soal nomor 1.' }
    ] },
  { id: 46, q: 'Bolehkah wanita haid menulis ayat Al-Qur\'an?',
    jawab: 'Dalam mazhab Syafi\'i boleh menulisnya jika ia tidak menyentuh dan tidak membawa kertas yang ditulisi ayat itu.',
    pendapat: [
      { nama: 'Boleh tanpa menyentuh', siapa: 'Syafi\'iyah (al-ashahh)', isi: 'Misalnya kertas diletakkan di meja dan ia menulis dengan pena tanpa menyentuh tulisannya, atau mengetik di HP dan laptop. Jika ia menyentuh atau membawa kertasnya, haram.', dalil: 'Yang dilarang adalah menyentuh dan membawa mushaf, sedangkan menulis tanpa keduanya tidak termasuk.' }
    ] },
  { id: 47, q: 'Apakah wanita haid ikut ke lapangan shalat Id?',
    jawab: 'Ya, ia dianjurkan ikut hadir, tetapi menjauhi tempat shalat.',
    pendapat: [
      { nama: 'Dianjurkan hadir', siapa: 'Jumhur ulama', isi: 'Ia ikut menyaksikan kebaikan, takbir, dan doa kaum muslimin, dengan tetap menutup aurat.', dalil: 'Ummu \'Athiyyah berkata, "Kami diperintah mengeluarkan para gadis dan wanita haid pada dua hari raya, agar mereka menyaksikan kebaikan dan doa kaum muslimin, dan wanita haid menjauhi tempat shalat" (HR. Al-Bukhari dan Muslim).' }
    ] },
  { id: 48, q: 'Nifas berhenti sebelum 40 hari, bolehkah shalat dan digauli?',
    jawab: 'Boleh. Jika darah berhenti dan ia sudah suci, ia mandi lalu shalat dan puasa. Tentang jima\', ada khilaf.',
    pendapat: [
      { nama: 'Boleh digauli', siapa: 'Jumhur: Hanafiyah, Malikiyah, Syafi\'iyah', isi: 'Ia sudah suci, maka semua yang dilarang karena nifas menjadi halal setelah mandi.', dalil: 'Nifas tidak punya batas minimal; ketika darah berhenti, hukumnya hilang.' },
      { nama: 'Makruh sebelum 40 hari', siapa: 'Hanabilah', isi: 'Shalat dan puasa wajib, tetapi jima\' makruh sebelum genap 40 hari, khawatir darah kembali.', dalil: 'Atsar \'Utsman bin Abil \'Ash yang berpesan kepada istrinya agar tidak mendekatinya sebelum 40 hari.' }
    ],
    penutup: 'Jika darah kembali sebelum 60 hari dan jedanya kurang dari 15 hari, darah itu masih nifas (mazhab Syafi\'i).' },
  { id: 49, q: 'Apa hubungan haid dengan masa iddah (quru\')?',
    jawab: 'Iddah wanita yang ditalak dan masih haid adalah tiga quru\'. Ulama berbeda pendapat apakah quru\' itu masa suci atau masa haid.',
    pendapat: [
      { nama: 'Quru\' adalah masa suci', siapa: 'Malikiyah dan Syafi\'iyah', isi: 'Iddah selesai ketika ia memasuki haid ketiga.', dalil: 'Firman Allah, "Maka ceraikanlah mereka pada waktu mereka dapat (menghadapi) iddahnya" (QS. Ath-Thalaq: 1). Dalam kisah Ibnu Umar, Nabi ﷺ memerintahkan talak di masa suci lalu bersabda, "Itulah iddah yang Allah perintahkan" (HR. Al-Bukhari dan Muslim).' },
      { nama: 'Quru\' adalah masa haid', siapa: 'Hanafiyah dan Hanabilah', isi: 'Iddah selesai ketika ia suci dari haid ketiga.', dalil: 'Sabda Nabi ﷺ kepada wanita mustahadhah: "Tinggalkan shalat pada hari-hari quru\'mu" (HR. Abu Dawud dan An-Nasa\'i), yaitu hari-hari haid.' }
    ] },
  { id: 50, q: 'Haid berhenti dan ia juga sedang junub, cukupkah mandi sekali?',
    jawab: 'Cukup sekali mandi untuk keduanya.',
    pendapat: [
      { nama: 'Cukup satu mandi', siapa: 'Jumhur ulama, termasuk Syafi\'iyah', isi: 'Ia berniat menghilangkan hadats haid dan junub, atau niat menghilangkan hadats besar. Menurut mazhab Syafi\'i, berniat salah satunya saja juga sudah mengangkat keduanya.', dalil: 'Sabda Nabi ﷺ: "Sesungguhnya amal itu tergantung niatnya" (HR. Al-Bukhari dan Muslim). Nabi ﷺ juga pernah menggilir istri-istrinya dengan satu kali mandi (HR. Muslim).' }
    ] }
);
window.TANYA_RENCANA = [];

/* Haidku — kerangka aplikasi. Penyusun materi: Ukkaasyah Abdurrahman */
(function () {
  'use strict';
  const E = window.HaidEngine, P = window.PrayTimes;
  const H = 3600e3, D = 24 * H;
  const KEY = 'haidku_v1';
  const DEMO_CODES = ['HAIDKU-DEMO'];
  const PRICE = 'Rp50.000';

  const CITIES = [
    ['Medan', 3.5952, 98.6722, 7], ['Medan Marelan', 3.7300, 98.6480, 7], ['Binjai', 3.6001, 98.4854, 7], ['Banda Aceh', 5.5483, 95.3238, 7], ['Pekanbaru', 0.5071, 101.4478, 7], ['Padang', -0.9471, 100.4172, 7],
    ['Batam', 1.0456, 104.0305, 7], ['Jambi', -1.6101, 103.6131, 7], ['Palembang', -2.9761, 104.7754, 7], ['Bengkulu', -3.7928, 102.2608, 7], ['Bandar Lampung', -5.3971, 105.2668, 7],
    ['Jakarta', -6.2088, 106.8456, 7], ['Bogor', -6.5971, 106.8060, 7], ['Depok', -6.4025, 106.7942, 7], ['Tangerang', -6.1783, 106.6319, 7], ['Bekasi', -6.2383, 106.9756, 7], ['Serang', -6.1200, 106.1503, 7],
    ['Bandung', -6.9175, 107.6191, 7], ['Cirebon', -6.7320, 108.5523, 7], ['Semarang', -6.9667, 110.4167, 7], ['Solo', -7.5755, 110.8243, 7], ['Yogyakarta', -7.7956, 110.3695, 7],
    ['Surabaya', -7.2575, 112.7521, 7], ['Malang', -7.9666, 112.6326, 7], ['Pontianak', -0.0263, 109.3425, 7], ['Palangkaraya', -2.2161, 113.9135, 7],
    ['Banjarmasin', -3.3186, 114.5944, 8], ['Balikpapan', -1.2379, 116.8529, 8], ['Samarinda', -0.5022, 117.1536, 8], ['Denpasar', -8.6705, 115.2126, 8], ['Mataram', -8.5833, 116.1167, 8],
    ['Kupang', -10.1772, 123.6070, 8], ['Makassar', -5.1477, 119.4327, 8], ['Palu', -0.8917, 119.8707, 8], ['Kendari', -3.9985, 122.5129, 8], ['Manado', 1.4748, 124.8421, 8], ['Gorontalo', 0.5435, 123.0568, 8],
    ['Ambon', -3.6954, 128.1814, 9], ['Ternate', 0.7893, 127.3842, 9], ['Jayapura', -2.5337, 140.7181, 9], ['Sorong', -0.8762, 131.2558, 9],
    ['Kuala Lumpur', 3.1390, 101.6869, 8], ['Singapura', 1.3521, 103.8198, 8], ['Makkah', 21.3891, 39.8579, 3], ['Madinah', 24.5247, 39.5692, 3]
  ];

  /* ---------------- STATE ---------------- */
  const blank = () => ({ user: null, city: { name: 'Medan', lat: 3.5952, lng: 98.6722, tz: 7 }, khilaf: 'ibnuhajar', premium: false, segments: [], births: [], dz: { day: '', c: {} }, dzOpt: { lat: true, arti: true, z: 1 }, fs: 1 });
  let S = blank();
  try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(blank(), JSON.parse(raw)); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const ui = { view: 'beranda', cal: null, belajar: 'materi', materi: null, dzTab: null, q: '', kat: 'Semua' };
  const APP_VERSION = '2026.11.14-1916';
  const KAT_ORDER = ['Tidur', 'Bersuci', 'Rumah', 'Masjid', 'Makan', 'Pakaian', 'Ibadah', 'Shalat', 'Perasaan', 'Kesehatan', 'Keluarga', 'Sosial', 'Cuaca', 'Perjalanan', 'Umum'];

  /* ---------------- UTIL ---------------- */
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const HARI = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const hm = (ms, tz) => { const d = new Date(ms + tz * H); return pad(d.getUTCHours()) + '.' + pad(d.getUTCMinutes()); };
  const fdt = ms => { const d = new Date(ms); return HARI[d.getDay()] + ', ' + d.getDate() + ' ' + BULAN[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear() + ', ' + pad(d.getHours()) + '.' + pad(d.getMinutes()); };
  const fd = ms => { const d = new Date(ms); return d.getDate() + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear(); };
  const toInput = ms => { const d = new Date(ms); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  const fromInput = v => v ? new Date(v).getTime() : null;
  const dur = ms => { const d = Math.floor(ms / D), h = Math.round((ms % D) / H); return (d ? d + ' hari ' : '') + (h ? h + ' jam' : (d ? '' : '< 1 jam')); };
  const uid = () => Math.random().toString(36).slice(2, 10);
  function hijri(ms, opt) {
    try { return new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', opt || { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(ms)); } catch (e) { return ''; }
  }
  function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); }

  const ICON = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/><circle cx="12" cy="15" r="1.6" fill="currentColor"/>',
    book: '<path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v15H5.5A1.5 1.5 0 0 1 4 17.5z"/><path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H13v15h5.5c.8 0 1.5-.7 1.5-1.5z"/>',
    beads: '<circle cx="12" cy="5" r="2"/><circle cx="6.5" cy="8.5" r="2"/><circle cx="17.5" cy="8.5" r="2"/><circle cx="5.5" cy="14.5" r="2"/><circle cx="18.5" cy="14.5" r="2"/><path d="M12 7v9m0 0-2 4m2-4 2 4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    drop: '<path d="M12 3.5s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    left: '<path d="m15 5-7 7 7 7"/>', right: '<path d="m9 5 7 7-7 7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', stop: '<rect x="6" y="6" width="12" height="12" rx="3"/>',
    swap: '<path d="M7 7h11l-3-3M17 17H6l3 3"/>', baby: '<circle cx="12" cy="9" r="4"/><path d="M6 20c.8-3 3.2-5 6-5s5.2 2 6 5"/><path d="M10.5 8.5h.01M13.5 8.5h.01"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', palette: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 1.8-.8 1.8-1.7 0-1.3-1-1.6-1-2.6 0-.9.7-1.6 1.6-1.6H17a3.5 3.5 0 0 0 3.5-3.5c0-4.3-3.8-7.6-8.5-7.6z"/><circle cx="8" cy="11" r="1.2" fill="currentColor"/><circle cx="11" cy="7.6" r="1.2" fill="currentColor"/><circle cx="15" cy="8.2" r="1.2" fill="currentColor"/>',
    sparkle: '<path d="M12 3.5 13.8 10 20 12l-6.2 2L12 20.5 10.2 14 4 12l6.2-2z"/>', ban: '<circle cx="12" cy="12" r="8.5"/><path d="m6 6 12 12"/>',
    mosque: '<path d="M12 3c2 2 4 3 4 6H8c0-3 2-4 4-6z"/><path d="M5 21V12h14v9"/><path d="M10 21v-4a2 2 0 0 1 4 0v4M3 21h18"/>', water: '<path d="M7 14a5 5 0 0 0 10 0c0-3.5-5-9-5-9s-5 5.5-5 9z"/><path d="M10 15a2 2 0 0 0 2 2"/>',
    shield: '<path d="M12 3.5 19 6v5.5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z"/>', layers: '<path d="m12 4 8.5 4.5L12 13 3.5 8.5z"/><path d="m3.5 12.5 8.5 4.5 8.5-4.5"/><path d="m3.5 16.5 8.5 4.5 8.5-4.5"/>',
    note: '<path d="M6 3.5h9l4 4v13H6z"/><path d="M14.5 3.5V8H19M9 12h7M9 16h5"/>', search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M5 15.5V6a2 2 0 0 1 2-2h8.5"/>', trash: '<path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    pin: '<path d="M12 21s6.5-6 6.5-11a6.5 6.5 0 0 0-13 0C5.5 15 12 21 12 21z"/><circle cx="12" cy="10" r="2.4"/>', moon: '<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
    star: '<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8-4.3-4.1 5.9-.8z"/>', download: '<path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/>', crown: '<path d="m4 8 4 4 4-7 4 7 4-4-1.5 10h-13z"/>'
  };
  const ic = (n, cls) => '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (ICON[n] || '') + '</svg>';
  const KIND = {
    haid: { c: '#C8385A', n: 'Haid' }, haid_sementara: { c: '#E7849A', n: 'Kemungkinan haid' }, nifas: { c: '#8E4C9E', n: 'Nifas' },
    istihadhah: { c: '#E9A06B', n: 'Istihadhah' }, fasad: { c: '#B9AEB5', n: 'Dam fasad' }, ragu: { c: '#B48BC9', n: 'Ragu (ihtiyath)' }, suci: { c: '#E9A9BC', n: 'Suci' }
  };
  const COLOR_HEX = { hitam: '#2B1A20', merah: '#B3202F', asyqar: '#D9733B', kuning: '#E6C14A', keruh: '#9C8E78' };
  const COLOR_LBL = { hitam: 'Hitam', merah: 'Merah', asyqar: 'Asyqar', kuning: 'Kuning', keruh: 'Keruh' };

  /* ---------------- ENGINE ---------------- */
  let cache = null;
  function analysis() {
    const key = JSON.stringify([S.segments, S.births, S.user && S.user.birth, S.user && S.user.status, S.user && S.user.adahHaid, S.user && S.user.adahSuci, S.khilaf, Math.floor(Date.now() / 60000)]);
    if (cache && cache.key === key) return cache.r;
    const u = S.user || {};
    const prof = { birthDate: u.birth ? new Date(u.birth).getTime() : null, status: u.status || 'mubtadiah' };
    if (u.status === 'mutadah' && u.adahHaid) prof.adah = { haidH: +u.adahHaid * 24, suciH: (+u.adahSuci || 24) * 24 };
    const r = E.analyze({ segments: S.segments, births: S.births, profile: prof, opts: { khilaf: S.khilaf }, now: Date.now() });
    cache = { key, r }; return r;
  }
  const ongoingSeg = () => S.segments.find(s => s.end == null);

  /* ---------------- PRAYER ---------------- */
  const PKEYS = ['imsak', 'fajr', 'sunrise', 'dhuha', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const MAJOR = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  function nextPrayer(now) {
    const t = P.forDate(now, S.city), t2 = P.forDate(now + D, S.city);
    for (const k of MAJOR) if (t[k] > now) return { k, at: t[k] };
    return { k: 'fajr', at: t2.fajr };
  }

  /* ================= VIEWS ================= */
  function render() {
    const app = $('#app');
    try { document.documentElement.style.setProperty('--fs', S.fs || 1); document.documentElement.style.setProperty('--arz', (S.dzOpt && S.dzOpt.z) || 1); } catch (e) {}
    if (!S.user) { app.innerHTML = viewOnboard(); return; }
    let body = '';
    if (ui.view === 'beranda') body = viewHome();
    else if (ui.view === 'kalender') body = S.premium ? viewCal() : viewLocked('Kalender Haid', 'Catat darah, lihat hukumnya otomatis menurut mazhab Syafi\'i: haid, istihadhah, nifas, dan shalat yang wajib diqadha.');
    else if (ui.view === 'belajar') body = S.premium ? viewBelajar() : viewLocked('Belajar Fikih Wanita', 'Materi fikih haid, nifas, dan istihadhah, 50 tanya jawab lengkap dengan khilaf ulama dan dalilnya, serta mutiara nasihat salaf.');
    else if (ui.view === 'dzikir') body = S.premium ? viewDzikir() : viewLocked('Dzikir & Doa', 'Dzikir pagi petang, dzikir setelah shalat, dan doa harian dari hadits-hadits yang shahih, lengkap dengan Arab, latin, dan artinya.');
    else if (ui.view === 'profil') body = viewProfil();
    app.innerHTML = '<div class="view">' + body + '</div>' + navBar();
    if (ui.view === 'beranda') tick();
  }

  function navBar() {
    const items = [['beranda', 'home', 'Beranda', 0], ['kalender', 'cal', 'Kalender', 1], ['belajar', 'book', 'Belajar', 1], ['dzikir', 'beads', 'Dzikir', 1], ['profil', 'user', 'Profil', 0]];
    return '<nav class="nav">' + items.map(([v, i, n, p]) => '<button data-act="go" data-v="' + v + '" class="' + (ui.view === v ? 'on' : '') + '">' + ic(i) + n + (p && !S.premium ? '<span class="lk">' + ic('lock') + '</span>' : '') + '</button>').join('') + '</nav>';
  }

  /* ---------- Onboarding ---------- */
  let ob = { step: 0, d: { status: 'mutadah' } };
  function viewOnboard() {
    const st = '<div class="steps">' + [0, 1, 2].map(i => '<i class="' + (i <= ob.step ? 'on' : '') + '"></i>').join('') + '</div>';
    if (ob.step === 0) return '<div class="ob-wrap"><div class="logo">' + ic('moon') + '</div><h1 class="ob-title">Haidku</h1><p class="ob-sub">Catatan haid & ibadah muslimah<br>menurut mazhab Syafi\'i</p>' + st +
      '<div class="card"><ul class="feat">' +
      [['clock', 'Waktu shalat harian untuk kota Anda'], ['cal', 'Kalender haid yang langsung menentukan hukumnya: haid, istihadhah, atau nifas'], ['mosque', 'Pengingat shalat yang wajib diqadha ketika haid datang dan berhenti'], ['book', 'Materi fikih dan 50 tanya jawab dengan khilaf ulama'], ['beads', 'Dzikir pagi petang, setelah shalat, dan doa harian yang shahih']].map(x => '<li>' + ic(x[0]) + '<span>' + x[1] + '</span></li>').join('') +
      '</ul><button class="btn block" data-act="ob-next">Mulai daftar</button></div><p class="disclaimer">Materi disusun oleh Ukkaasyah Abdurrahman</p></div>';
    if (ob.step === 1) {
      const d = ob.d;
      return '<div class="ob-wrap">' + st + '<h2 class="ob-title" style="font-size:1.6rem">Daftar akun</h2><p class="ob-sub">Data ini membantu menghitung hukum haid, seperti batas usia haid.</p><div class="card">' +
        '<label class="lbl">Nama</label><input class="inp" id="o-nama" value="' + esc(d.nama) + '" placeholder="Nama Anda">' +
        '<label class="lbl">Email</label><input class="inp" id="o-email" type="email" value="' + esc(d.email) + '" placeholder="nama@email.com">' +
        '<label class="lbl">Tanggal lahir</label><input class="inp" id="o-lahir" type="date" value="' + esc(d.birth) + '">' +
        '<label class="lbl">Kota (untuk waktu shalat)</label><select class="inp" id="o-kota">' + CITIES.map(c => '<option ' + (c[0] === (d.kota || S.city.name) ? 'selected' : '') + '>' + c[0] + '</option>').join('') + '</select>' +
        '<div style="height:14px"></div><button class="btn block" data-act="ob-1">Lanjut</button></div></div>';
    }
    const d = ob.d;
    const r = (v, b, s) => '<div class="radio ' + (d.status === v ? 'on' : '') + '" data-act="ob-status" data-v="' + v + '"><span class="dot2"></span><div><b>' + b + '</b><span>' + s + '</span></div></div>';
    return '<div class="ob-wrap">' + st + '<h2 class="ob-title" style="font-size:1.6rem">Data haid</h2><p class="ob-sub">Boleh dilewati dan diisi nanti di menu Profil.</p><div class="card">' +
      r('mutadah', 'Sudah biasa haid', 'Saya ingat kebiasaan haid saya') + r('mubtadiah', 'Belum pernah haid', 'Atau baru pertama kali') + r('nasiyah', 'Sudah pernah haid, tapi lupa kebiasaannya', 'Lupa lama dan waktunya') +
      (d.status === 'mutadah' ? '<div class="row2"><div><label class="lbl">Biasanya haid (hari)</label><input class="inp" id="o-ah" type="number" min="1" max="15" step="0.5" value="' + esc(d.adahHaid || 7) + '"></div><div><label class="lbl">Biasanya suci (hari)</label><input class="inp" id="o-as" type="number" min="15" max="120" value="' + esc(d.adahSuci || 23) + '"></div></div>' +
        '<label class="lbl" style="margin-top:16px">Haid terakhir: pertama keluar</label><input class="inp" id="o-ls" type="datetime-local">' +
        '<label class="lbl">Haid terakhir: berhenti</label><input class="inp" id="o-le" type="datetime-local">' : '') +
      '<div style="height:14px"></div><button class="btn block" data-act="ob-2">Selesai</button><div style="height:8px"></div><button class="btn ghost block" data-act="ob-skip">Lewati</button></div></div>';
  }

  /* ---------- Beranda ---------- */
  function viewHome() {
    const now = Date.now(), t = P.forDate(now, S.city), np = nextPrayer(now);
    const nm = (S.user.nama || '').split(' ')[0];
    const names = { imsak: 'Imsak', fajr: 'Subuh', sunrise: 'Terbit', dhuha: 'Dhuha', dhuhr: 'Zhuhur', asr: 'Ashar', maghrib: 'Maghrib', isha: 'Isya' };
    const curW = P.windowAt(now, S.city);
    let html = '<div class="hdr"><div class="row"><div><div class="sub">Assalamu\'alaikum,</div><h1>' + esc(nm || 'Ukhti') + '</h1><div class="sub">' + HARI[new Date().getDay()] + ', ' + fd(now) + '<br>' + esc(hijri(now)) + '</div></div>' +
      '<button class="chip" data-act="city">' + ic('pin', '') + esc(S.city.name) + '</button></div></div><div class="wrap">';
    html += '<div class="card lift"><div class="next"><div><div class="muted">Shalat berikutnya</div><div class="big">' + names[np.k] + '</div><div class="muted">pukul ' + hm(np.at, S.city.tz) + '</div></div><div class="cd" id="cd">--:--:--</div></div>' +
      '<div class="times">' + PKEYS.map(k => '<div class="time ' + (MAJOR.includes(k) ? '' : 'minor ') + (curW && curW.k === k ? 'on' : '') + '"><div class="n">' + names[k] + '</div><div class="t">' + hm(t[k], S.city.tz) + '</div></div>').join('') + '</div>' +
      '<div class="src" style="text-align:center">Kriteria Kemenag RI: Subuh 20°, Isya 18°, Ashar bayangan 1×, ihtiyath 2 menit</div></div>';
    // status
    const statusCard = statusBlock(true);
    html += S.premium ? statusCard : '<div style="position:relative"><div class="blur">' + statusCard + '</div><div class="lockover">' + ic('lock', '') + '<b>Status haid & hukumnya</b><button class="btn gold sm" data-act="paywall">Buka Premium</button></div></div>';
    const q = window.QUOTES[Math.floor(now / D) % window.QUOTES.length];
    const qh = '<div class="quote"><div class="qm">"</div><div class="muted" style="font-weight:700;color:var(--rose)">Mutiara salaf hari ini</div><div class="ar">' + q.ar + '</div><div class="qt">' + esc(q.id) + '</div><div class="qs">' + esc(q.siapa) + ' <span>— ' + esc(q.kitab) + '</span></div></div>';
    html += S.premium ? qh : '<div style="position:relative"><div class="blur">' + qh + '</div><div class="lockover">' + ic('lock', '') + '<b>Mutiara salaf harian</b></div></div>';
    if (!S.premium) html += '<div class="card" style="text-align:center"><h3>Buka semua fitur</h3><div class="muted">Kalender haid, materi fikih, tanya jawab, dzikir, dan mutiara salaf.</div><div style="height:10px"></div><button class="btn gold block" data-act="paywall">' + ic('crown') + 'Premium ' + PRICE + '</button></div>';
    html += installCard();
    return html + '</div>';
  }
  let timer = null;
  function tick() {
    clearInterval(timer);
    const upd = () => {
      const el = $('#cd'); if (!el) { clearInterval(timer); return; }
      const now = Date.now(), np = nextPrayer(now); let s = Math.max(0, Math.floor((np.at - now) / 1000));
      el.textContent = '-' + pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s % 3600 / 60)) + ':' + pad(s % 60);
      if (s === 0) setTimeout(render, 1500);
    };
    upd(); timer = setInterval(upd, 1000);
  }

  function statusBlock(compact) {
    const r = analysis(), st = r.status, kind = st.kind;
    let h = '<div class="status st-' + kind + '"><div class="k">Status saat ini</div><div class="t">' + esc(st.title) + '</div>';
    if (kind === 'suci') {
      h += '<p>' + esc(st.detail) + '</p>';
      if (st.lastHaid) h += '<p style="margin-top:8px">Haid terakhir: ' + fd(st.lastHaid.start) + ' (' + dur(st.lastHaid.end - st.lastHaid.start) + ').' + (st.suciUntilFence > Date.now() ? ' Darah sebelum ' + fdt(st.suciUntilFence) + ' belum bisa dihitung haid.' : '') + '</p>';
      if (st.estimate && st.estimate > Date.now() - 3 * D) h += '<p style="margin-top:6px">Perkiraan haid berikutnya: <b>' + fd(st.estimate) + '</b></p>';
    } else {
      h += '<p>Sejak ' + fdt(st.since) + '</p>';
      if (!compact) h += '<p style="margin-top:8px">' + esc(st.detail) + '</p>';
      h += '<p style="margin-top:8px;font-weight:600">' + esc(guidance(kind)) + '</p>';
    }
    h += '</div>';
    return compact ? '<div class="card" style="padding:0;overflow:hidden">' + h + '</div>' : h;
  }
  function guidance(kind) {
    return ({ haid: 'Tinggalkan shalat dan puasa. Dzikir dan doa tetap boleh.', haid_sementara: 'Untuk sementara tinggalkan shalat. Jika ternyata kurang dari 24 jam, shalatnya diqadha.', nifas: 'Tinggalkan shalat dan puasa sampai darah berhenti, lalu mandi.', istihadhah: 'Tetap shalat dan puasa. Basuh, sumbat, ikat, lalu wudhu setiap masuk waktu fardhu.', fasad: 'Tetap shalat dan puasa. Darah ini membatalkan wudhu seperti istihadhah.', ragu: 'Ihtiyath. Sebaiknya bertanya langsung kepada ustadz/ustadzah.' })[kind] || '';
  }

  /* ---------- Kalender ---------- */
  function viewCal() {
    const now = new Date();
    if (!ui.cal) ui.cal = { y: now.getFullYear(), m: now.getMonth() };
    const { y, m } = ui.cal, r = analysis();
    const og = ongoingSeg();
    let h = '<div class="hdr"><div class="row"><div><div class="sub">Kalender haid</div><h1>Catatan & Hukum</h1></div><button class="chip" data-act="rules">' + ic('book') + 'Rujukan</button></div></div><div class="wrap"><div class="lift" style="margin-top:-14px">' + statusBlock(false) + '</div>';
    h += '<div class="actions">' + (og ? '<button class="btn" data-act="stop-now">' + ic('stop') + 'Darah berhenti</button><button class="btn soft" data-act="swap-now">' + ic('swap') + 'Sifat berubah</button>'
      : '<button class="btn" data-act="start-now">' + ic('drop') + 'Darah keluar</button><button class="btn soft" data-act="add-past">' + ic('plus') + 'Catatan lampau</button>') + '</div>';
    if (og) h += '<div style="margin-top:8px"><button class="btn ghost block sm" data-act="add-past">' + ic('plus') + 'Tambah catatan lampau</button></div>';
    // grid
    const first = new Date(y, m, 1), startDow = first.getDay(), days = new Date(y, m + 1, 0).getDate();
    const est = r.status.estimate, adah = r.adah;
    let g = '<div class="card"><div class="cal-h"><button class="ibtn" data-act="cal-prev">' + ic('left') + '</button><b>' + BULAN[m] + ' ' + y + '<span class="hj">' + esc(hijri(new Date(y, m, 1).getTime(), { month: 'long', year: 'numeric' })) + ' – ' + esc(hijri(new Date(y, m, days).getTime(), { month: 'long', year: 'numeric' })) + '</span></b><button class="ibtn" data-act="cal-next">' + ic('right') + '</button></div><div class="grid">' + ['Ah', 'Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb'].map(x => '<div class="dow">' + x + '</div>').join('');
    for (let i = 0; i < startDow; i++) g += '<div></div>';
    const PRI = ['haid', 'nifas', 'haid_sementara', 'ragu', 'istihadhah', 'fasad'];
    for (let d = 1; d <= days; d++) {
      const a = new Date(y, m, d).getTime(), b = a + D;
      const ov = r.blocks.filter(x => x.start < b && x.end > a && (x.end - x.start > 0 || x.start >= a));
      let k = null; for (const p of PRI) if (ov.some(x => x.kind === p)) { k = p; break; }
      const isEst = !k && est && adah && a >= new Date(est).setHours(0, 0, 0, 0) && a < est + (adah.haid || 6 * D) && a > Date.now() - D;
      const hasBirth = S.births.some(bb => bb.time >= a && bb.time < b);
      const today = new Date().setHours(0, 0, 0, 0) === a;
      const hj = hijri(a, { day: 'numeric' }).replace(/\D/g, '');
      g += '<button class="day ' + (k ? 'k-' + k : '') + (today ? ' today' : '') + (isEst ? ' est' : '') + '" data-act="day" data-t="' + a + '">' + d + '<small>' + hj + '</small>' + (hasBirth ? '<span class="dot"></span>' : '') + '</button>';
    }
    g += '</div><div class="legend">' + ['haid', 'nifas', 'istihadhah', 'fasad', 'haid_sementara'].map(k => '<span><i style="background:' + KIND[k].c + '"></i>' + KIND[k].n + '</span>').join('') + '<span><i style="border:2px solid var(--rose-2);border-radius:50%"></i>Perkiraan</span></div></div>';
    h += g;
    // riwayat
    const blocks = r.blocks.slice().reverse().slice(0, 30);
    h += '<div class="card"><h3>Riwayat & hukumnya</h3>';
    if (!blocks.length) h += '<p class="muted">Belum ada catatan. Tekan "Darah keluar" saat haid datang, atau isi catatan lampau (haid bulan-bulan sebelumnya) agar kebiasaan Anda diketahui.</p>';
    else h += '<div class="tl">' + blocks.map(blockItem).join('') + '</div>';
    h += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px"><button class="btn soft sm" data-act="add-birth">' + ic('baby') + 'Saya melahirkan</button><button class="btn soft sm" data-act="list-seg">' + ic('note') + 'Semua catatan darah</button></div></div>';
    h += '<p class="disclaimer">Perhitungan mengikuti kaidah mazhab Syafi\'i dari kitab Al-Ibanah wal-Ifadhah dan syarahnya. Hasilnya bantuan, bukan fatwa. Jika ragu, tanyakan kepada ustadz atau ustadzah.</p>';
    return h + '</div>';
  }
  function blockItem(b) {
    const kd = KIND[b.kind] || KIND.fasad;
    let s = '<div class="tl-item" style="--c:' + kd.c + '"><div class="tt">' + esc(b.title) + '</div><div class="dd">' + fdt(b.start) + (b.end - b.start > 60e3 ? ' → ' + (b.ongoing ? 'sekarang' : fdt(b.end)) : '') + ' · ' + dur(Math.max(b.end - b.start, 0)) + '</div><details><summary>Penjelasan</summary><p>' + esc(b.detail) + '</p>';
    if (b.khilaf) s += '<div class="kh"><b>Khilaf:</b> ' + esc(b.khilaf.masalah) + '<br><b>Ibnu Hajar:</b> ' + esc(b.khilaf.ibnuHajar) + '<br><b>Ar-Ramli:</b> ' + esc(b.khilaf.ramli) + '<br><span class="muted">Rujukan yang dipakai sekarang: ' + (S.khilaf === 'ramli' ? 'Ar-Ramli' : 'Ibnu Hajar') + ' (ubah di Profil).</span></div>';
    if (b.kind === 'haid' || b.kind === 'nifas') {
      const o = P.obligations(b.start, b.ongoing ? null : b.end, S.city);
      if (o.atStart) s += '<div class="ob">' + (o.atStart.wajibQadha ? '<b>Wajib qadha ' + o.atStart.prayer + '.</b> Darah keluar ' + o.atStart.elapsedMin + ' menit setelah masuk waktu ' + o.atStart.prayer + ' (pukul ' + hm(o.atStart.since, S.city.tz) + '), cukup untuk mengerjakannya, jika belum dikerjakan.' : 'Darah keluar ' + o.atStart.elapsedMin + ' menit setelah masuk waktu ' + o.atStart.prayer + ', belum cukup untuk shalat. Tidak wajib qadha.') + '</div>';
      if (o.atEnd) s += '<div class="ob"><b>Setelah suci wajib shalat: ' + o.atEnd.wajib.join(' dan ') + '.</b> Darah berhenti di waktu ' + o.atEnd.prayer + ' (berakhir pukul ' + hm(o.atEnd.until, S.city.tz) + '). Segera mandi lalu shalat.</div>';
    }
    if ((b.kind === 'istihadhah' || b.kind === 'fasad') && /qadha/.test(b.detail)) s += '<div class="ob">Shalat lima waktu pada rentang ini yang sempat ditinggalkan wajib diqadha.</div>';
    return s + '</details></div>';
  }

  /* ---------- Locked ---------- */
  function viewLocked(title, desc) {
    return '<div class="hdr"><h1>' + esc(title) + '</h1><div class="sub">Fitur premium</div></div><div class="wrap"><div class="card lift lock"><div class="ic">' + ic('lock') + '</div><h2>' + esc(title) + '</h2><p class="muted">' + esc(desc) + '</p>' +
      '<button class="btn gold block" data-act="paywall">' + ic('crown') + 'Buka Premium ' + PRICE + '</button></div></div>';
  }

  /* ---------- Belajar ---------- */
  function viewBelajar() {
    if (ui.materi) {
      const m = window.MATERI.find(x => x.id === ui.materi);
      return '<div class="hdr"><div class="row"><button class="back" data-act="materi-back">' + ic('left') + 'Materi</button><button class="chip" data-act="font">Aa</button></div><h1>' + esc(m.judul) + '</h1></div><div class="wrap"><div class="card lift prose">' + renderProse(m.isi) + '</div><p class="disclaimer">Penyusun: Ukkaasyah Abdurrahman</p></div>';
    }
    let h = '<div class="hdr"><div class="row"><div><div class="sub">Belajar</div><h1>Fikih Darah Wanita</h1><div class="sub">Mazhab Syafi\'i, dengan khilaf ulama</div></div><button class="chip" data-act="font">Aa</button></div></div><div class="wrap"><div class="seg">' +
      [['materi', 'Materi'], ['tanya', 'Tanya Jawab'], ['mutiara', 'Mutiara Salaf']].map(([k, n]) => '<button data-act="bel" data-v="' + k + '" class="' + (ui.belajar === k ? 'on' : '') + '">' + n + '</button>').join('') + '</div>';
    if (ui.belajar === 'materi') h += '<div class="mlist">' + window.MATERI.map((m, i) => '<div class="mi" data-act="materi" data-v="' + m.id + '"><div class="mic">' + ic(m.ikon) + '</div><div><b>' + esc(m.judul) + '</b><span>Bab ' + (i + 1) + '</span></div></div>').join('') + '</div>';
    if (ui.belajar === 'tanya') {
      const q = ui.q.toLowerCase();
      const list = window.TANYA.filter(x => !q || (x.q + ' ' + x.jawab).toLowerCase().includes(q));
      h += '<div class="search">' + ic('search') + '<input class="inp" id="qsearch" placeholder="Cari pertanyaan..." value="' + esc(ui.q) + '"></div>';
      h += list.map(x => '<details class="qa"><summary><span class="no">' + x.id + '</span><span>' + esc(x.q) + '</span></summary><div class="body"><p>' + esc(x.jawab) + '</p>' +
        x.pendapat.map((p, i) => '<div class="pd"><div class="pn">' + (x.pendapat.length > 1 ? 'Pendapat ' + (i + 1) + ': ' : '') + esc(p.nama) + '</div><div class="ps">' + esc(p.siapa) + '</div>' + esc(p.isi) + '<div class="dl"><b>Dalil:</b> ' + esc(p.dalil) + '</div></div>').join('') +
        (x.penutup ? '<p class="muted">' + esc(x.penutup) + '</p>' : '') + '</div></details>').join('');
      if (!q) h += '<div class="card"><h3>Segera hadir</h3><div class="muted">Soal-soal berikut sedang disusun untuk melengkapi 50 tanya jawab.</div>' + window.TANYA_RENCANA.map((t, i) => '<div class="li soon"><span style="color:var(--ink)">' + (26 + i) + '. ' + esc(t) + '</span></div>').join('') + '</div>';
    }
    if (ui.belajar === 'mutiara') h += window.QUOTES.map(q => '<div class="quote"><div class="qm">"</div><div class="ar">' + q.ar + '</div><div class="qt">' + esc(q.id) + '</div><div class="qs">' + esc(q.siapa) + ' <span>— ' + esc(q.kitab) + '</span></div></div>').join('');
    return h + '</div>';
  }
  function renderProse(isi) {
    return isi.map(([t, v]) => {
      if (t === 'p') return '<p>' + esc(v) + '</p>';
      if (t === 'h') return '<h4>' + esc(v) + '</h4>';
      if (t === 'note') return '<div class="nt">' + esc(v) + '</div>';
      if (t === 'list') return '<ul>' + v.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>';
      if (t === 'table') return '<table>' + v.map((r, i) => '<tr>' + r.map(c => i ? '<td>' + esc(c) + '</td>' : '<th>' + esc(c) + '</th>').join('') + '</tr>').join('') + '</table>';
      if (t === 'colors') return v.map(([k, n, d]) => '<div class="swatch"><i style="background:' + COLOR_HEX[k] + '"></i><div><b>' + esc(n) + '</b><br><span class="muted">' + esc(d) + '</span></div></div>').join('');
      return '';
    }).join('');
  }

  /* ---------- Dzikir ---------- */
  function viewDzikir() {
    const hour = new Date().getHours();
    if (!ui.dzTab) ui.dzTab = hour >= 15 || hour < 3 ? 'petang' : 'pagi';
    const today = new Date().toDateString();
    if (S.dz.day !== today) { S.dz = { day: today, c: {} }; save(); }
    const tab = ui.dzTab, o = S.dzOpt;
    let h = '<div class="hdr"><div class="sub">Dzikir & Doa</div><h1>' + ({ pagi: 'Dzikir Pagi', petang: 'Dzikir Petang', shalat: 'Setelah Shalat', harian: 'Doa Harian' })[tab] + '</h1><div class="sub">Dari hadits-hadits yang shahih</div></div><div class="wrap"><div class="seg">' +
      [['pagi', 'Pagi'], ['petang', 'Petang'], ['shalat', 'Shalat'], ['harian', 'Harian']].map(([k, n]) => '<button data-act="dz" data-v="' + k + '" class="' + (tab === k ? 'on' : '') + '">' + n + '</button>').join('') + '</div>';
    h += '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm ' + (o.lat ? 'soft' : 'ghost') + '" data-act="dzopt" data-v="lat">Latin</button><button class="btn sm ' + (o.arti ? 'soft' : 'ghost') + '" data-act="dzopt" data-v="arti">Arti</button><button class="btn sm ghost" data-act="font">Aa Ukuran huruf</button></div>';
    if (tab === 'pagi' || tab === 'petang') h += '<div class="banner">' + esc(window.DZIKIR.catatanHaid) + '</div>';
    let list = [];
    if (tab === 'pagi') list = window.DZIKIR.pagipetang.filter(x => x.waktu !== 'petang');
    if (tab === 'petang') list = window.DZIKIR.pagipetang.filter(x => x.waktu !== 'pagi').map(x => Object.assign({}, x, { ar: x.arP || x.ar, lat: x.latP || x.lat, arti: x.artiP || x.arti }));
    if (tab === 'shalat') list = window.DZIKIR.setelahShalat;
    if (tab === 'harian') {
      let kat = '';
      const all = window.DZIKIR.harian.map((x, i) => Object.assign({ id: 'h' + i, n: 0, _i: i }, x));
      const kats = KAT_ORDER.filter(k => all.some(x => x.kat === k)).concat([...new Set(all.map(x => x.kat))].filter(k => !KAT_ORDER.includes(k)));
      list = all.filter(x => ui.kat === 'Semua' || x.kat === ui.kat).sort((a, b) => (kats.indexOf(a.kat) - kats.indexOf(b.kat)) || (a._i - b._i));
      h += '<div class="chips" style="margin-top:10px">' + ['Semua'].concat(kats).map(k => '<button data-act="kat" data-v="' + esc(k) + '" class="' + (ui.kat === k ? 'on' : '') + '">' + esc(k) + (k === 'Semua' ? ' (' + all.length + ')' : '') + '</button>').join('') + '</div>';
      return h + list.map(x => { const head = x.kat !== kat ? '<h3 style="font-family:var(--serif);color:var(--plum);margin:18px 0 0">' + esc(x.kat) + '</h3>' : ''; kat = x.kat; return head + dzCard(x, tab); }).join('') + '</div>';
    }
    return h + '<div style="--arz:' + o.z + '">' + list.map(x => dzCard(x, tab)).join('') + '</div></div>';
  }
  function dzCard(x, tab) {
    const o = S.dzOpt, key = tab + ':' + x.id, done = S.dz.c[key] || 0, left = Math.max(0, (x.n || 0) - done);
    return '<div class="dz" style="--arz:' + o.z + '"><div class="dh"><b>' + esc(x.judul) + '</b>' + (x.n ? '<button class="cnt ' + (left === 0 ? 'done' : '') + '" data-act="count" data-k="' + key + '" data-n="' + x.n + '">' + (left === 0 ? '✓' : left + '×') + '</button>' : '') + '</div>' +
      '<div class="ar">' + esc(x.ar) + '</div>' + (o.lat ? '<div class="lat">' + esc(x.lat) + '</div>' : '') + (o.arti ? '<div class="arti">' + esc(x.arti) + '</div>' : '') +
      (x.fadhilah ? '<div class="fad">' + esc(x.fadhilah) + '</div>' : '') + '<div class="src">' + esc(x.src) + '</div></div>';
  }

  /* ---------- Profil ---------- */
  function viewProfil() {
    const u = S.user, age = u.birth ? Math.floor((Date.now() - new Date(u.birth)) / (365.25 * D)) : null;
    const st = { mutadah: 'Mu\'tadah (punya kebiasaan)', mubtadiah: 'Mubtada\'ah (baru pertama)', nasiyah: 'Lupa kebiasaan' }[u.status || 'mubtadiah'];
    const r = analysis();
    let h = '<div class="hdr"><div class="row" style="justify-content:flex-start;gap:14px"><div class="avatar">' + esc((u.nama || '?').trim().charAt(0).toUpperCase()) + '</div><div><h1>' + esc(u.nama) + '</h1><div class="sub">' + esc(u.email) + (age != null ? ' · ' + age + ' tahun' : '') + '</div></div></div></div><div class="wrap">';
    h += '<div class="card lift">' + (S.premium ? '<div style="display:flex;align-items:center;gap:10px"><span class="pill">' + ic('crown').replace('class=""', 'style="width:12px;height:12px;vertical-align:-2px"') + ' PREMIUM</span><span class="muted">Semua fitur terbuka. Jazakillahu khairan.</span></div>' : '<h3>Akun gratis</h3><div class="muted">Saat ini hanya waktu shalat yang terbuka.</div><div style="height:10px"></div><button class="btn gold block" data-act="paywall">' + ic('crown') + 'Buka Premium ' + PRICE + '</button>') + '</div>';
    h += '<div class="card"><h3>Data diri</h3>' +
      '<div class="li" data-act="edit-user"><b>Nama, email, tanggal lahir</b><span>Ubah ›</span></div>' +
      '<div class="li" data-act="city"><b>Kota waktu shalat</b><span>' + esc(S.city.name) + ' ›</span></div></div>';
    h += '<div class="card"><h3>Pengaturan fikih</h3>' +
      '<div class="li" data-act="edit-haid"><b>Status & kebiasaan haid</b><span>' + esc(st) + (u.status === 'mutadah' && u.adahHaid ? ', ' + u.adahHaid + '/' + (u.adahSuci || 24) + ' hari' : '') + ' ›</span></div>' +
      '<div class="li" data-act="khilaf"><b>Rujukan saat khilaf</b><span>' + (S.khilaf === 'ramli' ? 'Ar-Ramli (Nihayah)' : 'Ibnu Hajar (Tuhfah)') + ' ›</span></div>' +
      (r.adah ? '<div class="li"><b>Kebiasaan menurut catatan</b><span>haid ' + dur(r.adah.haid) + (r.adah.suci ? ', suci ' + dur(r.adah.suci) : '') + '</span></div>' : '') + '</div>';
    h += '<div class="card"><h3>Tampilan</h3><div class="li" data-act="font"><b>Ukuran huruf</b><span>' + ({ 0.9: 'Kecil', 1: 'Normal', 1.15: 'Besar', 1.3: 'Sangat besar' }[S.fs || 1] || 'Normal') + ' ›</span></div></div>';
    h += '<div class="card"><h3>Data</h3><div class="muted" style="margin-bottom:6px">Catatan haid tersimpan di perangkat ini saja.</div>' +
      '<div class="li" data-act="export"><b>Cadangkan data</b><span>Salin ›</span></div><div class="li" data-act="import"><b>Pulihkan data</b><span>Tempel ›</span></div><div class="li" data-act="reset"><b style="color:#B03A55">Hapus semua data</b><span>›</span></div></div>';
    h += installCard();
    h += '<div class="card"><h3>Tentang Haidku</h3><p class="muted">Materi fikih disusun oleh <b>Ukkaasyah Abdurrahman</b>. Penanggalan haid mengikuti mazhab Syafi\'i berdasarkan kitab Al-Ibanah wal-Ifadhah fi Ahkam al-Haidh wan-Nifas wal-Istihadhah, Tuhfah al-Muhtaj, Nihayah al-Muhtaj, Mughni al-Muhtaj, dan Asna al-Mathalib. Pembahasan tanya jawab menyebutkan khilaf ulama beserta dalilnya. Dzikir dipilih dari hadits-hadits yang shahih.</p><p class="muted">Versi ' + APP_VERSION + '. Aplikasi memperbarui dirinya sendiri setiap kali ada versi baru.</p></div>';
    return h + '</div>';
  }
  let deferredPrompt = null;
  function installCard() {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent), standalone = window.matchMedia && matchMedia('(display-mode: standalone)').matches;
    if (standalone) return '';
    return '<div class="card tight" style="display:flex;gap:12px;align-items:center"><div class="mic" style="width:42px;height:42px;border-radius:13px;background:var(--blush);color:var(--rose);display:flex;align-items:center;justify-content:center;flex:none">' + ic('download') + '</div><div style="flex:1"><b style="font-size:0.933rem">Pasang di layar utama</b><div class="muted" style="font-size:0.8rem">' + (deferredPrompt ? 'Agar terbuka seperti aplikasi.' : isIOS ? 'Safari: tombol Bagikan → Tambah ke Layar Utama.' : 'Menu browser (⋮) → Instal aplikasi / Tambahkan ke layar utama.') + '</div></div>' + (deferredPrompt ? '<button class="btn sm" data-act="install">Pasang</button>' : '') + '</div>';
  }

  /* ================= SHEETS ================= */
  function sheet(html) { closeSheet(); const bg = document.createElement('div'); bg.className = 'sheet-bg'; bg.id = 'sheet'; bg.innerHTML = '<div class="sheet"><div class="grab"></div>' + html + '</div>'; bg.addEventListener('click', e => { if (e.target === bg) closeSheet(); }); document.body.appendChild(bg); }
  function closeSheet() { const s = $('#sheet'); if (s) s.remove(); }

  let form = null;
  function segForm(mode, seg) {
    // mode: now | swap | past | edit
    form = Object.assign({ color: 'merah', kental: false, bau: false, thalq: false }, seg || {});
    form.mode = mode;
    const showTimes = mode === 'past' || mode === 'edit';
    const og = form.end == null && mode === 'edit';
    sheet('<h2>' + ({ now: 'Darah keluar', swap: 'Sifat darah berubah', past: 'Catatan lampau', edit: 'Ubah catatan' })[mode] + '</h2><div class="muted">' + ({ now: 'Catat sifat darah yang keluar sekarang.', swap: 'Catatan sebelumnya ditutup sekarang, lalu dimulai catatan baru dengan sifat yang baru.', past: 'Isi kapan darah pertama keluar dan kapan berhenti.', edit: 'Ubah waktu atau sifat darah.' })[mode] + '</div>' +
      (showTimes ? '<label class="lbl">Pertama keluar</label><input class="inp" id="f-s" type="datetime-local" value="' + (form.start ? toInput(form.start) : '') + '">' +
        '<div class="tog ' + (og ? 'on' : '') + '" data-act="f-og" id="f-og">Masih keluar sampai sekarang<span class="sw"></span></div>' +
        '<div id="f-ew" style="' + (og ? 'display:none' : '') + '"><label class="lbl">Berhenti</label><input class="inp" id="f-e" type="datetime-local" value="' + (form.end ? toInput(form.end) : '') + '"></div>' :
        '<label class="lbl">Waktu</label><input class="inp" id="f-s" type="datetime-local" value="' + toInput(Date.now()) + '">') +
      '<label class="lbl">Warna darah</label><div class="colors">' + Object.keys(COLOR_HEX).map(k => '<button class="cbtn ' + (form.color === k ? 'on' : '') + '" data-act="f-color" data-v="' + k + '"><i style="background:' + COLOR_HEX[k] + '"></i>' + COLOR_LBL[k] + '</button>').join('') + '</div>' +
      tg('kental', 'Kental', 'Lebih pekat dari biasanya') + tg('bau', 'Berbau tidak sedap', '') + tg('thalq', 'Keluar bersama kontraksi menjelang melahirkan', 'Dam thalq, bukan haid') +
      '<div style="height:14px"></div><button class="btn block" data-act="f-save">' + ic('check') + 'Simpan</button>' + (mode === 'edit' ? '<div style="height:8px"></div><button class="btn danger block" data-act="f-del">' + ic('trash') + 'Hapus catatan ini</button>' : ''));
  }
  const tg = (k, t, s) => '<div class="tog ' + (form[k] ? 'on' : '') + '" data-act="f-tog" data-v="' + k + '"><div>' + t + (s ? '<small>' + s + '</small>' : '') + '</div><span class="sw"></span></div>';
  function overlaps(a, b, exceptId) { return S.segments.some(s => s.id !== exceptId && a < (s.end == null ? Infinity : s.end) && (b == null ? Infinity : b) > s.start); }
  function saveForm() {
    const now = Date.now();
    const s = fromInput($('#f-s') && $('#f-s').value);
    if (!s) return toast('Isi waktu terlebih dahulu.');
    if (s > now + 5 * 60e3) return toast('Waktu tidak boleh di masa depan.');
    const attrs = { color: form.color, kental: !!form.kental, bau: !!form.bau, thalq: !!form.thalq };
    if (form.mode === 'now') {
      if (overlaps(s, null)) return toast('Waktu ini bertumpuk dengan catatan lain.');
      S.segments.push(Object.assign({ id: uid(), start: s, end: null }, attrs));
    } else if (form.mode === 'swap') {
      const og = ongoingSeg(); if (!og) return;
      if (s <= og.start) return toast('Waktu perubahan harus setelah darah mulai.');
      og.end = s; S.segments.push(Object.assign({ id: uid(), start: s, end: null }, attrs));
    } else {
      const ogOn = $('#f-og') && $('#f-og').classList.contains('on');
      const e = ogOn ? null : fromInput($('#f-e') && $('#f-e').value);
      if (!ogOn && !e) return toast('Isi waktu berhenti, atau pilih "masih keluar".');
      if (e != null && e <= s) return toast('Waktu berhenti harus setelah waktu keluar.');
      if (ogOn && ongoingSeg() && (!form.id || ongoingSeg().id !== form.id)) return toast('Sudah ada darah yang sedang keluar.');
      if (overlaps(s, e, form.id)) return toast('Waktu ini bertumpuk dengan catatan lain.');
      if (form.mode === 'edit') Object.assign(S.segments.find(x => x.id === form.id), { start: s, end: e }, attrs);
      else S.segments.push(Object.assign({ id: uid(), start: s, end: e }, attrs));
    }
    S.segments.sort((a, b) => a.start - b.start); save(); closeSheet(); render(); toast('Tersimpan');
  }

  /* ================= ACTIONS ================= */
  const A = {
    'go': el => { ui.view = el.dataset.v; ui.materi = null; render(); window.scrollTo(0, 0); try { history.replaceState(null, '', '#' + ui.view); } catch (e) {} },
    'ob-next': () => { ob.step = 1; render(); },
    'ob-1': () => {
      const nama = $('#o-nama').value.trim(), email = $('#o-email').value.trim(), birth = $('#o-lahir').value;
      if (!nama) return toast('Nama wajib diisi.');
      if (!/^\S+@\S+\.\S+$/.test(email)) return toast('Email belum benar.');
      if (!birth) return toast('Tanggal lahir wajib diisi.');
      Object.assign(ob.d, { nama, email, birth, kota: $('#o-kota').value }); ob.step = 2; render();
    },
    'ob-status': el => { ob.d.status = el.dataset.v; const ah = $('#o-ah'), as = $('#o-as'); if (ah) { ob.d.adahHaid = ah.value; ob.d.adahSuci = as.value; } render(); },
    'ob-2': () => finishOb(true), 'ob-skip': () => finishOb(false),
    'city': () => sheet('<h2>Pilih kota</h2><div class="muted">Waktu shalat dihitung dengan kriteria Kemenag RI.</div><div style="height:8px"></div>' + CITIES.map(c => '<div class="li" data-act="set-city" data-v="' + c[0] + '"><b>' + c[0] + '</b><span>' + (c[0] === S.city.name ? '✓' : 'UTC+' + c[3]) + '</span></div>').join('') + '<div style="height:10px"></div><button class="btn soft block" data-act="geo">' + ic('pin') + 'Gunakan lokasi saya</button>'),
    'set-city': el => { const c = CITIES.find(x => x[0] === el.dataset.v); S.city = { name: c[0], lat: c[1], lng: c[2], tz: c[3] }; save(); closeSheet(); render(); },
    'geo': () => {
      if (!navigator.geolocation) return toast('Lokasi tidak tersedia di perangkat ini.');
      navigator.geolocation.getCurrentPosition(p => { S.city = { name: 'Lokasi saya', lat: p.coords.latitude, lng: p.coords.longitude, tz: -new Date().getTimezoneOffset() / 60 }; save(); closeSheet(); render(); }, () => toast('Izin lokasi ditolak. Silakan pilih kota.'));
    },
    'paywall': () => sheet('<div class="lock" style="padding:6px 4px"><div class="ic">' + ic('crown') + '</div><h2>Haidku Premium</h2><div class="price">' + PRICE + ' <small>sekali bayar</small></div><ul class="feat">' +
      ['Kalender haid dengan hukum otomatis mazhab Syafi\'i', 'Penentuan istihadhah: tamyiz, kebiasaan, dan nifas', 'Shalat yang wajib diqadha saat haid datang dan berhenti', 'Materi fikih wanita dan 50 tanya jawab dengan khilaf', 'Dzikir pagi petang, setelah shalat, dan doa harian', 'Mutiara nasihat Ibnul Qayyim, Ibnu Rajab, Ibnul Jauzi'].map(x => '<li>' + ic('check') + '<span>' + x + '</span></li>').join('') +
      '</ul><label class="lbl" style="text-align:left">Kode aktivasi</label><input class="inp" id="code" placeholder="Masukkan kode" style="text-transform:uppercase"><div style="height:10px"></div><button class="btn gold block" data-act="activate">Aktifkan</button>' +
      '<p class="muted" style="font-size:0.8rem;margin-top:12px">Cara pembayaran masih didiskusikan (misalnya lewat Lynk.id, lalu kode aktivasi dikirim ke email). Untuk uji coba kerangka ini, gunakan kode <b>HAIDKU-DEMO</b>.</p></div>'),
    'activate': () => { const c = ($('#code').value || '').trim().toUpperCase(); if (DEMO_CODES.includes(c)) { S.premium = true; save(); closeSheet(); render(); toast('Premium aktif. Barakallahu fiki.'); } else toast('Kode tidak dikenali.'); },
    'start-now': () => segForm('now'), 'swap-now': () => segForm('swap'), 'add-past': () => segForm('past'),
    'stop-now': () => { const og = ongoingSeg(); sheet('<h2>Darah berhenti</h2><div class="muted">Mulai keluar ' + fdt(og.start) + '. Kapan darah berhenti (kapas keluar bersih)?</div><label class="lbl">Waktu berhenti</label><input class="inp" id="st-e" type="datetime-local" value="' + toInput(Date.now()) + '"><div style="height:14px"></div><button class="btn block" data-act="stop-save">' + ic('check') + 'Simpan</button>'); },
    'stop-save': () => { const og = ongoingSeg(), e = fromInput($('#st-e').value); if (!e || e <= og.start) return toast('Waktu berhenti harus setelah darah mulai.'); if (e > Date.now() + 5 * 60e3) return toast('Waktu tidak boleh di masa depan.'); og.end = e; save(); closeSheet(); render(); afterStop(og); },
    'f-color': el => { form.color = el.dataset.v; document.querySelectorAll('.cbtn').forEach(b => b.classList.toggle('on', b.dataset.v === form.color)); },
    'f-tog': el => { const k = el.dataset.v; form[k] = !form[k]; el.classList.toggle('on', form[k]); },
    'f-og': el => { el.classList.toggle('on'); $('#f-ew').style.display = el.classList.contains('on') ? 'none' : ''; },
    'f-save': () => saveForm(),
    'f-del': () => { S.segments = S.segments.filter(x => x.id !== form.id); save(); closeSheet(); render(); toast('Catatan dihapus'); },
    'cal-prev': () => { let { y, m } = ui.cal; m--; if (m < 0) { m = 11; y--; } ui.cal = { y, m }; render(); },
    'cal-next': () => { let { y, m } = ui.cal; m++; if (m > 11) { m = 0; y++; } ui.cal = { y, m }; render(); },
    'day': el => {
      const a = +el.dataset.t, b = a + D, r = analysis();
      const ov = r.blocks.filter(x => x.start < b && x.end > a);
      const segs = S.segments.filter(s => s.start < b && (s.end == null ? Date.now() : s.end) > a);
      const births = S.births.filter(x => x.time >= a && x.time < b);
      sheet('<h2>' + HARI[new Date(a).getDay()] + ', ' + fd(a) + '</h2><div class="muted">' + esc(hijri(a)) + '</div>' +
        (ov.length ? '<div class="tl" style="margin-top:12px">' + ov.map(blockItem).join('') + '</div>' : '<p class="muted">Tidak ada darah tercatat. Hukumnya suci.</p>') +
        (segs.length ? '<label class="lbl">Catatan darah</label>' + segs.map(segRow).join('') : '') +
        (births.length ? births.map(x => '<div class="seglist"><span>' + ic('baby').replace('class=""', 'style="width:14px;height:14px"') + ' Melahirkan ' + fdt(x.time) + '</span><button class="btn sm danger" data-act="del-birth" data-id="' + x.id + '">Hapus</button></div>').join('') : '') +
        '<div style="height:12px"></div><button class="btn soft block" data-act="add-past">' + ic('plus') + 'Tambah catatan</button>');
    },
    'edit-seg': el => { const s = S.segments.find(x => x.id === el.dataset.id); segForm('edit', Object.assign({}, s)); },
    'list-seg': () => sheet('<h2>Semua catatan darah</h2>' + (S.segments.length ? S.segments.slice().reverse().map(segRow).join('') : '<p class="muted">Belum ada.</p>') + (S.births.length ? '<label class="lbl">Kelahiran</label>' + S.births.map(x => '<div class="seglist"><span>Melahirkan ' + fdt(x.time) + '</span><button class="btn sm danger" data-act="del-birth" data-id="' + x.id + '">Hapus</button></div>').join('') : '')),
    'add-birth': () => sheet('<h2>Saya melahirkan</h2><div class="muted">Waktu bayi keluar. Masa nifas dihitung dari waktu ini (paling lama 60 hari). Termasuk keguguran yang sudah berupa gumpalan darah atau daging.</div><label class="lbl">Waktu melahirkan</label><input class="inp" id="b-t" type="datetime-local" value="' + toInput(Date.now()) + '"><div style="height:14px"></div><button class="btn block" data-act="birth-save">' + ic('check') + 'Simpan</button>'),
    'birth-save': () => { const t = fromInput($('#b-t').value); if (!t) return; S.births.push({ id: uid(), time: t }); save(); closeSheet(); render(); toast('Tersimpan. Semoga Allah memberkahi buah hati Anda.'); },
    'del-birth': el => { S.births = S.births.filter(x => x.id !== el.dataset.id); save(); closeSheet(); render(); },
    'rules': () => sheet('<h2>Kaidah yang dipakai</h2><div class="prose">' + renderProse([
      ['p', 'Mesin penanggalan Haidku mengikuti mazhab Syafi\'i. Ringkasnya:'],
      ['list', ['Haid paling sedikit 24 jam (boleh terputus, dijumlahkan dalam 15 hari), paling lama 15 hari. Masa bersih di sela-sela darah termasuk haid (qaul as-sahb).', 'Suci di antara dua haid paling sedikit 15 hari. Darah sebelum genap 15 hari suci adalah dam fasad yang menggenapkan suci.', 'Usia haid paling muda 9 tahun hijriyah (taqribi).', 'Darah lebih dari 15 hari: tamyiz dahulu (4 syarat), lalu kebiasaan, lalu sehari semalam bagi mubtada\'ah, dan ihtiyath bagi yang lupa kebiasaan.', 'Nifas dari kelahiran sampai 60 hari. Lebih dari itu: tamyiz, kebiasaan nifas, atau nifas sekejap.', 'Shalat wajib diqadha bila haid datang setelah sempat mengerjakannya; bila suci di waktu Ashar wajib Zhuhur juga, bila di waktu Isya wajib Maghrib juga.']],
      ['note', 'Pada masalah khilaf antara Ibnu Hajar dan Ar-Ramli, rujukan bisa dipilih di menu Profil. Bentuk 6 dan 7 (ingat waktu atau ingat kadar saja) belum dihitung otomatis pada versi ini.']]) + '</div>'),
    'bel': el => { ui.belajar = el.dataset.v; render(); },
    'materi': el => { ui.materi = el.dataset.v; render(); window.scrollTo(0, 0); },
    'materi-back': () => { ui.materi = null; render(); },
    'dz': el => { ui.dzTab = el.dataset.v; render(); },
    'dzopt': el => { const v = el.dataset.v, o = S.dzOpt; if (v === 'lat') o.lat = !o.lat; else if (v === 'arti') o.arti = !o.arti; else o.z = Math.min(1.6, Math.max(.8, Math.round((o.z + (v === 'z+' ? .1 : -.1)) * 10) / 10)); save(); render(); },
    'count': el => { const k = el.dataset.k, n = +el.dataset.n, c = S.dz.c[k] || 0; if (c >= n) { S.dz.c[k] = 0; } else S.dz.c[k] = c + 1; save(); try { navigator.vibrate && navigator.vibrate(12); } catch (e) {} const left = n - S.dz.c[k]; el.textContent = left === 0 ? '✓' : left + '×'; el.classList.toggle('done', left === 0); },
    'edit-user': () => { const u = S.user; sheet('<h2>Data diri</h2><label class="lbl">Nama</label><input class="inp" id="u-n" value="' + esc(u.nama) + '"><label class="lbl">Email</label><input class="inp" id="u-e" value="' + esc(u.email) + '"><label class="lbl">Tanggal lahir</label><input class="inp" id="u-b" type="date" value="' + esc(u.birth) + '"><div style="height:14px"></div><button class="btn block" data-act="user-save">Simpan</button>'); },
    'user-save': () => { Object.assign(S.user, { nama: $('#u-n').value.trim() || S.user.nama, email: $('#u-e').value.trim(), birth: $('#u-b').value }); save(); closeSheet(); render(); },
    'edit-haid': () => { const u = S.user; const r = (v, b) => '<div class="radio ' + ((u.status || 'mubtadiah') === v ? 'on' : '') + '" data-act="haid-st" data-v="' + v + '"><span class="dot2"></span><div><b>' + b + '</b></div></div>';
      sheet('<h2>Status & kebiasaan haid</h2>' + r('mutadah', 'Mu\'tadah: sudah punya kebiasaan') + r('mubtadiah', 'Mubtada\'ah: belum pernah / baru pertama') + r('nasiyah', 'Lupa kebiasaan (mutahayyirah)') + '<div class="row2"><div><label class="lbl">Kebiasaan haid (hari)</label><input class="inp" id="h-a" type="number" step="0.5" min="1" max="15" value="' + esc(u.adahHaid || '') + '"></div><div><label class="lbl">Kebiasaan suci (hari)</label><input class="inp" id="h-s" type="number" min="15" value="' + esc(u.adahSuci || '') + '"></div></div><div class="muted" style="font-size:0.8rem;margin-top:6px">Jika catatan di kalender sudah ada, kebiasaan terbaru diambil dari catatan.</div><div style="height:14px"></div><button class="btn block" data-act="haid-save">Simpan</button>'); },
    'haid-st': el => { S.user.status = el.dataset.v; document.querySelectorAll('.radio').forEach(x => x.classList.toggle('on', x === el)); },
    'haid-save': () => { const a = parseFloat($('#h-a').value), s = parseFloat($('#h-s').value); if (a && (a < 1 || a > 15)) return toast('Kebiasaan haid antara 1 sampai 15 hari.'); if (s && s < 15) return toast('Suci paling sedikit 15 hari.'); S.user.adahHaid = a || null; S.user.adahSuci = s || null; save(); closeSheet(); render(); },
    'khilaf': () => sheet('<h2>Rujukan saat khilaf</h2><div class="muted">Pada beberapa masalah tamyiz, Ibnu Hajar (Tuhfah al-Muhtaj) dan Syamsuddin Ar-Ramli (Nihayah al-Muhtaj) berbeda pendapat. Keduanya mu\'tamad dalam mazhab.</div>' +
      ['ibnuhajar', 'ramli'].map(v => '<div class="radio ' + (S.khilaf === v ? 'on' : '') + '" data-act="set-khilaf" data-v="' + v + '"><span class="dot2"></span><div><b>' + (v === 'ramli' ? 'Ar-Ramli' : 'Ibnu Hajar Al-Haitami') + '</b><span>' + (v === 'ramli' ? 'Dipegang banyak ulama Mesir; Al-Khathib sering sejalan.' : 'Dipegang banyak ulama Hadhramaut dan Nusantara.') + '</span></div></div>').join('')),
    'set-khilaf': el => { S.khilaf = el.dataset.v; save(); closeSheet(); render(); toast('Rujukan diganti'); },
    'export': () => sheet('<h2>Cadangkan data</h2><div class="muted">Salin teks ini dan simpan di tempat aman (misalnya catatan pribadi).</div><textarea class="inp" id="ex" readonly>' + esc(JSON.stringify({ v: 1, user: S.user, city: S.city, khilaf: S.khilaf, segments: S.segments, births: S.births })) + '</textarea><div style="height:10px"></div><button class="btn block" data-act="copy">' + ic('copy') + 'Salin</button>'),
    'copy': () => { const t = $('#ex').value; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('Tersalin'), () => { $('#ex').select(); toast('Tekan lama lalu salin'); }); },
    'import': () => sheet('<h2>Pulihkan data</h2><div class="muted">Tempel teks cadangan di bawah. Data saat ini akan diganti.</div><textarea class="inp" id="im"></textarea><div style="height:10px"></div><button class="btn block" data-act="import-do">Pulihkan</button>'),
    'import-do': () => { try { const d = JSON.parse($('#im').value); if (!d.segments) throw 0; Object.assign(S, { user: d.user || S.user, city: d.city || S.city, khilaf: d.khilaf || S.khilaf, segments: d.segments, births: d.births || [] }); save(); closeSheet(); render(); toast('Data dipulihkan'); } catch (e) { toast('Teks cadangan tidak valid.'); } },
    'reset': () => sheet('<h2>Hapus semua data?</h2><div class="muted">Semua catatan haid, akun, dan pengaturan di perangkat ini akan dihapus.</div><div style="height:14px"></div><button class="btn danger block" data-act="reset-do">' + ic('trash') + 'Ya, hapus</button><div style="height:8px"></div><button class="btn ghost block" data-act="close">Batal</button>'),
    'reset-do': () => { S = blank(); save(); ob = { step: 0, d: { status: 'mutadah' } }; closeSheet(); ui.view = 'beranda'; render(); },
    'close': () => closeSheet(),
    'kat': el => { ui.kat = el.dataset.v; render(); },
    'font': () => {
      const fsv = [[0.9, 'Kecil'], [1, 'Normal'], [1.15, 'Besar'], [1.3, 'Sangat besar']], arv = [[0.85, 'Kecil'], [1, 'Normal'], [1.25, 'Besar'], [1.5, 'Sangat besar']];
      const z = S.dzOpt.z || 1;
      sheet('<h2>Ukuran huruf</h2><label class="lbl">Seluruh aplikasi</label><div class="fsopt">' + fsv.map(([v, n]) => '<button data-act="set-fs" data-v="' + v + '" class="' + ((S.fs || 1) === v ? 'on' : '') + '" style="font-size:' + (0.8 * v) + 'rem">' + n + '</button>').join('') + '</div>' +
        '<label class="lbl">Tulisan Arab (Amiri)</label><div class="fsopt">' + arv.map(([v, n]) => '<button data-act="set-arz" data-v="' + v + '" class="' + (Math.abs(z - v) < 0.01 ? 'on' : '') + '">' + n + '</button>').join('') + '</div>' +
        '<div class="card" style="margin-top:14px"><div class="ar" style="margin:0">رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً</div><div class="arti">Contoh ukuran teks bacaan.</div></div><button class="btn block" data-act="close">Selesai</button>');
    },
    'set-fs': el => { S.fs = +el.dataset.v; save(); render(); A.font(); },
    'set-arz': el => { S.dzOpt.z = +el.dataset.v; save(); render(); A.font(); },
    'install': () => { if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt.userChoice.finally(() => { deferredPrompt = null; render(); }); } }
  };
  function segRow(s) {
    return '<div class="seglist"><span><i style="background:' + COLOR_HEX[s.color] + '"></i>' + COLOR_LBL[s.color] + (s.kental ? ', kental' : '') + (s.bau ? ', berbau' : '') + '<br><span class="muted">' + fdt(s.start) + ' → ' + (s.end == null ? 'sekarang' : fdt(s.end)) + '</span></span><button class="btn sm soft" data-act="edit-seg" data-id="' + s.id + '">' + ic('edit') + '</button></div>';
  }
  function afterStop(seg) {
    const r = analysis();
    const b = r.blocks.filter(x => x.start <= seg.end && x.end >= seg.end - 60e3 && (x.kind === 'haid' || x.kind === 'nifas')).pop();
    if (!b) return toast('Tersimpan');
    const o = P.obligations(null, seg.end, S.city);
    sheet('<h2>Alhamdulillah</h2><div class="status st-' + b.kind + '" style="margin-top:8px"><div class="k">Hukum darah ini</div><div class="t">' + esc(b.title) + '</div><p>' + dur(b.end - b.start) + '</p></div>' +
      (o.atEnd ? '<div class="card"><h3>Yang perlu dilakukan</h3><ul class="feat"><li>' + ic('water') + '<span>Mandi wajib dengan niat menghilangkan hadats ' + (b.kind === 'nifas' ? 'nifas' : 'haid') + '.</span></li><li>' + ic('mosque') + '<span>Kerjakan shalat <b>' + o.atEnd.wajib.join(' dan ') + '</b>. Waktu ' + o.atEnd.prayer + ' berakhir pukul ' + hm(o.atEnd.until, S.city.tz) + '.</span></li></ul><div class="muted" style="font-size:0.8rem">Jika darah kembali sebelum genap 15 hari sejak awal haid, catat lagi. Bisa jadi semuanya masih haid.</div></div>' : '') +
      '<button class="btn block" data-act="close">Baik</button>');
  }
  function finishOb(full) {
    const d = ob.d, c = CITIES.find(x => x[0] === d.kota) || CITIES[0];
    S.city = { name: c[0], lat: c[1], lng: c[2], tz: c[3] };
    S.user = { nama: d.nama, email: d.email, birth: d.birth, status: d.status, adahHaid: null, adahSuci: null, created: Date.now() };
    if (full && d.status === 'mutadah') {
      const ah = parseFloat($('#o-ah') && $('#o-ah').value), as = parseFloat($('#o-as') && $('#o-as').value);
      if (ah >= 1 && ah <= 15) S.user.adahHaid = ah; if (as >= 15) S.user.adahSuci = as;
      const ls = fromInput($('#o-ls') && $('#o-ls').value), le = fromInput($('#o-le') && $('#o-le').value);
      if (ls && le && le > ls) S.segments.push({ id: uid(), start: ls, end: le, color: 'merah', kental: false, bau: false });
    }
    save(); ui.view = 'beranda'; render(); toast('Selamat datang, ' + d.nama.split(' ')[0]);
  }

  /* ================= INIT ================= */
  document.addEventListener('click', e => { const el = e.target.closest('[data-act]'); if (!el) return; const f = A[el.dataset.act]; if (f) { e.preventDefault(); f(el); } });
  document.addEventListener('input', e => { if (e.target.id === 'qsearch') { ui.q = e.target.value; const pos = e.target.selectionStart; render(); const s = $('#qsearch'); if (s) { s.focus(); s.setSelectionRange(pos, pos); } } });
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; if (S.user && (ui.view === 'beranda' || ui.view === 'profil')) render(); });
  const h0 = (location.hash || '').slice(1); if (['beranda', 'kalender', 'belajar', 'dzikir', 'profil'].includes(h0)) ui.view = h0;
  window.addEventListener('hashchange', () => { const v = location.hash.slice(1); if (v !== ui.view && ['beranda', 'kalender', 'belajar', 'dzikir', 'profil'].includes(v)) { ui.view = v; render(); } });
  setInterval(() => { if (S.user && ui.view === 'kalender' && !$('#sheet')) render(); }, 60000);
  function showUpdate(reg) {
    if ($('.upd')) return;
    const d = document.createElement('div'); d.className = 'upd';
    d.innerHTML = '<span><b>Versi baru tersedia.</b><br>Perbarui untuk mendapatkan perbaikan terbaru.</span><button>Perbarui</button>';
    d.querySelector('button').onclick = () => { if (reg.waiting) reg.waiting.postMessage('skip'); else location.reload(); };
    document.body.appendChild(d);
  }
  try {
    if ('serviceWorker' in navigator && location.protocol === 'https:' && !/claude|anthropic/.test(location.hostname)) {
      let reloading = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloading) return; reloading = true; location.reload(); });
      navigator.serviceWorker.register('sw.js').then(reg => {
        if (reg.waiting && navigator.serviceWorker.controller) showUpdate(reg);
        reg.addEventListener('updatefound', () => { const w = reg.installing; if (w) w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) showUpdate(reg); }); });
        const chk = () => reg.update().catch(() => {});
        setInterval(chk, 30 * 60e3);
        document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') chk(); });
      }).catch(() => {});
    }
  } catch (e) {}
  render();
})();
