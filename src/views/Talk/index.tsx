import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Container from "@mui/material/Container";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Fab from "@mui/material/Fab";
import { mainListItems, secondaryListItems } from "./listItems";
import Copyright from "../../components/Copyright";
import DataTable from "../Talk/Table";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Chip,
} from "@mui/material";
import { useQuery } from "react-query";
import axios from "axios";
import Alert from "../../components/Alert";
import { useNavigate } from "react-router-dom";

type Props = {};

interface Attendee {
  id: string;
  name: string;
  emailAddress: string;
}

interface NewTalk {
  title: string;
  attendees: string[];
}

const Talk = (props: Props) => {
  const { isLoading, error, data } = useQuery("talk", async () => {
    const response = await axios.get(
      "https://conference-api.onrender.com/talk"
    );
    return response.data;
  });
  const {
    isLoading: isAttendeeLoading,
    error: isAttendeeError,
    data: attendees,
  } = useQuery("attendee", async () => {
    const response = await axios.get(
      "https://conference-api.onrender.com/attendee"
    );
    return response.data;
  });
  const navigate = useNavigate();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [openModal, setOpenModal] = useState(false);
  const [newTalk, setNewTalk] = useState<NewTalk>({
    title: "",
    attendees: [],
  });
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<"error" | "success">("success");
  const [alertMessage, setAlertMessage] = useState("");
  const validationErrors: { [key: string]: string } = {};
  const [talks, setTalks] = useState<NewTalk[]>([]);

  useEffect(() => {
    if (data) {
      setTalks(data);
    }
  }, [data]);

  const handleDelete = async (id: string) => {
    // Perform edit action
    try {
      await axios.delete(`https://conference-api.onrender.com/talk/${id}`);
      setTalks((prevTalks) => prevTalks.filter((talk) => talk.id !== id));
    } catch (error) {
      // Handle any errors that occurred during the deletion process
      console.error(`Failed to delete talk with ID ${id}.`, error);
    }
  };

  const handleView = (id: string) => {
    // Perform view action
    navigate(`/talk/${id}`);
  };

  const handleCreateTalk = async () => {
    // Perform form validation
    if (!newTalk.title) {
      validationErrors.title = "Title is required";
    }
    if (newTalk.attendees.length === 0) {
      validationErrors.attendees = "At least one attendee must be selected";
    }

    // Check if there are any validation errors
    if (Object.keys(validationErrors).length > 0) {
      setAlertType("error");
      setAlertMessage("Please fix the errors in the form");
      setAlertOpen(true);
      return;
    }

    // Clear any previous validation errors
    setAlertOpen(false);

    // Clear any previous validation errors
    setErrors({});
    try {
      const response = await axios.post(
        "https://conference-api.onrender.com/talk",
        newTalk
      );
      // Perform create talk action with newTalk data
      // Add the new talk to the existing data
      const updatedData = [...talks, response.data];
      setTalks(updatedData);

      // Reset the newTalk state and close the modal
      setNewTalk({ title: "", attendees: [] });
      setOpenModal(false);
    } catch (error) {}
  };

  const handleAttendeeSelect = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const selectedAttendees = event.target.value as string[];
    setNewTalk((prevTalk) => ({
      ...prevTalk,
      attendees: selectedAttendees,
    }));
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <DataTable data={talks} onView={handleView} onDelete={handleDelete} />
        <Box sx={{ position: "fixed", bottom: 20, right: 20 }}>
          <Fab color="primary" onClick={() => setOpenModal(true)}>
            +
          </Fab>
        </Box>

        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Box
            sx={{
              width: 400,
              p: 3,
              mt: 5,
              mx: "auto",
              backgroundColor: "white",
            }}
          >
            <h2>Create New Talk</h2>
            <TextField
              label="Title"
              value={newTalk.title}
              onChange={(e) =>
                setNewTalk({ ...newTalk, title: e.target.value })
              }
              fullWidth
              margin="normal"
              error={!!validationErrors.title} // Check if there is a validation error for the title field
              helperText={validationErrors.title} // Display the validation error message for the title field
            />

            <FormControl
              sx={{
                mt: 1,
                mb: 1,
              }}
              fullWidth
            >
              <InputLabel id="attendee-select-label">Attendees</InputLabel>
              <Select
                labelId="attendee-select-label"
                id="attendee-select"
                multiple
                value={newTalk.attendees ? newTalk.attendees : []}
                onChange={handleAttendeeSelect}
                renderValue={(selected) => (
                  <div>
                    {(selected as string[])?.map((attendeeId) => {
                      const attendee = attendees.find(
                        (attendee) => attendee.id === attendeeId
                      );
                      return (
                        <Chip key={attendeeId} label={attendee?.name || ""} />
                      );
                    })}
                  </div>
                )}
              >
                {attendees?.map((attendee) => (
                  <MenuItem key={attendee.id} value={attendee.id}>
                    {attendee.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText error={Boolean(validationErrors.attendees)}>
                {validationErrors.attendees}
              </FormHelperText>
            </FormControl>

            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateTalk}
            >
              Create
            </Button>

            {/* <Alert
              open={alertOpen}
              type={alertType}
              message={alertMessage}
              onClose={handleAlertClose}
            /> */}
          </Box>
        </Modal>
      </Grid>
    </Grid>
  );
};

export default Talk;
