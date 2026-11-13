/* ====== BANK MATERI & SOAL — Kebun Ilmu ====== */

const LEVELS = [
  { n: 1, name: 'Mudah', kelas: 'TK – Kelas 1' },
  { n: 2, name: 'Cukup Mudah', kelas: 'Kelas 2' },
  { n: 3, name: 'Sedang', kelas: 'Kelas 3–4' },
  { n: 4, name: 'Sulit', kelas: 'Kelas 5' },
  { n: 5, name: 'Sangat Sulit', kelas: 'Kelas 6' }
];

/* ---------- MEMBACA ---------- */
const WORDS = [
  ['BOLA','⚽'],['BUKU','📚'],['TOPI','🧢'],['ROTI','🍞'],['SUSU','🥛'],['BAJU','👕'],['SAPU','🧹'],
  ['PENA','🖊️'],['APEL','🍎'],['KADO','🎁'],['MADU','🍯'],['NASI','🍚'],['BATU','🪨'],['AWAN','☁️'],
  ['KAYU','🪵'],['PALU','🔨'],['LAMPU','💡'],['RUMAH','🏠'],['BULAN','🌙'],['MOBIL','🚗'],['KAPAL','🚢'],
  ['PINTU','🚪'],['KUNCI','🔑'],['NANAS','🍍'],['JERUK','🍊'],['HUJAN','🌧️'],['BUNGA','🌸'],['POHON','🌳'],
  ['BALON','🎈'],['TELUR','🥚'],['SURAT','✉️'],['KOTAK','📦'],['KURSI','🪑'],['KASUR','🛏️'],['LILIN','🕯️'],
  ['TOMAT','🍅'],['ROKET','🚀'],['PIRING','🍽️'],['PISANG','🍌'],['ANGGUR','🍇'],['WORTEL','🥕'],['JAGUNG','🌽'],
  ['PAYUNG','☂️'],['SEPATU','👟'],['SENDOK','🥄'],['PENSIL','✏️'],['SEPEDA','🚲'],['KERETA','🚆'],['MASJID','🕌'],
  ['GUNTING','✂️'],['PESAWAT','✈️'],['PELANGI','🌈'],['MATAHARI','☀️'],['BINTANG','⭐'],['KOMPAS','🧭'],
  ['KACAMATA','👓'],['SEMANGKA','🍉'],['STROBERI','🍓']
];
const KALIMAT = [
  ['Adik minum ___ setiap pagi.','SUSU',['BATU','KAYU','PALU']],
  ['Kita shalat berjamaah di ___.','MASJID',['KASUR','KOTAK','KAPAL']],
  ['Ayah pergi ke kantor naik ___.','MOBIL',['LILIN','SENDOK','TOPI']],
  ['Kakak menulis di buku dengan ___.','PENSIL',['PIRING','BALON','PAYUNG']],
  ['Saat hujan turun, kita memakai ___.','PAYUNG','SEPATU,KUNCI,TELUR'.split(',')],
  ['Malam hari tampak ___ bersinar di langit.','BULAN',['JERUK','KURSI','PINTU']],
  ['Ibu memotong kertas dengan ___.','GUNTING',['SENDOK','BOLA','MADU']],
  ['Kita makan nasi memakai ___.','SENDOK',['PALU','KOMPAS','LAMPU']],
  ['Aku membaca ___ di perpustakaan.','BUKU',['ROTI','TOMAT','SAPU']],
  ['Sebelum masuk rumah, ayah membuka ___.','PINTU',['AWAN','PISANG','BATU']],
  ['Lantai yang kotor dibersihkan dengan ___.','SAPU',['APEL','KADO','SURAT']],
  ['Kami pergi umrah naik ___.','PESAWAT',['SEPEDA','KASUR','KUNCI']]
];

/* ---------- WARNA ---------- */
const COLORS = [
  { id:'merah', name:'Merah', hex:'#E53935', ar:'أَحْمَرُ', arF:'حَمْرَاءُ' },
  { id:'biru', name:'Biru', hex:'#1E6FE0', ar:'أَزْرَقُ', arF:'زَرْقَاءُ' },
  { id:'kuning', name:'Kuning', hex:'#FDD835', ar:'أَصْفَرُ', arF:'صَفْرَاءُ' },
  { id:'hijau', name:'Hijau', hex:'#43A047', ar:'أَخْضَرُ', arF:'خَضْرَاءُ' },
  { id:'putih', name:'Putih', hex:'#FFFFFF', ar:'أَبْيَضُ', arF:'بَيْضَاءُ' },
  { id:'hitam', name:'Hitam', hex:'#212121', ar:'أَسْوَدُ', arF:'سَوْدَاءُ' },
  { id:'oranye', name:'Oranye', hex:'#FB8C00', ar:'بُرْتُقَالِيٌّ' },
  { id:'ungu', name:'Ungu', hex:'#8E24AA', ar:'بَنَفْسَجِيٌّ' },
  { id:'cokelat', name:'Cokelat', hex:'#795548', ar:'بُنِّيٌّ' },
  { id:'abu', name:'Abu-abu', hex:'#9E9E9E', ar:'رَمَادِيٌّ' },
  { id:'pink', name:'Merah Muda', hex:'#F48FB1', ar:'وَرْدِيٌّ' }
];
const COLOR_OBJ = [
  ['🍌','pisang','kuning'],['🍎','apel','merah'],['🍊','jeruk','oranye'],['🍆','terong','ungu'],
  ['☁️','awan','putih'],['🍫','cokelat batangan','cokelat'],['🍇','anggur','ungu'],['🥕','wortel','oranye'],
  ['🌽','jagung','kuning'],['🍅','tomat','merah'],['🍃','daun','hijau'],['☀️','matahari','kuning'],
  ['🌊','air laut','biru'],['🥚','telur','putih'],['🍓','stroberi','merah'],['🥦','brokoli','hijau'],
  ['🪨','batu','abu'],['🪵','kayu','cokelat'],['🌸','bunga sakura','pink']
];
const COLOR_MIX = [
  ['merah','kuning','oranye'],['biru','kuning','hijau'],['merah','biru','ungu'],
  ['merah','putih','pink'],['hitam','putih','abu']
];
const AR_NOUNS_COLOR = [
  // [kata, jenis, arti]
  ['الْقَلَمُ','m','pena itu'],['الْبَيْتُ','m','rumah itu'],['الْكِتَابُ','m','buku itu'],['الْقَمِيصُ','m','kemeja itu'],
  ['السَّيَّارَةُ','f','mobil itu'],['الْحَقِيبَةُ','f','tas itu'],['الْوَرْدَةُ','f','bunga mawar itu'],['السَّاعَةُ','f','jam itu']
];

