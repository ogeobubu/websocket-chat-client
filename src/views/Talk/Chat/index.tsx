import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  Avatar,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import axios from "axios";
import { io, Socket } from "socket.io-client";

const Chat = () => {
  const user = JSON.parse(localStorage.getItem("talksWeb"));
  const [addData, setAddData] = useState<{ title: string; attendee: string }>({
    title: "",
    attendee: "",
  });
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [attendees, setAttendees] = useState<any[]>([]);
  const [attendee, setAttendee] = useState<any>();
  const { id } = useParams<{ id: string }>();
  const { isLoading, error, data } = useQuery("chat", async () => {
    const response = await axios.get(
      `https://conference-api.onrender.com/talk/${id}`
    );
    return response.data;
  });
  const {
    isLoading: loadingAttendees,
    error: errorAttendees,
    data: dataAttendees,
  } = useQuery("attendees", async () => {
    const response = await axios.get(
      `https://conference-api.onrender.com/attendee`
    );
    return response.data;
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const socketRef = useRef<Socket | null>(null);
  const textContentRef = useRef<HTMLSpanElement>(null); // Ref for the text content
  const [paperWidth, setPaperWidth] = useState("");

  const isSender = data?.attendees.some(
    (attendee) => attendee.email === user?.emailAddress
  );

  useEffect(() => {
    if (data) {
      setMessages(data.chats);
    }
  }, [data]);

  useEffect(() => {
    socketRef.current = io("https://websocket-server-3fvz.onrender.com");

    socketRef.current.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("message", (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
    }
  }, []);

  useEffect(() => {
    if (data) {
      setAttendees(data.attendees);
      if (socketRef.current) {
        const attendee = data.attendees.find(
          (attendee) => attendee.email === user?.emailAddress
        );
        if (attendee) {
          setAttendee(attendee);
          socketRef.current.emit("join", attendee._id);
        }
      }
    }
  }, [data]);

  const handleAttendeeSubmit = async () => {
    try {
      const response = await axios.put(
        `https://conference-api.onrender.com/talk/${id}/attendee`,
        addData
      );
      setAttendees([...attendees, response.data]);
      socketRef.current?.emit("join", response.data.sender._id);
    } catch (error) {
      console.error("Error adding attendee:", error);
      // Handle error here, e.g., show error alert
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    const resizeHandler = () => {
      if (textContentRef.current) {
        const textContentWidth = textContentRef.current.offsetWidth;
        const paperWidth = isMobile
          ? "100%"
          : Math.min(0.6 * textContentWidth, 600); // Adjust the maximum width as desired
        setPaperWidth(paperWidth);
      }
    };

    window.addEventListener("resize", resizeHandler);
    resizeHandler();

    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, [isMobile]);

  const handleSendMessage = () => {
    if (inputValue.trim() !== "") {
      const newMessage = {
        dateCreated: new Date(),
        _id: id,
        message: inputValue,
        sender: {
          _id: attendee?._id,
          email: user?.emailAddress,
          name: user?.name,
          dateCreated: new Date(),
        },
      };
      socketRef.current?.emit("message", newMessage);
      setInputValue("");
      setMessages([...messages, newMessage]);
    }
  };

  const renderMessage = (message: any, index: number) => {
    const isSender = message?.sender.email === user?.emailAddress;
    const color = isSender ? "primary.main" : "secondary.main";
    const textAlign = isSender ? "right" : "left";
    const senderInitials = message.sender.name
      .split(" ")
      .map((name: string) => name.charAt(0).toUpperCase())
      .join("");

    return (
      <ListItem
        sx={{
          display: "flex",
          justifyContent: isSender ? "flex-end" : "flex-start",
        }}
        key={index}
      >
        {!isSender && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mr: 1,
            }}
          >
            <Avatar sx={{ bgcolor: color }}>{senderInitials}</Avatar>
          </Box>
        )}
        <Paper
          ref={textContentRef}
          sx={{
            p: 2,
            borderRadius: 4,
            backgroundColor: color,
            color: "#fff",
            textAlign: textAlign,
            width: isMobile ? "100%" : "70%", // Use the calculated width
          }}
        >
          <ListItemText primary={message?.message} />
        </Paper>
      </ListItem>
    );
  };

  if (isLoading || loadingAttendees) {
    return <div>Loading...</div>;
  }

  if (error || errorAttendees) {
    return (
      <Alert severity="error">
        Error fetching chat data. Please try again later.
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 800,
        width: "100%",
        mx: "auto",
        mt: 5,
      }}
    >
      <Card
        sx={{ display: "flex", flexDirection: isMobile ? "column" : "row" }}
      >
        <CardContent sx={{ flex: isMobile ? "none" : 1 }}>
          <Typography variant="h6" gutterBottom>
            Attendees
          </Typography>
          <List sx={{ mb: 2 }}>
            {attendees?.map((attendee: any, index: number) => (
              <ListItem key={index}>
                <ListItemText
                  primary={attendee.name}
                  secondary={attendee.email}
                />
              </ListItem>
            ))}
          </List>
          <FormControl variant="outlined" fullWidth sx={{ mb: 1 }}>
            <InputLabel id="attendee-label">Attendee</InputLabel>
            <Select
              labelId="attendee-label"
              id="attendee-select"
              value={addData.attendee}
              onChange={(e) =>
                setAddData({
                  ...addData,
                  attendee: e.target.value,
                })
              }
              label="Attendee"
            >
              {dataAttendees?.map((a: any) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleAttendeeSubmit}>
            Add Attendee
          </Button>
        </CardContent>
        <CardContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Chat
          </Typography>
          <List
            sx={{
              flexGrow: 1,
              overflow: "auto",
              mb: 2,
            }}
          >
            {messages.map(renderMessage)}
          </List>
          {isSender && (
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={isMobile ? 9 : 10}>
                <TextField
                  value={inputValue}
                  onChange={handleInputChange}
                  label="Message"
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={isMobile ? 3 : 2}>
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={!attendee}
                  fullWidth
                >
                  Send
                </Button>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Chat;
