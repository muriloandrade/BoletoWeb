import { ClientsRepository } from "../repositories/clients.repository";

interface AddClientUseCaseRequest {
  id: string;
  client_name: string;
  emails: string[];
}

interface UpdateClientUseCaseRequest {
  id: string;
  client_name: string;
  emails: string[];
}

interface DeleteClientUseCaseRequest {
  id: string;
  client_name: string;
  emails: string[];
}

export class GetClientsUseCase {
  constructor(private clientsRepository: ClientsRepository) {}

  async execute() {
    return await this.clientsRepository.getAll();
  }
}

export class GetClientUseCase {
  constructor(private clientsRepository: ClientsRepository) {}

  async execute(id: string) {
    return await this.clientsRepository.get(id);
  }
}

export class AddClientUseCase {
  constructor(private clientsRepository: ClientsRepository) {}

  async execute(request: AddClientUseCaseRequest) {
    const { id, client_name, emails } = request;

    await this.clientsRepository.addNew({ id, client_name, emails });
  }
}

export class UpdateClientUseCase {
  constructor(private clientsRepository: ClientsRepository) {}

  async execute(request: UpdateClientUseCaseRequest) {
    const updatedClient = request;
    await this.clientsRepository.update(updatedClient);
  }
}

export class DeleteClientUseCase {
  constructor(private clientsRepository: ClientsRepository) {}

  async execute(id: string) {
    await this.clientsRepository.delete(id);
  }
}