/* ---------- MUFRADAT (Durusul Lughah & Buku Saku Santri) ---------- */
// [arab, latin, arti, emoji]
const MUF_L1 = [
  ['بَيْتٌ','baitun','rumah','🏠'],['كِتَابٌ','kitaabun','buku','📚'],['قَلَمٌ','qolamun','pena','🖊️'],
  ['بَابٌ','baabun','pintu','🚪'],['شَمْسٌ','syamsun','matahari','☀️'],['قَمَرٌ','qomarun','bulan','🌙'],
  ['نَجْمٌ','najmun','bintang','⭐'],['مَاءٌ','maa-un','air','💧'],['خُبْزٌ','khubzun','roti','🍞'],
  ['لَبَنٌ','labanun','susu','🥛'],['تُفَّاحٌ','tuffaahun','apel','🍎'],['مَوْزٌ','mauzun','pisang','🍌'],
  ['مَسْجِدٌ','masjidun','masjid','🕌'],['سَيَّارَةٌ','sayyaarotun','mobil','🚗'],['سَاعَةٌ','saa\'atun','jam','⏰'],
  ['مِفْتَاحٌ','miftaahun','kunci','🔑'],['كُرْسِيٌّ','kursiyyun','kursi','🪑'],['سَرِيرٌ','sariirun','ranjang','🛏️'],
  ['قَمِيصٌ','qomiishun','kemeja','👕'],['حَقِيبَةٌ','haqiibatun','tas','🎒'],['شَجَرَةٌ','syajarotun','pohon','🌳'],
  ['مِلْعَقَةٌ','mil\'aqotun','sendok','🥄'],['بَيْضٌ','baidhun','telur','🥚'],['طَائِرَةٌ','thoo-irotun','pesawat','✈️'],
  ['دَرَّاجَةٌ','darroojatun','sepeda','🚲'],['مَطَرٌ','mathorun','hujan','🌧️'],['نَارٌ','naarun','api','🔥'],
  ['جَبَلٌ','jabalun','gunung','⛰️'],['بَحْرٌ','bahrun','laut','🌊']
];
const ANGKA = [
  ['وَاحِدٌ','waahidun','satu',1],['اثْنَانِ','itsnaani','dua',2],['ثَلَاثَةٌ','tsalaatsatun','tiga',3],
  ['أَرْبَعَةٌ','arba\'atun','empat',4],['خَمْسَةٌ','khomsatun','lima',5],['سِتَّةٌ','sittatun','enam',6],
  ['سَبْعَةٌ','sab\'atun','tujuh',7],['ثَمَانِيَةٌ','tsamaaniyatun','delapan',8],['تِسْعَةٌ','tis\'atun','sembilan',9],
  ['عَشَرَةٌ','\'asyarotun','sepuluh',10]
];
// [arab, arti, kelompok]
const MUF_L2 = [
  ['رَأْسٌ','kepala','tubuh'],['عَيْنٌ','mata','tubuh'],['أُذُنٌ','telinga','tubuh'],['أَنْفٌ','hidung','tubuh'],
  ['فَمٌ','mulut','tubuh'],['يَدٌ','tangan','tubuh'],['رِجْلٌ','kaki','tubuh'],['سِنٌّ','gigi','tubuh'],
  ['شَعْرٌ','rambut','tubuh'],['وَجْهٌ','wajah','tubuh'],
  ['أَبٌ','ayah','keluarga'],['أُمٌّ','ibu','keluarga'],['أَخٌ','saudara laki-laki','keluarga'],
  ['أُخْتٌ','saudara perempuan','keluarga'],['جَدٌّ','kakek','keluarga'],['جَدَّةٌ','nenek','keluarga'],
  ['عَمٌّ','paman (dari ayah)','keluarga'],['ابْنٌ','anak laki-laki','keluarga'],
  ['مُدَرِّسٌ','guru','sekolah'],['طَالِبٌ','pelajar','sekolah'],['فَصْلٌ','kelas','sekolah'],
  ['سَبُّورَةٌ','papan tulis','sekolah'],['مَكْتَبٌ','meja tulis','sekolah'],['دَفْتَرٌ','buku tulis','sekolah'],
  ['مِسْطَرَةٌ','penggaris','sekolah'],['مِمْسَحَةٌ','penghapus','sekolah'],
  ['طَبِيبٌ','dokter','orang'],['تَاجِرٌ','pedagang','orang'],['مُهَنْدِسٌ','insinyur','orang'],
  ['نَافِذَةٌ','jendela','rumah'],['مِرْآةٌ','cermin','rumah'],['مَطْبَخٌ','dapur','rumah'],
  ['حَمَّامٌ','kamar mandi','rumah'],['غُرْفَةٌ','kamar','rumah'],['سُوقٌ','pasar','tempat']
];
const MUF_L3 = [
  ['ذَهَبَ','pergi'],['جَلَسَ','duduk'],['كَتَبَ','menulis'],['قَرَأَ','membaca'],['أَكَلَ','makan'],
  ['شَرِبَ','minum'],['نَامَ','tidur'],['خَرَجَ','keluar'],['دَخَلَ','masuk'],['فَتَحَ','membuka'],
  ['رَجَعَ','pulang, kembali'],['سَمِعَ','mendengar'],['نَظَرَ','melihat'],['لَعِبَ','bermain'],
  ['غَسَلَ','mencuci'],['قَامَ','berdiri'],['حَفِظَ','menghafal'],['تَعَلَّمَ','belajar'],['سَافَرَ','bepergian jauh'],
  ['كَبِيرٌ','besar'],['صَغِيرٌ','kecil'],['طَوِيلٌ','panjang, tinggi'],['قَصِيرٌ','pendek'],
  ['جَدِيدٌ','baru'],['قَدِيمٌ','lama, kuno'],['جَمِيلٌ','indah'],['نَظِيفٌ','bersih'],
  ['حَارٌّ','panas'],['بَارِدٌ','dingin'],['قَرِيبٌ','dekat'],['بَعِيدٌ','jauh'],['سَهْلٌ','mudah'],['صَعْبٌ','sulit']
];
const JAMAK = [
  ['كِتَابٌ','كُتُبٌ','buku'],['قَلَمٌ','أَقْلَامٌ','pena'],['بَيْتٌ','بُيُوتٌ','rumah'],['بَابٌ','أَبْوَابٌ','pintu'],
  ['مَسْجِدٌ','مَسَاجِدُ','masjid'],['وَلَدٌ','أَوْلَادٌ','anak'],['طَالِبٌ','طُلَّابٌ','pelajar'],
  ['دَرْسٌ','دُرُوسٌ','pelajaran'],['نَجْمٌ','نُجُومٌ','bintang'],['شَجَرَةٌ','أَشْجَارٌ','pohon'],
  ['كُرْسِيٌّ','كَرَاسِيُّ','kursi'],['مِفْتَاحٌ','مَفَاتِيحُ','kunci'],['جَبَلٌ','جِبَالٌ','gunung'],
  ['صَدِيقٌ','أَصْدِقَاءُ','teman'],['رَجُلٌ','رِجَالٌ','laki-laki'],['يَوْمٌ','أَيَّامٌ','hari'],['بَحْرٌ','بِحَارٌ','laut']
];
const LAWAN = [
  ['كَبِيرٌ','صَغِيرٌ'],['طَوِيلٌ','قَصِيرٌ'],['جَدِيدٌ','قَدِيمٌ'],['حَارٌّ','بَارِدٌ'],['قَرِيبٌ','بَعِيدٌ'],
  ['سَهْلٌ','صَعْبٌ'],['دَخَلَ','خَرَجَ'],['فَتَحَ','أَغْلَقَ'],['قَامَ','جَلَسَ'],['لَيْلٌ','نَهَارٌ'],['فَوْقَ','تَحْتَ']
];
// [ungkapan, arti, jawaban]
const MUHADATSAH = [
  ['السَّلَامُ عَلَيْكُمْ','Semoga keselamatan atas kalian','وَعَلَيْكُمُ السَّلَامُ'],
  ['مَا اسْمُكَ؟','Siapa namamu?','اسْمِي أَحْمَدُ'],
  ['كَيْفَ حَالُكَ؟','Bagaimana kabarmu?','بِخَيْرٍ، وَالْحَمْدُ لِلَّهِ'],
  ['مِنْ أَيْنَ أَنْتَ؟','Dari mana asalmu?','أَنَا مِنْ إِنْدُونِيسِيَا'],
  ['كَمْ عُمُرُكَ؟','Berapa umurmu?','عُمُرِي عَشْرُ سَنَوَاتٍ'],
  ['أَيْنَ تَسْكُنُ؟','Di mana kamu tinggal?','أَسْكُنُ فِي مَارِيلَان'],
  ['جَزَاكَ اللَّهُ خَيْرًا','Semoga Allah membalasmu dengan kebaikan','وَإِيَّاكَ'],
  ['هَلْ فَهِمْتَ؟','Apakah kamu sudah paham?','نَعَمْ، فَهِمْتُ'],
  ['أَيْنَ الْحَمَّامُ؟','Di mana kamar mandi?','هُنَاكَ، بِجَانِبِ الْمَسْجِدِ'],
  ['هَيَّا بِنَا إِلَى الْمَسْجِدِ','Ayo kita ke masjid',null],
  ['شُكْرًا جَزِيلًا','Terima kasih banyak','عَفْوًا'],
  ['أَنَا مَرِيضٌ','Saya sakit',null],
  ['اسْمَحْ لِي','Izinkan saya (permisi)',null],
  ['افْتَحِ الْكِتَابَ','Bukalah bukumu',null],
  ['إِلَى اللِّقَاءِ','Sampai jumpa',null]
];

