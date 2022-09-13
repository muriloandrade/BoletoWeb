import cors from "cors";
import express from "express";
import { routes } from "./routes";
import morgan from "morgan"; //Log de requisicoes http

const app = express();

app.use(cors({origin: process.env.ORIGIN}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(routes);

app.listen(process.env.PORT || 3333, () => {
  console.log("HTTP server running!");
});

