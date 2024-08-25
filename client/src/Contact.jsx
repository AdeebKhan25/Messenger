import Avatar from "./Avatar.jsx";

export default function Contact({ id, username, selected, onClick, online }) {
  return (
    <div
      key={id}
      onClick={() => onClick(id)}
      className={
        "border-b border-gray-400 flex items-center gap-2 rounded-md cursor-pointer " +
        (selected ? "bg-purple-400" : "")
      }
    >
      {selected && <div className="w-1 bg-purple-500 h-12 rounded-r-md"></div>}

      <div className="flex gap-2 py-2 items-center rounded-md">
        <Avatar online={online} name={username} userId={id} />
        <span className={selected ? "text-white" : "text-gray-800"}>
          {username}
        </span>
      </div>
    </div>
  );
}
