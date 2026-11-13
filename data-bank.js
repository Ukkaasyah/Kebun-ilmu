/* ====== BANK TAMBAHAN: Membaca, Mufradat, Muhadatsah, Warna, Doa ====== */

/* ---------- MEMBACA: kata bergambar (benda, tanpa makhluk bernyawa) ---------- */
const WORDS2 = [
  // buah & sayur
  ['PIR','🍐','buah'],['LEMON','🍋','buah'],['CERI','🍒','buah'],['PERSIK','🍑','buah'],['MANGGA','🥭','buah'],['KELAPA','🥥','buah'],
  ['KIWI','🥝','buah'],['MELON','🍈','buah'],['TERONG','🍆','sayur'],['ALPUKAT','🥑','buah'],['BROKOLI','🥦','sayur'],['TIMUN','🥒','sayur'],
  ['CABAI','🌶️','sayur'],['BAWANG','🧅','sayur'],['KENTANG','🥔','sayur'],['JAMUR','🍄','sayur'],['KACANG','🥜','sayur'],['PAPRIKA','🫑','sayur'],
  // makanan & minuman
  ['KEJU','🧀','makanan'],['MIE','🍜','makanan'],['SUP','🍲','makanan'],['SATE','🍢','makanan'],['KUE','🍰','makanan'],['DONAT','🍩','makanan'],
  ['PERMEN','🍬','makanan'],['COKELAT','🍫','makanan'],['TEH','🍵','minuman'],['KOPI','☕','minuman'],['GARAM','🧂','makanan'],['MENTEGA','🧈','makanan'],
  ['PANEKUK','🥞','makanan'],['ES','🧊','minuman'],['BISKUIT','🍪','makanan'],['NASI','🍚','makanan'],
  // rumah
  ['SOFA','🛋️','rumah'],['JENDELA','🪟','rumah'],['GEMBOK','🔒','rumah'],['EMBER','🪣','rumah'],['SABUN','🧼','rumah'],['SIKAT','🪥','rumah'],
  ['CERMIN','🪞','rumah'],['GARPU','🍴','rumah'],['MANGKUK','🥣','rumah'],['WAJAN','🍳','rumah'],['TEKO','🫖','rumah'],['BOTOL','🧴','rumah'],
  ['DOMPET','👛','rumah'],['TELEPON','📞','rumah'],['PONSEL','📱','rumah'],['LAPTOP','💻','rumah'],['KAMERA','📷','rumah'],['BATERAI','🔋','rumah'],
  ['MAGNET','🧲','rumah'],['TIMBANGAN','⚖️','rumah'],['GERGAJI','🪚','alat'],['OBENG','🪛','alat'],['KAPAK','🪓','alat'],['TANGGA','🪜','alat'],
  ['BAUT','🔩','alat'],['RANTAI','⛓️','alat'],['TALI','🪢','alat'],['JARUM','🪡','alat'],['BENANG','🧵','alat'],['PENITI','🧷','alat'],
  // sekolah
  ['KRAYON','🖍️','sekolah'],['PENGGARIS','📏','sekolah'],['KERTAS','📄','sekolah'],['AMPLOP','✉️','sekolah'],['MAP','📁','sekolah'],['KALENDER','📅','sekolah'],
  ['TAS','🎒','sekolah'],['BUKU','📚','sekolah'],
  // pakaian
  ['KEMEJA','👔','pakaian'],['CELANA','👖','pakaian'],['JAKET','🧥','pakaian'],['SANDAL','🩴','pakaian'],['SYAL','🧣','pakaian'],['CINCIN','💍','pakaian'],
  ['KAOS','🧦','pakaian'],
  // kendaraan
  ['BUS','🚌','kendaraan'],['TRUK','🚚','kendaraan'],['TAKSI','🚕','kendaraan'],['AMBULANS','🚑','kendaraan'],['MOTOR','🛵','kendaraan'],
  ['HELIKOPTER','🚁','kendaraan'],['PERAHU','⛵','kendaraan'],['TRAKTOR','🚜','kendaraan'],['SKUTER','🛴','kendaraan'],
  // alam
  ['PETIR','⚡','alam'],['SALJU','❄️','alam'],['API','🔥','alam'],['AIR','💧','alam'],['OMBAK','🌊','alam'],['GUNUNG','⛰️','alam'],
  ['DAUN','🍃','alam'],['MAWAR','🌹','alam'],['KAKTUS','🌵','alam'],['PULAU','🏝️','alam'],['BUMI','🌍','alam'],['GURUN','🏜️','alam'],
  ['PADI','🌾','alam'],['TUNAS','🌱','alam'],['GUNUNG API','🌋','alam'],
  // bangunan & lain-lain
  ['SEKOLAH','🏫','tempat'],['KANTOR','🏢','tempat'],['TENDA','⛺','tempat'],['PABRIK','🏭','tempat'],['LAYANGAN','🪁','mainan'],['YOYO','🪀','mainan'],
  ['BENDERA','🚩','benda'],['PETA','🗺️','benda'],['KOIN','🪙','benda'],['UANG','💵','benda'],['MAHKOTA','👑','benda'],['BERLIAN','💎','benda'],
  ['PIALA','🏆','benda'],['MEDALI','🏅','benda'],['RAKET','🏸','mainan'],['TERMOMETER','🌡️','benda'],['JAM PASIR','⏳','benda']
].filter(w => !w[0].includes(' '));

/* ---------- MEMBACA: teka-teki kata (tanpa gambar) ---------- */
// [kata, petunjuk]
const TEBAKAN = [
  ['AYAM','Hewan yang berkokok di pagi hari'],['SAPI','Hewan yang susunya sering kita minum'],['UNTA','Hewan gurun yang punya punuk'],
  ['GAJAH','Hewan besar yang belalainya panjang'],['SEMUT','Hewan kecil yang suka gula dan hidup bergotong royong'],['LEBAH','Hewan yang menghasilkan madu'],
  ['IKAN','Hewan yang hidup dan bernapas di dalam air'],['KUCING','Hewan yang mengeong'],['KUDA','Hewan yang bisa ditunggangi dan berlari kencang'],
  ['KAMBING','Hewan yang mengembik, sering disembelih saat Idul Adha'],['BURUNG','Hewan bersayap yang bisa terbang'],['KELINCI','Hewan bertelinga panjang yang suka wortel'],
  ['KATAK','Hewan yang melompat dan bersuara di saat hujan'],['BEBEK','Hewan yang berenang dan bersuara kwek-kwek'],['KERBAU','Hewan yang membantu membajak sawah'],
  ['SINGA','Hewan yang dijuluki raja hutan'],['RUSA','Hewan bertanduk bercabang yang larinya cepat'],['PENYU','Hewan laut bertempurung yang bertelur di pantai'],
  ['GURU','Orang yang mengajar kita di kelas'],['DOKTER','Orang yang mengobati orang sakit'],['PETANI','Orang yang menanam padi di sawah'],
  ['PILOT','Orang yang mengemudikan pesawat'],['NELAYAN','Orang yang menangkap ikan di laut'],['POLISI','Orang yang menjaga keamanan dan mengatur lalu lintas'],
  ['KOKI','Orang yang pekerjaannya memasak'],['PENJAHIT','Orang yang membuat baju'],['IMAM','Orang yang memimpin shalat berjamaah'],
  ['MUADZIN','Orang yang mengumandangkan adzan'],['AYAH','Bapak di rumah'],['IBU','Orang yang melahirkan kita'],['KAKAK','Saudara yang lebih tua'],
  ['ADIK','Saudara yang lebih muda'],['NENEK','Ibu dari ayah atau ibu kita'],['KAKEK','Ayah dari ayah atau ibu kita'],['PAMAN','Saudara laki-laki ayah atau ibu'],
  ['MATA','Bagian tubuh untuk melihat'],['TELINGA','Bagian tubuh untuk mendengar'],['HIDUNG','Bagian tubuh untuk mencium bau'],
  ['MULUT','Bagian tubuh untuk makan dan berbicara'],['GIGI','Bagian keras di mulut untuk mengunyah'],['TANGAN','Bagian tubuh untuk memegang'],
  ['KAKI','Bagian tubuh untuk berjalan'],['RAMBUT','Tumbuh di kepala dan bisa disisir'],['JARI','Ada lima di setiap tangan'],['LIDAH','Untuk merasakan manis dan asin'],
  ['KIBLAT','Arah kita menghadap ketika shalat'],['ZAKAT','Harta yang wajib dikeluarkan untuk fakir miskin'],['PUASA','Menahan makan dan minum dari subuh sampai maghrib'],
  ['HAJI','Rukun Islam kelima, pergi ke Makkah'],['SEDEKAH','Memberi sebagian harta kepada orang lain'],['SUJUD','Meletakkan dahi di lantai ketika shalat'],
  ['DOA','Permintaan kita kepada Allah'],['MIMBAR','Tempat khatib berdiri saat khutbah'],['SAJADAH','Alas untuk shalat'],['PECI','Penutup kepala laki-laki untuk shalat'],
  ['SARUNG','Kain yang dipakai untuk shalat'],['MUKENA','Pakaian shalat untuk perempuan'],['KURMA','Buah manis untuk berbuka puasa'],
  ['SENIN','Hari setelah Ahad'],['JUMAT','Hari untuk shalat Jumat'],['SABTU','Hari setelah Jumat'],['KAMIS','Hari sebelum Jumat'],
  ['SELASA','Hari setelah Senin'],['RABU','Hari di tengah-tengah pekan'],
  ['KECIL','Lawan kata BESAR'],['DINGIN','Lawan kata PANAS'],['RENDAH','Lawan kata TINGGI'],['MALAM','Lawan kata SIANG'],['KELUAR','Lawan kata MASUK'],
  ['MALAS','Lawan kata RAJIN'],['DEKAT','Lawan kata JAUH'],['LAMA','Lawan kata BARU'],['MISKIN','Lawan kata KAYA'],['SEDIH','Lawan kata SENANG'],
  ['PENDEK','Lawan kata PANJANG'],['KOTOR','Lawan kata BERSIH'],['LAMBAT','Lawan kata CEPAT'],['RINGAN','Lawan kata BERAT'],['GELAP','Lawan kata TERANG'],
  ['PASAR','Tempat orang berjual beli'],['SAWAH','Tempat menanam padi'],['PANTAI','Tempat pasir bertemu laut'],['DAPUR','Ruangan untuk memasak'],
  ['KAMAR','Ruangan untuk tidur'],['TAMAN','Tempat bermain yang banyak bunga dan pohon'],['KELAS','Ruangan tempat kita belajar'],['HUTAN','Tempat yang penuh pohon besar'],
  ['TIGA','Dua tambah satu'],['LIMA','Jumlah jari di satu tangan'],['SEPULUH','Lima tambah lima'],['DUA','Jumlah mata kita'],['TUJUH','Jumlah hari dalam sepekan'],
  ['MERAH','Warna buah stroberi'],['KUNING','Warna pisang matang'],['BIRU','Warna langit cerah'],['PUTIH','Warna awan dan susu']
];

