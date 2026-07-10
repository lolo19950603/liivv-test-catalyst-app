export function ChatSystemMessage({ body }: { body: string }) {
  return (
    <div className="flex justify-center py-1">
      <p className="text-center text-xs italic text-[#8a8176]">{body}</p>
    </div>
  );
}
