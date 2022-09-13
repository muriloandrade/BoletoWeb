import { useCallback, useEffect, useState } from "react";
import { ClientType } from "../Clients/Clients";
import _ from "lodash";
import { Box, Grid, Typography } from "@mui/material";
import toast from "react-hot-toast";
import { api } from "../../api/api";
import { BoletoGroup } from "../../components/BoletoGroup";
import { MyDropzone } from "../../components/MyDropzone";

export type BoletoType = {
  id: string;
  filename: string;
  filepath: string;
  nf: string;
  client?: ClientType;
  client_id?: string;
  cnpj: string;
  status: BoletoStatus;
  sent_at: Date;
  sent_to: string[];
  selected: boolean;
};

export enum BoletoStatus {
  AWAITING = "AWAITING",
  SENT = "SENT",
  ERROR = "ERROR",
  SENDING = "SENDING",
}

enum BoletosScreen {
  SENDING = "SENDING",
  SENT = "SENT",
}

interface BoletosProps {
  setTitle: Function;
  addNewClientWithId: Function;
}

export enum BoletoGroupTitle {
  TO_SEND = "Boletos a enviar",
  SENT_TODAY = "Enviados hoje",
  WITHOUT_CLIENT = "Clientes não cadastrados",
}

export function SendBoletos(props: BoletosProps) {
  const { setTitle, addNewClientWithId } = props;
  const [boletoScreen, setBoletoScreen] = useState(BoletosScreen.SENDING);

  const [boletosForToday, setBoletosForToday] = useState<BoletoType[]>([]);

  const [boletosAwaitingWithClient, setBoletosAwaitingWithClient] = useState<
    BoletoType[]
  >([]);

  const [boletosWithoutClient, setBoletosWithoutClient] = useState<
    BoletoType[]
  >([]);

  const [boletosSentToday, setBoletosSentToday] = useState<BoletoType[]>([]);

  const getBoletosForToday = useCallback(async () => {
    try {
      setBoletosForToday((await api.get("/getBoletosForToday")).data);
    } catch (e) {
      toast.error(
        "Server Error: Não foi possível obter a lista de boletos a ser enviados"
      );
      console.log(e);
    }
  }, []);

  useEffect(() => {
    setTitle("Enviar Boletos");
    getBoletosForToday();
  }, []);

  useEffect(() => {
    setBoletosAwaitingWithClient(
      boletosForToday.filter((bft) => {
        if (
          bft.client &&
          (bft.status === BoletoStatus.AWAITING ||
            bft.status === BoletoStatus.ERROR ||
            (bft.status === BoletoStatus.SENDING && !bft.sent_at))
        )
          return bft;
      })
    );
  }, [boletosForToday]);

  useEffect(() => {
    setBoletosSentToday(
      boletosForToday.filter((bft) => {
        if (
          bft.status === BoletoStatus.SENT ||
          (bft.status === BoletoStatus.SENDING && bft.sent_at)
        )
          return bft;
      })
    );
  }, [boletosForToday]);

  useEffect(() => {
    setBoletosWithoutClient(
      boletosForToday.filter((bft) => {
        if (!bft.client) return bft;
      })
    );
  }, [boletosForToday]);

  async function handleDeleteBoleto(boleto: BoletoType) {
    if (window.confirm("Tem certeza que deseja excluir o boleto?")) {
      try {
        await api.delete("/deleteBoleto", { data: { id: boleto.id } });
        toast.success("Boleto excluído com sucesso!");
      } catch (e) {
        toast.error("Server error: Não foi possível excluir o boleto");
        console.log(e);
      }
      await getBoletosForToday();
    }
  }

  async function deleteMany(boletos: BoletoType[]) {
    if (
      window.confirm(
        `Tem certeza que deseja excluir ${
          boletos.length > 1
            ? `os ${boletos.length} boletos selecionados?`
            : "o boleto selecionado?"
        }`
      )
    ) {
      try {
        await api.delete("/deleteManyBoletos", {
          data: { boletos },
        });
        toast.success("Boleto(s) excluído(s) com sucesso!");
      } catch (e) {
        toast.error(
          "Server error: Não foi possível excluir o(s) boleto(s) selecionado(s)"
        );
        console.log(e);
      }
      await getBoletosForToday();
    }
  }

  return (
    <>
      <Grid container height="80vh" spacing={0} direction="column">
        <Grid xs item container overflow="auto" direction="column">
          <Grid item p={2}>
            <MyDropzone
              getBoletos={getBoletosForToday}
              empty={boletosForToday.length == 0}
            />

            <BoletoGroup
              boletos={boletosAwaitingWithClient}
              setBoletos={setBoletosAwaitingWithClient}
              title={BoletoGroupTitle.TO_SEND}
              fetchBoletos={getBoletosForToday}
              handleDeleteBoleto={handleDeleteBoleto}
              deleteMany={deleteMany}
              sendButtonTitle="Enviar"
              deletable={true}
            />

            <BoletoGroup
              boletos={boletosSentToday}
              setBoletos={setBoletosSentToday}
              title={BoletoGroupTitle.SENT_TODAY}
              fetchBoletos={getBoletosForToday}
              handleDeleteBoleto={handleDeleteBoleto}
              deleteMany={deleteMany}
              sendButtonTitle="Reenviar"
              deletable={false}
            />

            <BoletoGroup
              boletos={boletosWithoutClient}
              setBoletos={setBoletosWithoutClient}
              title={BoletoGroupTitle.WITHOUT_CLIENT}
              fetchBoletos={getBoletosForToday}
              handleDeleteBoleto={handleDeleteBoleto}
              deleteMany={deleteMany}
              deletable={true}
              addNewClientWithId={addNewClientWithId}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