/* ---------- MEMBACA: suku kata ---------- */
const KONSONAN = 'B C D F G H J K L M N P R S T W Y'.split(' ');
const VOKAL = ['A','I','U','E','O'];

/* ---------- MEMBACA: kalimat rumpang tambahan ---------- */
const KALIMAT2 = [
  ['Setelah makan, kita membaca ___.','DOA',['BUKU','LAMPU','TOPI']],
  ['Ahmad memakai ___ di kepalanya.','PECI',['SANDAL','SENDOK','EMBER']],
  ['Kita berwudhu memakai ___.','AIR',['API','PASIR','MINYAK']],
  ['Ibu memasak nasi di ___.','DAPUR',['KAMAR','TAMAN','GARASI']],
  ['Pak tani menanam padi di ___.','SAWAH',['KELAS','PASAR','MASJID']],
  ['Kakak menyapu lantai dengan ___.','SAPU',['GELAS','PENA','BOLA']],
  ['Matahari terbit di waktu ___.','PAGI',['MALAM','TENGAH','LAMA']],
  ['Kita menghadap ___ ketika shalat.','KIBLAT',['JENDELA','PINTU','LANGIT']],
  ['Di bulan Ramadhan kita berpuasa dan berbuka dengan ___.','KURMA',['GARAM','KERTAS','BATU']],
  ['Adik menulis huruf di buku dengan ___.','PENSIL',['GARPU','SABUN','KUNCI']],
  ['Sebelum tidur, kita menggosok ___.','GIGI',['MEJA','SEPATU','PINTU']],
  ['Pesawat terbang tinggi di ___.','LANGIT',['LAUT','SAWAH','DAPUR']],
  ['Ikan hidup di dalam ___.','AIR',['API','PASIR','KAYU']],
  ['Kita mendengar adzan dengan ___.','TELINGA',['HIDUNG','KAKI','RAMBUT']],
  ['Ayah membeli sayur di ___.','PASAR',['SUMUR','KAMAR','SAWAH']],
  ['Kalau gelap, kita menyalakan ___.','LAMPU',['KOMPOR','KIPAS','KERAN']],
  ['Hujan turun dari ___.','AWAN',['BATU','POHON','TANAH']],
  ['Kita mencuci tangan memakai air dan ___.','SABUN',['GARAM','GULA','PASIR']],
  ['Saat Idul Adha, orang menyembelih ___.','KAMBING',['AYAM','IKAN','BEBEK']],
  ['Kakak menelepon nenek memakai ___.','PONSEL',['PAYUNG','SENDOK','TOPI']],
  ['Lebah menghasilkan ___.','MADU',['SUSU','TEH','KOPI']],
  ['Kita minum susu dari ___.','GELAS',['PIRING','EMBER','TAS']],
  ['Buah yang kulitnya kuning dan panjang adalah ___.','PISANG',['APEL','JERUK','ANGGUR']],
  ['Sebelum masuk kelas, kita mengucapkan ___.','SALAM',['MAAF','TOLONG','PERMISI']],
  ['Jika berbuat salah, kita meminta ___.','MAAF',['UANG','HADIAH','MAKAN']],
  ['Hari Jumat, laki-laki pergi shalat ___.','JUMAT',['ID','DHUHA','TARAWIH']],
  ['Al-Qur\'an dibaca dengan ___ dan pelan-pelan.','TARTIL',['CEPAT','TERIAK','BERLARI']],
  ['Kita makan dan minum memakai tangan ___.','KANAN',['KIRI','KAKI','SIKU']]
];

