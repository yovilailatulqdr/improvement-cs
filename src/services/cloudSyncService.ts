import { RegistrationFormData, CustomerTrackingRecord, SurveySubmission, UserAccount, MonthlyBillRecord } from '../types';
import { INITIAL_REGISTRATIONS, INITIAL_TRACKING_DATABASE, INITIAL_SURVEY_RESPONSES } from '../data/mockData';

// Dedicated Persistent Cloud Object on restful-api.dev for cross-device multi-client sync
const MASTER_SYNC_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a0e8a02f4e3619';

export interface CloudSyncPayload {
  version: number;
  lastSync: string;
  accounts: UserAccount[];
  registrations: RegistrationFormData[];
  trackingRecords: CustomerTrackingRecord[];
  bills: MonthlyBillRecord[];
  surveys: SurveySubmission[];
}

export const INITIAL_BILLS_DATA: MonthlyBillRecord[] = [
  {
    id: 'bill-10842918-032026',
    idPelanggan: '10842918',
    noSr: '168392',
    nama: 'Yovi Lailatul',
    alamat: 'Jl. Merpati No. 24 RT 003/004, Kel. Cikupa, Kec. Cikupa, Tangerang',
    golonganTarif: '2A1 - Rumah Tangga Standard (R2)',
    nomorMeter: 'AET-2609-8472',
    periodeBulan: 'Maret 2026',
    tanggalJatuhTempo: '20 Maret 2026',
    standLalu: 142,
    standKini: 165,
    pemakaianM3: 23,
    rincianBlok: {
      blok1M3: 10,
      blok1Tarif: 4250,
      blok1Total: 42500,
      blok2M3: 10,
      blok2Tarif: 5800,
      blok2Total: 58000,
      blok3M3: 3,
      blok3Tarif: 8200,
      blok3Total: 24600,
    },
    biayaAir: 125100,
    biayaPemeliharaanMeter: 12500,
    biayaAdministrasi: 5000,
    retribusi: 0,
    denda: 0,
    totalTagihan: 142600,
    status: 'BELUM LUNAS',
  },
  {
    id: 'bill-10928371-032026',
    idPelanggan: '10928371',
    noSr: '172839',
    nama: 'Amara Putri',
    alamat: 'Jl. Raya Serang Km 14 No. 88, Balaraja, Tangerang',
    golonganTarif: '2A2 - Rumah Tangga Menengah (R3)',
    nomorMeter: 'AET-2609-8473',
    periodeBulan: 'Maret 2026',
    tanggalJatuhTempo: '20 Maret 2026',
    standLalu: 210,
    standKini: 242,
    pemakaianM3: 32,
    rincianBlok: {
      blok1M3: 10,
      blok1Tarif: 5200,
      blok1Total: 52000,
      blok2M3: 10,
      blok2Tarif: 7100,
      blok2Total: 71000,
      blok3M3: 12,
      blok3Tarif: 9500,
      blok3Total: 114000,
    },
    biayaAir: 237000,
    biayaPemeliharaanMeter: 15000,
    biayaAdministrasi: 5000,
    retribusi: 0,
    denda: 0,
    totalTagihan: 218400,
    status: 'LUNAS',
    tanggalBayar: '15 Maret 2026',
    metodeBayar: 'Bank BCA (Virtual Account)',
    noReferensi: 'BCA-8839201948',
  },
  {
    id: 'bill-10739182-032026',
    idPelanggan: '10739182',
    noSr: '183920',
    nama: 'Nabila Syahrani',
    alamat: 'Perumahan Lavon Swan City Cluster Allura No. 12, Pasar Kemis, Tangerang',
    golonganTarif: '2A3 - Rumah Tangga Atas (R4)',
    nomorMeter: 'AET-2609-8474',
    periodeBulan: 'Maret 2026',
    tanggalJatuhTempo: '20 Maret 2026',
    standLalu: 88,
    standKini: 102,
    pemakaianM3: 14,
    rincianBlok: {
      blok1M3: 10,
      blok1Tarif: 5200,
      blok1Total: 52000,
      blok2M3: 4,
      blok2Tarif: 7100,
      blok2Total: 28400,
      blok3M3: 0,
      blok3Tarif: 0,
      blok3Total: 0,
    },
    biayaAir: 80400,
    biayaPemeliharaanMeter: 12500,
    biayaAdministrasi: 5000,
    retribusi: 0,
    denda: 0,
    totalTagihan: 96500,
    status: 'BELUM LUNAS',
  },
];

