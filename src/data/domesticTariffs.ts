export interface DomesticTariffClause {
  id: string;
  code: 'R1' | 'R2' | 'R3' | 'R4';
  text: string;
  sampleLuas: number;
  isRealEstate: boolean;
  hasUsaha: boolean;
}

export const DOMESTIC_TARIFF_CLAUSES: DomesticTariffClause[] = [
  {
    id: 'r1-1',
    code: 'R1',
    text: 'Pelanggan yang propertinya mempunyai luas bangunan < 28,8 m2 Yang peruntukannya hanya untuk rumah tinggal tanpa usaha komersil',
    sampleLuas: 24,
    isRealEstate: false,
    hasUsaha: false,
  },
  {
    id: 'r2-1',
    code: 'R2',
    text: 'Pelanggan yang propertinya mempunyai luas bangunan > 28,9 m2 dan < 70 m2 di area non real estate, yang peruntukannya hanya untuk rumah tinggal tanpa usaha komersil.',
    sampleLuas: 54,
    isRealEstate: false,
    hasUsaha: false,
  },
  {
    id: 'r3-1',
    code: 'R3',
    text: 'Pelanggan yang propertinya mempunyai luas bangunan > 70 m2 dan < 120 m2 di pemukiman umum.',
    sampleLuas: 90,
    isRealEstate: false,
    hasUsaha: false,
  },
  {
    id: 'r3-2',
    code: 'R3',
    text: 'Pelanggan yang propertinya mempunyai luas bangunan < 70 m2 di kawasan real estate tanpa ada usaha.',
    sampleLuas: 60,
    isRealEstate: true,
    hasUsaha: false,
  },
  {
    id: 'r3-3',
    code: 'R3',
    text: 'Pelanggan yang propertinya mempunyai luas bangunan > 28,9 m2 dan < 70 m2 di area non real estate tetapi memiliki usaha.',
    sampleLuas: 54,
    isRealEstate: false,
    hasUsaha: true,
  },
  {
    id: 'r4-1',
    code: 'R4',
    text: 'Pelanggan yang propertinya mempunyai luas bangunan > 120 m2 di pemukiman umum atau > 70 m2 di real estate tanpa ada usaha.',
    sampleLuas: 140,
    isRealEstate: false,
    hasUsaha: false,
  },
  {
    id: 'r4-2',
    code: 'R4',
    text: 'Pelanggan yang propertinya mempunyai luas bangunan < 70 m2 dan < 120 m2 di pemukiman umum tetapi memiliki usaha.',
    sampleLuas: 80,
    isRealEstate: false,
    hasUsaha: true,
  },
];

export interface DomesticTariffRule {
  code: 'R1' | 'R2' | 'R3' | 'R4';
  name: string;
  shortLabel: string;
  points: string[];
  summaryCondition: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
}

// Exactly mirrored from official Aetra document image: "Kategori Tarif Pelanggan Domestik"
export const DOMESTIC_TARIFF_RULES: DomesticTariffRule[] = [
  {
    code: 'R1',
    name: 'Rumah Tangga 1',
    shortLabel: 'R1 = Rumah Tangga 1',
    points: [
      'Pelanggan yang propertinya mempunyai luas bangunan < 28,8 m2 yang peruntukannya hanya untuk rumah tinggal tanpa usaha komersil.',
    ],
    summaryCondition: 'Luas bangunan < 28,8 m² (Rumah tinggal murni tanpa usaha komersil)',
    badgeBg: 'bg-emerald-500',
    badgeText: 'text-white',
    borderColor: 'border-emerald-300',
  },
  {
    code: 'R2',
    name: 'Rumah Tangga 2',
    shortLabel: 'R2 = Rumah Tangga 2',
    points: [
      'Pelanggan yang propertinya mempunyai luas bangunan > 28,9 m2 dan < 70 m2 di area non real estate, yang peruntukannya hanya untuk rumah tinggal tanpa usaha komersil.',
    ],
    summaryCondition: 'Luas bangunan > 28,9 m² dan < 70 m² di area non real estate (tanpa usaha komersil)',
    badgeBg: 'bg-amber-500',
    badgeText: 'text-white',
    borderColor: 'border-amber-300',
  },
  {
    code: 'R3',
    name: 'Rumah Tangga 3',
    shortLabel: 'R3 = Rumah Tangga 3',
    points: [
      'Pelanggan yang propertinya mempunyai luas bangunan > 70 m2 dan < 120 m2 di pemukiman umum.',
      'Pelanggan yang propertinya mempunyai luas bangunan < 70 m2 di kawasan real estate tanpa ada usaha.',
      'Pelanggan yang propertinya mempunyai luas bangunan > 28,9 m2 dan < 70 m2 di area non real estate tetapi memiliki usaha.',
    ],
    summaryCondition: 'Luas 70 - 120 m² pemukiman umum, < 70 m² real estate, atau 28,9 - 70 m² non real estate dengan usaha',
    badgeBg: 'bg-blue-600',
    badgeText: 'text-white',
    borderColor: 'border-blue-300',
  },
  {
    code: 'R4',
    name: 'Rumah Tangga 4',
    shortLabel: 'R4 = Rumah Tangga 4',
    points: [
      'Pelanggan yang propertinya mempunyai luas bangunan > 120 m2 di pemukiman umum atau > 70 m2 di real estate tanpa ada usaha.',
      'Pelanggan yang propertinya mempunyai luas bangunan < 70 m2 dan < 120 m2 di pemukiman umum tetapi memiliki usaha.',
    ],
    summaryCondition: 'Luas > 120 m² pemukiman umum, > 70 m² real estate, atau < 120 m² di pemukiman umum dengan usaha',
    badgeBg: 'bg-purple-600',
    badgeText: 'text-white',
    borderColor: 'border-purple-300',
  },
];

