import {
  Button,
  Checkbox,
  IconButton,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import _ from "lodash";
import { useState } from "react";
import { BoletoStatus, BoletoType } from "../pages/Boletos/SendBoletos";
import { ClientType } from "../pages/Clients/Clients";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { api } from "../api/api";

interface BoletoRowProperties {
  boleto: BoletoType;
  index: number;
  selectable: boolean;
  handleSelect?: Function;
  handleDeleteBoleto?: Function;
  deletable: boolean;
  addNewClientWithId?: Function;
}

async function sendByWhatsApp() {
  console.log((await api.get("/sendWhatsApp")).data);
}

export function BoletoRow(props: BoletoRowProperties) {
  const {
    boleto,
    index,
    selectable,
    handleSelect,
    handleDeleteBoleto,
    deletable,
    addNewClientWithId,
  } = props;
  const emails = boleto.client ? _.join(boleto.client.emails, "\n") : "";
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TableRow
      hover
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ height: "36px" }}
    >
      <TableCell sx={{ width: "50px" }}>
        <Checkbox
          checked={boleto.selected || false}
          onChange={() => handleSelect && handleSelect(boleto)}
        />
      </TableCell>
      <TableCell
        sx={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          width: "12em",
        }}
      >
        {boleto.cnpj}
      </TableCell>
      <TableCell
        sx={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "15em",
          px: 2,
        }}
      >
        {boleto.client ? (
          boleto.client.client_name
        ) : (
          <>
            <Button
              variant="text"
              onClick={() =>
                addNewClientWithId && addNewClientWithId(boleto.cnpj)
              }
            >
              Cadastrar este cliente
            </Button>
            <Tooltip title="Enviar por WhatsApp">
              <IconButton>
                <WhatsAppIcon onClick={sendByWhatsApp}/>
              </IconButton>
            </Tooltip>
          </>
        )}
      </TableCell>
      <TableCell
        sx={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          width: "5em",
          pr: 2,
        }}
      >
        {boleto.nf}
      </TableCell>
    </TableRow>
  );
}
