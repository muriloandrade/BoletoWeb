import express from "express";
import multer, { Multer } from "multer";
import { multerConfig } from "./config/multer";
import { PrismaClientsRepository } from "./repositories/prisma/prisma-clients-repository";
import { PrismaBoletosRepository } from "./repositories/prisma/prisma-boletos-repository";
import {
  GetClientsUseCase,
  AddClientUseCase,
  UpdateClientUseCase,
  DeleteClientUseCase,
  GetClientUseCase,
} from "./use-cases/client-use-cases";
import {
  AddBoletoUseCase,
  DeleteBoletoUseCase,
  DeleteManyBoletosUseCase,
  GetBoletosForTodayUseCase as GetBoletosForTodayUseCase,
  GetBoletosSentDatesUseCase,
  GetBoletosSentInDateUseCase,
  GetBoletosUseCase,
  SendEmailUseCase,
  UpdateBoletoUseCase,
} from "./use-cases/boleto-use-cases";
import twilio from "twilio";
import { readFileSync } from "fs";

export const routes = express.Router();

routes.post("/addClient", async (req, res) => {
  const { id, client_name, emails } = req.body;

  const prismaClientsRepository = new PrismaClientsRepository();
  const addClientUseCase = new AddClientUseCase(prismaClientsRepository);
  await addClientUseCase.execute({ id, client_name, emails });

  return res.status(201).send();
});

routes.get("/getClients", async (req, res) => {
  const prismaClientsRepository = new PrismaClientsRepository();
  const getClientsUseCase = new GetClientsUseCase(prismaClientsRepository);
  const clients = await getClientsUseCase.execute();

  return res.json(clients);
});

routes.post("/getClient", async (req, res) => {
  const { id } = req.body;

  const prismaClientsRepository = new PrismaClientsRepository();
  const getClientUseCase = new GetClientUseCase(prismaClientsRepository);
  const client = await getClientUseCase.execute(id);

  return res.json(client);
});

routes.delete("/deleteClient", async (req, res) => {
  const { id } = req.body;

  const prismaClientsRepository = new PrismaClientsRepository();
  const deleteClientUseCase = new DeleteClientUseCase(prismaClientsRepository);
  const result = await deleteClientUseCase.execute(id);

  return res.json(result);
});

routes.post("/updateClient", async (req, res) => {
  const updatedClient = req.body;

  const prismaClientsRepository = new PrismaClientsRepository();
  const updateClientUseCase = new UpdateClientUseCase(prismaClientsRepository);
  await updateClientUseCase.execute(updatedClient);

  return res.status(201).send();
});

routes.get("/getBoletos", async (req, res) => {
  const prismaBoletosRepository = new PrismaBoletosRepository();
  const getBoletosUseCase = new GetBoletosUseCase(prismaBoletosRepository);
  const boletos = await getBoletosUseCase.execute();

  return res.json(boletos);
});

routes.get("/getBoletosForToday", async (req, res) => {
  const prismaBoletosRepository = new PrismaBoletosRepository();
  const getBoletosForTodayUseCase = new GetBoletosForTodayUseCase(
    prismaBoletosRepository
  );
  const boletos = await getBoletosForTodayUseCase.execute();

  return res.json(boletos);
});

routes.get("/getBoletosSentInDate", async (req, res) => {
  const date = new Date(Date.parse(req.query.date as string));

  const prismaBoletosRepository = new PrismaBoletosRepository();
  const getBoletosSentInDateUseCase = new GetBoletosSentInDateUseCase(
    prismaBoletosRepository
  );
  const boletos = await getBoletosSentInDateUseCase.execute(date);

  return res.json(boletos);
});

routes.get("/getBoletosSentDates", async (req, res) => {
  const prismaBoletosRepository = new PrismaBoletosRepository();
  const getBoletosSentDatesUseCase = new GetBoletosSentDatesUseCase(
    prismaBoletosRepository
  );
  const boletos = await getBoletosSentDatesUseCase.execute();

  return res.json(boletos);
});

routes.delete("/deleteBoleto", async (req, res) => {
  const { id } = req.body;

  const prismaBoletosRepository = new PrismaBoletosRepository();
  const deleteBoletoUseCase = new DeleteBoletoUseCase(prismaBoletosRepository);
  const result = await deleteBoletoUseCase.execute(id);

  return res.json(result);
});

routes.delete("/deleteManyBoletos", async (req, res) => {
  const { boletos } = req.body;

  const prismaBoletosRepository = new PrismaBoletosRepository();
  const deleteManyBoletosUseCase = new DeleteManyBoletosUseCase(
    prismaBoletosRepository
  );
  const result = await deleteManyBoletosUseCase.execute(boletos);

  return res.json(result);
});

routes.post("/updateBoleto", async (req, res) => {
  const updatedBoleto = req.body;

  const prismaBoletosRepository = new PrismaBoletosRepository();
  const updateBoletoUseCase = new UpdateBoletoUseCase(prismaBoletosRepository);
  await updateBoletoUseCase.execute(updatedBoleto);

  return res.status(201).send();
});

routes.post(
  "/addBoleto",
  multer(multerConfig).single("file"),
  async (req, res) => {
    if (req.file) {
      const prismaBoletosRepository = new PrismaBoletosRepository();
      const addBoletoUseCase = new AddBoletoUseCase(prismaBoletosRepository);
      try {
        await addBoletoUseCase.execute(req.file);
        return res.status(201).send();
      } catch (e) {
        return res.status(400).send((e as Error).message);
      }
    } else {
      return res.status(400).send("Multer error: Formato de arquivo inválido");
    }
  }
);

routes.post("/sendEmail", async (req, res) => {
  const boletoToSend = req.body;

  const prismaClientsRepository = new PrismaClientsRepository();
  const prismaBoletosRepository = new PrismaBoletosRepository();

  const sendEmailUseCase = new SendEmailUseCase(
    prismaClientsRepository,
    prismaBoletosRepository
  );

  try {
    const result = await sendEmailUseCase.execute(boletoToSend);
    return res.status(201).json({ result });
  } catch (error) {
    return res.status(502).json(error);
  }
});

routes.get("/sendWhatsApp", async (req, res) => {
  const accountSid = process.env.ACCOUNT_SID;
  const authToken = process.env.AUTH_TOKEN;

  const client = twilio(accountSid, authToken);

  try {
    const message = await client.messages.create({
      mediaUrl: [
        `${process.env.SERVER_URL}/pdfFile?filename=Boleto_CALVASLTDAME`,
        // "https://images.unsplash.com/photo-1545093149-618ce3bcf49d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=668&q=80",
      ],
      from: "whatsapp:+14155238886",
      to: "whatsapp:+5516981100407",
    });
    return res.json(message.sid);
  } catch (e) {
    res.json(e);
  }
});

routes.get("/pdfFile", (req, res) => {
  const { filename } = req.query;

  var data = readFileSync(`../tmp/${filename}.pdf`);
  res.contentType("application/pdf");
  res.send(data);
});
