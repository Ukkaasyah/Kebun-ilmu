/* ====== NAHWU & SHARAF — diringkas dari buku "Asyik Belajar Nahwu & Sharaf" (Ukkaasyah Abdurrahman) ======
   Level 1–2 : harakat saja (TK – kelas 2)
   Level 3   : Kelas 4 → Bab 1–6
   Level 4   : Kelas 5 → Bab 7–11
   Level 5   : Kelas 6 → Bab 12–16                                                     */

const HURUF_HIJAIYAH = [['ا','a'],['ب','b'],['ت','t'],['ث','ts'],['ج','j'],['ح','h'],['خ','kh'],['د','d'],['ذ','dz'],['ر','r'],['ز','z'],['س','s'],['ش','sy'],['ص','sh'],['ض','dh'],['ط','th'],['ظ','zh'],['ع','\''],['غ','gh'],['ف','f'],['ق','q'],['ك','k'],['ل','l'],['م','m'],['ن','n'],['و','w'],['ه','h'],['ي','y']];

const HARAKAT_LEARN = {
  1: [
    { t:'Fathah', ar:'فَتْحَةٌ', b:'Garis miring kecil di atas huruf. Bunyinya “a”.', ex:[['بَ','ba'],['تَ','ta'],['مَ','ma'],['كَتَبَ','ka-ta-ba']] },
    { t:'Kasrah', ar:'كَسْرَةٌ', b:'Garis miring kecil di bawah huruf. Bunyinya “i”.', ex:[['بِ','bi'],['تِ','ti'],['مِ','mi'],['سَمِعَ','sa-mi-\'a']] },
    { t:'Dhammah', ar:'ضَمَّةٌ', b:'Seperti wawu kecil di atas huruf. Bunyinya “u”.', ex:[['بُ','bu'],['تُ','tu'],['مُ','mu'],['حَسُنَ','ha-su-na']] },
    { t:'Sukun', ar:'سُكُونٌ', b:'Bulatan kecil di atas huruf. Hurufnya mati, tidak berbunyi vokal.', ex:[['بْ','b'],['أَبْ','ab'],['قُلْ','qul'],['مِنْ','min']] }
  ],
  2: [
    { t:'Tanwin', ar:'التَّنْوِينُ', b:'Harakat dobel di ujung kata. Bunyinya ada “n” di belakangnya.', ex:[['بٌ','bun (dhammatain)'],['بًا','ban (fathatain)'],['بٍ','bin (kasratain)'],['كِتَابٌ','ki-taa-bun']] },
    { t:'Syaddah', ar:'الشَّدَّةُ', b:'Tanda seperti huruf w kecil. Hurufnya dibaca dobel (tasydid).', ex:[['رَبَّ','rab-ba'],['أُمٌّ','um-mun'],['مُحَمَّدٌ','mu-ham-ma-dun']] },
    { t:'Bacaan panjang (mad)', ar:'الْمَدُّ', b:'Fathah bertemu alif, kasrah bertemu ya mati, dhammah bertemu wawu mati: dibaca panjang dua harakat.', ex:[['بَا','baa'],['بِي','bii'],['بُو','buu'],['نُورٌ','nuu-run']] }
  ]
};

// Bacaan suku kata panjang & tanwin untuk soal level 2
const HARAKAT2 = [
  ['بٌ','bun'],['بًا','ban'],['بٍ','bin'],['تٌ','tun'],['تًا','tan'],['تٍ','tin'],['مٌ','mun'],['مًا','man'],['مٍ','min'],
  ['بَا','baa'],['بِي','bii'],['بُو','buu'],['نَا','naa'],['نِي','nii'],['نُو','nuu'],['سَا','saa'],['سِي','sii'],['سُو','suu'],
  ['رَبَّ','rabba'],['أُمٌّ','ummun'],['جَنَّةٌ','jannatun'],['كِتَابٌ','kitaabun'],['نُورٌ','nuurun'],['دِينٌ','diinun']
];

