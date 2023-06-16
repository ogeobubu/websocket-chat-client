import React from "react";
import { Snackbar, Alert as MuiAlert } from "@mui/material";

type AlertType = "error" | "success";

interface AlertProps {
  open: boolean;
  type: AlertType;
  message: string;
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ open, type, message, onClose }) => {
  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={onClose}>
      <MuiAlert
        elevation={6}
        variant="filled"
        onClose={onClose}
        severity={type}
      >
        {message}
      </MuiAlert>
    </Snackbar>
  );
};

export default Alert;