class CloudSyncService {
  private isSyncing = false;
  private syncListeners: Array<() => void> = [];
  private lastSyncTime: Date | null = null;
  private isOnline = navigator.onLine;

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncNow();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
    window.addEventListener('focus', () => {
      this.syncNow();
    });
  }

  public getStatus() {
    return {
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      isOnline: this.isOnline,
    };
  }

  public addListener(cb: () => void) {
    this.syncListeners.push(cb);
    return () => {
      this.syncListeners = this.syncListeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.syncListeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.warn('Sync listener err:', err);
      }
    });
  }

  // Load local state snapshot
  public getLocalSnapshot(): CloudSyncPayload {
    let accounts: UserAccount[] = [];
    let registrations: RegistrationFormData[] = [];
    let trackingRecords: CustomerTrackingRecord[] = [];
    let bills: MonthlyBillRecord[] = [];
    let surveys: SurveySubmission[] = [];

    try {
      const accStr = localStorage.getItem('aetra_accounts');
      if (accStr) accounts = JSON.parse(accStr);
    } catch { accounts = []; }

    try {
      const regStr = localStorage.getItem('aetra_registrations');
      if (regStr) registrations = JSON.parse(regStr);
    } catch { registrations = []; }

    try {
      const trackStr = localStorage.getItem('aetra_tracking');
      if (trackStr) trackingRecords = JSON.parse(trackStr);
    } catch { trackingRecords = []; }

    try {
      const billStr = localStorage.getItem('aetra_customer_bills');
      if (billStr) bills = JSON.parse(billStr);
    } catch { bills = []; }

    try {
      const survStr = localStorage.getItem('aetra_surveys');
      if (survStr) surveys = JSON.parse(survStr);
    } catch { surveys = []; }

    if (!Array.isArray(accounts) || accounts.length === 0) {
      accounts = [
        {
          id: 'acc-admin',
          idPelanggan: '10999999',
          nama: 'Administrator Aetra Tangerang',
          email: 'admin@aetra.co.id',
          password: 'aetra123',
          role: 'admin',
          createdAt: new Date().toISOString(),
        },
      ];
    }

    if (!Array.isArray(registrations) || registrations.length === 0) {
      registrations = [...INITIAL_REGISTRATIONS];
    }

    if (!Array.isArray(trackingRecords) || trackingRecords.length === 0) {
      trackingRecords = [...INITIAL_TRACKING_DATABASE];
    }

    if (!Array.isArray(bills) || bills.length === 0) {
      bills = [...INITIAL_BILLS_DATA];
    }

    if (!Array.isArray(surveys) || surveys.length === 0) {
      surveys = [...INITIAL_SURVEY_RESPONSES];
    }

    return {
      version: 1,
      lastSync: new Date().toISOString(),
      accounts,
      registrations,
      trackingRecords,
      bills,
      surveys,
    };
  }

  // Save snapshot to local storage
  public saveLocalSnapshot(payload: Partial<CloudSyncPayload>) {
    if (payload.accounts) {
      localStorage.setItem('aetra_accounts', JSON.stringify(payload.accounts));
    }
    if (payload.registrations) {
      localStorage.setItem('aetra_registrations', JSON.stringify(payload.registrations));
    }
    if (payload.trackingRecords) {
      localStorage.setItem('aetra_tracking', JSON.stringify(payload.trackingRecords));
    }
    if (payload.bills) {
      localStorage.setItem('aetra_customer_bills', JSON.stringify(payload.bills));
    }
    if (payload.surveys) {
      localStorage.setItem('aetra_surveys', JSON.stringify(payload.surveys));
    }
  }

  // Pull latest from Cloud and merge with local data
  public async pullFromCloud(): Promise<CloudSyncPayload | null> {
    try {
      const resp = await fetch(MASTER_SYNC_URL, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (!resp.ok) return null;
      const json = await resp.json();
      if (!json || !json.data) return null;

      const remote = json.data as CloudSyncPayload;
      const local = this.getLocalSnapshot();

      // Merge Accounts: keep all unique accounts by email / idPelanggan
      const mergedAccounts = [...local.accounts];
      if (Array.isArray(remote.accounts)) {
        remote.accounts.forEach((ra) => {
          const idx = mergedAccounts.findIndex(
            (la) =>
              (ra.email && la.email && la.email.toLowerCase() === ra.email.toLowerCase()) ||
              (ra.idPelanggan && la.idPelanggan && la.idPelanggan === ra.idPelanggan)
          );
          if (idx >= 0) {
            mergedAccounts[idx] = { ...mergedAccounts[idx], ...ra };
          } else {
            mergedAccounts.push(ra);
          }
        });
      }

      // Merge Registrations: keep unique by noForm / id
      const mergedRegistrations = [...local.registrations];
      if (Array.isArray(remote.registrations)) {
        remote.registrations.forEach((rr) => {
          const idx = mergedRegistrations.findIndex(
            (lr) => lr.noForm === rr.noForm || (rr.id && lr.id === rr.id)
          );
          if (idx >= 0) {
            mergedRegistrations[idx] = { ...mergedRegistrations[idx], ...rr };
          } else {
            mergedRegistrations.unshift(rr);
          }
        });
      }

      // Merge Tracking: unique by noForm
      const mergedTracking = [...local.trackingRecords];
      if (Array.isArray(remote.trackingRecords)) {
        remote.trackingRecords.forEach((rt) => {
          const idx = mergedTracking.findIndex((lt) => lt.noForm === rt.noForm);
          if (idx >= 0) {
            mergedTracking[idx] = { ...mergedTracking[idx], ...rt };
          } else {
            mergedTracking.unshift(rt);
          }
        });
      }

      // Merge Bills: unique by idPelanggan + periodeBulan or id
      const mergedBills = [...local.bills];
      if (Array.isArray(remote.bills)) {
        remote.bills.forEach((rb) => {
          const idx = mergedBills.findIndex(
            (lb) =>
              (lb.id && rb.id && lb.id === rb.id) ||
              (lb.idPelanggan === rb.idPelanggan && lb.periodeBulan === rb.periodeBulan)
          );
          if (idx >= 0) {
            mergedBills[idx] = { ...mergedBills[idx], ...rb };
          } else {
            mergedBills.unshift(rb);
          }
        });
      }

      // Merge Surveys
      const mergedSurveys = [...local.surveys];
      if (Array.isArray(remote.surveys)) {
        remote.surveys.forEach((rs) => {
          const idx = mergedSurveys.findIndex((ls) => ls.id === rs.id);
          if (idx >= 0) {
            mergedSurveys[idx] = rs;
          } else {
            mergedSurveys.unshift(rs);
          }
        });
      }

      const mergedPayload: CloudSyncPayload = {
        version: 1,
        lastSync: new Date().toISOString(),
        accounts: mergedAccounts,
        registrations: mergedRegistrations,
        trackingRecords: mergedTracking,
        bills: mergedBills,
        surveys: mergedSurveys,
      };

      this.saveLocalSnapshot(mergedPayload);
      this.lastSyncTime = new Date();
      this.notify();
      return mergedPayload;
    } catch (err) {
      console.warn('Cloud pull error:', err);
      return null;
    }
  }

  // Push local data snapshot to Cloud
  public async pushToCloud(snapshot?: Partial<CloudSyncPayload>): Promise<boolean> {
    try {
      const current = this.getLocalSnapshot();
      const updated: CloudSyncPayload = {
        version: 1,
        lastSync: new Date().toISOString(),
        accounts: snapshot?.accounts || current.accounts,
        registrations: snapshot?.registrations || current.registrations,
        trackingRecords: snapshot?.trackingRecords || current.trackingRecords,
        bills: snapshot?.bills || current.bills,
        surveys: snapshot?.surveys || current.surveys,
      };

      const resp = await fetch(MASTER_SYNC_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: 'aetra_air_tangerang_production_sync',
          data: updated,
        }),
      });

      if (resp.ok) {
        this.saveLocalSnapshot(updated);
        this.lastSyncTime = new Date();
        this.notify();
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Cloud push error:', err);
      return false;
    }
  }

  // Fast single-record add helpers
  public async saveAccount(acc: UserAccount): Promise<void> {
    const current = this.getLocalSnapshot();
    const accounts = [...current.accounts];
    const idx = accounts.findIndex(
      (a) =>
        (a.email && acc.email && a.email.toLowerCase() === acc.email.toLowerCase()) ||
        (a.idPelanggan && acc.idPelanggan && a.idPelanggan === acc.idPelanggan)
    );
    if (idx >= 0) {
      accounts[idx] = { ...accounts[idx], ...acc };
    } else {
      accounts.push(acc);
    }
    this.saveLocalSnapshot({ accounts });
    this.pushToCloud({ accounts });
  }

  public async saveRegistration(reg: RegistrationFormData): Promise<void> {
    const current = this.getLocalSnapshot();
    const registrations = [...current.registrations];
    const idx = registrations.findIndex((r) => r.noForm === reg.noForm || r.id === reg.id);
    if (idx >= 0) {
      registrations[idx] = { ...registrations[idx], ...reg };
    } else {
      registrations.unshift(reg);
    }
    this.saveLocalSnapshot({ registrations });
    this.pushToCloud({ registrations });
  }

  public async saveTrackingRecord(track: CustomerTrackingRecord): Promise<void> {
    const current = this.getLocalSnapshot();
    const trackingRecords = [...current.trackingRecords];
    const idx = trackingRecords.findIndex((t) => t.noForm === track.noForm);
    if (idx >= 0) {
      trackingRecords[idx] = { ...trackingRecords[idx], ...track };
    } else {
      trackingRecords.unshift(track);
    }
    this.saveLocalSnapshot({ trackingRecords });
    this.pushToCloud({ trackingRecords });
  }

  public async saveTracking(track: CustomerTrackingRecord): Promise<void> {
    return this.saveTrackingRecord(track);
  }

  public async deleteRegistration(noForm: string): Promise<void> {
    const current = this.getLocalSnapshot();
    const registrations = current.registrations.filter((r) => r.noForm !== noForm);
    const trackingRecords = current.trackingRecords.filter((t) => t.noForm !== noForm);
    this.saveLocalSnapshot({ registrations, trackingRecords });
    this.pushToCloud({ registrations, trackingRecords });
  }

  public async saveSurvey(survey: SurveySubmission): Promise<void> {
    const current = this.getLocalSnapshot();
    const surveys = [survey, ...current.surveys.filter((s) => s.id !== survey.id)];
    this.saveLocalSnapshot({ surveys });
    this.pushToCloud({ surveys });
  }

  public async saveBills(bills: MonthlyBillRecord[]): Promise<void> {
    this.saveLocalSnapshot({ bills });
    this.pushToCloud({ bills });
  }

  public async saveSingleBill(bill: MonthlyBillRecord): Promise<void> {
    const current = this.getLocalSnapshot();
    const bills = [...current.bills];
    const idx = bills.findIndex((b) => b.id === bill.id || (b.idPelanggan === bill.idPelanggan && b.periodeBulan === bill.periodeBulan));
    if (idx >= 0) {
      bills[idx] = { ...bills[idx], ...bill };
    } else {
      bills.unshift(bill);
    }
    this.saveLocalSnapshot({ bills });
    this.pushToCloud({ bills });
  }

  public async deleteBill(billId: string): Promise<void> {
    const current = this.getLocalSnapshot();
    const bills = current.bills.filter((b) => b.id !== billId);
    this.saveLocalSnapshot({ bills });
    this.pushToCloud({ bills });
  }

  public async syncNow(): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.notify();
    try {
      await this.pullFromCloud();
    } finally {
      this.isSyncing = false;
      this.notify();
    }
  }

  // Auto-poll interval for live cross-device updates
  public startAutoSync(intervalMs = 8000) {
    this.syncNow();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        this.pullFromCloud();
      }
    }, intervalMs);
    return () => clearInterval(timer);
  }
}

export const cloudSyncService = new CloudSyncService();
