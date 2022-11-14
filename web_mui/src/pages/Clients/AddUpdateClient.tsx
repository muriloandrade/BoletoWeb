import {
  Box,
  Button,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import _ from "lodash";
import {
  ChangeEvent,
  FormEvent,
  Fragment,
  useCallback,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";
import { api } from "../../api/api";
import { ClientPage, ClientType } from "./Clients";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { clientsFile } from "../../clients";

import {
  useForm,
  Controller,
  FieldValues,
  useFieldArray,
  useFormContext,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { cnpj, cpf } from "cpf-cnpj-validator";

interface AddNewClientProps {
  clients: ClientType[];
  getClients: Function;
  existingData: ClientType;
  setNewClientIdFromBoleto: Function;
  clientPage: ClientPage;
  setClientPage: Function;
}

export function AddUpdateClient(props: AddNewClientProps) {
  const {
    clients,
    getClients,
    existingData,
    setNewClientIdFromBoleto,
    clientPage,
    setClientPage,
  } = props;

  const [data, setData] = useState({
    id: existingData?.id || "",
    client_name: existingData?.client_name || "",
    emails: existingData?.emails || ["", "", ""],
  });

  const validationSchema = Yup.object().shape({
    client_id: Yup.string()
      .required("CPF/CNPJ é obrigatório")
      .test("test-cpf-cnpj-valid", "CPF/CNPJ inválido", (cpf_cnpj) => {
        return (
          cpf.isValid(cpf_cnpj as string) || cnpj.isValid(cpf_cnpj as string)
        );
      }),
    client_name: Yup.string().required("Nome do cliente é obrigatório"),
    emails: Yup.array().of(
      Yup.string()
        .email("Email inválido")
        .test(
          "is-the-first-field",
          "Email principal é obrigatório",
          function (item) {
            const index = parseInt(this.path.split("[")[1].split("]")[0]);
            return index == 0 ? item != "" : true;
          }
        )
    ),
  });

  const { register, handleSubmit, setValue, control, formState } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const { errors }: { errors: any } = formState;

  const { fields, replace } = useFieldArray({
    name: "emails",
    control,
  });

  const onSubmit = (data: FieldValues) => {
    data.client_name = data.client_name.toUpperCase();
    const { client_id: id, client_name, emails } = data;
    const alreadyExists = _.find(clients, ["id", id]);
    if (!_.isEmpty(alreadyExists)) {
      toast.error("Cliente já cadastrado com o CPF/CNPJ informado");
    } else {
      const addClient = async () => {
        try {
          await api.post("/addClient", { id, client_name, emails });
          toast.success("Cliente cadastrado com sucesso!");
          setClientPage(ClientPage.LIST);
          await getClients();
        } catch (e) {
          toast.error(
            "Server error: Não foi possível cadastrar o novo cliente"
          );
          console.log(e);
        }
      };
      addClient().then(setNewClientIdFromBoleto(""));
    }
  };

  const handleUpdateClient = (data: FieldValues) => {

    const updateClient = {id: data.client_id, ...data}

    const doUpdateClient = async () => {
      try {
        await api.post("/updateClient", updateClient);
        toast.success("Informações atualizadas com sucesso!");
        setClientPage(ClientPage.LIST_WITHOUT_UPDATE_CLIENT);
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

  // USED ONLY ONCE TO ADD ALL CLIENTS FROM JSON FILE
  const addAllClients = useCallback(() => {
    try {
      clientsFile.map(async (c) => {
        const client = {
          id: c.id,
          client_name: c.client_name,
          emails: [c.email0, c.email1, c.email2],
        };
        const alreadyExists = _.find(clients, ["id", client.id]);
        if (_.isEmpty(alreadyExists)) api.post("/addClient", client);
      });
    } catch (e) {
      console.log(e);
    }
  }, []);

  function handleClientIdChange(event: ChangeEvent<HTMLInputElement>) {
    let client_id = event.target.value;
    client_id = client_id.length <= 11 ? cpf.format(client_id) : cnpj.format(client_id);
    setData({...data, id: client_id});
    setValue("client_id", client_id);
  }

  useEffect(() => {
      replace([data?.emails?.[0] || "", data?.emails?.[1] || "", data?.emails?.[2] || ""])
  }, []);

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
            <IconButton
              onClick={() => {
                setNewClientIdFromBoleto("");
                setClientPage(ClientPage.LIST_WITHOUT_UPDATE_CLIENT);
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography sx={{ alignSelf: "center" }}>Voltar</Typography>
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
                id="c_id"
                label="CPF / CNPJ"
                inputProps={{ maxLength: 18 }}
                defaultValue={data.id}
                required
                margin="dense"
                {...register("client_id", { onChange: handleClientIdChange })}
                error={!!errors.client_id}
                helperText={errors.client_id?.message as string}
              />
              <TextField
                id="c_name"
                label="Nome do cliente"
                variant="outlined"
                defaultValue={data.client_name}
                required
                fullWidth
                {...register("client_name")}
                error={!!errors.client_name}
                helperText={errors.client_name?.message as string}
              />
              <Typography variant="subtitle1" mt={2}>
                E-mails
              </Typography>
              {fields.map((item, i) => (
                <Fragment key={item.id}>
                  <TextField
                    size="small"
                    id={`c_emails_${i}`}
                    required={i == 0}
                    defaultValue={data.emails[i]}
                    label={i == 0 ? "Email principal" : "Email"}
                    sx={{ width: "350px" }}
                    {...register(`emails.${i}`)}
                    error={!!errors?.emails?.[i]}
                    helperText={errors.emails?.[i]?.message as string}
                  />
                  <br />
                </Fragment>
              ))}
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
          <Button
            variant="contained"
            // onClick={handleAddClient}
            onClick={handleSubmit(clientPage == ClientPage.ADD ? onSubmit : handleUpdateClient)}
          >
            Salvar
          </Button>
          {/* <Button variant="contained" onClick={addAllClients}>Inserir todos</Button> */}
        </Grid>
      </Grid>
    </>
  );
}