/* ---------- MEMBACA: bacaan pendek (level 5) ---------- */
// {judul, teks, soal:[[pertanyaan, jawaban, [pengecoh]]]}
const BACAAN = [
  { judul:'Subuh bersama Ayah', teks:'Pagi itu Hasan bangun sebelum subuh. Ia berwudhu lalu berangkat ke masjid bersama ayahnya. Setelah shalat, Hasan duduk membaca Al-Qur\'an sampai matahari terbit.',
    soal:[['Hasan pergi ke masjid bersama siapa?','Ayahnya',['Ibunya','Kakaknya','Gurunya']],['Apa yang dilakukan Hasan setelah shalat?','Membaca Al-Qur\'an',['Tidur lagi','Bermain bola','Menonton']]] },
  { judul:'Kurma untuk Tetangga', teks:'Ibu membeli sekotak kurma dari pasar. Ibu meminta Aisyah mengantar sebagian kurma ke rumah Bu Aminah, tetangga mereka. Bu Aminah tersenyum dan mendoakan keluarga Aisyah.',
    soal:[['Apa yang dibeli ibu dari pasar?','Kurma',['Roti','Apel','Madu']],['Kurma itu diantar kepada siapa?','Tetangga',['Guru','Nenek','Teman sekolah']]] },
  { judul:'Pensil yang Hilang', teks:'Umar kehilangan pensilnya di kelas. Ali melihat Umar sedih, lalu meminjamkan pensilnya. Setelah pulang sekolah, Umar menemukan pensilnya di dalam tas.',
    soal:[['Siapa yang kehilangan pensil?','Umar',['Ali','Hasan','Zaid']],['Di mana pensil itu ditemukan?','Di dalam tas',['Di bawah meja','Di masjid','Di kantin']]] },
  { judul:'Hujan di Sore Hari', teks:'Sore itu langit gelap dan hujan turun dengan deras. Fatimah membaca doa ketika turun hujan. Setelah hujan reda, ia melihat pelangi di langit.',
    soal:[['Apa yang dibaca Fatimah saat hujan turun?','Doa',['Buku cerita','Koran','Surat']],['Apa yang terlihat setelah hujan reda?','Pelangi',['Bintang','Bulan','Petir']]] },
  { judul:'Berbuka Puasa', teks:'Hari ini Zaid berpuasa penuh untuk pertama kalinya. Ketika adzan maghrib terdengar, ia berbuka dengan kurma dan air putih. Ayah memuji Zaid karena ia sabar.',
    soal:[['Zaid berbuka dengan apa?','Kurma dan air putih',['Nasi dan sup','Roti dan susu','Es dan kue']],['Mengapa ayah memuji Zaid?','Karena ia sabar',['Karena ia pintar','Karena ia cepat','Karena ia kuat']]] },
  { judul:'Menolong Nenek', teks:'Di jalan, Khalid melihat seorang nenek membawa belanjaan yang berat. Khalid membantu membawakan belanjaan itu sampai ke rumah nenek. Nenek berterima kasih dan mendoakan Khalid.',
    soal:[['Apa yang dibawa nenek?','Belanjaan yang berat',['Payung','Buku','Sepeda']],['Apa yang dilakukan Khalid?','Membantu membawakan',['Pergi bermain','Pulang ke rumah','Tertawa']]] },
  { judul:'Kebun Kakek', teks:'Kakek punya kebun di belakang rumah. Di kebun itu ada pohon mangga, pohon pisang, dan banyak sayuran. Setiap sore, Salma menyiram tanaman bersama kakek.',
    soal:[['Di mana letak kebun kakek?','Di belakang rumah',['Di depan masjid','Di dekat sekolah','Di tepi laut']],['Kapan Salma menyiram tanaman?','Setiap sore',['Setiap pagi','Setiap malam','Setiap Jumat']]] },
  { judul:'Perpustakaan Pondok', teks:'Setiap hari Kamis, santri boleh meminjam buku di perpustakaan pondok. Yusuf meminjam buku kisah para nabi. Ia mengembalikan buku itu tepat waktu dan dalam keadaan rapi.',
    soal:[['Kapan santri boleh meminjam buku?','Hari Kamis',['Hari Senin','Hari Jumat','Hari Ahad']],['Buku apa yang dipinjam Yusuf?','Kisah para nabi',['Buku masak','Buku hewan','Kamus']]] },
  { judul:'Merapikan Kamar', teks:'Setelah bangun tidur, Maryam merapikan tempat tidurnya. Ia melipat selimut dan menyusun bantal. Ibu senang karena kamar Maryam selalu rapi.',
    soal:[['Kapan Maryam merapikan tempat tidur?','Setelah bangun tidur',['Sebelum makan','Setelah sekolah','Sebelum maghrib']],['Mengapa ibu senang?','Kamar Maryam rapi',['Maryam pintar','Maryam lapar','Maryam tidur']]] },
  { judul:'Lomba Hafalan', teks:'Pondok mengadakan lomba hafalan surat pendek. Abdullah membaca surat Al-Mulk dengan tartil. Walaupun belum juara, ia tetap bersyukur dan berjanji terus belajar.',
    soal:[['Lomba apa yang diadakan?','Hafalan surat',['Lari','Menggambar','Sepak bola']],['Bagaimana sikap Abdullah?','Tetap bersyukur',['Marah','Menangis lama','Berhenti belajar']]] }
];

