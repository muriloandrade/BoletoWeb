"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaClientsRepository = void 0;
const prisma_1 = require("../../prisma");
class PrismaClientsRepository {
    async addNew({ id, client_name, emails }) {
        await prisma_1.prisma.client.create({
            data: {
                id,
                client_name,
                emails,
            },
        });
    }
    async getAll() {
        return await prisma_1.prisma.client.findMany();
    }
    async get(id) {
        return await prisma_1.prisma.client.findUnique({ where: { id: id } });
    }
    async delete(id) {
        return await prisma_1.prisma.client.delete({
            where: { id: id },
        });
    }
    async update(data) {
        await prisma_1.prisma.client.update({
            where: {
                id: data.id,
            },
            data: {
                id: data.id,
                client_name: data.client_name,
                emails: data.emails,
            },
        });
    }
}
exports.PrismaClientsRepository = PrismaClientsRepository;
