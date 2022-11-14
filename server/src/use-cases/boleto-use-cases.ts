import { Boleto, Client, Status } from "@prisma/client";
import { BoletosRepository } from "../repositories/boletos.repository";
import { PDFExtract } from "pdf.js-extract";
import md5File from "md5-file";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { ClientsRepository } from "../repositories/clients.repository";
import Mail from "nodemailer/lib/mailer";
import _ from "lodash";
import { html } from "../model";
import twilio from "twilio";

interface UpdateBoletoUseCaseRequest {
  id: string;
  filename: string;
  filepath: string;
  nf: string;
  client_id?: string;
  cnpj: string;
  status: string;
  sent_at: Date;
  sent_to: string[];
}

interface AddBoletoUseCaseRequest {
  id: string;
  filename: string;
  filepath: string;
  nf: string;
  cnpj: string;
}

export class GetBoletosUseCase {
  constructor(private boletosRepository: BoletosRepository) {}

  async execute() {
    return await this.boletosRepository.getAll();
  }
}

export class GetBoletosForTodayUseCase {
  constructor(private boletosRepository: BoletosRepository) {}

  async execute() {
    return await this.boletosRepository.getForToday();
  }
}

export class GetBoletosSentInDateUseCase {
  constructor(private boletosRepository: BoletosRepository) {}

  async execute(date: Date) {
    return await this.boletosRepository.getSentInDate(date);
  }
}

export class GetBoletosSentDatesUseCase {
  constructor(private boletosRepository: BoletosRepository) {}

  async execute() {
    return await this.boletosRepository.getSentDates();
  }
}

export class AddBoletoUseCase {
  constructor(private boletosRepository: BoletosRepository) {}

  async execute(file: Express.Multer.File) {
    const { cnpj, notaFiscal } = await getDataFromPDF(file.path);

    const boleto: AddBoletoUseCaseRequest = {
      id: md5File.sync(file.path),
      filename: file.filename,
      filepath: file.path,
      nf: notaFiscal,
      cnpj: cnpj,
    };

    if (!boleto.cnpj) throw new Error("Formato de arquivo inválido");

    await this.boletosRepository.addNew(boleto);
  }
}

export class DeleteBoletoUseCase {
  constructor(private boletosRepository: BoletosRepository) {}

  async execute(id: string) {
    await this.boletosRepository.delete(id);
  }
}

export class DeleteManyBoletosUseCase {
  constructor(private boletosRepository: BoletosRepository) {}

  async execute(boletos: Boleto[]) {
    await this.boletosRepository.deleteMany(boletos);
  }
}

export class UpdateBoletoUseCase {
  constructor(private boletosRepository: BoletosRepository) {}

  async execute(updatedBoleto: Boleto) {
    await this.boletosRepository.update(updatedBoleto);
  }
}

export class SendEmailUseCase {
  constructor(
    private clientsRepository: ClientsRepository,
    private boletosRepository: BoletosRepository
  ) {}

  async execute(boletoToSend: Boleto) {
    if (boletoToSend.client_id) {
      try {
        const client = await this.clientsRepository.get(boletoToSend.client_id);
        if (client) {
          const answer = await sendEmail(boletoToSend, client);
          const boletoSent = {
            ...boletoToSend,
            status: Status.SENT,
            sent_at: new Date(),
            sent_to: answer.accepted as string[],
          };
          await this.boletosRepository.update(boletoSent);
          return boletoSent;
        } else
          throw new Error(
            "Não foi possível obter o cliente do boleto: " +
              boletoToSend.filename
          );
      } catch (error) {
        console.log("ERRO: " + JSON.stringify(error));
        const boletoError = {
          ...boletoToSend,
          status: Status.ERROR,
        };
        await this.boletosRepository.update(boletoError);
        throw new Error("Erro de conexão");
      }
    } else {
      throw new Error(
        "Cliente nao cadastrado p/ o boleto: " + boletoToSend.filename
      );
    }
  }
}

async function getDataFromPDF(file: string) {
  let cnpj = "";
  let notaFiscal = "0";
  const idRegex =
    /([0-9]{2}[\.][0-9]{3}[\.][0-9]{3}[\/][0-9]{4}[\-][0-9]{2})|([0-9]{3}[\.][0-9]{3}[\.][0-9]{3}[\-][0-9]{2})/;
  const pdfExtract = new PDFExtract();

  try {
    const data = await pdfExtract.extract(file);
    const page = data.pages[0].content;
    page.forEach((item) => {
      if (idRegex.test(item.str)) {
        if (!item.str.match(String(process.env.CNPJ_IGNORE))) cnpj = item.str;
      }
      if (notaFiscal == "0000") {
        // Possiveis valores: 12345, 12345/1, 12345/2, etc
        if (item.str.indexOf("/") > 0)
          item.str = item.str.substring(0, item.str.indexOf("/"));
        // Confirma que o valor encontrado eh um numero
        if (item.str != "" && !isNaN(item.str as any)) notaFiscal = item.str;
      }

      // Setar 0000 significa que o proximo item sera o numero da NF
      if (item.str.includes("Núm. do documento")) notaFiscal = "0000";
    });
  } catch (error: any) {
    error.message = "Erro na leitura do arquivo " + file;
    throw error;
  }
  return { cnpj, notaFiscal };
}

const transporter = nodemailer.createTransport({
  name: process.env.MAIL_OPT_FROM,
  port: process.env.TRANSP_PORT,
  host: process.env.TRANSP_HOST,
  secure: process.env.TRANSP_SECURE,
  auth: {
    user: process.env.TRANSP_AUTH_USER,
    pass: process.env.TRANSP_AUTH_PASSWORD,
  },
  pool: true,
} as SMTPTransport.Options);

async function sendEmail(
  boleto: Boleto,
  client: Client
): Promise<SMTPTransport.SentMessageInfo> {

  var mailOptions = {
    name: process.env.MAIL_OPT_NAME,
    from: process.env.MAIL_OPT_FROM,
    to: client.emails,
    // to: ["muriloap.info@gmail.com"],
    bcc: process.env.MAIL_OPT_FROM,
    subject: `${
      process.env.MAIL_OPT_SUBJECT
    } - ${client.client_name.toUpperCase()} - NF: ${boleto.nf}`,
    html,
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

  return await transporter.sendMail(mailOptions as Mail.Options);
}