/* ---------- MUFRADAT BERTEMA ---------- */
// [arab, arti, tema, level, emoji?, latin?]
const MUF = [
  // Level 1: benda bergambar + latin
  ...MUF_L1.map(w => [w[0], w[2], 'Benda', 1, w[3], w[1]]),
  ['كُرَةٌ','bola','Benda',1,'⚽','kurotun'],['قِطَارٌ','kereta','Benda',1,'🚆','qithoorun'],['سَفِينَةٌ','kapal','Benda',1,'🚢','safiinatun'],
  ['مِظَلَّةٌ','payung','Benda',1,'☂️','mizhollatun'],['حِذَاءٌ','sepatu','Benda',1,'👟','hidzaa-un'],['نَظَّارَةٌ','kacamata','Benda',1,'👓','nazhzhooratun'],
  ['مِصْبَاحٌ','lampu','Benda',1,'💡','mishbaahun'],['هَدِيَّةٌ','hadiah','Benda',1,'🎁','hadiyyatun'],['زَهْرَةٌ','bunga','Benda',1,'🌸','zahrotun'],
  ['عِنَبٌ','anggur','Benda',1,'🍇','\'inabun'],['بُرْتُقَالٌ','jeruk','Benda',1,'🍊','burtuqoolun'],['بِطِّيخٌ','semangka','Benda',1,'🍉','biththiikhun'],
  ['لَيْمُونٌ','lemon','Benda',1,'🍋','laimuunun'],['أَرُزٌّ','nasi','Benda',1,'🍚','aruzzun'],['عَسَلٌ','madu','Benda',1,'🍯','\'asalun'],
  ['كَعْكَةٌ','kue','Benda',1,'🍰','ka\'katun'],['شَايٌ','teh','Benda',1,'🍵','syaayun'],['جَزَرٌ','wortel','Benda',1,'🥕','jazarun'],
  ['مِقَصٌّ','gunting','Benda',1,'✂️','miqoshshun'],['سَحَابٌ','awan','Benda',1,'☁️','sahaabun'],['شَمْعَةٌ','lilin','Benda',1,'🕯️','syam\'atun'],
  ['هَاتِفٌ','telepon','Benda',1,'📱','haatifun'],['حَاسُوبٌ','komputer','Benda',1,'💻','haasuubun'],['صُنْدُوقٌ','kotak','Benda',1,'📦','shunduuqun'],
  ['رِسَالَةٌ','surat','Benda',1,'✉️','risaalatun'],['مِيزَانٌ','timbangan','Benda',1,'⚖️','miizaanun'],['خَيْمَةٌ','tenda','Benda',1,'⛺','khoimatun'],
  ['حَافِلَةٌ','bus','Benda',1,'🚌','haafilatun'],['صَارُوخٌ','roket','Benda',1,'🚀','shooruukhun'],['قَلْبٌ','hati','Benda',1,'❤️','qolbun'],
  // Level 2: tubuh
  ['رَأْسٌ','kepala','Tubuh',2],['وَجْهٌ','wajah','Tubuh',2],['عَيْنٌ','mata','Tubuh',2],['أُذُنٌ','telinga','Tubuh',2],['أَنْفٌ','hidung','Tubuh',2],
  ['فَمٌ','mulut','Tubuh',2],['سِنٌّ','gigi','Tubuh',2],['لِسَانٌ','lidah','Tubuh',2],['شَعْرٌ','rambut','Tubuh',2],['يَدٌ','tangan','Tubuh',2],
  ['إِصْبَعٌ','jari','Tubuh',2],['رِجْلٌ','kaki','Tubuh',2],['بَطْنٌ','perut','Tubuh',2],['ظَهْرٌ','punggung','Tubuh',2],['صَدْرٌ','dada','Tubuh',2],
  ['رَقَبَةٌ','leher','Tubuh',2],['رُكْبَةٌ','lutut','Tubuh',2],['شَفَةٌ','bibir','Tubuh',2],['جَبْهَةٌ','dahi','Tubuh',2],['كَتِفٌ','bahu','Tubuh',2],['ظُفْرٌ','kuku','Tubuh',2],
  // keluarga
  ['أَبٌ','ayah','Keluarga',2],['أُمٌّ','ibu','Keluarga',2],['أَخٌ','saudara laki-laki','Keluarga',2],['أُخْتٌ','saudara perempuan','Keluarga',2],
  ['جَدٌّ','kakek','Keluarga',2],['جَدَّةٌ','nenek','Keluarga',2],['عَمٌّ','paman (saudara ayah)','Keluarga',2],['عَمَّةٌ','bibi (saudari ayah)','Keluarga',2],
  ['خَالٌ','paman (saudara ibu)','Keluarga',2],['خَالَةٌ','bibi (saudari ibu)','Keluarga',2],['ابْنٌ','anak laki-laki','Keluarga',2],['بِنْتٌ','anak perempuan','Keluarga',2],
  ['زَوْجٌ','suami','Keluarga',2],['زَوْجَةٌ','istri','Keluarga',2],['أُسْرَةٌ','keluarga','Keluarga',2],['طِفْلٌ','anak kecil','Keluarga',2],
  ['صَدِيقٌ','teman','Keluarga',2],['جَارٌ','tetangga','Keluarga',2],
  // rumah
  ['غُرْفَةٌ','kamar','Rumah',2],['مَطْبَخٌ','dapur','Rumah',2],['حَمَّامٌ','kamar mandi','Rumah',2],['سَقْفٌ','atap','Rumah',2],['جِدَارٌ','dinding','Rumah',2],
  ['نَافِذَةٌ','jendela','Rumah',2],['وِسَادَةٌ','bantal','Rumah',2],['بَطَّانِيَّةٌ','selimut','Rumah',2],['خِزَانَةٌ','lemari','Rumah',2],['مِرْآةٌ','cermin','Rumah',2],
  ['مِكْنَسَةٌ','sapu','Rumah',2],['صَحْنٌ','piring','Rumah',2],['كُوبٌ','gelas','Rumah',2],['قِدْرٌ','panci','Rumah',2],['ثَلَّاجَةٌ','kulkas','Rumah',2],
  ['مِرْوَحَةٌ','kipas angin','Rumah',2],['سَجَّادَةٌ','sajadah, karpet','Rumah',2],['مِنْشَفَةٌ','handuk','Rumah',2],['صَابُونٌ','sabun','Rumah',2],['مُشْطٌ','sisir','Rumah',2],
  ['فُرْشَاةُ الْأَسْنَانِ','sikat gigi','Rumah',2],['دُرْجٌ','laci','Rumah',2],['سُلَّمٌ','tangga','Rumah',2],['حَدِيقَةٌ','kebun, taman','Rumah',2],
  // sekolah
  ['مَدْرَسَةٌ','sekolah','Sekolah',2],['فَصْلٌ','kelas','Sekolah',2],['مُدَرِّسٌ','guru','Sekolah',2],['طَالِبٌ','pelajar','Sekolah',2],['سَبُّورَةٌ','papan tulis','Sekolah',2],
  ['طَبَاشِيرُ','kapur tulis','Sekolah',2],['مَكْتَبٌ','meja tulis','Sekolah',2],['دَفْتَرٌ','buku tulis','Sekolah',2],['مِسْطَرَةٌ','penggaris','Sekolah',2],
  ['مِمْحَاةٌ','penghapus pensil','Sekolah',2],['مِمْسَحَةٌ','penghapus papan','Sekolah',2],['قَلَمُ رَصَاصٍ','pensil','Sekolah',2],['مِبْرَاةٌ','rautan','Sekolah',2],
  ['وَرَقَةٌ','kertas','Sekolah',2],['دَرْسٌ','pelajaran','Sekolah',2],['امْتِحَانٌ','ujian','Sekolah',2],['مَكْتَبَةٌ','perpustakaan','Sekolah',2],
  ['مُدِيرٌ','kepala sekolah','Sekolah',2],['سُؤَالٌ','pertanyaan','Sekolah',2],['جَوَابٌ','jawaban','Sekolah',2],['وَاجِبٌ','tugas, PR','Sekolah',2],
  // makanan
  ['طَعَامٌ','makanan','Makanan',2],['شَرَابٌ','minuman','Makanan',2],['لَحْمٌ','daging','Makanan',2],['دَجَاجٌ','daging ayam','Makanan',2],['سَمَكٌ','ikan','Makanan',2],
  ['جُبْنٌ','keju','Makanan',2],['زُبْدٌ','mentega','Makanan',2],['سُكَّرٌ','gula','Makanan',2],['مِلْحٌ','garam','Makanan',2],['عَصِيرٌ','jus','Makanan',2],
  ['فُطُورٌ','sarapan','Makanan',2],['غَدَاءٌ','makan siang','Makanan',2],['عَشَاءٌ','makan malam','Makanan',2],['حَلْوَى','manisan, permen','Makanan',2],
  ['زَيْتٌ','minyak','Makanan',2],['تَمْرٌ','kurma','Makanan',2],['قَهْوَةٌ','kopi','Makanan',2],
  // buah & sayur
  ['رُمَّانٌ','delima','Buah & Sayur',2],['تِينٌ','buah tin','Buah & Sayur',2],['زَيْتُونٌ','zaitun','Buah & Sayur',2],['فَاكِهَةٌ','buah-buahan','Buah & Sayur',2],
  ['خُضْرَوَاتٌ','sayur-sayuran','Buah & Sayur',2],['بَصَلٌ','bawang merah','Buah & Sayur',2],['ثُومٌ','bawang putih','Buah & Sayur',2],['طَمَاطِمُ','tomat','Buah & Sayur',2],
  ['بَطَاطِسُ','kentang','Buah & Sayur',2],['خِيَارٌ','mentimun','Buah & Sayur',2],
  // angka lanjutan
  ['أَحَدَ عَشَرَ','sebelas (11)','Angka',2],['اثْنَا عَشَرَ','dua belas (12)','Angka',2],['ثَلَاثَةَ عَشَرَ','tiga belas (13)','Angka',2],['أَرْبَعَةَ عَشَرَ','empat belas (14)','Angka',2],
  ['خَمْسَةَ عَشَرَ','lima belas (15)','Angka',2],['عِشْرُونَ','dua puluh (20)','Angka',2],['ثَلَاثُونَ','tiga puluh (30)','Angka',2],['أَرْبَعُونَ','empat puluh (40)','Angka',2],
  ['خَمْسُونَ','lima puluh (50)','Angka',2],['سِتُّونَ','enam puluh (60)','Angka',2],['سَبْعُونَ','tujuh puluh (70)','Angka',2],['ثَمَانُونَ','delapan puluh (80)','Angka',2],
  ['تِسْعُونَ','sembilan puluh (90)','Angka',2],['مِائَةٌ','seratus (100)','Angka',2],['أَلْفٌ','seribu (1000)','Angka',2],
  // Level 3: masjid & ibadah
  ['صَلَاةٌ','shalat','Masjid & Ibadah',3],['وُضُوءٌ','wudhu','Masjid & Ibadah',3],['أَذَانٌ','adzan','Masjid & Ibadah',3],['إِقَامَةٌ','iqamah','Masjid & Ibadah',3],
  ['إِمَامٌ','imam','Masjid & Ibadah',3],['مُؤَذِّنٌ','muadzin','Masjid & Ibadah',3],['صَفٌّ','shaf, barisan','Masjid & Ibadah',3],['قِبْلَةٌ','kiblat','Masjid & Ibadah',3],
  ['مِحْرَابٌ','mihrab','Masjid & Ibadah',3],['مِنْبَرٌ','mimbar','Masjid & Ibadah',3],['مُصْحَفٌ','mushaf','Masjid & Ibadah',3],['صِيَامٌ','puasa','Masjid & Ibadah',3],
  ['زَكَاةٌ','zakat','Masjid & Ibadah',3],['حَجٌّ','haji','Masjid & Ibadah',3],['دُعَاءٌ','doa','Masjid & Ibadah',3],['ذِكْرٌ','dzikir','Masjid & Ibadah',3],
  ['خُطْبَةٌ','khutbah','Masjid & Ibadah',3],['جَمَاعَةٌ','jamaah','Masjid & Ibadah',3],['رَكْعَةٌ','rakaat','Masjid & Ibadah',3],['سُجُودٌ','sujud','Masjid & Ibadah',3],
  ['رُكُوعٌ','rukuk','Masjid & Ibadah',3],['طَهَارَةٌ','bersuci','Masjid & Ibadah',3],['صَدَقَةٌ','sedekah','Masjid & Ibadah',3],
  // alam
  ['سَمَاءٌ','langit','Alam',3],['أَرْضٌ','bumi, tanah','Alam',3],['رِيحٌ','angin','Alam',3],['نَهْرٌ','sungai','Alam',3],['حَجَرٌ','batu','Alam',3],
  ['رَمْلٌ','pasir','Alam',3],['تُرَابٌ','debu, tanah','Alam',3],['هَوَاءٌ','udara','Alam',3],['نُورٌ','cahaya','Alam',3],['ظِلٌّ','bayangan','Alam',3],
  ['ثَلْجٌ','salju, es','Alam',3],['بُسْتَانٌ','kebun','Alam',3],['صَحْرَاءُ','gurun','Alam',3],['غَابَةٌ','hutan','Alam',3],['جَزِيرَةٌ','pulau','Alam',3],
  ['بِئْرٌ','sumur','Alam',3],['بَرْقٌ','kilat','Alam',3],['رَعْدٌ','guruh, petir','Alam',3],['عُشْبٌ','rumput','Alam',3],['ثَمَرَةٌ','buah (hasil pohon)','Alam',3],
  // waktu
  ['يَوْمٌ','hari','Waktu',3],['لَيْلٌ','malam','Waktu',3],['نَهَارٌ','siang','Waktu',3],['صَبَاحٌ','pagi','Waktu',3],['مَسَاءٌ','sore, petang','Waktu',3],
  ['دَقِيقَةٌ','menit','Waktu',3],['أُسْبُوعٌ','pekan','Waktu',3],['شَهْرٌ','bulan','Waktu',3],['سَنَةٌ','tahun','Waktu',3],['الْيَوْمَ','hari ini','Waktu',3],
  ['أَمْسِ','kemarin','Waktu',3],['غَدًا','besok','Waktu',3],['الْآنَ','sekarang','Waktu',3],['يَوْمُ الْأَحَدِ','hari Ahad','Waktu',3],
  ['يَوْمُ الِاثْنَيْنِ','hari Senin','Waktu',3],['يَوْمُ الثُّلَاثَاءِ','hari Selasa','Waktu',3],['يَوْمُ الْأَرْبِعَاءِ','hari Rabu','Waktu',3],
  ['يَوْمُ الْخَمِيسِ','hari Kamis','Waktu',3],['يَوْمُ الْجُمُعَةِ','hari Jumat','Waktu',3],['يَوْمُ السَّبْتِ','hari Sabtu','Waktu',3],
  ['الْفَجْرُ','subuh, fajar','Waktu',3],['الظُّهْرُ','zhuhur','Waktu',3],['الْعَصْرُ','ashar','Waktu',3],['الْمَغْرِبُ','maghrib','Waktu',3],['الْعِشَاءُ','isya','Waktu',3],
  // pakaian
  ['ثَوْبٌ','gamis, baju panjang','Pakaian',3],['سِرْوَالٌ','celana','Pakaian',3],['جَوْرَبٌ','kaus kaki','Pakaian',3],['قَلَنْسُوَةٌ','peci','Pakaian',3],
  ['عِمَامَةٌ','sorban','Pakaian',3],['حِجَابٌ','hijab','Pakaian',3],['إِزَارٌ','sarung, kain bawahan','Pakaian',3],['حِزَامٌ','ikat pinggang','Pakaian',3],
  ['مِعْطَفٌ','mantel','Pakaian',3],['خَاتَمٌ','cincin','Pakaian',3],['مِنْدِيلٌ','sapu tangan','Pakaian',3],['لِبَاسٌ','pakaian','Pakaian',3],
  // pekerjaan
  ['طَبِيبٌ','dokter','Pekerjaan',3],['مُمَرِّضٌ','perawat','Pekerjaan',3],['مُهَنْدِسٌ','insinyur','Pekerjaan',3],['تَاجِرٌ','pedagang','Pekerjaan',3],
  ['فَلَّاحٌ','petani','Pekerjaan',3],['نَجَّارٌ','tukang kayu','Pekerjaan',3],['خَبَّازٌ','tukang roti','Pekerjaan',3],['سَائِقٌ','sopir','Pekerjaan',3],
  ['شُرْطِيٌّ','polisi','Pekerjaan',3],['جُنْدِيٌّ','tentara','Pekerjaan',3],['طَبَّاخٌ','juru masak','Pekerjaan',3],['كَاتِبٌ','penulis','Pekerjaan',3],
  ['صَيَّادٌ','nelayan, pemburu','Pekerjaan',3],['خَيَّاطٌ','penjahit','Pekerjaan',3],['حَارِسٌ','penjaga','Pekerjaan',3],['مُوَظَّفٌ','pegawai','Pekerjaan',3],
  // hewan
  ['أَسَدٌ','singa','Hewan',3],['فِيلٌ','gajah','Hewan',3],['جَمَلٌ','unta','Hewan',3],['حِصَانٌ','kuda','Hewan',3],['بَقَرَةٌ','sapi','Hewan',3],
  ['غَنَمٌ','kambing, domba','Hewan',3],['قِطٌّ','kucing','Hewan',3],['دِيكٌ','ayam jantan','Hewan',3],['دَجَاجَةٌ','ayam betina','Hewan',3],['طَائِرٌ','burung','Hewan',3],
  ['سَمَكَةٌ','seekor ikan','Hewan',3],['نَحْلَةٌ','lebah','Hewan',3],['نَمْلَةٌ','semut','Hewan',3],['عَنْكَبُوتٌ','laba-laba','Hewan',3],['ذِئْبٌ','serigala','Hewan',3],
  ['ثَعْلَبٌ','rubah','Hewan',3],['أَرْنَبٌ','kelinci','Hewan',3],['فَأْرٌ','tikus','Hewan',3],['حِمَارٌ','keledai','Hewan',3],['حَمَامَةٌ','merpati','Hewan',3],
  ['ثُعْبَانٌ','ular','Hewan',3],['غُرَابٌ','burung gagak','Hewan',3],['هُدْهُدٌ','burung hud-hud','Hewan',3],['فَرَاشَةٌ','kupu-kupu','Hewan',3],
  // tempat
  ['سُوقٌ','pasar','Tempat',3],['مُسْتَشْفًى','rumah sakit','Tempat',3],['مَطَارٌ','bandara','Tempat',3],['مَحَطَّةٌ','stasiun, halte','Tempat',3],
  ['شَارِعٌ','jalan raya','Tempat',3],['مَدِينَةٌ','kota','Tempat',3],['قَرْيَةٌ','desa','Tempat',3],['دُكَّانٌ','toko','Tempat',3],['مَطْعَمٌ','rumah makan','Tempat',3],
  ['مَلْعَبٌ','lapangan','Tempat',3],['جَامِعَةٌ','universitas','Tempat',3],['مَصْنَعٌ','pabrik','Tempat',3],['فُنْدُقٌ','hotel','Tempat',3],
  ['مَزْرَعَةٌ','ladang, peternakan','Tempat',3],['مِينَاءٌ','pelabuhan','Tempat',3],['مَسْكَنٌ','asrama, tempat tinggal','Tempat',3],
  // fi'il dasar
  ...MUF_L3.filter(w => /َ$/.test(w[0])).map(w => [w[0], w[1], 'Kata Kerja', 3]),
  ['صَلَّى','shalat','Kata Kerja',3],['جَاءَ','datang','Kata Kerja',3],['قَالَ','berkata','Kata Kerja',3],['رَكِبَ','naik (kendaraan)','Kata Kerja',3],
  ['حَمَلَ','membawa','Kata Kerja',3],['وَقَفَ','berhenti, berdiri','Kata Kerja',3],['ضَحِكَ','tertawa','Kata Kerja',3],['بَكَى','menangis','Kata Kerja',3],
  ['فَهِمَ','paham','Kata Kerja',3],['عَرَفَ','mengetahui, mengenal','Kata Kerja',3],['سَأَلَ','bertanya','Kata Kerja',3],['أَجَابَ','menjawab','Kata Kerja',3],
  ['سَاعَدَ','membantu','Kata Kerja',3],['اشْتَرَى','membeli','Kata Kerja',3],['بَاعَ','menjual','Kata Kerja',3],['طَبَخَ','memasak','Kata Kerja',3],
  ['نَظَّفَ','membersihkan','Kata Kerja',3],['رَسَمَ','menggambar','Kata Kerja',3],['سَبَحَ','berenang','Kata Kerja',3],['جَرَى','berlari','Kata Kerja',3],['مَشَى','berjalan','Kata Kerja',3],
  // Level 4: fi'il lanjutan
  ['أَحَبَّ','mencintai','Kata Kerja 2',4],['كَرِهَ','membenci','Kata Kerja 2',4],['أَرَادَ','ingin','Kata Kerja 2',4],['اسْتَطَاعَ','mampu','Kata Kerja 2',4],
  ['انْتَظَرَ','menunggu','Kata Kerja 2',4],['اسْتَيْقَظَ','bangun tidur','Kata Kerja 2',4],['أَغْلَقَ','menutup','Kata Kerja 2',4],['أَرْسَلَ','mengirim','Kata Kerja 2',4],
  ['اسْتَقْبَلَ','menyambut','Kata Kerja 2',4],['اجْتَهَدَ','bersungguh-sungguh','Kata Kerja 2',4],['تَوَضَّأَ','berwudhu','Kata Kerja 2',4],['اسْتَغْفَرَ','memohon ampun','Kata Kerja 2',4],
  ['شَكَرَ','berterima kasih','Kata Kerja 2',4],['صَدَقَ','berkata jujur','Kata Kerja 2',4],['كَذَبَ','berdusta','Kata Kerja 2',4],['نَسِيَ','lupa','Kata Kerja 2',4],
  ['تَذَكَّرَ','ingat','Kata Kerja 2',4],['بَدَأَ','memulai','Kata Kerja 2',4],['انْتَهَى','selesai','Kata Kerja 2',4],['عَمِلَ','bekerja, beramal','Kata Kerja 2',4],
  ['سَكَنَ','tinggal','Kata Kerja 2',4],['زَارَ','mengunjungi','Kata Kerja 2',4],['لَبِسَ','memakai (pakaian)','Kata Kerja 2',4],['خَلَعَ','melepas','Kata Kerja 2',4],
  ['وَجَدَ','menemukan','Kata Kerja 2',4],['فَقَدَ','kehilangan','Kata Kerja 2',4],['أَعْطَى','memberi','Kata Kerja 2',4],['أَخَذَ','mengambil','Kata Kerja 2',4],
  ['دَرَسَ','belajar','Kata Kerja 2',4],['عَلَّمَ','mengajar','Kata Kerja 2',4],['اسْتَمَعَ','mendengarkan','Kata Kerja 2',4],['تَكَلَّمَ','berbicara','Kata Kerja 2',4],
  // sifat
  ['كَبِيرٌ','besar','Sifat',4],['صَغِيرٌ','kecil','Sifat',4],['طَوِيلٌ','panjang, tinggi','Sifat',4],['قَصِيرٌ','pendek','Sifat',4],['جَدِيدٌ','baru','Sifat',4],
  ['قَدِيمٌ','lama, kuno','Sifat',4],['جَمِيلٌ','indah','Sifat',4],['نَظِيفٌ','bersih','Sifat',4],['وَسِخٌ','kotor','Sifat',4],['حَارٌّ','panas','Sifat',4],
  ['بَارِدٌ','dingin','Sifat',4],['قَرِيبٌ','dekat','Sifat',4],['بَعِيدٌ','jauh','Sifat',4],['سَهْلٌ','mudah','Sifat',4],['صَعْبٌ','sulit','Sifat',4],
  ['سَرِيعٌ','cepat','Sifat',4],['بَطِيءٌ','lambat','Sifat',4],['ثَقِيلٌ','berat','Sifat',4],['خَفِيفٌ','ringan','Sifat',4],['كَثِيرٌ','banyak','Sifat',4],
  ['قَلِيلٌ','sedikit','Sifat',4],['غَنِيٌّ','kaya','Sifat',4],['فَقِيرٌ','miskin','Sifat',4],['قَوِيٌّ','kuat','Sifat',4],['ضَعِيفٌ','lemah','Sifat',4],
  ['مَشْغُولٌ','sibuk','Sifat',4],['فَارِغٌ','kosong, luang','Sifat',4],['مَسْرُورٌ','gembira','Sifat',4],['حَزِينٌ','sedih','Sifat',4],['جَائِعٌ','lapar','Sifat',4],
  ['عَطْشَانُ','haus','Sifat',4],['مَرِيضٌ','sakit','Sifat',4],['نَشِيطٌ','giat, rajin','Sifat',4],['كَسْلَانُ','malas','Sifat',4],['ذَكِيٌّ','cerdas','Sifat',4],
  ['شُجَاعٌ','berani','Sifat',4],['صَادِقٌ','jujur','Sifat',4],['أَمِينٌ','terpercaya','Sifat',4],
  // kata tanya & keterangan
  ['مَنْ','siapa','Kata Tanya & Keterangan',4],['مَا','apa','Kata Tanya & Keterangan',4],['أَيْنَ','di mana','Kata Tanya & Keterangan',4],['مَتَى','kapan','Kata Tanya & Keterangan',4],
  ['كَيْفَ','bagaimana','Kata Tanya & Keterangan',4],['كَمْ','berapa','Kata Tanya & Keterangan',4],['لِمَاذَا','mengapa','Kata Tanya & Keterangan',4],['هَلْ','apakah','Kata Tanya & Keterangan',4],
  ['فَوْقَ','di atas','Kata Tanya & Keterangan',4],['تَحْتَ','di bawah','Kata Tanya & Keterangan',4],['أَمَامَ','di depan','Kata Tanya & Keterangan',4],['خَلْفَ','di belakang','Kata Tanya & Keterangan',4],
  ['بَيْنَ','di antara','Kata Tanya & Keterangan',4],['عِنْدَ','di sisi, pada','Kata Tanya & Keterangan',4],['مَعَ','bersama','Kata Tanya & Keterangan',4],['هُنَا','di sini','Kata Tanya & Keterangan',4],
  ['هُنَاكَ','di sana','Kata Tanya & Keterangan',4],['قَبْلَ','sebelum','Kata Tanya & Keterangan',4],['بَعْدَ','sesudah','Kata Tanya & Keterangan',4],['دَائِمًا','selalu','Kata Tanya & Keterangan',4],
  ['أَيْضًا','juga','Kata Tanya & Keterangan',4],['جِدًّا','sekali','Kata Tanya & Keterangan',4],['فَقَطْ','saja, hanya','Kata Tanya & Keterangan',4]
];

