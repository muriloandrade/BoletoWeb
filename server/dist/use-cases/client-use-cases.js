"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteClientUseCase = exports.UpdateClientUseCase = exports.AddClientUseCase = exports.GetClientUseCase = exports.GetClientsUseCase = void 0;
class GetClientsUseCase {
    constructor(clientsRepository) {
        this.clientsRepository = clientsRepository;
    }
    async execute() {
        return await this.clientsRepository.getAll();
    }
}
exports.GetClientsUseCase = GetClientsUseCase;
class GetClientUseCase {
    constructor(clientsRepository) {
        this.clientsRepository = clientsRepository;
    }
    async execute(id) {
        return await this.clientsRepository.get(id);
    }
}
exports.GetClientUseCase = GetClientUseCase;
class AddClientUseCase {
    constructor(clientsRepository) {
        this.clientsRepository = clientsRepository;
    }
    async execute(request) {
        const { id, client_name, emails } = request;
        await this.clientsRepository.addNew({ id, client_name, emails });
    }
}
exports.AddClientUseCase = AddClientUseCase;
class UpdateClientUseCase {
    constructor(clientsRepository) {
        this.clientsRepository = clientsRepository;
    }
    async execute(request) {
        const updatedClient = request;
        await this.clientsRepository.update(updatedClient);
    }
}
exports.UpdateClientUseCase = UpdateClientUseCase;
class DeleteClientUseCase {
    constructor(clientsRepository) {
        this.clientsRepository = clientsRepository;
    }
    async execute(id) {
        await this.clientsRepository.delete(id);
    }
}
exports.DeleteClientUseCase = DeleteClientUseCase;