export interface TariffCalculationResult {
  code: 'R1' | 'R2' | 'R3' | 'R4';
  name: string;
  appliedClause: string;
  allPoints: string[];
  color: string;
}

/**
 * Calculates official Aetra Domestic Tariff Category based on building area,
 * real estate status, and commercial business presence.
 */
export function calculateDomesticTariff(
  totalLuas: number,
  isRealEstate: boolean,
  hasUsaha: boolean
): TariffCalculationResult | null {
  if (!totalLuas || totalLuas <= 0) return null;

  // Case 1: Real Estate Area
  if (isRealEstate) {
    if (!hasUsaha) {
      if (totalLuas < 70) {
        return {
          code: 'R3',
          name: 'R3 = Rumah Tangga 3',
          appliedClause: 'Pelanggan yang propertinya mempunyai luas bangunan < 70 m2 di kawasan real estate tanpa ada usaha.',
          allPoints: DOMESTIC_TARIFF_RULES[2].points,
          color: 'blue',
        };
      } else {
        return {
          code: 'R4',
          name: 'R4 = Rumah Tangga 4',
          appliedClause: 'Pelanggan yang propertinya mempunyai luas bangunan > 70 m2 di real estate tanpa ada usaha.',
          allPoints: DOMESTIC_TARIFF_RULES[3].points,
          color: 'purple',
        };
      }
    } else {
      // Real estate with business
      return {
        code: 'R4',
        name: 'R4 = Rumah Tangga 4',
        appliedClause: 'Pelanggan di kawasan real estate dengan kegiatan usaha.',
        allPoints: DOMESTIC_TARIFF_RULES[3].points,
        color: 'purple',
      };
    }
  }

  // Case 2: Non Real Estate / Pemukiman Umum
  if (!hasUsaha) {
    // Pure residential without commercial business
    if (totalLuas <= 28.8) {
      return {
        code: 'R1',
        name: 'R1 = Rumah Tangga 1',
        appliedClause: 'Pelanggan yang propertinya mempunyai luas bangunan < 28,8 m2 Yang peruntukannya hanya untuk rumah tinggal tanpa usaha komersil',
        allPoints: DOMESTIC_TARIFF_RULES[0].points,
        color: 'emerald',
      };
    } else if (totalLuas < 70) {
      return {
        code: 'R2',
        name: 'R2 = Rumah Tangga 2',
        appliedClause: 'Pelanggan yang propertinya mempunyai luas bangunan > 28,9 m2 dan < 70 m2 di area non real estate, yang peruntukannya hanya untuk rumah tinggal tanpa usaha komersil.',
        allPoints: DOMESTIC_TARIFF_RULES[1].points,
        color: 'amber',
      };
    } else if (totalLuas < 120) {
      return {
        code: 'R3',
        name: 'R3 = Rumah Tangga 3',
        appliedClause: 'Pelanggan yang propertinya mempunyai luas bangunan > 70 m2 dan < 120 m2 di pemukiman umum.',
        allPoints: DOMESTIC_TARIFF_RULES[2].points,
        color: 'blue',
      };
    } else {
      return {
        code: 'R4',
        name: 'R4 = Rumah Tangga 4',
        appliedClause: 'Pelanggan yang propertinya mempunyai luas bangunan > 120 m2 di pemukiman umum atau > 70 m2 di real estate tanpa ada usaha.',
        allPoints: DOMESTIC_TARIFF_RULES[3].points,
        color: 'purple',
      };
    }
  } else {
    // Non real estate / pemukiman umum DENGAN usaha
    if (totalLuas < 70) {
      return {
        code: 'R3',
        name: 'R3 = Rumah Tangga 3',
        appliedClause: 'Pelanggan yang propertinya mempunyai luas bangunan > 28,9 m2 dan < 70 m2 di area non real estate tetapi memiliki usaha.',
        allPoints: DOMESTIC_TARIFF_RULES[2].points,
        color: 'blue',
      };
    } else {
      return {
        code: 'R4',
        name: 'R4 = Rumah Tangga 4',
        appliedClause: 'Pelanggan yang propertinya mempunyai luas bangunan < 70 m2 dan < 120 m2 di pemukiman umum tetapi memiliki usaha.',
        allPoints: DOMESTIC_TARIFF_RULES[3].points,
        color: 'purple',
      };
    }
  }
}
