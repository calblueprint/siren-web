import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box, FormControl, Select, MenuItem } from '@mui/material';
import { SirenUser } from '../../../types';
import { setSirenUser } from '../../firebase/queries';

export default function RoleChange(props) {
  const sirenUserInput = props.user;
  const [role, setRole] = useState(sirenUserInput.role);
  const [currentUser, setCurrentUser] = useState(sirenUserInput);
  const handleChange = (event) => {
    const updatedUser = {...currentUser};
    updatedUser.role = event.target.value;
    setRole(event.target.value);
    setCurrentUser(updatedUser);
    setSirenUser(updatedUser);
  };
  return (
    <Box>
      <FormControl>
        <Select
          value={role}
          onChange={handleChange}
        >
          <MenuItem value={"Admin"}>Admin</MenuItem>
          <MenuItem value={"Editor"}>Editor</MenuItem>
          <MenuItem value={"Viewer"}>Viewer</MenuItem>
        </Select>
      </FormControl>
    </Box>
  )
}