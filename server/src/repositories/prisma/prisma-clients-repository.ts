import { prisma } from "../../prisma";
import { ClientData, ClientsRepository } from "./../clients.repository";

export class PrismaClientsRepository implements ClientsRepository {
  async addNew({ id, client_name, emails }: ClientData) {
    await prisma.client.create({
      data: {
        id,
        client_name,
        emails,
      },
    });
  }

  async getAll() {
    return await prisma.client.findMany();
  }

  async get(id: string) {
    return await prisma.client.findUnique({ where: { id: id } });
  }

  async delete(id: string) {
    return await prisma.client.delete({
      where: { id: id },
    });
  }

  async update(data: ClientData) {
    await prisma.client.update({
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
