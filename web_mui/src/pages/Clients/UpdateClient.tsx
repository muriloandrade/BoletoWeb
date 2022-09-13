import {
  Box,
  Button,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import _ from "lodash";
import { ChangeEvent, FormEvent, useEffect } from "react";
import toast from "react-hot-toast";
import { api } from "../../api/api";
import { ClientType } from "./Clients";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface UpdateClientProps {
  updateClient: ClientType;
  setUpdateClient: Function;
  clients: ClientType[];
  getClients: Function;
}

export function UpdateClient(props: UpdateClientProps) {
  const { updateClient, setUpdateClient, clients, getClients } =
    props;

  const handleUpdateClient = () => {
    const doUpdateClient = async () => {
      try {
        await api.post("/updateClient", updateClient);
        toast.success("Informações atualizadas com sucesso!");
        setUpdateClient({} as ClientType);
        await getClients();
      } catch (e) {
        toast.error(
          "Server error: Não foi possível atualizar os dados do cliente"
        );
        console.log(e);
      }
    };
    doUpdateClient();
  };

  function handleEmailChange(
    event: ChangeEvent<HTMLInputElement>,
    index: number
  ) {
    setUpdateClient({
      ...updateClient,
      emails: updateClient.emails.map((email, i) => {
        if (i === index) return event.target.value;
        else return email;
      }),
    });
  }

  return (
    <>
      <Grid container height="80vh" spacing={0} direction="column">
        <Grid
          item
          container
          xs="auto"
          p={1}
          direction="row"
          sx={{
            backgroundColor: (theme) => theme.palette.grey[200],
            borderBottom: "1px solid",
            borderColor: (theme) => theme.palette.grey[300],
          }}
        >
          <Grid item container xs={12}>
            <IconButton onClick={() => setUpdateClient({} as ClientType)}>
              <ArrowBackIcon />
            </IconButton>
            <Typography sx={{alignSelf: "center"}}>Voltar</Typography>
          </Grid>
        </Grid>

        <Grid xs item container overflow="auto" direction="column">
          <Grid item p={2}>
            <Box
              component="form"
              noValidate
              autoComplete="off"
              sx={{
                "& .MuiTextField-root": { mt: 2 },
              }}
            >
              <TextField
                id="c_cnpj"
                label="CNPJ / CPF"
                value={updateClient.id}
                required
                disabled
                margin="dense"
              />
              <TextField
                id="c_name"
                label="Nome do cliente"
                required
                value={updateClient.client_name}
                variant="outlined"
                fullWidth
                onChange={(event) => {
                  setUpdateClient({
                    ...updateClient,
                    client_name: event.target.value,
                  });
                }}
              />
              <Typography variant="subtitle1" mt={2}>
                E-mails
              </Typography>
              <TextField
                size="small"
                id="c_emails"
                sx={{ width: "350px" }}
                label="E-mail principal"
                required
                value={updateClient.emails[0]}
                onChange={(event) =>
                  handleEmailChange(event as ChangeEvent<HTMLInputElement>, 0)
                }
              />
              <br />
              <TextField
                size="small"
                id="c_emails"
                sx={{ width: "350px" }}
                label="E-mail"
                value={updateClient.emails[1]}
                onChange={(event) =>
                  handleEmailChange(event as ChangeEvent<HTMLInputElement>, 1)
                }
              />
              <br />
              <TextField
                size="small"
                id="c_emails"
                sx={{ width: "350px" }}
                label="E-mail"
                value={updateClient.emails[2]}
                onChange={(event) =>
                  handleEmailChange(event as ChangeEvent<HTMLInputElement>, 2)
                }
              />
            </Box>
          </Grid>
        </Grid>

        <Grid
          xs="auto"
          item
          container
          justifyContent="flex-end"
          p={2}
          direction="row"
          sx={{
            borderTop: "1px solid",
            borderColor: (theme) => theme.palette.grey[200],
          }}
        >
          <Button variant="contained" onClick={handleUpdateClient}>
            Salvar
          </Button>
        </Grid>
      </Grid>
    </>
  );
}