/* ---------- NAHWU & SHARAF ---------- */
const HURUF_HARAKAT = [['ب','b'],['ت','t'],['ج','j'],['د','d'],['ر','r'],['س','s'],['ك','k'],['م','m'],['ن','n'],['ل','l'],['ف','f']];
const HARAKAT = [
  { mark:'َ', name:'Fathah', bunyi:'a' },
  { mark:'ِ', name:'Kasrah', bunyi:'i' },
  { mark:'ُ', name:'Dhammah', bunyi:'u' },
  { mark:'ْ', name:'Sukun', bunyi:'' }
];
const KALIMAH = {
  isim: ['مَسْجِدٌ','قَلَمٌ','أَحْمَدُ','كِتَابٌ','بَيْتٌ','الْوَلَدُ','مَدْرَسَةٌ','شَمْسٌ','الطَّالِبُ','بَابٌ'],
  fiil: ['كَتَبَ','يَقْرَأُ','اكْتُبْ','ذَهَبَ','جَلَسَ','يَشْرَبُ','نَامَ','اجْلِسْ','قَرَأَ','يَذْهَبُ'],
  huruf: ['فِي','مِنْ','هَلْ','إِلَى','عَلَى','لَمْ','ثُمَّ','عَنْ']
};
const KALIMAH_TF = [
  ['Kata yang diawali alif lam (ال) adalah isim.', true],
  ['Kata yang ujungnya bertanwin (ـٌ ـٍ ـً) adalah isim.', true],
  ['Fi\'il adalah kata kerja yang disertai waktu.', true],
  ['Huruf adalah kata yang maknanya sempurna walaupun berdiri sendiri.', false],
  ['كَتَبَ termasuk isim.', false],
  ['فِي termasuk huruf jar.', true],
  ['أَحْمَدُ termasuk fi\'il.', false]
];
const GENDER = {
  m: ['مُدَرِّسٌ','طَالِبٌ','بَيْتٌ','قَلَمٌ','وَلَدٌ','رَجُلٌ','مَسْجِدٌ','كِتَابٌ'],
  f: ['مُدَرِّسَةٌ','طَالِبَةٌ','سَيَّارَةٌ','شَجَرَةٌ','بِنْتٌ','أُمٌّ','شَمْسٌ','حَمْرَاءُ','ذِكْرَى']
};
const BILANGAN = [
  ['مُسْلِمٌ','Mufrad (satu)'],['قَلَمٌ','Mufrad (satu)'],['بَيْتٌ','Mufrad (satu)'],
  ['مُسْلِمَانِ','Mutsanna (dua)'],['كِتَابَانِ','Mutsanna (dua)'],['طَالِبَانِ','Mutsanna (dua)'],['بِنْتَانِ','Mutsanna (dua)'],
  ['مُسْلِمُونَ','Jamak mudzakkar salim'],['مُدَرِّسُونَ','Jamak mudzakkar salim'],
  ['مُسْلِمَاتٌ','Jamak muannats salim'],['طَالِبَاتٌ','Jamak muannats salim'],
  ['كُتُبٌ','Jamak taksir'],['بُيُوتٌ','Jamak taksir'],['مَسَاجِدُ','Jamak taksir']
];
const WAKTU_FIIL = [
  ['كَتَبَ','Madhi (lampau)'],['ذَهَبَ','Madhi (lampau)'],['جَلَسَ','Madhi (lampau)'],['قَرَأَ','Madhi (lampau)'],['خَرَجَ','Madhi (lampau)'],
  ['يَكْتُبُ','Mudhari\' (sekarang/akan)'],['يَذْهَبُ','Mudhari\' (sekarang/akan)'],['يَجْلِسُ','Mudhari\' (sekarang/akan)'],['تَخْرُجُ','Mudhari\' (sekarang/akan)'],['نَشْرَبُ','Mudhari\' (sekarang/akan)'],
  ['اكْتُبْ','Amar (perintah)'],['اذْهَبْ','Amar (perintah)'],['اجْلِسْ','Amar (perintah)'],['اقْرَأْ','Amar (perintah)'],['اخْرُجْ','Amar (perintah)']
];
const MAKRIFAH = [
  ['كِتَابٌ','Nakirah'],['بَيْتٌ','Nakirah'],['طَالِبٌ','Nakirah'],['قَلَمٌ','Nakirah'],
  ['الْكِتَابُ','Ma\'rifah'],['أَحْمَدُ','Ma\'rifah'],['هُوَ','Ma\'rifah'],['هَذَا','Ma\'rifah'],['قَلَمُ أَحْمَدَ','Ma\'rifah'],['الَّذِي','Ma\'rifah']
];
const MAJHUL = [
  ['كَتَبَ','Ma\'lum'],['فَتَحَ','Ma\'lum'],['يَكْتُبُ','Ma\'lum'],['نَصَرَ','Ma\'lum'],
  ['كُتِبَ','Majhul'],['فُتِحَ','Majhul'],['يُكْتَبُ','Majhul'],['نُصِرَ','Majhul'],['يُفْتَحُ','Majhul']
];
// [kalimat (kata target diapit [ ]), kedudukan, i'rab]
const IRAB = [
  ['ذَهَبَ [الطَّالِبُ] إِلَى الْمَسْجِدِ','Fa\'il','Marfu\''],
  ['ذَهَبَ الطَّالِبُ إِلَى [الْمَسْجِدِ]','Majrur dengan huruf jar','Majrur'],
  ['قَرَأَ [أَحْمَدُ] الْكِتَابَ','Fa\'il','Marfu\''],
  ['قَرَأَ أَحْمَدُ [الْكِتَابَ]','Maf\'ul bih','Manshub'],
  ['[الْبَيْتُ] كَبِيرٌ','Mubtada\'','Marfu\''],
  ['الْبَيْتُ [كَبِيرٌ]','Khabar','Marfu\''],
  ['شَرِبَ الْوَلَدُ [الْمَاءَ]','Maf\'ul bih','Manshub'],
  ['الْمُدَرِّسُ فِي [الْفَصْلِ]','Majrur dengan huruf jar','Majrur'],
  ['كُتِبَ [الدَّرْسُ]','Naibul fa\'il','Marfu\''],
  ['إِنَّ [اللَّهَ] غَفُورٌ رَحِيمٌ','Isim inna','Manshub'],
  ['كَانَ الْجَوُّ [حَارًّا]','Khabar kana','Manshub'],
  ['كَانَ [الْجَوُّ] حَارًّا','Isim kana','Marfu\''],
  ['هَذَا كِتَابُ [الطَّالِبِ]','Mudhaf ilaih','Majrur']
];
// [madhi, mudhari, amar, wazan]
const TASHRIF = [
  ['نَصَرَ','يَنْصُرُ','انْصُرْ','فَعَلَ – يَفْعُلُ'],['كَتَبَ','يَكْتُبُ','اكْتُبْ','فَعَلَ – يَفْعُلُ'],
  ['دَخَلَ','يَدْخُلُ','ادْخُلْ','فَعَلَ – يَفْعُلُ'],['خَرَجَ','يَخْرُجُ','اخْرُجْ','فَعَلَ – يَفْعُلُ'],
  ['ضَرَبَ','يَضْرِبُ','اضْرِبْ','فَعَلَ – يَفْعِلُ'],['جَلَسَ','يَجْلِسُ','اجْلِسْ','فَعَلَ – يَفْعِلُ'],
  ['فَتَحَ','يَفْتَحُ','افْتَحْ','فَعَلَ – يَفْعَلُ'],['ذَهَبَ','يَذْهَبُ','اذْهَبْ','فَعَلَ – يَفْعَلُ'],
  ['عَلِمَ','يَعْلَمُ','اعْلَمْ','فَعِلَ – يَفْعَلُ'],['سَمِعَ','يَسْمَعُ','اسْمَعْ','فَعِلَ – يَفْعَلُ'],
  ['حَسُنَ','يَحْسُنُ','–','فَعُلَ – يَفْعُلُ'],['حَسِبَ','يَحْسِبُ','احْسِبْ','فَعِلَ – يَفْعِلُ']
];

