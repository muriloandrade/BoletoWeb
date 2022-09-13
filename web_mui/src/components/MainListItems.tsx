import * as React from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import PeopleIcon from "@mui/icons-material/People";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import AssignmentIcon from "@mui/icons-material/Assignment";
import Divider from "@mui/material/Divider";
import { Collapse, List } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import DoneAllIcon from '@mui/icons-material/DoneAll';
import SendIcon from '@mui/icons-material/Send';

interface MainListItemsProps {
  selectedListItem: number;
  handleSelectedListItem: Function;
}

export default function MainListItems(props: MainListItemsProps) {

  const {selectedListItem, handleSelectedListItem} = props;
  
  const [openBoletos, setOpenBoletos] = React.useState(false);

  return (
    <React.Fragment>
      <ListItemButton selected={selectedListItem == 0} onClick={() => handleSelectedListItem(0)}>
        <ListItemIcon>
          <PeopleIcon />
        </ListItemIcon>
        <ListItemText primary="Clientes" />
      </ListItemButton>

      <ListItemButton selected={!openBoletos && (selectedListItem == 1 || selectedListItem == 2)} onClick={() => {
        if (selectedListItem != 1 && selectedListItem != 2) {handleSelectedListItem(1); setOpenBoletos(true)}
        else setOpenBoletos(!openBoletos)
        }}>
        <ListItemIcon>
          <MonetizationOnOutlinedIcon />
        </ListItemIcon>
        <ListItemText primary="Boletos" />
        {openBoletos ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      
      <Collapse in={openBoletos} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton selected={selectedListItem == 1} sx={{ pl: 4 }} onClick={() => handleSelectedListItem(1)}>
            <ListItemIcon>
              <SendIcon />
            </ListItemIcon>
            <ListItemText primary="Enviar" />
          </ListItemButton>
          <ListItemButton selected={selectedListItem == 2} sx={{ pl: 4 }} onClick={() => handleSelectedListItem(2)}>
            <ListItemIcon>
              <DoneAllIcon />
            </ListItemIcon>
            <ListItemText primary="Enviados" />
          </ListItemButton>
        </List>
      </Collapse>

      <ListItemButton selected={selectedListItem == 3} onClick={() => handleSelectedListItem(3)}>
        <ListItemIcon>
          <MailOutlinedIcon />
        </ListItemIcon>
        <ListItemText primary="E-mail" />
      </ListItemButton>

      <Divider sx={{ my: 1 }} />

      <ListItemButton selected={selectedListItem == 4} onClick={() => handleSelectedListItem(4)}>
        <ListItemIcon>
          <AssignmentIcon />
        </ListItemIcon>
        <ListItemText primary="Log" />
      </ListItemButton>
    </React.Fragment>
  );
}
