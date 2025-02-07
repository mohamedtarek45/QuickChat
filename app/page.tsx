"use client";
import ChatForm from "@/components/ChatForm";
import ChatMessage from "@/components/ChatMessage";
import { useEffect, useState } from "react";
import { socket } from "@/lib/socketClient";
export default function Home() {
  const [error,setError]=useState<string | null>(null)
  const [room, setRoom] = useState<string>("");
  const [joined, setJoined] = useState<boolean>(false);
  const [messages, setMessages] = useState<
    { sender: string; message: string }[]
  >([]);
  const [userName, setUserName] = useState<string>("");
  const handleMessage = (data:{sender:string,message:string}) => {
    console.log(data);
    setMessages((prev) => [...prev, data]);
  };
  const handleJoin = (message: string) => {
    console.log(message);
    setMessages((prev) => [...prev, { sender: "system", message }]);
  };
  const handleJoinState=(feedback:string)=>{
    if(feedback==="This username is already taken in this room.")
    { 
      console.log("This username is already taken in this room.");
      setError("This username is already taken in this room.")
      setJoined(false);
      return;
    }else if(feedback==="This username is valid"){
      setJoined(true);
    }
  }
  useEffect(() => {
    socket.on("message", handleMessage);
    socket.on("user-joined", handleJoin);
    socket.on("join-state",handleJoinState)

    return () => {
      socket.off("user-joined",handleJoin);
      socket.off("message",handleMessage);
    };
  }, [joined, room, userName]);
  const handleSendMessage = (message: string) => {
    const data = { sender: userName, message, room };
    setMessages((prev) => [...prev, data]);
    console.log("data", data);
    socket.emit("message", data);
    console.log(message);
  };
  const handleJoinRoom = () => {
    if (userName && room) {
      socket.emit("join-room", { room, userName });
    }
  };
  return (
    <div className="flex mt-16 justify-center w-full ">
      {!joined ? (
        <div className="flex w-full max-w-3xl mx-auto flex-col items-center">
          <h1 className="mb-4 text-2xl font-bold">Join a Room</h1>
          <input
            type="text"
            placeholder="Username"
            className={`w-64 px-4 py-2 outline-none mb-4 border-2 rounded-lg ${error?"border-1 border-red-500":""}`}
            value={userName}
            onChange={(e) => {setUserName(e.target.value); setError(null)}}
          />
          <input
            type="text"
            placeholder="Room"
            className="w-64 outline-none px-4 py-2 mb-4 border-2 rounded-lg"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          {error&&<p className="text-red-500 mb-5">{error}</p>}
          <button
            className="px-4 py-2 text-white bg-blue-500 border rounded-full"
            onClick={handleJoinRoom}
          >
            Join Room
          </button>
        </div>
      ) : (
        <div className="w-full  max-w-3xl mb-9 ">
          <h1 className="text-3xl mb-4 font-bold">{userName} joined Room:{room}</h1>
          <div className="h-[500px] overflow-y-auto p-4 mb-4 bg-gray-200 border-2 rounded-lg">
            {messages.map((msg, index) => (
              <ChatMessage
                key={index}
                message={msg.message}
                sender={msg.sender}
                isOwnMessage={msg.sender === userName}
              />
            ))}
          </div>
          <ChatForm onSendMessage={handleSendMessage} />
        </div>
      )}
    </div>
  );
}
