import _ from "lodash";
import { Boleto } from "@prisma/client";
import { prisma } from "../../prisma";
import { AddBoletoData, BoletosRepository } from "./../boletos.repository";

export class PrismaBoletosRepository implements BoletosRepository {
  async addNew(boleto: AddBoletoData) {
    await prisma.boleto
      .create({
        data: boleto,
      })
      .catch((error) => {
        if (error.code === "P2002") throw new Error("Arquivo já existente");
      });
  }

  async getAll() {
    return await prisma.boleto.findMany({
      include: {
        client: true,
      },
    });
  }

  async getForToday() {
    return await prisma.boleto.findMany({
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

  async getSentInDate(date: Date) {
    return await prisma.boleto.findMany({
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
    return await prisma.boleto.groupBy({
      by: ['sent_at'],
      where: {
        NOT: [{ sent_at: null }],
      },
      orderBy: {
        sent_at: 'desc',
      }
    });
  }

  async delete(id: string) {
    return await prisma.boleto.delete({
      where: { id: id },
    });
  }

  async deleteMany(boletos: Boleto[]) {
    const boletosIds = boletos.map((boleto) => {
      return _.pick(boleto, ["id"]);
    });

    return await prisma.boleto.deleteMany({
      where: {
        OR: boletosIds,
      },
    });
  }

  async update(updatedBoleto: Boleto) {
    await prisma.boleto.update({
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
