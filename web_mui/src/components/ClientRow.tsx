import _ from "lodash";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api/api";

import * as React from "react";
import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Grid from "@mui/material/Grid";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";

import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  Paper,
  Skeleton,
  Toolbar,
} from "@mui/material";
import { ClientType } from "../pages/Clients/Clients";

interface ClientRowProps {
  client: ClientType;
  isLoading: boolean;
  setUpdateClient: Function;
  handleDeleteClient: Function;
}

export default function ClientRow(props: ClientRowProps) {
  const { client, isLoading, setUpdateClient, handleDeleteClient } = props;

  const [isHovered, setIsHovered] = useState(false);

  return (
    <TableRow
      hover={!isLoading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ height: "36px" }}
    >
      <TableCell
        sx={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          paddingRight: "1em",
          minWidth: "5vw",
          maxWidth: "15vw",
        }}
      >
        {client ? (
          client.id
        ) : (
          <Skeleton
            animation="wave"
            variant="rectangular"
            width="10vw"
            height="25px"
          />
        )}
      </TableCell>
      <TableCell
        sx={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "30vw",
        }}
      >
        {client ? (
          client.client_name
        ) : (
          <Skeleton
            animation="wave"
            variant="rectangular"
            width="25vw"
            height="25px"
          />
        )}
      </TableCell>
      <TableCell align="right" width="34px">
        <Button
          size="small"
          sx={{
            visibility: !isLoading && isHovered ? "visible" : "hidden",
            color: (theme) => theme.palette.grey[400],
            minWidth: 0,
            ":hover": {
              backgroundColor: "#0d66ba12",
              color: "#0d66ba",
            },
          }}
          onClick={() => setUpdateClient(client)}
        >
          <EditOutlinedIcon />
        </Button>
      </TableCell>
      <TableCell align="right" width="34px">
        <Button
          size="small"
          sx={{
            visibility: !isLoading && isHovered ? "visible" : "hidden",
            color: (theme) => theme.palette.grey[400],
            minWidth: 0,
            ":hover": {
              backgroundColor: "#b8333312",
              color: "#b83333",
            },
          }}
          onClick={() => handleDeleteClient(client)}
        >
          <DeleteOutlinedIcon />
        </Button>
      </TableCell>
    </TableRow>
  );
}
