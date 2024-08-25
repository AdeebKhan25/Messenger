import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [name, setName] = useState(null);
  const [id, setId] = useState(null);
  const [email, setEmail] = useState(null);
  useEffect(() => {
    axios.get("/profile").then((response) => {
      setId(response.data.userId);
      setName(response.data.name);
      setEmail(response.data.email);
    });
  }, []);
  return (
    <UserContext.Provider value={{ name, setName, id, setId, email, setEmail }}>
      {children}
    </UserContext.Provider>
  );
}