const JAMAK2 = [
  ['مُدَرِّسٌ','مُدَرِّسُونَ','guru'],['دَفْتَرٌ','دَفَاتِرُ','buku tulis'],['مَدْرَسَةٌ','مَدَارِسُ','sekolah'],['شَارِعٌ','شَوَارِعُ','jalan'],
  ['قَمِيصٌ','قُمْصَانٌ','kemeja'],['ثَوْبٌ','ثِيَابٌ','baju'],['سُوقٌ','أَسْوَاقٌ','pasar'],['طَبِيبٌ','أَطِبَّاءُ','dokter'],['أَخٌ','إِخْوَةٌ','saudara'],
  ['أُخْتٌ','أَخَوَاتٌ','saudari'],['عَيْنٌ','عُيُونٌ','mata'],['شَهْرٌ','شُهُورٌ','bulan'],['سَنَةٌ','سَنَوَاتٌ','tahun'],['غُرْفَةٌ','غُرَفٌ','kamar'],
  ['نَافِذَةٌ','نَوَافِذُ','jendela'],['سَيَّارَةٌ','سَيَّارَاتٌ','mobil'],['مُسْلِمٌ','مُسْلِمُونَ','muslim'],['صَلَاةٌ','صَلَوَاتٌ','shalat'],['بِنْتٌ','بَنَاتٌ','anak perempuan'],
  ['ابْنٌ','أَبْنَاءٌ','anak laki-laki'],['قَلْبٌ','قُلُوبٌ','hati'],['حَدِيقَةٌ','حَدَائِقُ','kebun'],['مَدِينَةٌ','مُدُنٌ','kota'],['جَدِيدٌ','جُدُدٌ','baru'],
  ['كَبِيرٌ','كِبَارٌ','besar'],['صَغِيرٌ','صِغَارٌ','kecil'],['فَصْلٌ','فُصُولٌ','kelas'],['مَلِكٌ','مُلُوكٌ','raja'],['عَالِمٌ','عُلَمَاءُ','orang berilmu'],['نَبِيٌّ','أَنْبِيَاءُ','nabi']
];
const LAWAN2 = [
  ['كَثِيرٌ','قَلِيلٌ'],['غَنِيٌّ','فَقِيرٌ'],['قَوِيٌّ','ضَعِيفٌ'],['سَرِيعٌ','بَطِيءٌ'],['ثَقِيلٌ','خَفِيفٌ'],['نَظِيفٌ','وَسِخٌ'],['مَسْرُورٌ','حَزِينٌ'],
  ['صَبَاحٌ','مَسَاءٌ'],['أَمَامَ','خَلْفَ'],['ذَهَبَ','رَجَعَ'],['أَحَبَّ','كَرِهَ'],['نَسِيَ','تَذَكَّرَ'],['بَدَأَ','انْتَهَى'],['سَأَلَ','أَجَابَ'],
  ['أَخَذَ','أَعْطَى'],['ضَحِكَ','بَكَى'],['صَدَقَ','كَذَبَ'],['سَمَاءٌ','أَرْضٌ'],['قَبْلَ','بَعْدَ'],['نَشِيطٌ','كَسْلَانُ'],['اشْتَرَى','بَاعَ'],['جَائِعٌ','شَبْعَانُ']
];

