import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";

interface IData {
  id: number;
  name: string;
  description: string;
}

interface IProps {
  data: IData[];
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

const DataTable: React.FC<IProps> = ({ data, onView, onDelete }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Attendee</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.title}</TableCell>
              <TableCell>
                {item?.attendees?.length > 1
                  ? `${item?.attendees?.length} attendees`
                  : `${item?.attendees?.length} attendee`}
              </TableCell>
              <TableCell>
                <Button variant="outlined" onClick={() => onView(item.id)}>
                  View
                </Button>
                <Button variant="outlined" onClick={() => onDelete(item.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable;
