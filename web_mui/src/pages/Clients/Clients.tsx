import _ from "lodash";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../api/api";
import { AddUpdateClient } from "./AddUpdateClient";
import { UpdateClient } from "./UpdateClient";

import * as React from "react";
import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Grid from "@mui/material/Grid";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import AddIcon from "@mui/icons-material/Add";

import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";

import {
  Box,
  Checkbox,
  Fab,
  FormControl,
  FormControlLabel,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  Pagination,
  Paper,
  Skeleton,
  TableFooter,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import ClientRow from "../../components/ClientRow";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

export type ClientType = {
  id: string;
  client_name: string;
  emails: string[];
};

interface ClientsProps {
  clients: ClientType[];
  isLoading: boolean;
  setIsLoading: Function;
  getClients: Function;
  setTitle: Function;
  newClientIdFromBoleto: String;
  setNewClientIdFromBoleto: Function;
}

export enum ClientPage {
  LIST = "list",
  LIST_WITHOUT_UPDATE_CLIENT = "list_without_update_client",
  ADD = "add",
  UPDATE = "update",
}

export function Clients(props: ClientsProps) {
  const {
    clients,
    isLoading,
    setIsLoading,
    getClients,
    setTitle,
    newClientIdFromBoleto,
    setNewClientIdFromBoleto,
  } = props;

  // stores the client been edit and is used to show update client page
  const [updateClient, setUpdateClient] = useState({} as ClientType);

  // show/hide add new client page
  const [clientPage, setClientPage] = useState(
    newClientIdFromBoleto != ""
      ? ClientPage.ADD
      : !_.isEmpty(updateClient)
      ? ClientPage.UPDATE
      : ClientPage.LIST
  );

  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(1);
  const itemsPerPage = 25;

  React.useEffect(() => {
    if (clientPage == ClientPage.LIST_WITHOUT_UPDATE_CLIENT) {
      setUpdateClient({} as ClientType);
      setClientPage(ClientPage.LIST);
    }
    if (!_.isEmpty(updateClient)) {
      setClientPage(ClientPage.UPDATE);
      setTitle("Editar cliente");
    } else if (clientPage == ClientPage.ADD) setTitle("Novo cliente");
    else setTitle("Clientes");
  }, [updateClient, clientPage]);

  async function handleDeleteClient(deletingClient: ClientType) {
    if (
      window.confirm(
        `Tem certeza que deseja excluir: ${deletingClient.client_name} ?`
      )
    ) {
      try {
        await api.delete("/deleteClient", { data: { id: deletingClient.id } });
        toast.success(deletingClient.client_name + " excluído com sucesso!");
      } catch (e) {
        toast.error("Server error: Não foi possível excluir o cliente");
        console.log(e);
      }
      await getClients();
    }
  }

  const clientsFiltered = _.orderBy(clients, ["client_name"], ["asc"]).filter(
    (client) => {
      if (searchTerm === "") {
        return client;
      } else if (
        (
          client.client_name.toLowerCase() +
          " " +
          client.id.replace(/\D/g, "")
        ).includes(searchTerm.toLowerCase())
      ) {
        return client;
      }
    }
  );

  return clientPage == ClientPage.ADD ? (
    <AddUpdateClient
      clients={clients}
      getClients={getClients}
      existingData={{ id: newClientIdFromBoleto } as ClientType}
      setNewClientIdFromBoleto={setNewClientIdFromBoleto}
      clientPage={clientPage}
      setClientPage={setClientPage}
    />
  ) : !_.isEmpty(updateClient) && clientPage == ClientPage.UPDATE ? (
    <AddUpdateClient
      clients={clients}
      getClients={getClients}
      existingData={updateClient}
      setNewClientIdFromBoleto={setNewClientIdFromBoleto}
      clientPage={clientPage}
      setClientPage={setClientPage}
    />
  ) : (
    <>
      <Grid container height="80vh" spacing={0} direction="column">
        <Grid
          item
          container
          xs="auto"
          p={1}
          direction="row"
          sx={{
            position: "relative",
            backgroundColor: (theme) => theme.palette.grey[200],
            borderBottom: "1px solid",
            borderColor: (theme) => theme.palette.grey[300],
          }}
          alignItems="center"
        >
          <Grid item xs={11}>
            <TextField
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: "300px", backgroundColor: "white" }}
              placeholder="Localizar cliente..."
              disabled={isLoading}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              value={searchTerm}
            />
          </Grid>
          <Grid
            item
            container
            xs={1}
            justifyContent="flex-end"
            alignItems="flex-end"
          >
            <Grid item>
              <Tooltip title="Novo cliente">
                <IconButton
                  onClick={() => {
                    setClientPage(ClientPage.ADD);
                  }}
                  sx={{
                    backgroundColor: (theme) => theme.palette.primary.main,
                    color: "white",
                    ":hover": {
                      backgroundColor: (theme) => theme.palette.primary.light,
                    },
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Grid>

        <Grid xs item container overflow="auto" direction="column">
          {!isLoading && clientsFiltered.length == 0 && searchTerm != "" ? (
            <Grid
              item
              container
              xs
              alignItems="center"
              justifyContent="center"
              direction="column"
            >
              <Grid item>
                <SentimentDissatisfiedIcon
                  sx={{ fontSize: 50, color: "rgba(0, 0, 0, 0.26);" }}
                />
              </Grid>
              <Grid item>
                <Typography
                  sx={{ fontSize: 25, color: "rgba(0, 0, 0, 0.26);" }}
                >
                  Ops! nada por aqui
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <Grid item p={2}>
              <Table padding="none">
                <TableBody>
                  {(isLoading
                    ? Array.from(new Array(16))
                    : _.take(
                        _.drop(clientsFiltered, (page - 1) * itemsPerPage),
                        itemsPerPage
                      )
                  ).map((client, index) => (
                    <ClientRow
                      key={client ? client.id : index}
                      client={client}
                      isLoading={isLoading}
                      setUpdateClient={setUpdateClient}
                      handleDeleteClient={handleDeleteClient}
                    />
                  ))}
                </TableBody>
              </Table>
            </Grid>
          )}
        </Grid>

        <Grid
          xs="auto"
          item
          container
          justifyContent="flex-end"
          p={1}
          direction="row"
          sx={{
            borderTop: "1px solid",
            borderColor: (theme) => theme.palette.grey[200],
          }}
        >
          <Grid item>
            <Pagination
              count={Math.ceil(clientsFiltered.length / itemsPerPage)}
              shape="rounded"
              page={page}
              size="small"
              onChange={(e, value) => setPage(value)}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