/* ---------- MUHADATSAH (dari tema Buku Saku Santri) ---------- */
// [ungkapan, arti, jawaban|null, tema]
const MUHADATSAH2 = [
  ['صَبَاحَ الْخَيْرِ','Selamat pagi','صَبَاحَ النُّورِ','Salam & Perkenalan'],
  ['مَسَاءَ الْخَيْرِ','Selamat sore','مَسَاءَ النُّورِ','Salam & Perkenalan'],
  ['أَهْلًا وَسَهْلًا','Selamat datang','أَهْلًا بِكَ','Salam & Perkenalan'],
  ['تَشَرَّفْنَا بِمَعْرِفَتِكَ','Senang berkenalan denganmu',null,'Salam & Perkenalan'],
  ['فِي أَيِّ فَصْلٍ أَنْتَ؟','Kamu di kelas berapa?','أَنَا فِي الْفَصْلِ الْخَامِسِ','Salam & Perkenalan'],
  ['مَنْ هَذَا؟','Siapa ini?','هَذَا صَدِيقِي','Salam & Perkenalan'],
  ['مِنْ فَضْلِكَ','Tolong (permintaan sopan)',null,'Sopan Santun'],
  ['عَفْوًا، لَا أَعْرِفُ','Maaf, saya tidak tahu',null,'Sopan Santun'],
  ['آسِفٌ','Maaf (saya menyesal)','لَا بَأْسَ','Sopan Santun'],
  ['بَارَكَ اللَّهُ فِيكَ','Semoga Allah memberkahimu','وَفِيكَ بَارَكَ اللَّهُ','Sopan Santun'],
  ['إِنْ شَاءَ اللَّهُ','Jika Allah menghendaki',null,'Sopan Santun'],
  ['أَيْنَ سَرِيرُكَ؟','Di mana ranjangmu?','سَرِيرِي هُنَاكَ','Di Asrama'],
  ['أَطْفِئِ الْمِصْبَاحَ','Matikan lampunya',null,'Di Asrama'],
  ['رَتِّبْ سَرِيرَكَ','Rapikan ranjangmu',null,'Di Asrama'],
  ['قُمْ، جَاءَ وَقْتُ الصَّلَاةِ','Bangun, waktu shalat sudah tiba',null,'Di Asrama'],
  ['هَلِ الْحَمَّامُ فَارِغٌ؟','Apakah kamar mandi kosong?','نَعَمْ، هُوَ فَارِغٌ','Di Kamar Mandi'],
  ['أَيْنَ الصَّابُونُ؟','Di mana sabunnya?','الصَّابُونُ فِي الْحَمَّامِ','Di Kamar Mandi'],
  ['أَغْسِلُ ثِيَابِي','Saya mencuci pakaianku',null,'Di Kamar Mandi'],
  ['هَلْ تَوَضَّأْتَ؟','Apakah kamu sudah berwudhu?','نَعَمْ، تَوَضَّأْتُ','Di Masjid'],
  ['سَوُّوا صُفُوفَكُمْ','Luruskan shaf kalian',null,'Di Masjid'],
  ['أَيْنَ الْمُصْحَفُ؟','Di mana mushafnya?','الْمُصْحَفُ عَلَى الرَّفِّ','Di Masjid'],
  ['هَلْ أَذَّنَ الْمُؤَذِّنُ؟','Apakah muadzin sudah adzan?','نَعَمْ، أَذَّنَ','Di Masjid'],
  ['أَيْنَ وَاجِبُكَ؟','Mana tugasmu?','هَذَا وَاجِبِي','Di Kelas'],
  ['اكْتُبْ هَذَا الدَّرْسَ','Tulislah pelajaran ini',null,'Di Kelas'],
  ['هَلْ عِنْدَكَ قَلَمٌ؟','Apakah kamu punya pena?','نَعَمْ، عِنْدِي قَلَمٌ','Di Kelas'],
  ['أَعِدْ مِنْ فَضْلِكَ','Tolong ulangi',null,'Di Kelas'],
  ['يَا أُسْتَاذُ، عِنْدِي سُؤَالٌ','Ustadz, saya punya pertanyaan','تَفَضَّلْ','Bersama Ustadz'],
  ['هَلْ يُمْكِنُ أَنْ أَخْرُجَ؟','Bolehkah saya keluar?','نَعَمْ، تَفَضَّلْ','Bersama Ustadz'],
  ['أُرِيدُ أَنْ أَسْتَعِيرَ هَذَا الْكِتَابَ','Saya ingin meminjam buku ini',null,'Perpustakaan'],
  ['مَتَى أُعِيدُ الْكِتَابَ؟','Kapan saya mengembalikan buku?','بَعْدَ أُسْبُوعٍ','Perpustakaan'],
  ['مَتَى الِامْتِحَانُ؟','Kapan ujiannya?','الِامْتِحَانُ غَدًا','Ujian'],
  ['هَلِ الْأَسْئِلَةُ صَعْبَةٌ؟','Apakah soal-soalnya sulit?','لَا، هِيَ سَهْلَةٌ','Ujian'],
  ['أَنَا جَائِعٌ','Saya lapar','هَيَّا نَأْكُلْ','Dapur & Makan'],
  ['أَنَا عَطْشَانُ','Saya haus','اشْرَبْ هَذَا الْمَاءَ','Dapur & Makan'],
  ['الطَّعَامُ لَذِيذٌ','Makanannya lezat',null,'Dapur & Makan'],
  ['بِكَمْ هَذَا؟','Berapa harga ini?','بِخَمْسَةِ آلَافٍ','Kantin'],
  ['أُرِيدُ أَنْ أَشْتَرِيَ خُبْزًا','Saya ingin membeli roti',null,'Kantin'],
  ['هَيَّا نَلْعَبْ كُرَةَ الْقَدَمِ','Ayo bermain sepak bola',null,'Di Lapangan'],
  ['أَنَا تَعْبَانُ','Saya capek','اسْتَرِحْ قَلِيلًا','Di Lapangan'],
  ['مَاذَا بِكَ؟','Kamu kenapa?','رَأْسِي يُؤْلِمُنِي','Sakit & Klinik'],
  ['شَفَاكَ اللَّهُ','Semoga Allah menyembuhkanmu','آمِينَ','Sakit & Klinik'],
  ['اذْهَبْ إِلَى الطَّبِيبِ','Pergilah ke dokter',null,'Sakit & Klinik'],
  ['جَاءَ أَبِي لِزِيَارَتِي','Ayahku datang menjengukku',null,'Kunjungan Wali'],
  ['نَظِّفِ الْفَصْلَ','Bersihkan kelas',null,'Kebersihan'],
  ['النَّظَافَةُ مِنَ الْإِيمَانِ','Kebersihan bagian dari iman',null,'Kebersihan'],
  ['تَكَلَّمْ بِاللُّغَةِ الْعَرَبِيَّةِ','Berbicaralah dengan bahasa Arab',null,'Bahasa & Disiplin'],
  ['مَتَى تُسَافِرُ؟','Kapan kamu bepergian?','أُسَافِرُ غَدًا','Liburan'],
  ['رَافَقَتْكَ السَّلَامَةُ','Semoga selamat di perjalanan',null,'Liburan'],
  ['عِيدٌ مُبَارَكٌ','Selamat hari raya',null,'Ucapan & Doa'],
  ['تَقَبَّلَ اللَّهُ مِنَّا وَمِنْكُمْ','Semoga Allah menerima amal kami dan kalian',null,'Ucapan & Doa']
];