const NAHWU_BAB = [
  /* ---------------- KELAS 4 (Level 3) ---------------- */
  { no:1, lv:3, judul:'Apa itu Nahwu?', ar:'مَا هُوَ النَّحْوُ؟',
    learn:[
      { t:'Nahwu dan Sharaf', b:'Ilmu Nahwu membahas ujung kata (dibaca dhammah, fathah, kasrah, atau sukun) dan cara menyusun kata menjadi kalimat. Ilmu Sharaf membahas perubahan bentuk kata supaya muncul arti baru.', ex:[['مُحَمَّدٌ • مُحَمَّدًا • مُحَمَّدٍ','Nahwu: katanya sama, ujungnya berubah'],['كَتَبَ ← يَكْتُبُ ← اكْتُبْ','Sharaf: bentuknya berubah, artinya berubah']] },
      { t:'Kenapa belajar Nahwu?', b:'Salah membaca harakat di ujung kata bisa membuat arti jauh berbeda. Kata yang dibaca dhammah biasanya pelakunya.', ex:[['أَكَلَ الْوَلَدُ السَّمَكَةَ','Anak itu memakan ikan (benar)'],['أَكَلَ الْوَلَدَ السَّمَكَةُ','Ikan itu memakan anak! (keliru)']] },
      { t:'Pepatah ulama', b:'“Sharaf itu ibunya ilmu, dan Nahwu itu bapaknya.”', ex:[['الصَّرْفُ أُمُّ الْعُلُومِ وَالنَّحْوُ أَبُوهَا','Sharaf ibu ilmu, Nahwu bapaknya']] }
    ],
    soal:[
      { q:'Ilmu yang membahas ujung kata (harakat akhirnya) disebut ilmu…', a:'Nahwu', p:['Sharaf','Tajwid','Fikih'] },
      { q:'Ilmu yang membahas perubahan bentuk kata disebut ilmu…', a:'Sharaf', p:['Nahwu','Tajwid','Hadits'] },
      { ar:'كَتَبَ ← يَكْتُبُ ← اكْتُبْ', q:'Perubahan seperti ini dibahas dalam ilmu…', a:'Sharaf', p:['Nahwu','Tajwid','Balaghah'] },
      { ar:'مُحَمَّدٌ • مُحَمَّدًا • مُحَمَّدٍ', q:'Perubahan ujung kata seperti ini dibahas dalam ilmu…', a:'Nahwu', p:['Sharaf','Tajwid','Tafsir'] },
      { ar:'أَكَلَ الْوَلَدُ السَّمَكَةَ', q:'Siapa yang makan?', a:'Anak itu', p:['Ikan itu','Ayah','Tidak ada'] },
      { ar:'أَكَلَ الْوَلَدَ السَّمَكَةُ', q:'Siapa yang makan?', a:'Ikan itu', p:['Anak itu','Ibu','Tidak ada'] },
      { s:'Harakat di ujung kata tidak memengaruhi arti.', v:false },
      { s:'Sharaf itu ibunya ilmu, dan Nahwu itu bapaknya.', v:true },
      { s:'Belajar Nahwu membantu kita membaca kitab tanpa harakat.', v:true }
    ] },
  { no:2, lv:3, judul:'Kalimah: Isim, Fi\'il, Huruf', ar:'الْكَلِمَةُ',
    learn:[
      { t:'Kalimah itu apa?', b:'Kalimah adalah lafazh yang memiliki satu makna. Kalimah ada tiga: isim, fi\'il, dan huruf.', ex:[['مَسْجِدٌ • قَلَمٌ • أَحْمَدُ','Isim: kata benda, tanpa waktu'],['كَتَبَ • يَقْرَأُ • اكْتُبْ','Fi\'il: kata kerja, disertai waktu'],['فِي • مِنْ • هَلْ','Huruf: maknanya sempurna bila bersama kata lain']] },
      { t:'Tanda-tanda isim', b:'Cukup ada satu tanda, kata itu pasti isim.', ex:[['كِتَابٌ','Tanwin di ujung'],['الْمَسْجِدُ','Diawali alif-lam (ال)'],['فِي الْبَيْتِ','Didahului huruf jar'],['يَا أَحْمَدُ','Didahului huruf nida (يَا)']] },
      { t:'Tanda-tanda fi\'il', b:'Kalau sebuah kata menerima salah satu tanda ini, berarti ia fi\'il.', ex:[['قَدْ قَامَ','Qad: sungguh dia telah berdiri'],['سَيَقُومُ • سَوْفَ يَقُومُ','Sa / saufa: dia akan berdiri'],['قَامَتْ','Ta\' mati: dia (pr) telah berdiri']] },
      { t:'Tanda huruf', b:'Huruf tidak punya tanda. Ia tidak bisa menerima tanda isim maupun tanda fi\'il.', ex:[['هَلْ • فِي • لَمْ • ثُمَّ','apakah • di dalam • tidak • kemudian']] }
    ],
    soal:'kalimah' },
  { no:3, lv:3, judul:'Mudzakkar & Muannats', ar:'الْمُذَكَّرُ وَالْمُؤَنَّثُ',
    learn:[
      { t:'Pengertian', b:'Mudzakkar: isim yang menunjukkan laki-laki atau benda yang dianggap laki-laki. Muannats: isim yang menunjukkan perempuan atau benda yang dianggap perempuan.', ex:[['رَجُلٌ • أَبٌ • قَلَمٌ • بَابٌ','Mudzakkar'],['امْرَأَةٌ • أُمٌّ • شَجَرَةٌ • مَدْرَسَةٌ','Muannats']] },
      { t:'Tanda muannats', b:'Ada tiga tanda: ta\' marbuthah, alif maqshurah, dan alif mamdudah.', ex:[['مُسْلِمَةٌ • فَاطِمَةُ','Ta\' marbuthah (ة)'],['سَلْمَى • لَيْلَى • كُبْرَى','Alif maqshurah (ى)'],['حَمْرَاءُ • صَحْرَاءُ • حَسْنَاءُ','Alif mamdudah (اء)']] },
      { t:'Muannats tanpa tanda', b:'Ada isim yang tetap muannats walaupun tanpa tanda. Ini dihafal.', ex:[['مَرْيَمُ • زَيْنَبُ • أُمٌّ • بِنْتٌ','Nama dan sebutan perempuan'],['يَدٌ • عَيْنٌ • أُذُنٌ • رِجْلٌ','Anggota badan yang berpasangan'],['حَامِلٌ • مُرْضِعٌ','Sifat khusus perempuan']] }
    ],
    soal:'gender' },
  { no:4, lv:3, judul:'Mufrad, Mutsanna, Jamak', ar:'الْمُفْرَدُ وَالْمُثَنَّى وَالْجَمْعُ',
    learn:[
      { t:'Satu, dua, atau banyak?', b:'Mufrad menunjukkan satu. Mutsanna menunjukkan dua, dengan tambahan ـَانِ (rafa\') atau ـَيْنِ (nashab dan jar). Jamak menunjukkan lebih dari dua.', ex:[['مُسْلِمٌ','seorang muslim'],['مُسْلِمَانِ • مُسْلِمَيْنِ','dua orang muslim'],['مُسْلِمُونَ','banyak muslim']] },
      { t:'Jamak ada tiga macam', b:'Jamak mudzakkar salim: tambah ـُونَ / ـِينَ. Jamak muannats salim: tambah ـَاتٌ (ة dibuang). Jamak taksir: bentuknya berubah, dihafal.', ex:[['مُدَرِّسُونَ','Jamak mudzakkar salim'],['مُسْلِمَاتٌ • طَالِبَاتٌ','Jamak muannats salim'],['كُتُبٌ • بُيُوتٌ • أَقْلَامٌ','Jamak taksir']] },
      { t:'Kalau ujungnya ة', b:'Untuk mutsanna, ta\' marbuthah berubah menjadi ta\' biasa.', ex:[['شَجَرَةٌ ← شَجَرَتَانِ','satu pohon → dua pohon'],['مُدَرِّسَةٌ ← مُدَرِّسَتَانِ','satu guru pr → dua guru pr']] }
    ],
    soal:'bilangan' },
  { no:5, lv:3, judul:'Nakirah & Ma\'rifah', ar:'النَّكِرَةُ وَالْمَعْرِفَةُ',
    learn:[
      { t:'Pengertian', b:'Nakirah: isim yang belum tertentu (umum), biasanya bertanwin. Ma\'rifah: isim yang sudah tertentu (jelas).', ex:[['كِتَابٌ','sebuah buku (buku apa saja)'],['الْكِتَابُ','buku itu (yang sudah kita tahu)']] },
      { t:'Enam macam ma\'rifah', b:'Dhamir, \'alam, isim isyarah, isim maushul, yang ber-alif-lam, dan yang disandarkan kepada salah satunya (mudhaf).', ex:[['هُوَ • أَنَا','Dhamir (kata ganti)'],['أَحْمَدُ • مَكَّةُ','\'Alam (nama)'],['هَذَا • تِلْكَ','Isim isyarah (kata tunjuk)'],['الَّذِي • الَّتِي','Isim maushul (yang)'],['الْبَيْتُ','Ber-alif-lam'],['كِتَابُ أَحْمَدَ','Mudhaf']] },
      { t:'Tabel dhamir', b:'Semua dhamir termasuk ma\'rifah dan mabni.', ex:[['هُوَ • هُمَا • هُمْ','dia (lk) • mereka berdua • mereka (lk)'],['هِيَ • هُمَا • هُنَّ','dia (pr) • mereka berdua • mereka (pr)'],['أَنْتَ • أَنْتُمَا • أَنْتُمْ','kamu (lk) • kalian berdua • kalian (lk)'],['أَنْتِ • أَنْتُمَا • أَنْتُنَّ','kamu (pr) • kalian berdua • kalian (pr)'],['أَنَا • نَحْنُ','saya • kami']] },
      { t:'Isyarah dan maushul', b:'Isyarah dekat “ini”, isyarah jauh “itu”, dan maushul “yang”.', ex:[['هَذَا • ذَلِكَ • الَّذِي','satu laki-laki'],['هَذِهِ • تِلْكَ • الَّتِي','satu perempuan'],['هَؤُلَاءِ • أُولَئِكَ • الَّذِينَ','banyak laki-laki'],['مَنْ • مَا','maushul umum: orang yang • sesuatu yang']] }
    ],
    soal:'makrifah' },
  { no:6, lv:3, judul:'Mu\'rab & Mabni', ar:'الْمُعْرَبُ وَالْمَبْنِيُّ',
    learn:[
      { t:'Pengertian', b:'Mu\'rab: isim yang ujungnya berubah karena kedudukannya berubah. Mabni: isim yang ujungnya tetap dalam satu keadaan.', ex:[['جَاءَ زَيْدٌ • رَأَيْتُ زَيْدًا • مَرَرْتُ بِزَيْدٍ','Mu\'rab: ujungnya berubah'],['جَاءَ هَذَا • رَأَيْتُ هَذَا • مَرَرْتُ بِهَذَا','Mabni: ujungnya tetap']] },
      { t:'Isim yang mabni (dihafal)', b:'Dhamir, isim isyarah, isim maushul, dan isim istifham (kata tanya). Selain itu, kebanyakan isim mu\'rab.', ex:[['أَنَا • هُوَ • نَحْنُ','Dhamir'],['هَذَا • ذَلِكَ','Isim isyarah'],['الَّذِي • الَّتِي','Isim maushul'],['مَنْ • مَا • مَتَى • أَيْنَ • كَيْفَ • كَمْ','Isim istifham']] }
    ],
    soal:'murab' },

  /* ---------------- KELAS 5 (Level 4) ---------------- */
  { no:7, lv:4, judul:'Madhi, Mudhari\', Amar', ar:'الْمَاضِي وَالْمُضَارِعُ وَالْأَمْرُ',
    learn:[
      { t:'Fi\'il dari waktunya', b:'Madhi: perbuatan yang sudah terjadi. Mudhari\': sedang atau akan terjadi. Amar: perintah.', ex:[['كَتَبَ','telah menulis'],['يَكْتُبُ','sedang/akan menulis'],['اكْتُبْ','tulislah!']] },
      { t:'Tanda mudhari\'', b:'Diawali salah satu huruf أ ن ي ت (mudah diingat: أَنَيْتُ). Madhi dan amar itu mabni, mudhari\' itu mu\'rab.', ex:[['أَكْتُبُ • نَكْتُبُ','saya • kami menulis'],['يَكْتُبُ • تَكْتُبُ','dia (lk) • kamu menulis']] },
      { t:'Cara membuat fi\'il amar', b:'Ambil mudhari\' untuk “kamu”, buang huruf pertamanya, sukunkan huruf akhirnya. Kalau huruf awalnya mati, tambah hamzah: dhammah bila huruf ketiga mudhari\'-nya dhammah, kasrah bila fathah atau kasrah.', ex:[['تَكْتُبُ ← اكْتُبْ','hamzah dhammah: uktub'],['تَجْلِسُ ← اجْلِسْ','hamzah kasrah: ijlis'],['تَفْتَحُ ← افْتَحْ','hamzah kasrah: iftah']] }
    ],
    soal:'waktu' },
  { no:8, lv:4, judul:'Ma\'lum & Majhul', ar:'الْمَعْلُومُ وَالْمَجْهُولُ',
    learn:[
      { t:'Pengertian', b:'Ma\'lum: fi\'il yang pelakunya disebut, artinya aktif (me-). Majhul: pelakunya tidak disebut dan digantikan naibul fa\'il, artinya pasif (di-).', ex:[['كَتَبَ مُحَمَّدٌ الدَّرْسَ','Muhammad menulis pelajaran'],['كُتِبَ الدَّرْسُ','Pelajaran itu ditulis']] },
      { t:'Cara membuat majhul', b:'Madhi: huruf pertama dhammah, huruf sebelum akhir kasrah (U – I). Mudhari\': huruf pertama dhammah, huruf sebelum akhir fathah (U – A). Fi\'il amar tidak punya bentuk majhul.', ex:[['كَتَبَ ← كُتِبَ','telah ditulis'],['نَصَرَ ← نُصِرَ','telah ditolong'],['يَكْتُبُ ← يُكْتَبُ','sedang/akan ditulis'],['يَفْتَحُ ← يُفْتَحُ','sedang/akan dibuka']] }
    ],
    soal:'majhul' },
  { no:9, lv:4, judul:'Kalam, Jumlah, Syibhul Jumlah', ar:'الْكَلَامُ وَالْجُمْلَةُ',
    learn:[
      { t:'Kalam', b:'Susunan kata yang artinya sudah sempurna, sehingga pendengar paham dan tidak menunggu lanjutannya. Syaratnya: dua kata atau lebih, artinya lengkap, dan berbahasa Arab.', ex:[['الْمَسْجِدُ نَظِيفٌ','Masjid itu bersih (kalam)'],['إِنْ جَاءَ مُحَمَّدٌ','Jika Muhammad datang… (bukan kalam)']] },
      { t:'Jumlah dan Syibhul Jumlah', b:'Jumlah ismiyyah diawali isim (mubtada\' + khabar). Jumlah fi\'liyyah diawali fi\'il (fi\'il + fa\'il). Syibhul jumlah: jar-majrur dan zharaf.', ex:[['الطَّالِبُ مُجْتَهِدٌ','Jumlah ismiyyah'],['ذَهَبَ أَحْمَدُ','Jumlah fi\'liyyah'],['فِي الْفَصْلِ','Jar-majrur'],['فَوْقَ الْمَكْتَبِ','Zharaf']] }
    ],
    soal:'jumlah' },
  { no:10, lv:4, judul:'I\'rab & Tanda-tandanya', ar:'الْإِعْرَابُ وَعَلَامَاتُهُ',
    learn:[
      { t:'Apa itu i\'rab?', b:'Berubahnya ujung kata karena berubahnya kedudukan kata itu, akibat kata lain yang masuk sebelumnya.', ex:[['جَاءَ زَيْدٌ','Rafa\''],['رَأَيْتُ زَيْدًا','Nashab'],['مَرَرْتُ بِزَيْدٍ','Jar'],['لَمْ يَكْتُبْ','Jazm (khusus fi\'il)']] },
      { t:'Empat keadaan i\'rab', b:'Rafa\' (asli: dhammah), nashab (asli: fathah), jar (asli: kasrah, khusus isim), jazm (asli: sukun, khusus fi\'il). Isim tidak pernah jazm, fi\'il tidak pernah jar.', ex:[] },
      { t:'Dua kelompok istimewa', b:'Asmaul khamsah: lima isim yang i\'rabnya dengan huruf (و ا ي) bila disandarkan. Af\'alul khamsah: mudhari\' yang bersambung alif dua, wawu jamak, atau ya\' perempuan, lalu diakhiri nun.', ex:[['أَبُوكَ • أَخُوكَ • حَمُوكِ • فُوكَ • ذُو مَالٍ','Asmaul khamsah'],['يَفْعَلَانِ • يَفْعَلُونَ • تَفْعَلِينَ','Af\'alul khamsah']] },
      { t:'Contekan tanda i\'rab', b:'Hafalkan tabel ini.', ex:[['مُفْرَدٌ • جَمْعُ تَكْسِيرٍ','dhammah • fathah • kasrah'],['جَمْعُ مُؤَنَّثٍ سَالِمٌ','dhammah • kasrah • kasrah'],['مُثَنًّى','alif • ya\' • ya\''],['جَمْعُ مُذَكَّرٍ سَالِمٌ','wawu • ya\' • ya\''],['الْأَسْمَاءُ الْخَمْسَةُ','wawu • alif • ya\''],['مَمْنُوعٌ مِنَ الصَّرْفِ','dhammah • fathah • fathah'],['الْأَفْعَالُ الْخَمْسَةُ','tetap nun • buang nun • buang nun']] }
    ],
    soal:'irabTanda' },
  { no:11, lv:4, judul:'Isim Ghairu Munsharif', ar:'الْمَمْنُوعُ مِنَ الصَّرْفِ',
    learn:[
      { t:'Isim yang tidak boleh bertanwin', b:'Ghairu munsharif tidak menerima tanwin, dan ketika jar ditandai dengan fathah, bukan kasrah.', ex:[['جَاءَتْ فَاطِمَةُ','Rafa\': dhammah tanpa tanwin'],['رَأَيْتُ فَاطِمَةَ','Nashab: fathah'],['مَرَرْتُ بِفَاطِمَةَ','Jar: tetap fathah']] },
      { t:'Nama-nama yang ghairu munsharif', b:'Nama perempuan, nama laki-laki berakhiran ة, nama laki-laki dari bahasa asing (\'ajam), dan nama berakhiran alif-nun.', ex:[['فَاطِمَةُ • زَيْنَبُ • مَرْيَمُ','Nama perempuan'],['حَمْزَةُ • طَلْحَةُ','Nama laki-laki berakhiran ة'],['إِبْرَاهِيمُ • يُوسُفُ • إِسْمَاعِيلُ','Nama asing'],['عُثْمَانُ • سُلَيْمَانُ • رَمَضَانُ','Berakhiran alif-nun']] },
      { t:'Awas!', b:'Nama Arab biasa seperti مُحَمَّدٌ dan عَلِيٌّ tetap bertanwin. Nama asing tiga huruf dengan huruf tengah mati, seperti نُوحٌ dan لُوطٌ, juga bertanwin.', ex:[] }
    ],
    soal:'ghairu' },

  /* ---------------- KELAS 6 (Level 5) ---------------- */
  { no:12, lv:5, judul:'Marfu\'at', ar:'الْمَرْفُوعَاتُ',
    learn:[
      { t:'Isim yang dibaca rafa\' ada tujuh', b:'Fa\'il, naibul fa\'il, mubtada\', khabar, isim kana, khabar inna, dan tabi\' yang marfu\'.', ex:[['قَرَأَ أَحْمَدُ الْكِتَابَ','أَحْمَدُ: fa\'il'],['قُرِئَ الْكِتَابُ','الْكِتَابُ: naibul fa\'il'],['الْمَسْجِدُ نَظِيفٌ','mubtada\' dan khabar'],['كَانَ الْجَوُّ بَارِدًا','الْجَوُّ: isim kana'],['إِنَّ اللَّهَ غَفُورٌ','غَفُورٌ: khabar inna']] },
      { t:'Cara cepat mengenali', b:'Kalimat diawali fi\'il? Cari pelakunya, itulah fa\'il (atau naibul fa\'il kalau fi\'ilnya majhul). Kalimat diawali isim? Itu mubtada\', lalu cari khabarnya.', ex:[] },
      { t:'Kana dan Inna saling kebalikan', b:'Kana: isimnya rafa\', khabarnya nashab. Inna: isimnya nashab, khabarnya rafa\'.', ex:[['كَانَ الْجَوُّ بَارِدًا','isim rafa\' • khabar nashab'],['إِنَّ اللَّهَ غَفُورٌ','isim nashab • khabar rafa\'']] }
    ],
    soal:'marfuat' },
  { no:13, lv:5, judul:'Manshubat', ar:'الْمَنْصُوبَاتُ',
    learn:[
      { t:'Isim yang dibaca nashab', b:'Maf\'ul bih, maf\'ul muthlaq, maf\'ul fih, maf\'ul li ajlih, maf\'ul ma\'ah, hal, tamyiz, mustatsna, isim lā, munada, khabar kana, isim inna, dan tabi\' yang manshub.', ex:[] },
      { t:'Maf\'ul-maf\'ul', b:'Maf\'ul bih: objek. Maf\'ul muthlaq: masdar dari fi\'ilnya sendiri. Maf\'ul fih: keterangan waktu/tempat. Maf\'ul li ajlih: sebab (karena). Maf\'ul ma\'ah: setelah wawu “bersama”.', ex:[['قَرَأْتُ الْقُرْآنَ','Maf\'ul bih'],['حَفِظْتُ الدَّرْسَ حِفْظًا','Maf\'ul muthlaq'],['صُمْتُ يَوْمَ الْخَمِيسِ','Maf\'ul fih'],['قُمْتُ احْتِرَامًا لِلْأُسْتَاذِ','Maf\'ul li ajlih'],['اسْتَيْقَظْتُ وَطُلُوعَ الشَّمْسِ','Maf\'ul ma\'ah']] },
      { t:'Hal, tamyiz, dan lainnya', b:'Hal menjelaskan keadaan. Tamyiz memperjelas yang samar (bilangan, takaran). Mustatsna setelah إِلَّا. Isim lā meniadakan jenis. Munada mudhaf dibaca nashab.', ex:[['رَجَعَ الْوَلَدُ مَسْرُورًا','Hal'],['اشْتَرَيْتُ عِشْرِينَ كِتَابًا','Tamyiz'],['حَضَرَ الطُّلَّابُ إِلَّا خَالِدًا','Mustatsna'],['لَا رَيْبَ فِيهِ','Isim lā'],['يَا عَبْدَ اللَّهِ','Munada']] }
    ],
    soal:'manshubat' },
  { no:14, lv:5, judul:'Majrurat', ar:'الْمَجْرُورَاتُ',
    learn:[
      { t:'Sebab jar ada tiga', b:'Karena huruf jar, karena menjadi mudhaf ilaih, dan karena menjadi tabi\' yang majrur. Mudhaf tidak boleh bertanwin dan tidak boleh ber-alif-lam.', ex:[['ذَهَبْتُ إِلَى الْمَسْجِدِ','Karena huruf jar'],['كِتَابُ الطَّالِبِ','Mudhaf ilaih'],['مَرَرْتُ بِالْبَيْتِ الْكَبِيرِ','Tabi\' yang majrur']] },
      { t:'Huruf jar dan artinya', b:'Huruf jar membuat isim sesudahnya dibaca jar.', ex:[['مِنْ • إِلَى • عَنْ','dari • ke • dari/tentang'],['عَلَى • فِي • بِـ','di atas • di dalam • dengan'],['لِـ • كَـ • حَتَّى','untuk/milik • seperti • sampai']] }
    ],
    soal:'majrurat' },
  { no:15, lv:5, judul:'Tawabi\'', ar:'التَّوَابِعُ',
    learn:[
      { t:'Kata yang selalu ikut', b:'Tabi\' adalah kata yang mengikuti i\'rab kata sebelumnya (matbu\'). Rafa\' ikut rafa\', nashab ikut nashab, jar ikut jar.', ex:[['جَاءَ الطَّالِبُ الْمُجْتَهِدُ','rafa\' ikut rafa\''],['رَأَيْتُ الطَّالِبَ الْمُجْتَهِدَ','nashab ikut nashab'],['مَرَرْتُ بِالطَّالِبِ الْمُجْتَهِدِ','jar ikut jar']] },
      { t:'Empat macam tawabi\'', b:'Na\'at (sifat), \'athaf (sambungan dengan huruf \'athaf), taukid (penguat), dan badal (pengganti).', ex:[['جَاءَ الطَّالِبُ الْمُجْتَهِدُ','Na\'at'],['جَاءَ أَحْمَدُ وَعَلِيٌّ','\'Athaf'],['جَاءَ الْقَوْمُ كُلُّهُمْ','Taukid'],['جَاءَ أَخُوكَ زَيْدٌ','Badal']] },
      { t:'Huruf \'athaf', b:'Dipakai untuk menyambung kata.', ex:[['وَ • فَـ • ثُمَّ','dan • lalu • kemudian'],['أَوْ • أَمْ • بَلْ','atau • ataukah • melainkan'],['لَا • لَكِنْ • حَتَّى','bukan • tetapi • sampai']] }
    ],
    soal:'tawabi' },
  { no:16, lv:5, judul:'Tashrif (Sharaf)', ar:'التَّصْرِيفُ',
    learn:[
      { t:'Apa itu tashrif?', b:'Mengubah satu kata asal menjadi beberapa bentuk supaya muncul arti yang bermacam-macam. Semua fi\'il ditimbang dengan huruf ف ع ل.', ex:[['نَصَرَ ← فَعَلَ','ن = fa\' fi\'il, ص = \'ain fi\'il, ر = lam fi\'il']] },
      { t:'Enam wazan tsulatsi mujarrad', b:'Kuncinya lihat harakat huruf kedua (\'ain fi\'il) di madhi dan mudhari\'.', ex:[['نَصَرَ – يَنْصُرُ','Bab 1: fathah – dhammah'],['ضَرَبَ – يَضْرِبُ','Bab 2: fathah – kasrah'],['فَتَحَ – يَفْتَحُ','Bab 3: fathah – fathah'],['عَلِمَ – يَعْلَمُ','Bab 4: kasrah – fathah'],['حَسِبَ – يَحْسِبُ','Bab 5: kasrah – kasrah'],['حَسُنَ – يَحْسُنُ','Bab 6: dhammah – dhammah']] },
      { t:'Tashrif istilahi', b:'Urutannya: madhi, mudhari\', masdar, isim fa\'il, isim maf\'ul, amar, nahi, isim zaman, isim makan, isim alat.', ex:[['نَصَرَ • يَنْصُرُ • نَصْرًا','madhi • mudhari\' • masdar'],['نَاصِرٌ • مَنْصُورٌ','isim fa\'il • isim maf\'ul'],['انْصُرْ • لَا تَنْصُرْ','amar • nahi'],['مَنْصَرٌ • مِنْصَرٌ','isim zaman/makan • isim alat']] },
      { t:'Tashrif lughawi', b:'Mengubah bentuk kata menurut pelakunya.', ex:[['نَصَرَ • نَصَرَا • نَصَرُوا','dia • mereka berdua • mereka (lk)'],['نَصَرَتْ • نَصَرَتَا • نَصَرْنَ','dia • mereka berdua • mereka (pr)'],['نَصَرْتَ • نَصَرْتُمَا • نَصَرْتُمْ','kamu • kalian berdua • kalian (lk)'],['نَصَرْتُ • نَصَرْنَا','saya • kami']] }
    ],
    soal:'tashrif' }
];

