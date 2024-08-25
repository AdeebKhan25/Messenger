export default function Avatar({ name, userId, online }) {
  return (
    <div
      className={
        "w-8 h-8 relative rounded-full flex items-center bg-purple-100"
      }
    >
      <div className="text-center w-full opacity-70">{name[0]}</div>
      {online && (
        <div className="absolute w-3 h-3 bg-green-400 rounded-full bottom-0 right-0 border border-white"></div>
      )}
      {!online && (
        <div className="absolute w-3 h-3 bg-gray-400 rounded-full bottom-0 right-0 border border-white"></div>
      )}
    </div>
  );
}
