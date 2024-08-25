import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "./UserContext";
import uniqWith from "lodash/uniqWith";
import isEqual from "lodash/isEqual";
import axios from "axios";
import Contact from "./Contact";

export default function Chat() {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState([]);
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { name, id, email, setId, setName, setEmail } = useContext(UserContext);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const divUnderMessages = useRef();

  useEffect(() => {
    connectToWs();
  }, []);

  function connectToWs() {
    const ws = new WebSocket("ws://localhost:4000");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", () => {
      setTimeout(() => {
        console.log("Disconnected. Trying to reconnect.");
        connectToWs();
      }, 1000);
    });
  }

  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, name, email }) => {
      people[userId] = { name, email };
    });
    setOnlinePeople(people);
  }

  function handleMessage(ev) {
    const messageData = JSON.parse(ev.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      setMessages((prev) => [...prev, { ...messageData }]);
    }
  }

  function logout() {
    axios.post("/logout").then(() => {
      setWs(null);
      setId(null);
      setName(null);
      setEmail(null);
    });
  }

  function sendMessage(ev, file = null) {
    if (ev) ev.preventDefault();

    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
        file,
      })
    );

    if (file) {
      axios.get("/messages/" + selectedUserId).then((res) => {
        setMessages(res.data);
      });
    } else {
      setNewMessageText("");
      setMessages((prev) => [
        ...prev,
        {
          text: newMessageText,
          sender: id,
          recipient: selectedUserId,
          _id: Date.now(),
        },
      ]);
    }
  }

  function sendFile(ev) {
    const reader = new FileReader();
    reader.readAsDataURL(ev.target.files[0]);
    reader.onload = () => {
      function sendMessage(ev, file = null) {
        if (ev) ev.preventDefault();
        ws.send(
          JSON.stringify({
            recipient: selectedUserId,
            text: newMessageText,
            file,
          })
        );

        if (file) {
          axios.get("/messages/" + selectedUserId).then((res) => {
            setMessages(res.data);
          });
        } else {
          setNewMessageText("");
          setMessages((prev) => [
            ...prev,
            {
              text: newMessageText,
              sender: id,
              recipient: selectedUserId,
              _id: Date.now(),
            },
          ]);
        }
      }
      sendMessage(null, {
        name: ev.target.files[0].name,
        data: reader.result,
      });
    };
  }

  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  useEffect(() => {
    axios.get("/people").then((res) => {
      const offLinePeopleArray = res.data
        .filter((p) => p._id !== id)
        .filter((p) => !Object.keys(onlinePeople).includes(p._id));
      const offLinePeople = {};
      offLinePeopleArray.forEach((p) => {
        const { _id, ...rest } = p;
        offLinePeople[p._id] = rest;
      });
      setOfflinePeople(offLinePeople);
    });
  }, [onlinePeople]);

  useEffect(() => {
    if (selectedUserId) {
      axios.get("/messages/" + selectedUserId).then((res) => {
        setMessages(res.data);
      });
    }
  }, [selectedUserId]);

  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];

  const messagesWithoutDupes = uniqWith(messages, isEqual);

  return (
    <div className="font-qSand h-screen flex flex-col">
      <div className="h-16 text-purple-500 flex items-center justify-start pl-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-8 h-8 my-2 text-purple-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
          />
        </svg>
        <span className="text-2xl font-semibold tracking-tight mx-1">
          Messenger
        </span>
      </div>
      <div className="flex flex-grow">
        <div className="bg-purple-200 w-1/3 p-2 px-4 flex flex-col">
          <div className="flex-grow">
            {Object.keys(onlinePeopleExclOurUser).map((userId) => (
              <Contact
                key={userId}
                id={userId}
                username={onlinePeopleExclOurUser[userId].name}
                onClick={() => setSelectedUserId(userId)}
                online={true}
                selected={userId === selectedUserId}
              />
            ))}
            {Object.keys(offlinePeople).map((userId) => (
              <Contact
                key={userId}
                id={userId}
                username={offlinePeople[userId].name}
                onClick={() => setSelectedUserId(userId)}
                online={false}
                selected={userId === selectedUserId}
              />
            ))}
          </div>
          <div className="p-2 text-center flex items-center justify-between text-gray-900">
            <span className="mr-3 text-sm flex gap-1 items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path
                  fillRule="evenodd"
                  d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                  clipRule="evenodd"
                />
              </svg>

              {name}
            </span>
            <button
              onClick={logout}
              className="text-sm text-white bg-purple-700 py-1 px-2 border rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="flex flex-col bg-purple-300 w-2/3 p-2">
          <div className="flex-grow">
            {!selectedUserId && (
              <div className="flex h-full items-center justify-center">
                <div>&larr; Select an online person to chat</div>
              </div>
            )}
            {!!selectedUserId && (
              <div className="relative h-full">
                <div
                  className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2"
                  style={{
                    scrollbarWidth: "none", // Firefox
                    msOverflowStyle: "none", // IE 10+
                    WebkitOverflowScrolling: "touch", // Smooth scrolling for iOS
                  }}
                >
                  {messagesWithoutDupes.map((message) => (
                    <div
                      key={message._id}
                      className={
                        message.sender === id ? "text-right" : "text-left"
                      }
                    >
                      <div
                        className={
                          "text-left inline-block p-2 my-1 rounded-md text-sm " +
                          (message.sender === id
                            ? "bg-purple-500 text-white"
                            : "bg-white text-black")
                        }
                      >
                        {message.text}
                        {message.file && (
                          <div className="">
                            <a
                              target="_blank"
                              className="flex flex-col items-center gap-1 border-b"
                              href={
                                axios.defaults.baseURL +
                                "/uploads/" +
                                message.file
                              }
                            >
                              {["png", "jpg", "jpeg"].includes(
                                message.file.split(".").pop()
                              ) && (
                                <img
                                  className="h-60 w-60"
                                  src={
                                    axios.defaults.baseURL +
                                    "/uploads/" +
                                    message.file
                                  }
                                  alt="Picture"
                                />
                              )}
                              {!["png", "jpg", "jpeg"].includes(
                                message.file.split(".").pop()
                              ) && (
                                <span className="flex gap-1 items-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="size-6"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  {message.file}
                                </span>
                              )}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <div ref={divUnderMessages}></div>
                </div>
              </div>
            )}
          </div>
          {!!selectedUserId && (
            <form className="flex gap-2" onSubmit={sendMessage}>
              <input
                value={newMessageText}
                onChange={(ev) => setNewMessageText(ev.target.value)}
                type="text"
                placeholder="Type your message here"
                className="bg-white rounded-md flex-grow border p-2"
              />
              <label
                type="button"
                className="cursor-pointer rounded-full bg-purple-500 p-2 text-white"
              >
                <input type="file" className="hidden" onChange={sendFile} />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z"
                    clipRule="evenodd"
                  />
                </svg>
              </label>
              <button
                type="submit"
                className="rounded-full bg-purple-500 p-2 text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                  />
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
