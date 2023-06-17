import React, { useState } from "react";
import Table from "./Table";
import axios from "axios";
import { Box, Modal, TextField, Button, Fab } from "@mui/material";
import { useQuery } from "react-query";

type Props = {};

interface NewAttendee {
  email: string;
  name: string;
}

const Attendee: React.FC<Props> = () => {
  const { isLoading, error, data } = useQuery("talk", async () => {
    const response = await axios.get(
      "https://conference-api.onrender.com/attendee"
    );
    return response.data;
  });

  const [newAttendee, setNewAttendee] = useState<NewAttendee>({
    email: "",
    name: "",
  });
  const [openModal, setOpenModal] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = async () => {
    try {
      const validationErrors: { [key: string]: string } = {};
      if (!newAttendee.name) {
        validationErrors.name = "Name is required";
      }
      if (!newAttendee.email) {
        validationErrors.email = "Email is required";
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      const response = await axios.post(
        "https://conference-api.onrender.com/attendee",
        newAttendee
      );
      localStorage.setItem("talksWeb", JSON.stringify(response.data));
      const updatedData = [...data, response.data];
      setNewAttendee(updatedData);
      console.log(response.data);

      setNewAttendee({ email: "", name: "" });
      setOpenModal(false);
    } catch (error) {
      // Handle error here
    }
  };

  return (
    <div>
      <Table data={data} />
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
          <h2>Create Attendee</h2>
          <TextField
            label="Name"
            value={newAttendee.name}
            onChange={(e) =>
              setNewAttendee({ ...newAttendee, name: e.target.value })
            }
            fullWidth
            margin="normal"
            error={!!errors.name}
            helperText={errors.name}
          />

          <TextField
            label="Email"
            type="email"
            value={newAttendee.email}
            onChange={(e) =>
              setNewAttendee({ ...newAttendee, email: e.target.value })
            }
            fullWidth
            margin="normal"
            error={!!errors.email}
            helperText={errors.email}
          />

          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Create
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default Attendee;
