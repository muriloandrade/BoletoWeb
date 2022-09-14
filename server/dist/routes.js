"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const multer_2 = require("./config/multer");
const prisma_clients_repository_1 = require("./repositories/prisma/prisma-clients-repository");
const prisma_boletos_repository_1 = require("./repositories/prisma/prisma-boletos-repository");
const client_use_cases_1 = require("./use-cases/client-use-cases");
const boleto_use_cases_1 = require("./use-cases/boleto-use-cases");
const twilio_1 = __importDefault(require("twilio"));
const fs_1 = require("fs");
exports.routes = express_1.default.Router();
exports.routes.post("/addClient", async (req, res) => {
    const { id, client_name, emails } = req.body;
    const prismaClientsRepository = new prisma_clients_repository_1.PrismaClientsRepository();
    const addClientUseCase = new client_use_cases_1.AddClientUseCase(prismaClientsRepository);
    await addClientUseCase.execute({ id, client_name, emails });
    return res.status(201).send();
});
exports.routes.get("/getClients", async (req, res) => {
    const prismaClientsRepository = new prisma_clients_repository_1.PrismaClientsRepository();
    const getClientsUseCase = new client_use_cases_1.GetClientsUseCase(prismaClientsRepository);
    const clients = await getClientsUseCase.execute();
    return res.json(clients);
});
exports.routes.post("/getClient", async (req, res) => {
    const { id } = req.body;
    const prismaClientsRepository = new prisma_clients_repository_1.PrismaClientsRepository();
    const getClientUseCase = new client_use_cases_1.GetClientUseCase(prismaClientsRepository);
    const client = await getClientUseCase.execute(id);
    return res.json(client);
});
exports.routes.delete("/deleteClient", async (req, res) => {
    const { id } = req.body;
    const prismaClientsRepository = new prisma_clients_repository_1.PrismaClientsRepository();
    const deleteClientUseCase = new client_use_cases_1.DeleteClientUseCase(prismaClientsRepository);
    const result = await deleteClientUseCase.execute(id);
    return res.json(result);
});
exports.routes.post("/updateClient", async (req, res) => {
    const updatedClient = req.body;
    const prismaClientsRepository = new prisma_clients_repository_1.PrismaClientsRepository();
    const updateClientUseCase = new client_use_cases_1.UpdateClientUseCase(prismaClientsRepository);
    await updateClientUseCase.execute(updatedClient);
    return res.status(201).send();
});
exports.routes.get("/getBoletos", async (req, res) => {
    const prismaBoletosRepository = new prisma_boletos_repository_1.PrismaBoletosRepository();
    const getBoletosUseCase = new boleto_use_cases_1.GetBoletosUseCase(prismaBoletosRepository);
    const boletos = await getBoletosUseCase.execute();
    return res.json(boletos);
});
exports.routes.get("/getBoletosForToday", async (req, res) => {
    const prismaBoletosRepository = new prisma_boletos_repository_1.PrismaBoletosRepository();
    const getBoletosForTodayUseCase = new boleto_use_cases_1.GetBoletosForTodayUseCase(prismaBoletosRepository);
    const boletos = await getBoletosForTodayUseCase.execute();
    return res.json(boletos);
});
exports.routes.get("/getBoletosSentInDate", async (req, res) => {
    const date = new Date(Date.parse(req.query.date));
    const prismaBoletosRepository = new prisma_boletos_repository_1.PrismaBoletosRepository();
    const getBoletosSentInDateUseCase = new boleto_use_cases_1.GetBoletosSentInDateUseCase(prismaBoletosRepository);
    const boletos = await getBoletosSentInDateUseCase.execute(date);
    return res.json(boletos);
});
exports.routes.get("/getBoletosSentDates", async (req, res) => {
    const prismaBoletosRepository = new prisma_boletos_repository_1.PrismaBoletosRepository();
    const getBoletosSentDatesUseCase = new boleto_use_cases_1.GetBoletosSentDatesUseCase(prismaBoletosRepository);
    const boletos = await getBoletosSentDatesUseCase.execute();
    return res.json(boletos);
});
exports.routes.delete("/deleteBoleto", async (req, res) => {
    const { id } = req.body;
    const prismaBoletosRepository = new prisma_boletos_repository_1.PrismaBoletosRepository();
    const deleteBoletoUseCase = new boleto_use_cases_1.DeleteBoletoUseCase(prismaBoletosRepository);
    const result = await deleteBoletoUseCase.execute(id);
    return res.json(result);
});
exports.routes.delete("/deleteManyBoletos", async (req, res) => {
    const { boletos } = req.body;
    const prismaBoletosRepository = new prisma_boletos_repository_1.PrismaBoletosRepository();
    const deleteManyBoletosUseCase = new boleto_use_cases_1.DeleteManyBoletosUseCase(prismaBoletosRepository);
    const result = await deleteManyBoletosUseCase.execute(boletos);
    return res.json(result);
});
exports.routes.post("/updateBoleto", async (req, res) => {
    const updatedBoleto = req.body;
    const prismaBoletosRepository = new prisma_boletos_repository_1.PrismaBoletosRepository();
    const updateBoletoUseCase = new boleto_use_cases_1.UpdateBoletoUseCase(prismaBoletosRepository);
    await updateBoletoUseCase.execute(updatedBoleto);
    return res.status(201).send();
});
exports.routes.post("/addBoleto", (0, multer_1.default)(multer_2.multerConfig).single("file"), async (req, res) => {
    if (req.file) {
        const prismaBoletosRepository = new prisma_boletos_repository_1.PrismaBoletosRepository();
        const addBoletoUseCase = new boleto_use_cases_1.AddBoletoUseCase(prismaBoletosRepository);
        try {
            await addBoletoUseCase.execute(req.file);
            return res.status(201).send();
        }
        catch (e) {
            return res.status(400).send(e.message);
        }
    }
    else {
        return res.status(400).send("Multer error: Formato de arquivo inválido");
    }
});
exports.routes.post("/sendEmail", async (req, res) => {
    const boletoToSend = req.body;
    const prismaClientsRepository = new prisma_clients_repository_1.PrismaClientsRepository();
    const prismaBoletosRepository = new prisma_boletos_repository_1.PrismaBoletosRepository();
    const sendEmailUseCase = new boleto_use_cases_1.SendEmailUseCase(prismaClientsRepository, prismaBoletosRepository);
    try {
        const result = await sendEmailUseCase.execute(boletoToSend);
        return res.status(201).json({ result });
    }
    catch (error) {
        return res.status(502).json(error);
    }
});
exports.routes.get("/sendWhatsApp", async (req, res) => {
    const accountSid = process.env.ACCOUNT_SID;
    const authToken = process.env.AUTH_TOKEN;
    const client = (0, twilio_1.default)(accountSid, authToken);
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
    }
    catch (e) {
        res.json(e);
    }
});
exports.routes.get("/pdfFile", (req, res) => {
    const { filename } = req.query;
    var data = (0, fs_1.readFileSync)(`./tmp/uploads/${filename}.pdf`);
    res.contentType("application/pdf");
    res.send(data);
});