const NAHWU_LEARN = {
  1: [
    { t:'Mengenal Harakat', ar:'الْحَرَكَاتُ', b:'Harakat adalah tanda baca kecil di atas atau di bawah huruf. Dengan harakat, kita tahu cara membaca hurufnya.',
      ex:[['بَ','Fathah, garis di atas, dibaca “ba”'],['بِ','Kasrah, garis di bawah, dibaca “bi”'],['بُ','Dhammah, seperti wawu kecil, dibaca “bu”'],['بْ','Sukun, bulatan kecil, hurufnya mati: “b”']] }
  ],
  2: [
    { t:'Kalimah ada tiga', ar:'أَقْسَامُ الْكَلِمَةِ', b:'Setiap kata dalam bahasa Arab pasti masuk salah satu dari tiga: isim, fi\'il, atau huruf.',
      ex:[['مَسْجِدٌ • قَلَمٌ','Isim: kata benda, tanpa waktu'],['كَتَبَ • يَقْرَأُ','Fi\'il: kata kerja, ada waktunya'],['فِي • مِنْ • هَلْ','Huruf: maknanya baru jelas bersama kata lain']] },
    { t:'Tanda-tanda isim', ar:'عَلَامَاتُ الِاسْمِ', b:'Kalau sebuah kata punya salah satu tanda ini, berarti ia isim.',
      ex:[['الْكِتَابُ','Diawali alif lam (ال)'],['كِتَابٌ','Bertanwin di ujungnya'],['فِي الْبَيْتِ','Dimasuki huruf jar dan dibaca kasrah']] }
  ],
  3: [
    { t:'Mudzakkar & Muannats', ar:'الْمُذَكَّرُ وَالْمُؤَنَّثُ', b:'Mudzakkar artinya laki-laki, muannats artinya perempuan. Tanda muannats yang paling sering adalah ta marbuthah (ة).',
      ex:[['مُدَرِّسٌ ← مُدَرِّسَةٌ','guru (lk) → guru (pr)'],['حَمْرَاءُ • ذِكْرَى','Muannats dengan alif mamdudah dan alif maqshurah'],['شَمْسٌ • أُمٌّ','Muannats walaupun tanpa tanda']] },
    { t:'Mufrad, Mutsanna, Jamak', ar:'الْمُفْرَدُ وَالْمُثَنَّى وَالْجَمْعُ', b:'Isim dilihat dari jumlahnya: satu, dua, atau lebih dari dua.',
      ex:[['مُسْلِمٌ','Mufrad: satu'],['مُسْلِمَانِ','Mutsanna: dua, tambah ـَانِ / ـَيْنِ'],['مُسْلِمُونَ • مُسْلِمَاتٌ','Jamak salim: tambah ـُونَ atau ـَاتٌ'],['كُتُبٌ','Jamak taksir: bentuk katanya berubah']] }
  ],
  4: [
    { t:'Fi\'il dari waktunya', ar:'الْمَاضِي وَالْمُضَارِعُ وَالْأَمْرُ', b:'Fi\'il madhi untuk yang sudah terjadi, mudhari\' untuk yang sedang atau akan terjadi, amar untuk perintah.',
      ex:[['كَتَبَ','telah menulis'],['يَكْتُبُ','sedang/akan menulis'],['اكْتُبْ','tulislah!']] },
    { t:'Nakirah & Ma\'rifah', ar:'النَّكِرَةُ وَالْمَعْرِفَةُ', b:'Nakirah itu isim yang umum, belum tertentu. Ma\'rifah itu isim yang sudah tertentu.',
      ex:[['كِتَابٌ','sebuah buku (nakirah)'],['الْكِتَابُ','buku itu (ma\'rifah dengan ال)'],['أَحْمَدُ • هُوَ • هَذَا','nama orang, dhamir, isim isyarah: ma\'rifah']] },
    { t:'Ma\'lum & Majhul', ar:'الْمَعْلُومُ وَالْمَجْهُولُ', b:'Fi\'il ma\'lum pelakunya disebut. Fi\'il majhul pelakunya tidak disebut, artinya menjadi “di-”.',
      ex:[['كَتَبَ','telah menulis'],['كُتِبَ','telah ditulis'],['يُفْتَحُ','sedang dibuka']] }
  ],
  5: [
    { t:'I\'rab dan tandanya', ar:'الْإِعْرَابُ', b:'I\'rab adalah berubahnya ujung kata karena kedudukannya dalam kalimat. Tanda asalnya: rafa\' dengan dhammah, nashab dengan fathah, jar dengan kasrah.',
      ex:[['جَاءَ زَيْدٌ','Marfu\': dhammah'],['رَأَيْتُ زَيْدًا','Manshub: fathah'],['مَرَرْتُ بِزَيْدٍ','Majrur: kasrah']] },
    { t:'Kedudukan kata', ar:'الْمَرْفُوعَاتُ وَالْمَنْصُوبَاتُ وَالْمَجْرُورَاتُ', b:'Marfu\': fa\'il, naibul fa\'il, mubtada\', khabar, isim kana, khabar inna. Manshub: maf\'ul bih, khabar kana, isim inna. Majrur: setelah huruf jar dan mudhaf ilaih.',
      ex:[['قَرَأَ أَحْمَدُ الْكِتَابَ','أَحْمَدُ fa\'il, الْكِتَابَ maf\'ul bih'],['الْبَيْتُ كَبِيرٌ','mubtada\' dan khabar'],['كِتَابُ الطَّالِبِ','الطَّالِبِ mudhaf ilaih']] },
    { t:'Tashrif 6 wazan', ar:'التَّصْرِيفُ', b:'Fi\'il tsulatsi berubah mengikuti enam wazan (bab). Hafalkan pasangan madhi dan mudhari\'-nya.',
      ex:[['نَصَرَ – يَنْصُرُ','fa\'ala – yaf\'ulu'],['ضَرَبَ – يَضْرِبُ','fa\'ala – yaf\'ilu'],['فَتَحَ – يَفْتَحُ','fa\'ala – yaf\'alu'],['عَلِمَ – يَعْلَمُ','fa\'ila – yaf\'alu'],['حَسُنَ – يَحْسُنُ','fa\'ula – yaf\'ulu'],['حَسِبَ – يَحْسِبُ','fa\'ila – yaf\'ilu']] }
  ]
};

