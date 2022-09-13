import { Boleto, Prisma } from "@prisma/client";

export interface BoletoData {
  id: string;
  filename: string;
  filepath: string;
  nf: string;
  client_id?: string;
  cnpj: string;
  status: BoletoStatus;
  sent_at: Date;
  sent_to: string[];
}

export interface AddBoletoData {
  id: string;
  filename: string;
  filepath: string;
  nf: string;
  cnpj: string;
}

enum BoletoStatus {
  AWAITING = "AWAITING",
  SENT = "SENT",
  ERROR = "ERROR",
}

export interface BoletosRepository {
  addNew: (boleto: AddBoletoData) => Promise<void>;
  getAll: () => Promise<Boleto[]>;
  getForToday: () => Promise<Boleto[]>;
  getSentInDate: (date: Date) => Promise<Boleto[]>;
  getSentDates: () => Promise<{ sent_at: Date | null; }[]>;
  delete: (id: string) => Promise<Boleto>;  
  deleteMany: (boletos: Boleto[]) => Promise<Prisma.BatchPayload>;
  update: (updatedBoleto: Boleto) => Promise<void>;
}


