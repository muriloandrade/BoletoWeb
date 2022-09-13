import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import _ from "lodash";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../api/api";
import { BoletoGroup } from "../../components/BoletoGroup";
import { BoletoRow } from "../../components/BoletoRow";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";

interface BoletosSentProps {
  setTitle: Function;
}

export function BoletosSent(props: BoletosSentProps) {
  const { setTitle } = props;
  const [dates, setDates] = useState([]);
  const [dateSelected, setDateSelected] = useState("");
  const [boletosSent, setBoletosSent] = useState([]);

  const getDates = useCallback(async () => {
    try {
      let dates = (await api.get("/getBoletosSentDates")).data;
      dates = _.map(dates, _.property("sent_at"));
      dates = _.map(dates, (date) => {
        return `${date.substring(8, 10)}/${date.substring(
          5,
          7
        )}/${date.substring(0, 4)}`;
      });
      setDates(dates);
    } catch (e) {
      toast.error(
        "Server Error: Não foi possível obter a lista das datas de envio"
      );
      console.log(e);
    }
  }, []);

  const getBoletosSent = useCallback(async (d: string) => {
    const date = `${d.substring(6, 10)}-${d.substring(3, 5)}-${d.substring(
      0,
      2
    )}`;
    setBoletosSent(
      (await api.get("/getBoletosSentInDate", { params: { date: date } })).data
    );
  }, []);

  useEffect(() => {
    setTitle("Boletos Enviados");
    getDates();
  }, []);

  async function handleDateSelected(e: any) {
    const date = e.target.value;
    setDateSelected(date);
    getBoletosSent(date);
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
            position: "relative",
            backgroundColor: (theme) => theme.palette.grey[200],
            borderBottom: "1px solid",
            borderColor: (theme) => theme.palette.grey[300],
          }}
        >
          <Grid item xs={12}>
            <FormControl
              size="small"
              sx={{ backgroundColor: "white", minWidth: "200px" }}
            >
              <InputLabel id="date-select-label">Data</InputLabel>
              <Select
                labelId="date-select-label"
                id="date-select"
                value={dateSelected}
                label="Data enviado"
                onChange={handleDateSelected}
              >
                {dates.map((date, index) => (
                  <MenuItem key={index} value={date}>
                    {date}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Grid xs item container overflow="auto" direction="column">
          {!dateSelected ? (
            <Grid
              item
              container
              xs
              alignItems="center"
              justifyContent="center"
              direction="column"
            >
              <Grid item>
                <Typography sx={{ fontSize: 25, color: "rgba(0, 0, 0, 0.5);" }}>
                  Selecione uma data
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <Grid item p={2}>
              <BoletoGroup
                boletos={boletosSent}
                setBoletos={setBoletosSent}
                title="Enviados"
                fetchBoletos={getBoletosSent}
                sendButtonTitle={"Reenviar"}
                deletable={false}
              />
            </Grid>
          )}
        </Grid>
      </Grid>
    </>

    // <div className="container">
    //   <div className="row d-flex justify-content-center">
    //     <div className="card">
    //       <div className="d-flex justify-content-end align-items-center"></div>

    //       <div className="enviados">
    //         <select onChange={handleDateSelected}>
    //           <option key={-1}></option>
    //           {dates.map((date, index) => (
    //             <option key={index}>{date}</option>
    //           ))}
    //         </select>
    //         <BoletoGroup
    //           boletos={boletosSent}
    //           setBoletos={setBoletosSent}
    //           title="Enviados"
    //           fetchBoletos={getBoletosSent}
    //           sendButtonTitle={"Reenviar"}
    //           deletable={false}
    //         />
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
}