/* ---------- Bank soal per bab ---------- */
const NB = {
  isimAlasan: [['كِتَابٌ','Tanwin'],['قَلَمٌ','Tanwin'],['بَيْتٌ','Tanwin'],['الْمَسْجِدُ','Alif-lam'],['الْقَمَرُ','Alif-lam'],['الطَّالِبُ','Alif-lam'],
    ['فِي [بَيْتِ] أَحْمَدَ','Huruf jar'],['عَلَى [مَكْتَبِ] الْمُدَرِّسِ','Huruf jar'],['يَا [أَحْمَدُ]','Huruf nida'],['يَا [عَلِيُّ]','Huruf nida']],
  fiilAlasan: [['قَدْ [قَامَ]','Qad'],['قَدْ [نَجَحَ]','Qad'],['[سَيَكْتُبُ]','Sa / saufa'],['سَوْفَ [يَذْهَبُ]','Sa / saufa'],['[قَامَتْ]','Ta\' mati'],['[جَلَسَتْ]','Ta\' mati']],
  tandaMuannats: [['مُسْلِمَةٌ','Ta\' marbuthah'],['شَجَرَةٌ','Ta\' marbuthah'],['مَدْرَسَةٌ','Ta\' marbuthah'],['سَلْمَى','Alif maqshurah'],['لَيْلَى','Alif maqshurah'],['كُبْرَى','Alif maqshurah'],
    ['حَمْرَاءُ','Alif mamdudah'],['صَحْرَاءُ','Alif mamdudah'],['مَرْيَمُ','Tanpa tanda'],['يَدٌ','Tanpa tanda'],['عَيْنٌ','Tanpa tanda'],['شَمْسٌ','Tanpa tanda']],
  gender: { m:['رَجُلٌ','أَبٌ','قَلَمٌ','بَابٌ','مُدَرِّسٌ','طَالِبٌ','بَيْتٌ','وَلَدٌ','مَسْجِدٌ','كِتَابٌ','حَمْزَةُ'], f:['امْرَأَةٌ','أُمٌّ','شَجَرَةٌ','مَدْرَسَةٌ','بِنْتٌ','سَيَّارَةٌ','حَمْرَاءُ','سَلْمَى','يَدٌ','عَيْنٌ','رِجْلٌ','زَيْنَبُ'] },
  mutsanna: [['كِتَابٌ','كِتَابَانِ'],['قَلَمٌ','قَلَمَانِ'],['بَيْتٌ','بَيْتَانِ'],['طَالِبٌ','طَالِبَانِ'],['شَجَرَةٌ','شَجَرَتَانِ'],['مُدَرِّسَةٌ','مُدَرِّسَتَانِ'],['مَسْجِدٌ','مَسْجِدَانِ'],['سَيَّارَةٌ','سَيَّارَتَانِ']],
  jamakMacam: [['مُسْلِمُونَ','Jamak mudzakkar salim'],['مُدَرِّسُونَ','Jamak mudzakkar salim'],['مُؤْمِنِينَ','Jamak mudzakkar salim'],['مُسْلِمَاتٌ','Jamak muannats salim'],['طَالِبَاتٌ','Jamak muannats salim'],['شَجَرَاتٌ','Jamak muannats salim'],
    ['كُتُبٌ','Jamak taksir'],['بُيُوتٌ','Jamak taksir'],['أَقْلَامٌ','Jamak taksir'],['مَسَاجِدُ','Jamak taksir'],['رِجَالٌ','Jamak taksir']],
  makrifahMacam: [['هُوَ','Dhamir'],['أَنَا','Dhamir'],['نَحْنُ','Dhamir'],['أَحْمَدُ','\'Alam'],['مَكَّةُ','\'Alam'],['هَذَا','Isim isyarah'],['تِلْكَ','Isim isyarah'],
    ['الَّذِي','Isim maushul'],['الَّتِي','Isim maushul'],['الْكِتَابُ','Ber-alif-lam'],['الْمَدْرَسَةُ','Ber-alif-lam'],['كِتَابُ أَحْمَدَ','Mudhaf']],
  dhamir: [['هُوَ','dia (lk)'],['هِيَ','dia (pr)'],['هُمْ','mereka (lk)'],['هُنَّ','mereka (pr)'],['هُمَا','mereka berdua'],['أَنْتَ','kamu (lk)'],['أَنْتِ','kamu (pr)'],
    ['أَنْتُمْ','kalian (lk)'],['أَنْتُنَّ','kalian (pr)'],['أَنَا','saya'],['نَحْنُ','kami / kita']],
  isyarah: [['هَذَا','ini (satu lk)'],['هَذِهِ','ini (satu pr)'],['ذَلِكَ','itu (satu lk)'],['تِلْكَ','itu (satu pr)'],['هَؤُلَاءِ','ini (banyak)'],['أُولَئِكَ','itu (banyak)'],
    ['الَّذِي','yang (satu lk)'],['الَّتِي','yang (satu pr)'],['الَّذِينَ','yang (banyak lk)']],
  murab: [['كِتَابٌ','Mu\'rab'],['الْبَيْتُ','Mu\'rab'],['زَيْدٌ','Mu\'rab'],['مَسْجِدٌ','Mu\'rab'],['الطَّالِبُ','Mu\'rab'],
    ['هُوَ','Mabni'],['أَنْتُمْ','Mabni'],['هَذَا','Mabni'],['الَّذِي','Mabni'],['مَنْ','Mabni'],['كَيْفَ','Mabni'],['أَيْنَ','Mabni']],
  istifham: [['مَنْ','siapa'],['مَا','apa'],['مَتَى','kapan'],['أَيْنَ','di mana'],['كَيْفَ','bagaimana'],['كَمْ','berapa'],['أَيَّانَ','bilamana'],['مِنْ أَيْنَ','dari mana']],
  waktu: [['كَتَبَ','Madhi'],['ذَهَبَ','Madhi'],['جَلَسَ','Madhi'],['خَرَجَ','Madhi'],['شَرِبَ','Madhi'],['قَرَأَ','Madhi'],
    ['يَكْتُبُ','Mudhari\''],['نَذْهَبُ','Mudhari\''],['تَجْلِسُ','Mudhari\''],['أَخْرُجُ','Mudhari\''],['يَشْرَبُ','Mudhari\''],
    ['اكْتُبْ','Amar'],['اذْهَبْ','Amar'],['اجْلِسْ','Amar'],['اخْرُجْ','Amar'],['اشْرَبْ','Amar'],['اقْرَأْ','Amar']],
  amar: [['تَكْتُبُ','اكْتُبْ'],['تَجْلِسُ','اجْلِسْ'],['تَفْتَحُ','افْتَحْ'],['تَخْرُجُ','اخْرُجْ'],['تَذْهَبُ','اذْهَبْ'],['تَدْخُلُ','ادْخُلْ'],['تَشْرَبُ','اشْرَبْ'],['تَنْصُرُ','انْصُرْ']],
  majhul: [['كَتَبَ','كُتِبَ'],['نَصَرَ','نُصِرَ'],['فَتَحَ','فُتِحَ'],['ضَرَبَ','ضُرِبَ'],['سَمِعَ','سُمِعَ'],['أَكَلَ','أُكِلَ'],['شَرِبَ','شُرِبَ'],
    ['يَكْتُبُ','يُكْتَبُ'],['يَنْصُرُ','يُنْصَرُ'],['يَفْتَحُ','يُفْتَحُ'],['يَضْرِبُ','يُضْرَبُ'],['يَسْمَعُ','يُسْمَعُ']],
  jumlah: [['الْمَسْجِدُ نَظِيفٌ','Jumlah ismiyyah'],['الطَّالِبُ مُجْتَهِدٌ','Jumlah ismiyyah'],['اللَّهُ غَفُورٌ','Jumlah ismiyyah'],['الْبَابُ مَفْتُوحٌ','Jumlah ismiyyah'],
    ['ذَهَبَ أَحْمَدُ','Jumlah fi\'liyyah'],['يَقْرَأُ الْوَلَدُ','Jumlah fi\'liyyah'],['خَرَجَ الْمُدَرِّسُ','Jumlah fi\'liyyah'],['جَلَسَتْ فَاطِمَةُ','Jumlah fi\'liyyah'],
    ['فِي الْفَصْلِ','Jar-majrur'],['عَلَى السَّرِيرِ','Jar-majrur'],['مِنَ الْمَدْرَسَةِ','Jar-majrur'],['إِلَى الْمَسْجِدِ','Jar-majrur'],
    ['فَوْقَ الْمَكْتَبِ','Zharaf'],['تَحْتَ الشَّجَرَةِ','Zharaf'],['أَمَامَ الْبَيْتِ','Zharaf'],['عِنْدَ الْبَابِ','Zharaf']],
  tandaIrab: [
    ['Tanda asli rafa\' adalah…','Dhammah',['Fathah','Kasrah','Sukun']],['Tanda asli nashab adalah…','Fathah',['Dhammah','Kasrah','Sukun']],
    ['Tanda asli jar adalah…','Kasrah',['Fathah','Dhammah','Sukun']],['Tanda asli jazm adalah…','Sukun',['Kasrah','Fathah','Dhammah']],
    ['Tanda rafa\' mutsanna adalah…','Alif',['Wawu','Ya\'','Dhammah']],['Tanda rafa\' jamak mudzakkar salim adalah…','Wawu',['Alif','Ya\'','Nun']],
    ['Tanda nashab jamak muannats salim adalah…','Kasrah',['Fathah','Ya\'','Alif']],['Tanda nashab mutsanna adalah…','Ya\'',['Alif','Fathah','Wawu']],
    ['Tanda nashab asmaul khamsah adalah…','Alif',['Ya\'','Wawu','Fathah']],['Tanda jar asmaul khamsah adalah…','Ya\'',['Kasrah','Alif','Wawu']],
    ['Tanda jar ghairu munsharif adalah…','Fathah',['Kasrah','Ya\'','Dhammah']],['Tanda rafa\' af\'alul khamsah adalah…','Tetap nun',['Buang nun','Dhammah','Wawu']],
    ['Tanda nashab af\'alul khamsah adalah…','Buang nun',['Tetap nun','Fathah','Alif']],['Jar khusus untuk…','Isim',['Fi\'il','Huruf','Semua kata']],
    ['Jazm khusus untuk…','Fi\'il',['Isim','Huruf','Semua kata']]
  ],
  irabKalimat: [['جَاءَ [الْمُسْلِمُونَ]','Rafa\''],['رَأَيْتُ [الْمُسْلِمِينَ]','Nashab'],['جَاءَ [أَبُوكَ]','Rafa\''],['رَأَيْتُ [أَبَاكَ]','Nashab'],['مَرَرْتُ بِـ[أَبِيكَ]','Jar'],
    ['لَمْ [يَكْتُبْ]','Jazm'],['لَنْ [يَكْتُبَ]','Nashab'],['[يَكْتُبُ] الطَّالِبُ','Rafa\''],['رَأَيْتُ [الطَّالِبَاتِ]','Nashab'],['جَاءَ [الطَّالِبَانِ]','Rafa\'']],
  ghairu: { ya:['فَاطِمَةُ','زَيْنَبُ','مَرْيَمُ','حَمْزَةُ','طَلْحَةُ','إِبْرَاهِيمُ','يُوسُفُ','إِسْمَاعِيلُ','عُثْمَانُ','سُلَيْمَانُ','رَمَضَانُ'], tidak:['مُحَمَّدٌ','عَلِيٌّ','زَيْدٌ','نُوحٌ','لُوطٌ','خَالِدٌ','بَيْتٌ','كِتَابٌ'] },
  ghairuBaca: [['مَرَرْتُ بِـ…','فَاطِمَةَ','فَاطِمَةٍ'],['سَلَّمْتُ عَلَى…','إِبْرَاهِيمَ','إِبْرَاهِيمٍ'],['ذَهَبْتُ مَعَ…','عُثْمَانَ','عُثْمَانٍ'],['جَاءَ…','زَيْنَبُ','زَيْنَبٌ'],['مَرَرْتُ بِـ…','مُحَمَّدٍ','مُحَمَّدَ'],['جَلَسْتُ مَعَ…','عَلِيٍّ','عَلِيَّ']],
  marfuat: [['قَرَأَ [أَحْمَدُ] الْكِتَابَ','Fa\'il'],['جَاءَ [الْمُدَرِّسُ]','Fa\'il'],['يَكْتُبُ [الطَّالِبُ] الدَّرْسَ','Fa\'il'],['قُرِئَ [الْكِتَابُ]','Naibul fa\'il'],
    ['كُتِبَ [الدَّرْسُ]','Naibul fa\'il'],['فُتِحَ [الْبَابُ]','Naibul fa\'il'],['[الْمَسْجِدُ] نَظِيفٌ','Mubtada\''],['[الطَّالِبُ] مُجْتَهِدٌ','Mubtada\''],
    ['الْمَسْجِدُ [نَظِيفٌ]','Khabar'],['الْبَيْتُ [كَبِيرٌ]','Khabar'],['كَانَ [الْجَوُّ] بَارِدًا','Isim kana'],['كَانَ [الطَّالِبُ] مَرِيضًا','Isim kana'],
    ['إِنَّ اللَّهَ [غَفُورٌ]','Khabar inna'],['إِنَّ الْعِلْمَ [نُورٌ]','Khabar inna'],['جَاءَ الطَّالِبُ [الْمُجْتَهِدُ]','Tabi\'']],
  manshubat: [['قَرَأْتُ [الْقُرْآنَ]','Maf\'ul bih'],['شَرِبَ الْوَلَدُ [الْمَاءَ]','Maf\'ul bih'],['حَفِظْتُ الدَّرْسَ [حِفْظًا]','Maf\'ul muthlaq'],['جَلَسْتُ [جُلُوسًا]','Maf\'ul muthlaq'],
    ['صُمْتُ [يَوْمَ] الْخَمِيسِ','Maf\'ul fih'],['جَلَسْتُ [أَمَامَ] الْمُدَرِّسِ','Maf\'ul fih'],['قُمْتُ [احْتِرَامًا] لِلْأُسْتَاذِ','Maf\'ul li ajlih'],
    ['اسْتَيْقَظْتُ وَ[طُلُوعَ] الشَّمْسِ','Maf\'ul ma\'ah'],['رَجَعَ الْوَلَدُ [مَسْرُورًا]','Hal'],['اشْتَرَيْتُ عِشْرِينَ [كِتَابًا]','Tamyiz'],
    ['حَضَرَ الطُّلَّابُ إِلَّا [خَالِدًا]','Mustatsna'],['لَا [رَيْبَ] فِيهِ','Isim lā'],['يَا [عَبْدَ] اللَّهِ','Munada'],['كَانَ الْجَوُّ [بَارِدًا]','Khabar kana'],['إِنَّ [اللَّهَ] غَفُورٌ','Isim inna']],
  majrurat: [['ذَهَبْتُ إِلَى [الْمَسْجِدِ]','Karena huruf jar'],['الْقَلَمُ عَلَى [الْمَكْتَبِ]','Karena huruf jar'],['خَرَجْتُ مِنَ [الْبَيْتِ]','Karena huruf jar'],
    ['هَذَا كِتَابُ [الطَّالِبِ]','Mudhaf ilaih'],['بَابُ [الْمَسْجِدِ] مَفْتُوحٌ','Mudhaf ilaih'],['بَيْتُ [اللَّهِ]','Mudhaf ilaih'],
    ['مَرَرْتُ بِالْبَيْتِ [الْكَبِيرِ]','Tabi\' yang majrur'],['سَلَّمْتُ عَلَى الْمُدَرِّسِ [الْجَدِيدِ]','Tabi\' yang majrur']],
  hurufJar: [['مِنْ','dari'],['إِلَى','ke'],['عَنْ','dari / tentang'],['عَلَى','di atas'],['فِي','di dalam'],['بِـ','dengan'],['لِـ','untuk / milik'],['كَـ','seperti'],['حَتَّى','sampai']],
  tawabi: [['جَاءَ الطَّالِبُ [الْمُجْتَهِدُ]','Na\'at'],['رَأَيْتُ بَيْتًا [جَمِيلًا]','Na\'at'],['مَرَرْتُ بِرَجُلٍ [كَرِيمٍ]','Na\'at'],
    ['جَاءَ أَحْمَدُ وَ[عَلِيٌّ]','\'Athaf'],['قَرَأْتُ الْقُرْآنَ ثُمَّ [الْحَدِيثَ]','\'Athaf'],['أَكَلْتُ الْخُبْزَ وَ[التَّمْرَ]','\'Athaf'],
    ['جَاءَ الْقَوْمُ [كُلُّهُمْ]','Taukid'],['جَاءَ الْأَمِيرُ [نَفْسُهُ]','Taukid'],['جَاءَ أَخُوكَ [زَيْدٌ]','Badal'],['قَرَأْتُ الْكِتَابَ [نِصْفَهُ]','Badal']],
  hurufAthaf: [['وَ','dan'],['فَـ','lalu'],['ثُمَّ','kemudian'],['أَوْ','atau'],['أَمْ','ataukah'],['بَلْ','melainkan'],['لَكِنْ','tetapi']],
  tashrifIstilahi: [['نَصَرَ','نَاصِرٌ','Isim fa\'il'],['نَصَرَ','مَنْصُورٌ','Isim maf\'ul'],['نَصَرَ','لَا تَنْصُرْ','Fi\'il nahi'],['نَصَرَ','مِنْصَرٌ','Isim alat'],
    ['ضَرَبَ','ضَارِبٌ','Isim fa\'il'],['ضَرَبَ','مَضْرُوبٌ','Isim maf\'ul'],['فَتَحَ','فَاتِحٌ','Isim fa\'il'],['فَتَحَ','مَفْتُوحٌ','Isim maf\'ul'],['فَتَحَ','مِفْتَحٌ','Isim alat'],
    ['عَلِمَ','عَالِمٌ','Isim fa\'il'],['عَلِمَ','مَعْلُومٌ','Isim maf\'ul']],
  lughawi: [['نَصَرَ','dia (lk)'],['نَصَرَا','mereka berdua (lk)'],['نَصَرُوا','mereka (lk)'],['نَصَرَتْ','dia (pr)'],['نَصَرْنَ','mereka (pr)'],
    ['نَصَرْتَ','kamu (lk)'],['نَصَرْتِ','kamu (pr)'],['نَصَرْتُمْ','kalian (lk)'],['نَصَرْتُ','saya'],['نَصَرْنَا','kami'],
    ['يَنْصُرُونَ','mereka (lk)'],['تَنْصُرِينَ','kamu (pr)'],['أَنْصُرُ','saya'],['نَنْصُرُ','kami']]
};
