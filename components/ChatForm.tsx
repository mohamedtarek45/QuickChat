"use client";

import { useRef, useState } from "react";

type ChatFormProps = {
    onSendMessage: (message: string) => void;
};
const ChatForm = ({onSendMessage}: ChatFormProps) => {
  const [message, setMessage] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()!=="") {
        console.log(message);
        if(ref.current){
            ref.current.value="";
        }
        onSendMessage(message);
        setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
      <input
        onChange={(e) => setMessage(e.target.value)}
        type="text"
        ref={ref}
        className="flex-1 rounded-lg border-2 border-gray-300 px-4 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-lg bg-blue-500 px-4 py-2 text-white"
      >
        Send
      </button>
    </form>
  );
};

export default ChatForm;