/* ---------- KALIMAT ARAB SEDERHANA (level 5) ---------- */
const KALIMAT_AR = [
  ['هَذَا كِتَابٌ','Ini buku'],['ذَلِكَ مَسْجِدٌ','Itu masjid'],['أَنَا طَالِبٌ','Saya pelajar'],['الْمُدَرِّسُ فِي الْفَصْلِ','Guru di dalam kelas'],
  ['ذَهَبَ أَحْمَدُ إِلَى الْمَدْرَسَةِ','Ahmad pergi ke sekolah'],['الْبَيْتُ كَبِيرٌ','Rumah itu besar'],['الْقَلَمُ عَلَى الْمَكْتَبِ','Pena di atas meja'],
  ['نَحْنُ نُصَلِّي فِي الْمَسْجِدِ','Kami shalat di masjid'],['هَلْ أَنْتَ مُدَرِّسٌ؟','Apakah kamu guru?'],['الْبَابُ مَفْتُوحٌ','Pintunya terbuka'],
  ['النَّافِذَةُ مُغْلَقَةٌ','Jendelanya tertutup'],['السَّيَّارَةُ جَدِيدَةٌ','Mobil itu baru'],['أُحِبُّ اللُّغَةَ الْعَرَبِيَّةَ','Saya mencintai bahasa Arab'],
  ['يَقْرَأُ الطَّالِبُ الْقُرْآنَ','Pelajar itu membaca Al-Qur\'an'],['الْجَوُّ حَارٌّ الْيَوْمَ','Cuaca panas hari ini'],['أَبِي تَاجِرٌ','Ayahku pedagang'],
  ['أُمِّي فِي الْمَطْبَخِ','Ibuku di dapur'],['شَرِبْتُ الْحَلِيبَ','Saya sudah minum susu'],['هَذِهِ سَاعَةٌ جَمِيلَةٌ','Ini jam yang indah'],['الْكِتَابُ تَحْتَ الْكُرْسِيِّ','Buku di bawah kursi']
];

