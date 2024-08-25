import { useContext } from "react";
import { UserContext } from "./UserContext";
import RegisterAndLoginForm from "./RegisterAndLoginForm";
import Chat from "./Chat";

export default function Routes() {
  const { name, id, email } = useContext(UserContext);
  if (name) {
    return <Chat />;
  }
  return <RegisterAndLoginForm />;
}
