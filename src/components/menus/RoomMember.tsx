import { usePresenceListener } from "ably/react";
import {User} from "@heroui/user"

export function RoomMember({roomId}: {roomId: string}) {
    const { presenceData } = usePresenceListener(`room:${roomId}`);
    console.log(presenceData)
    return (
        <div className="flex flex-col gap-2 items-start">
            {presenceData.map((member) => (
                <User key={member.clientId} name={member.data.userName} description={member.data.isHost ? "部屋主" : undefined}/>
            ))}
        </div>
    )
}