/* ---------- WARNA TAMBAHAN ---------- */
const COLORS2 = [
  { id:'emas', name:'Emas', hex:'#D4A017' },{ id:'perak', name:'Perak', hex:'#C0C4CC' },{ id:'birumuda', name:'Biru Muda', hex:'#7EC8F5' },
  { id:'birutua', name:'Biru Tua', hex:'#123A8A' },{ id:'marun', name:'Merah Marun', hex:'#7B1E2B' },{ id:'krem', name:'Krem', hex:'#F3E2B8' },{ id:'nila', name:'Nila', hex:'#3F3FB5' }
];
const COLOR_OBJ2 = [
  ['🌙','bulan','kuning'],['⭐','bintang','kuning'],['🍉','daging semangka','merah'],['🥥','kulit kelapa','cokelat'],['🧀','keju','kuning'],
  ['🍋','lemon','kuning'],['🍒','ceri','merah'],['🥒','mentimun','hijau'],['🌶️','cabai merah','merah'],['🥛','susu','putih'],['🧂','garam','putih'],
  ['❄️','salju','putih'],['🌑','langit malam','hitam'],['🎱','bola biliar hitam','hitam'],['🍑','persik','oranye'],['🎃','labu','oranye'],
  ['🧊','es batu','putih'],['🍯','madu','oranye'],['🟣','kancing ungu','ungu'],['🔵','bulatan biru','biru'],['🟡','bulatan kuning','kuning'],
  ['🔴','bulatan merah','merah'],['🟤','bulatan cokelat','cokelat'],['⚫','bulatan hitam','hitam'],['⚪','bulatan putih','putih'],['🟠','bulatan oranye','oranye'],
  ['🏆','piala','emas'],['🥈','medali perak','perak'],['🪙','koin emas','emas'],['💙','hati biru','biru'],['🌹','mawar','merah'],['🍫','cokelat','cokelat']
];
const COLOR_MIX2 = [['biru','putih','birumuda'],['merah','hitam','marun'],['kuning','putih','krem'],['biru','hitam','birutua']];
const COLOR_FACTS = [
  ['Warna bendera Indonesia adalah…','Merah dan putih',['Merah dan biru','Kuning dan hijau','Hitam dan putih']],
  ['Lampu lalu lintas merah artinya…','Berhenti',['Jalan terus','Hati-hati','Belok kiri']],
  ['Lampu lalu lintas kuning artinya…','Hati-hati',['Berhenti','Jalan terus','Putar balik']],
  ['Lampu lalu lintas hijau artinya…','Boleh jalan',['Berhenti','Hati-hati','Parkir']],
  ['Warna pelangi ada berapa?','7',['5','3','10']],
  ['Warna pelangi yang paling atas adalah…','Merah',['Ungu','Biru','Kuning']],
  ['Warna pelangi yang paling bawah adalah…','Ungu',['Merah','Kuning','Jingga']],
  ['Urutan pelangi: merah, jingga, lalu…','Kuning',['Biru','Ungu','Nila']],
  ['Tiga warna dasar (primer) adalah…','Merah, kuning, biru',['Merah, hijau, ungu','Hitam, putih, abu-abu','Oranye, ungu, hijau']],
  ['Warna yang terlihat panas dan hangat adalah…','Merah dan oranye',['Biru dan ungu','Hitam dan abu-abu','Putih dan perak']],
  ['Warna yang terlihat sejuk adalah…','Biru',['Merah','Oranye','Kuning']],
  ['Kalau warna biru diberi banyak putih, warnanya jadi…','Lebih muda',['Lebih tua','Hitam','Merah']],
  ['Kalau warna merah diberi sedikit hitam, warnanya jadi…','Lebih tua',['Lebih muda','Putih','Kuning']],
  ['Kain kafan berwarna…','Putih',['Hitam','Merah','Kuning']],
  ['Ka\'bah ditutupi kain (kiswah) berwarna…','Hitam',['Putih','Merah','Biru']]
];
const COLOR_AR_Q = [
  ['مَا لَوْنُ الْمَوْزِ؟','Apa warna pisang?','أَصْفَرُ'],['مَا لَوْنُ السَّمَاءِ؟','Apa warna langit?','أَزْرَقُ'],['مَا لَوْنُ الْحَلِيبِ؟','Apa warna susu?','أَبْيَضُ'],
  ['مَا لَوْنُ التُّفَّاحِ؟','Apa warna apel?','أَحْمَرُ'],['مَا لَوْنُ اللَّيْلِ؟','Apa warna malam?','أَسْوَدُ'],['مَا لَوْنُ الْبُرْتُقَالِ؟','Apa warna jeruk?','بُرْتُقَالِيٌّ'],
  ['مَا لَوْنُ الْعِنَبِ؟','Apa warna anggur?','بَنَفْسَجِيٌّ'],['مَا لَوْنُ الشَّايِ؟','Apa warna teh?','بُنِّيٌّ'],['مَا لَوْنُ السَّحَابِ؟','Apa warna awan?','أَبْيَضُ']
];

/* ---------- DOA TAMBAHAN ---------- */
const DOA2 = [
  { id:'adzan', judul:'Setelah adzan', e:'📢', lvl:4, ar:'اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلَاةِ الْقَائِمَةِ آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ', arti:'Ya Allah, Rabb pemilik seruan yang sempurna ini dan shalat yang akan didirikan, berilah Muhammad al-wasilah dan keutamaan, dan bangkitkan beliau di kedudukan terpuji yang telah Engkau janjikan.' },
  { id:'hidayah', judul:'Memohon petunjuk', e:'🧭', lvl:3, ar:'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى', arti:'Ya Allah, aku memohon kepada-Mu petunjuk, ketakwaan, kesucian diri, dan kecukupan.' },
  { id:'taubat', judul:'Mengakui kesalahan (doa Nabi Adam)', e:'🌿', lvl:4, ar:'رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ', arti:'Wahai Rabb kami, kami telah menzalimi diri kami. Jika Engkau tidak mengampuni dan merahmati kami, niscaya kami termasuk orang yang merugi.' },
  { id:'angin', judul:'Ketika angin bertiup kencang', e:'🌬️', lvl:4, ar:'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَأَعُوذُ بِكَ مِنْ شَرِّهَا', arti:'Ya Allah, aku memohon kebaikannya dan aku berlindung kepada-Mu dari keburukannya.' },
  { id:'sulit', judul:'Ketika menghadapi kesulitan', e:'🧗', lvl:5, ar:'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا', arti:'Ya Allah, tidak ada yang mudah kecuali yang Engkau jadikan mudah, dan Engkau menjadikan yang sulit menjadi mudah jika Engkau menghendaki.' },
  { id:'sakit', judul:'Mendoakan orang sakit', e:'🩹', lvl:5, ar:'اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ اشْفِ أَنْتَ الشَّافِي لَا شِفَاءَ إِلَّا شِفَاؤُكَ شِفَاءً لَا يُغَادِرُ سَقَمًا', arti:'Ya Allah, Rabb manusia, hilangkanlah penyakit ini. Sembuhkanlah, Engkaulah Yang Maha Menyembuhkan. Tidak ada kesembuhan kecuali kesembuhan dari-Mu, kesembuhan yang tidak menyisakan penyakit.' },
  { id:'nikmat', judul:'Melihat sesuatu yang menakjubkan', e:'✨', lvl:3, ar:'مَا شَاءَ اللَّهُ لَا قُوَّةَ إِلَّا بِاللَّهِ', arti:'Inilah yang dikehendaki Allah, tidak ada kekuatan kecuali dengan pertolongan Allah.' },
  { id:'salammasuk', judul:'Masuk rumah (mengucap salam)', e:'🏠', lvl:1, ar:'السَّلَامُ عَلَيْكُمْ', arti:'Semoga keselamatan tercurah atas kalian.' }
];
