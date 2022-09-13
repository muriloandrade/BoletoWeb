-- CreateEnum
CREATE TYPE "Status" AS ENUM ('AWAITING', 'SENT', 'RESENT', 'ERROR');

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "emails" TEXT[],

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boletos" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "nf" TEXT NOT NULL,
    "client_id" TEXT,
    "cnpj" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT E'AWAITING',
    "sent_at" TIMESTAMP(3)[],
    "sent_to" TEXT[],

    CONSTRAINT "boletos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_id_key" ON "clients"("id");

-- AddForeignKey
ALTER TABLE "boletos" ADD CONSTRAINT "boletos_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Whenever a new client is created, the corresponding client.id is copyied to boletos.client_id
CREATE OR REPLACE FUNCTION new_client_updt_boleto_clientid() RETURNS trigger AS
'
BEGIN
	UPDATE boletos
	SET client_id = NEW.id
	WHERE cnpj = NEW.id;
	RETURN NEW;
END;
'
LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER new_client AFTER INSERT ON clients
	FOR EACH ROW EXECUTE FUNCTION new_client_updt_boleto_clientid();

-- Whenever a new boleto is created, the corresponding client.id (if exists) is copyied to boletos.client_id
CREATE OR REPLACE FUNCTION new_boleto_updt_boleto_clientid() RETURNS trigger AS
'
DECLARE
selected_client clients%rowtype;
BEGIN
    SELECT * FROM clients
    INTO selected_client
    WHERE id = NEW.cnpj;
    
    IF FOUND THEN
      UPDATE boletos
      SET client_id = NEW.cnpj
      WHERE cnpj = NEW.cnpj;
    END IF;
    
    RETURN NEW;
END;
'
LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER new_boleto AFTER INSERT ON boletos
	FOR EACH ROW EXECUTE FUNCTION new_boleto_updt_boleto_clientid();