import {
  Box,
  Button,
  Checkbox,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import _ from "lodash";
import { Fragment, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api/api";
import {
  BoletoGroupTitle,
  BoletoStatus,
  BoletoType,
} from "../pages/Boletos/SendBoletos";
import { BoletoRow } from "./BoletoRow";
import { alpha } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

interface BoletoGroupProps {
  boletos: BoletoType[];
  setBoletos: Function;
  title: string;
  fetchBoletos: Function;
  handleDeleteBoleto?: Function;
  deleteMany?: Function;
  sendButtonTitle?: string;
  deletable: boolean;
  addNewClientWithId?: Function;
}

export function BoletoGroup(props: BoletoGroupProps) {
  const {
    boletos,
    setBoletos,
    title,
    fetchBoletos,
    handleDeleteBoleto,
    deleteMany,
    sendButtonTitle,
    deletable,
    addNewClientWithId,
  } = props;

  const [sending, setSending] = useState(false);
  const [totalSelected, setTotalSelected] = useState(0);
  const [opened, setOpened] = useState(false);
  let totalSent = useRef<number>(0);
  let [totalSentPercentage, setTotalSentPercentage] = useState<number>(0);

  useEffect(() => {
    setTotalSelected(boletos.map((b) => b.selected).filter(Boolean).length);
  }, [boletos]);

  function handleSelect(boleto: BoletoType) {
    setBoletos(
      boletos.map((b) => {
        return b.id === boleto.id
          ? { ...b, selected: boleto.selected ? false : true }
          : b;
      })
    );
  }

  function handleSelectAll(e: any) {
    const newValue = e.target.checked ? true : false;

    setBoletos(
      boletos.map((b) => {
        return { ...b, selected: newValue };
      })
    );
    newValue && setOpened(true);
  }

  function handleOpened() {
    totalSelected == 0 && setOpened(!opened);
  }

  async function sendSelected() {
    setSending(true);
    const selected = boletos.filter((b) => b.selected);
    setBoletos(
      boletos.map((b) =>
        b.selected ? { ...b, status: BoletoStatus.SENDING } : b
      )
    );

    let toSend = [] as Promise<any>[];

    selected.forEach((boletoSelected) => {
      toSend.push(
        api
          .post("/sendEmail", _.omit(boletoSelected, ["client", "selected"]))
          .then((result) => {
            boletoSelected = { ...boletoSelected, status: BoletoStatus.SENT };
          })
          .catch((error) => {
            boletoSelected = { ...boletoSelected, status: BoletoStatus.ERROR };
          })
          .finally(() => {
            setBoletos((prevState: BoletoType[], props: BoletoGroupProps) => {
              return prevState.map((b) =>
                b.id === boletoSelected.id
                  ? { ...boletoSelected, selected: false }
                  : b
              );
            });
            setTotalSentPercentage(
              Math.floor((++totalSent.current / selected.length) * 100)
            );
          })
      );
    });

    Promise.all(toSend).finally(() => {
      fetchBoletos();
      setSending(false);
      toast.success(`${totalSent.current} boletos enviados com sucesso`);
      totalSent.current = 0;
      setTotalSentPercentage(0);
    });
  }

  return (
    <>
      <TableContainer
        sx={{
          border: "thin solid rgba(0, 0, 0, 0.12)",
          borderRadius: "5px",
          mt: 3,
          display: boletos.length > 0 ? "inherit" : "none",
        }}
      >
        <Toolbar
          sx={{
            pl: { sm: 0 },
            pr: { xs: 1, sm: 1 },
            ...{
              bgcolor: (theme) =>
                alpha(
                  theme.palette.primary.main,
                  theme.palette.action.activatedOpacity
                ),
            },
          }}
        >
          <Checkbox
            indeterminate={totalSelected > 0 && totalSelected != boletos.length}
            checked={boletos.length == totalSelected}
            onChange={handleSelectAll}
          />
          <Typography
            sx={{ "&:hover": { cursor: "pointer" }  }}
            color="inherit"
            variant="button"
            onClick={handleOpened}
          >
            {sending
              ? `Enviando... ${totalSentPercentage}%`
              : totalSelected > 0
              ? `${totalSelected} selecionado(s)`
              : `${title} (${boletos.length})`}
          </Typography>
          <Box sx={{ flex: "1"}} />
          {!sending && totalSelected > 0 ? (
            <>
              {deletable && (
                <Tooltip title="Excluir">
                  <IconButton
                    onClick={() =>
                      deleteMany &&
                      deleteMany(boletos.filter((b) => b.selected))
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}

              {sendButtonTitle && (
                <Button
                  variant="contained"
                  disableElevation
                  endIcon={<SendIcon />}
                  sx={{ ml: 2 }}
                  onClick={() => sendSelected()}
                >
                  <Typography variant="button">{sendButtonTitle}</Typography>
                </Button>
              )}
            </>
          ) : (
            <IconButton onClick={handleOpened}>
              {opened ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          )}
        </Toolbar>

        <Collapse in={opened} timeout="auto" unmountOnExit>
          <Table padding="none">
            <TableHead>
              <TableRow>
                <TableCell>
                  <Checkbox sx={{ visibility: "hidden" }} />
                </TableCell>
                <TableCell>CPF/CNPJ</TableCell>
                <TableCell sx={{ px: 2 }}>Cliente</TableCell>
                <TableCell>NF</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {_.orderBy(boletos, ["client.client_name"], ["asc"]).map(
                (boleto, index) => {
                  return (
                    <BoletoRow
                      boleto={boleto}
                      index={index}
                      selectable={!!sendButtonTitle || deletable}
                      handleSelect={handleSelect}
                      handleDeleteBoleto={handleDeleteBoleto}
                      deletable={deletable}
                      key={index}
                      addNewClientWithId={addNewClientWithId}
                    />
                  );
                }
              )}
            </TableBody>
          </Table>
        </Collapse>
      </TableContainer>
    </>
  );
}
