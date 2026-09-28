export interface ServiceKecamatan {
  kecamatan: string;
  desaList: string[];
  kelurahanList?: string[]; // Backwards compatibility
}

export const AETRA_SERVICE_AREAS: ServiceKecamatan[] = [
  {
    kecamatan: 'BALARAJA',
    desaList: [
      'Balaraja',
      'Cangkudu',
      'Gembong',
      'Saga',
      'Sentul',
      'Sentul Jaya',
      'Sukamurni',
      'Talagasari',
      'Tobat',
    ],
    kelurahanList: [
      'Balaraja',
      'Cangkudu',
      'Gembong',
      'Saga',
      'Sentul',
      'Sentul Jaya',
      'Sukamurni',
      'Talagasari',
      'Tobat',
    ],
  },
  {
    kecamatan: 'CIKUPA',
    desaList: [
      'Bitung Jaya',
      'Bojong',
      'Bunder',
      'Cibadak',
      'Cikupa',
      'Dukuh',
      'Pasir Gadung',
      'Pasir Jaya',
      'Sukadamai',
      'Sukanagara',
      'Talaga',
      'Talagasari',
    ],
    kelurahanList: [
      'Bitung Jaya',
      'Bojong',
      'Bunder',
      'Cibadak',
      'Cikupa',
      'Dukuh',
      'Pasir Gadung',
      'Pasir Jaya',
      'Sukadamai',
      'Sukanagara',
      'Talaga',
      'Talagasari',
    ],
  },
  {
    kecamatan: 'JAYANTI',
    desaList: [
      'Cikande',
      'Dangdeur',
      'Jayanti',
      'Pabuaran',
      'Pangkat',
      'Pasir Gintung',
      'Pasir Muncang',
      'Sumurbandung',
    ],
    kelurahanList: [
      'Cikande',
      'Dangdeur',
      'Jayanti',
      'Pabuaran',
      'Pangkat',
      'Pasir Gintung',
      'Pasir Muncang',
      'Sumurbandung',
    ],
  },
  {
    kecamatan: 'PASAR KEMIS',
    desaList: [
      'Gelam Jaya',
      'Kuta Baru',
      'Kuta Bumi',
      'Kuta Jaya',
      'Pangadegan',
      'Pasar Kemis',
      'Sindangsari',
      'Sukaasih',
      'Sukamantri',
    ],
    kelurahanList: [
      'Gelam Jaya',
      'Kuta Baru',
      'Kuta Bumi',
      'Kuta Jaya',
      'Pangadegan',
      'Pasar Kemis',
      'Sindangsari',
      'Sukaasih',
      'Sukamantri',
    ],
  },
  {
    kecamatan: 'SEPATAN',
    desaList: [
      'Karet',
      'Kayu Agung',
      'Kayu Bongkok',
      'Mekar Jaya',
      'Pisangan Jaya',
      'Pondok Jaya',
      'Sarakan',
      'Sepatan',
    ],
    kelurahanList: [
      'Karet',
      'Kayu Agung',
      'Kayu Bongkok',
      'Mekar Jaya',
      'Pisangan Jaya',
      'Pondok Jaya',
      'Sarakan',
      'Sepatan',
    ],
  },
  {
    kecamatan: 'SEPATAN TIMUR',
    desaList: [
      'Gempol Sari',
      'Jati Mulya',
      'Kampung Kelor',
      'Kedaung Barat',
      'Lebak Wangi',
      'Pondok Kelor',
      'Sangiang',
      'Tanah Merah',
    ],
    kelurahanList: [
      'Gempol Sari',
      'Jati Mulya',
      'Kampung Kelor',
      'Kedaung Barat',
      'Lebak Wangi',
      'Pondok Kelor',
      'Sangiang',
      'Tanah Merah',
    ],
  },
  {
    kecamatan: 'SINDANG JAYA',
    desaList: [
      'Badak Anom',
      'Sindang Asih',
      'Sindang Jaya',
      'Sindang Panon',
      'Sindang Sono',
      'Sukaharja',
    ],
    kelurahanList: [
      'Badak Anom',
      'Sindang Asih',
      'Sindang Jaya',
      'Sindang Panon',
      'Sindang Sono',
      'Sukaharja',
    ],
  },
  {
    kecamatan: 'WANA KERTA',
    desaList: [
      'Wanakerta',
      'Karyamekar',
      'Pasir Nangka',
      'Tegalsari',
      'Sukamulya',
    ],
    kelurahanList: [
      'Wanakerta',
      'Karyamekar',
      'Pasir Nangka',
      'Tegalsari',
      'Sukamulya',
    ],
  },
];

export const KECAMATAN_LIST = [
  'BALARAJA',
  'CIKUPA',
  'JAYANTI',
  'PASAR KEMIS',
  'SEPATAN',
  'SEPATAN TIMUR',
  'SINDANG JAYA',
  'WANA KERTA',
];

// Helper to get flat list of all Desa with Kecamatan info
export const ALL_DESA_FLAT = AETRA_SERVICE_AREAS.flatMap((area) =>
  area.desaList.map((desa) => ({
    desa: desa,
    kecamatan: area.kecamatan,
    displayLabel: `${desa} (Kec. ${area.kecamatan})`,
  }))
);

// Backward compatibility alias
export const ALL_KELURAHAN_FLAT = ALL_DESA_FLAT.map((item) => ({
  kelurahan: item.desa,
  kecamatan: item.kecamatan,
  displayLabel: item.displayLabel,
}));