/* ---------- DOA & DZIKIR ---------- */
// lvl = mulai muncul di level berapa; kali = jumlah bacaan
const DOA = [
  { id:'makan', judul:'Sebelum makan', e:'🍽️', lvl:1, ar:'بِسْمِ اللَّهِ', arti:'Dengan nama Allah.' },
  { id:'tidur', judul:'Sebelum tidur', e:'🛏️', lvl:1, ar:'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', arti:'Dengan nama-Mu ya Allah, aku mati dan aku hidup.' },
  { id:'ilmu', judul:'Memohon tambahan ilmu', e:'📚', lvl:1, ar:'رَبِّ زِدْنِي عِلْمًا', arti:'Wahai Rabbku, tambahkanlah ilmu kepadaku.' },
  { id:'keluarwc', judul:'Keluar kamar mandi', e:'🚿', lvl:1, ar:'غُفْرَانَكَ', arti:'Aku memohon ampunan-Mu.' },
  { id:'bersin', judul:'Ketika bersin', e:'🌬️', lvl:1, ar:'الْحَمْدُ لِلَّهِ', arti:'Segala puji bagi Allah.' },
  { id:'bangun', judul:'Bangun tidur', e:'🌅', lvl:2, ar:'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', arti:'Segala puji bagi Allah yang menghidupkan kami setelah mematikan kami, dan kepada-Nya kami dibangkitkan.' },
  { id:'masukwc', judul:'Masuk kamar mandi', e:'🚪', lvl:2, ar:'بِسْمِ اللَّهِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ', arti:'Dengan nama Allah. Ya Allah, aku berlindung kepada-Mu dari setan laki-laki dan setan perempuan.' },
  { id:'masukmasjid', judul:'Masuk masjid', e:'🕌', lvl:2, ar:'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', arti:'Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.' },
  { id:'keluarmasjid', judul:'Keluar masjid', e:'🏡', lvl:2, ar:'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ', arti:'Ya Allah, aku memohon karunia-Mu.' },
  { id:'ortu', judul:'Untuk kedua orang tua', e:'🤲', lvl:2, ar:'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا', arti:'Wahai Rabbku, sayangilah keduanya sebagaimana mereka mendidikku waktu kecil.' },
  { id:'marah', judul:'Ketika marah', e:'🔥', lvl:2, ar:'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ', arti:'Aku berlindung kepada Allah dari setan yang terkutuk.' },
  { id:'hujan', judul:'Ketika turun hujan', e:'🌧️', lvl:2, ar:'اللَّهُمَّ صَيِّبًا نَافِعًا', arti:'Ya Allah, jadikanlah hujan ini hujan yang bermanfaat.' },
  { id:'lupa', judul:'Lupa membaca bismillah saat makan', e:'🍲', lvl:3, ar:'بِسْمِ اللَّهِ أَوَّلَهُ وَآخِرَهُ', arti:'Dengan nama Allah, di awal dan di akhirnya.' },
  { id:'selesaimakan', judul:'Selesai makan', e:'😋', lvl:3, ar:'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ', arti:'Segala puji bagi Allah yang telah memberiku makanan ini dan merezekikannya kepadaku tanpa daya dan kekuatan dariku.' },
  { id:'keluarrumah', judul:'Keluar rumah', e:'👟', lvl:3, ar:'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', arti:'Dengan nama Allah, aku bertawakal kepada Allah. Tiada daya dan kekuatan kecuali dengan pertolongan Allah.' },
  { id:'dunia', judul:'Kebaikan dunia dan akhirat', e:'🌍', lvl:3, ar:'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', arti:'Wahai Rabb kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari azab neraka.' },
  { id:'musibah', judul:'Ketika tertimpa musibah', e:'💔', lvl:3, ar:'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ', arti:'Sesungguhnya kami milik Allah dan kepada-Nya kami kembali.' },
  { id:'jenguk', judul:'Menjenguk orang sakit', e:'🏥', lvl:3, ar:'لَا بَأْسَ طَهُورٌ إِنْ شَاءَ اللَّهُ', arti:'Tidak mengapa, semoga menjadi pembersih dosa, insya Allah.' },
  { id:'jawabbersin', judul:'Mendoakan orang yang bersin', e:'💬', lvl:3, ar:'يَرْحَمُكَ اللَّهُ', arti:'Semoga Allah merahmatimu.' },
  { id:'pakaian', judul:'Memakai pakaian', e:'👕', lvl:4, ar:'الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ', arti:'Segala puji bagi Allah yang memberiku pakaian ini dan merezekikannya kepadaku tanpa daya dan kekuatan dariku.' },
  { id:'kendaraan', judul:'Naik kendaraan', e:'🚗', lvl:4, ar:'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ', arti:'Mahasuci Allah yang telah menundukkan kendaraan ini untuk kami, padahal kami sebelumnya tidak mampu menguasainya. Sungguh kami akan kembali kepada Rabb kami.' },
  { id:'wudhu', judul:'Setelah wudhu', e:'💧', lvl:4, ar:'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ', arti:'Aku bersaksi tiada sesembahan yang berhak disembah selain Allah semata, tiada sekutu bagi-Nya, dan aku bersaksi bahwa Muhammad adalah hamba dan utusan-Nya.' },
  { id:'majelis', judul:'Penutup majelis', e:'📖', lvl:5, ar:'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ', arti:'Mahasuci Engkau ya Allah dan dengan memuji-Mu. Aku bersaksi tiada sesembahan yang berhak disembah selain Engkau. Aku memohon ampun dan bertaubat kepada-Mu.' },
  { id:'buka', judul:'Berbuka puasa', e:'🌙', lvl:5, ar:'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ', arti:'Telah hilang dahaga, urat-urat telah basah, dan pahala telah tetap, insya Allah.' }
];
const DZIKIR_SHALAT = [
  { id:'istighfar', ar:'أَسْتَغْفِرُ اللَّهَ', kali:3, arti:'Aku memohon ampun kepada Allah.' },
  { id:'salam', ar:'اللَّهُمَّ أَنْتَ السَّلَامُ، وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ', kali:1, arti:'Ya Allah, Engkaulah As-Salam, dari-Mu keselamatan. Mahaberkah Engkau, wahai Pemilik keagungan dan kemuliaan.' },
  { id:'tahlil', ar:'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', kali:1, arti:'Tiada sesembahan yang berhak disembah selain Allah semata, tiada sekutu bagi-Nya. Milik-Nya kerajaan dan pujian, dan Dia Mahakuasa atas segala sesuatu.' },
  { id:'mani', ar:'اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ', kali:1, arti:'Ya Allah, tidak ada yang dapat menghalangi apa yang Engkau beri, tidak ada yang dapat memberi apa yang Engkau halangi, dan kekayaan tidak bermanfaat bagi pemiliknya di hadapan-Mu.' },
  { id:'tasbih', ar:'سُبْحَانَ اللَّهِ', kali:33, arti:'Mahasuci Allah.' },
  { id:'tahmid', ar:'الْحَمْدُ لِلَّهِ', kali:33, arti:'Segala puji bagi Allah.' },
  { id:'takbir', ar:'اللَّهُ أَكْبَرُ', kali:33, arti:'Allah Mahabesar.' },
  { id:'aini', ar:'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ، وَشُكْرِكَ، وَحُسْنِ عِبَادَتِكَ', kali:1, arti:'Ya Allah, tolonglah aku untuk berdzikir, bersyukur, dan beribadah dengan baik kepada-Mu.' },
  { id:'kursi', ar:'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', kali:1, arti:'Ayat Kursi (Al-Baqarah: 255), dibaca sampai selesai.', noFill:true },
  { id:'muawwidzat', ar:'قُلْ هُوَ اللَّهُ أَحَدٌ', kali:1, arti:'Al-Ikhlas, Al-Falaq, An-Nas (3× setelah Subuh dan Maghrib).', noFill:true }
];
const DZIKIR_PP = [
  { id:'ashbahna', waktu:'pagi', ar:'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ', kali:1, arti:'Kami memasuki waktu pagi dan kerajaan milik Allah, segala puji bagi Allah. (awal bacaan)' },
  { id:'amsaina', waktu:'petang', ar:'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ', kali:1, arti:'Kami memasuki waktu petang dan kerajaan milik Allah, segala puji bagi Allah. (awal bacaan)' },
  { id:'bika_p', waktu:'pagi', ar:'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ', kali:1, arti:'Ya Allah, dengan-Mu kami memasuki pagi dan petang, dengan-Mu kami hidup dan mati, dan kepada-Mu kebangkitan.' },
  { id:'bika_s', waktu:'petang', ar:'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ', kali:1, arti:'Ya Allah, dengan-Mu kami memasuki petang dan pagi, dengan-Mu kami hidup dan mati, dan kepada-Mu tempat kembali.' },
  { id:'layadhurru', waktu:'pagi & petang', ar:'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ', kali:3, arti:'Dengan nama Allah yang bersama nama-Nya tidak ada sesuatu pun di bumi dan di langit yang dapat membahayakan. Dia Maha Mendengar lagi Maha Mengetahui.' },
  { id:'radhitu', waktu:'pagi & petang', ar:'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا', kali:3, arti:'Aku ridha Allah sebagai Rabb, Islam sebagai agama, dan Muhammad ﷺ sebagai nabi.' },
  { id:'hasbiya', waktu:'pagi & petang', ar:'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ', kali:7, arti:'Cukuplah Allah bagiku, tiada sesembahan yang berhak disembah selain Dia. Kepada-Nya aku bertawakal, dan Dia Rabb pemilik Arsy yang agung.' },
  { id:'subhanallah', waktu:'pagi & petang', ar:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', kali:100, arti:'Mahasuci Allah dan dengan memuji-Nya.' },
  { id:'kalimat', waktu:'petang', ar:'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', kali:3, arti:'Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari kejahatan makhluk yang Dia ciptakan.' },
  { id:'yahayyu', waktu:'pagi & petang', ar:'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ', kali:1, arti:'Wahai Yang Mahahidup, wahai Yang terus-menerus mengurus makhluk-Nya, dengan rahmat-Mu aku memohon pertolongan. Perbaikilah seluruh urusanku dan jangan serahkan aku kepada diriku sendiri walau sekejap mata.' },
  { id:'sayyid', waktu:'pagi & petang', ar:'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ', kali:1, arti:'Sayyidul istighfar: penghulu permohonan ampun.' },
  { id:'tahlil10', waktu:'pagi & petang', ar:'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', kali:10, arti:'Tiada sesembahan yang berhak disembah selain Allah semata, tiada sekutu bagi-Nya. Milik-Nya kerajaan dan pujian, dan Dia Mahakuasa atas segala sesuatu.' }
];

/* ---------- HAFALAN CONTOH (bisa diganti orang tua) ---------- */
const HAFALAN_DEFAULT = [
  { id:'h2', judul:'Hadits niat', ar:true, teks:'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ', arti:'Sesungguhnya amal-amal itu tergantung niatnya. (HR. Al-Bukhari dan Muslim)', contoh:true },
  { id:'h3', judul:'Rukun Islam', ar:false, teks:'Syahadat, shalat, zakat, puasa Ramadhan, haji ke Baitullah', arti:'Lima rukun Islam berurutan.', contoh:true },
  { id:'h4', judul:'Rukun Iman', ar:false, teks:'Iman kepada Allah, malaikat, kitab-kitab, rasul-rasul, hari akhir, dan takdir', arti:'Enam rukun iman berurutan.', contoh:true }
];
