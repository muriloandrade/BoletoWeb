import * as React from "react";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Clients, ClientType } from "./Clients/Clients";
import { useCallback, useEffect, useState } from "react";
import { api } from "../api/api";
import toast, { Toaster } from "react-hot-toast";
import { Tab, Tabs } from "@mui/material";
import MainListItems from "../components/MainListItems";
import { SendBoletos } from "./Boletos/SendBoletos";
import { BoletosSent } from "./Boletos/BoletosSent";

const drawerWidth: number = 240;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

const mdTheme = createTheme();

export default function App() {
  const [open, setOpen] = React.useState(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const [clients, setClients] = useState([] as ClientType[]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedListItem, setSelectedListItem] = useState(0);
  const [newClientIdFromBoleto, setNewClientIdFromBoleto] = useState("");

  // fetch all clients
  const getClients = useCallback(async () => {
    try {
      setIsLoadingClients(true);
      setClients((await api.get("/getClients")).data);
    } catch (e) {
      toast.error("Server Error: Não foi possível obter a lista de clientes");
      console.log(e);
    } finally {
      setIsLoadingClients(false);
    }
  }, []);

  // fetch all clients on load
  useEffect(() => {
    getClients();
  }, []);

  function addNewClientWithId(newClientIdFromBoleto: React.SetStateAction<string>) {
    setNewClientIdFromBoleto(newClientIdFromBoleto);
  }

  function handleSelectedListItem(item: number) {
    item != 0 && setNewClientIdFromBoleto("");
    setSelectedListItem(item);
  }

  return (
    <ThemeProvider theme={mdTheme}>
      <Toaster
        position="top-right"
        reverseOrder={true}
        toastOptions={{ duration: 3000 }}
      />
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar position="absolute" open={open}>
          <Toolbar
            sx={{
              pr: "24px", // keep right padding when drawer closed
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: "36px",
                ...(open && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              Boletos Web
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: [1],
            }}
          >
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List component="nav">
            <MainListItems
              selectedListItem={selectedListItem}
              handleSelectedListItem={handleSelectedListItem}
            />
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: "100vh",
            overflow: "auto",
          }}
        >
          <Toolbar />

          <Container maxWidth="md" sx={{ mt: 2 }}>
            <Grid container direction="row">
              <Grid item xs={8}>
                <Typography
                  variant="h5"
                  color={(theme) => theme.palette.grey[700]}
                  noWrap
                  sx={{ flexGrow: 1 }}
                  fontWeight={500}
                >
                  {title}
                </Typography>
              </Grid>
            </Grid>

            <Grid container justifyContent="center">
              <Grid mt={2} xs={12} item>
                <Paper
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "80vh",
                    overflow: "none",
                  }}
                >
                  {selectedListItem == 0 || newClientIdFromBoleto != "" ? (
                    <Clients
                      clients={clients}
                      isLoading={isLoadingClients}
                      setIsLoading={setIsLoadingClients}
                      getClients={getClients}
                      setTitle={setTitle}
                      newClientIdFromBoleto={newClientIdFromBoleto}
                      setNewClientIdFromBoleto={setNewClientIdFromBoleto}
                    />
                  ) : selectedListItem == 1 ? (
                    <SendBoletos
                      setTitle={setTitle}
                      addNewClientWithId={addNewClientWithId}
                    />
                  ) : selectedListItem == 2 ? (
                    <BoletosSent setTitle={setTitle} />
                  ) : (
                    <Typography>{selectedListItem}</Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
