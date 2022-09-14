"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaBoletosRepository = void 0;
const lodash_1 = __importDefault(require("lodash"));
const prisma_1 = require("../../prisma");
class PrismaBoletosRepository {
    async addNew(boleto) {
        await prisma_1.prisma.boleto
            .create({
            data: boleto,
        })
            .catch((error) => {
            if (error.code === "P2002")
                throw new Error("Arquivo já existente");
        });
    }
    async getAll() {
        return await prisma_1.prisma.boleto.findMany({
            include: {
                client: true,
            },
        });
    }
    async getForToday() {
        return await prisma_1.prisma.boleto.findMany({
            where: {
                OR: [
                    {
                        status: {
                            equals: "AWAITING",
                        },
                    },
                    {
                        status: {
                            equals: "ERROR",
                        },
                    },
                    {
                        AND: [
                            { status: { equals: "SENT" } },
                            { sent_at: { equals: new Date() } },
                        ],
                    },
                ],
            },
            include: {
                client: true,
            },
        });
    }
    async getSentInDate(date) {
        return await prisma_1.prisma.boleto.findMany({
            where: {
                AND: [
                    {
                        status: {
                            equals: "SENT",
                        },
                    },
                    {
                        sent_at: {
                            equals: date,
                        },
                    },
                ],
            },
            include: {
                client: true,
            },
        });
    }
    async getSentDates() {
        return await prisma_1.prisma.boleto.groupBy({
            by: ['sent_at'],
            where: {
                NOT: [{ sent_at: null }],
            },
            orderBy: {
                sent_at: 'desc',
            }
        });
    }
    async delete(id) {
        return await prisma_1.prisma.boleto.delete({
            where: { id: id },
        });
    }
    async deleteMany(boletos) {
        const boletosIds = boletos.map((boleto) => {
            return lodash_1.default.pick(boleto, ["id"]);
        });
        return await prisma_1.prisma.boleto.deleteMany({
            where: {
                OR: boletosIds,
            },
        });
    }
    async update(updatedBoleto) {
        await prisma_1.prisma.boleto.update({
            where: {
                id: updatedBoleto.id,
            },
            data: {
                ...updatedBoleto,
                client_id: updatedBoleto.cnpj,
            },
        });
    }
}
exports.PrismaBoletosRepository = PrismaBoletosRepository;
