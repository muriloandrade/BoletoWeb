import { Client } from "@prisma/client";

export interface ClientData {
  id: string;
  client_name: string;
  emails?: string[];
}

export interface ClientsRepository {
  addNew: (data: ClientData) => Promise<void>;
  getAll: () => Promise<Client[]>;
  get: (id: string) => Promise<Client | null>;
  delete: (id: string) => Promise<Client>;
  update: (data: ClientData) => Promise<void>;
}