"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendEmailUseCase = exports.UpdateBoletoUseCase = exports.DeleteManyBoletosUseCase = exports.DeleteBoletoUseCase = exports.AddBoletoUseCase = exports.GetBoletosSentDatesUseCase = exports.GetBoletosSentInDateUseCase = exports.GetBoletosForTodayUseCase = exports.GetBoletosUseCase = void 0;
const client_1 = require("@prisma/client");
const pdf_js_extract_1 = require("pdf.js-extract");
const md5_file_1 = __importDefault(require("md5-file"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const model_1 = require("../model");
class GetBoletosUseCase {
    constructor(boletosRepository) {
        this.boletosRepository = boletosRepository;
    }
    async execute() {
        return await this.boletosRepository.getAll();
    }
}
exports.GetBoletosUseCase = GetBoletosUseCase;
class GetBoletosForTodayUseCase {
    constructor(boletosRepository) {
        this.boletosRepository = boletosRepository;
    }
    async execute() {
        return await this.boletosRepository.getForToday();
    }
}
exports.GetBoletosForTodayUseCase = GetBoletosForTodayUseCase;
class GetBoletosSentInDateUseCase {
    constructor(boletosRepository) {
        this.boletosRepository = boletosRepository;
    }
    async execute(date) {
        return await this.boletosRepository.getSentInDate(date);
    }
}
exports.GetBoletosSentInDateUseCase = GetBoletosSentInDateUseCase;
class GetBoletosSentDatesUseCase {
    constructor(boletosRepository) {
        this.boletosRepository = boletosRepository;
    }
    async execute() {
        return await this.boletosRepository.getSentDates();
    }
}
exports.GetBoletosSentDatesUseCase = GetBoletosSentDatesUseCase;
class AddBoletoUseCase {
    constructor(boletosRepository) {
        this.boletosRepository = boletosRepository;
    }
    async execute(file) {
        const { cnpj, notaFiscal } = await getDataFromPDF(file.path);
        const boleto = {
            id: md5_file_1.default.sync(file.path),
            filename: file.filename,
            filepath: file.path,
            nf: notaFiscal,
            cnpj: cnpj,
        };
        if (!boleto.cnpj)
            throw new Error("Formato de arquivo inválido");
        await this.boletosRepository.addNew(boleto);
    }
}
exports.AddBoletoUseCase = AddBoletoUseCase;
class DeleteBoletoUseCase {
    constructor(boletosRepository) {
        this.boletosRepository = boletosRepository;
    }
    async execute(id) {
        await this.boletosRepository.delete(id);
    }
}
exports.DeleteBoletoUseCase = DeleteBoletoUseCase;
class DeleteManyBoletosUseCase {
    constructor(boletosRepository) {
        this.boletosRepository = boletosRepository;
    }
    async execute(boletos) {
        await this.boletosRepository.deleteMany(boletos);
    }
}
exports.DeleteManyBoletosUseCase = DeleteManyBoletosUseCase;
class UpdateBoletoUseCase {
    constructor(boletosRepository) {
        this.boletosRepository = boletosRepository;
    }
    async execute(updatedBoleto) {
        await this.boletosRepository.update(updatedBoleto);
    }
}
exports.UpdateBoletoUseCase = UpdateBoletoUseCase;
class SendEmailUseCase {
    constructor(clientsRepository, boletosRepository) {
        this.clientsRepository = clientsRepository;
        this.boletosRepository = boletosRepository;
    }
    async execute(boletoToSend) {
        if (boletoToSend.client_id) {
            try {
                const client = await this.clientsRepository.get(boletoToSend.client_id);
                if (client) {
                    const answer = await sendEmail(boletoToSend, client);
                    const boletoSent = {
                        ...boletoToSend,
                        status: client_1.Status.SENT,
                        sent_at: new Date(),
                        sent_to: answer.accepted,
                    };
                    await this.boletosRepository.update(boletoSent);
                    return boletoSent;
                }
                else
                    throw new Error("Não foi possível obter o cliente do boleto: " +
                        boletoToSend.filename);
            }
            catch (error) {
                console.log("ERRO: " + JSON.stringify(error));
                const boletoError = {
                    ...boletoToSend,
                    status: client_1.Status.ERROR,
                };
                await this.boletosRepository.update(boletoError);
                throw new Error("Erro de conexão");
            }
        }
        else {
            throw new Error("Cliente nao cadastrado p/ o boleto: " + boletoToSend.filename);
        }
    }
}
exports.SendEmailUseCase = SendEmailUseCase;
async function getDataFromPDF(file) {
    let cnpj = "";
    let notaFiscal = "0";
    const idRegex = /([0-9]{2}[\.][0-9]{3}[\.][0-9]{3}[\/][0-9]{4}[\-][0-9]{2})|([0-9]{3}[\.][0-9]{3}[\.][0-9]{3}[\-][0-9]{2})/;
    const pdfExtract = new pdf_js_extract_1.PDFExtract();
    try {
        const data = await pdfExtract.extract(file);
        const page = data.pages[0].content;
        page.forEach((item) => {
            if (idRegex.test(item.str)) {
                if (!item.str.match(String(process.env.CNPJ_IGNORE)))
                    cnpj = item.str;
            }
            if (notaFiscal == "0000") {
                // Possiveis valores: 12345, 12345/1, 12345/2, etc
                if (item.str.indexOf("/") > 0)
                    item.str = item.str.substring(0, item.str.indexOf("/"));
                // Confirma que o valor encontrado eh um numero
                if (item.str != "" && !isNaN(item.str))
                    notaFiscal = item.str;
            }
            // Setar 0000 significa que o proximo item sera o numero da NF
            if (item.str.includes("Núm. do documento"))
                notaFiscal = "0000";
        });
    }
    catch (error) {
        error.message = "Erro na leitura do arquivo " + file;
        throw error;
    }
    return { cnpj, notaFiscal };
}
const transporter = nodemailer_1.default.createTransport({
    port: process.env.TRANSP_PORT,
    host: process.env.TRANSP_HOST,
    secure: process.env.TRANSP_SECURE,
    auth: {
        user: process.env.TRANSP_AUTH_USER,
        pass: process.env.TRANSP_AUTH_PASSWORD,
    },
    pool: true,
});
async function sendEmail(boleto, client) {
    var mailOptions = {
        name: process.env.MAIL_OPT_NAME,
        from: process.env.MAIL_OPT_FROM,
        // to: client.emails,
        to: ["muriloap.info.marta@gmail.com"],
        bcc: process.env.MAIL_OPT_FROM,
        subject: `${process.env.MAIL_OPT_SUBJECT} - ${client.client_name.toUpperCase()} - NF: ${boleto.nf}`,
        html: model_1.html,
        dsn: {
            id: boleto.id,
            return: "headers",
            notify: ["success", "failure"],
            recipient: process.env.MAIL_OPT_FROM,
        },
        headers: {
            "Return-Receipt-To": `${process.env.MAIL_OPT_FROM}`,
            "Disposition-Notification-To": `${process.env.MAIL_OPT_FROM}`,
        },
        attachments: [
            {
                filename: boleto.filename,
                path: boleto.filepath,
            },
        ],
    };
    return await transporter.sendMail(mailOptions);
}
