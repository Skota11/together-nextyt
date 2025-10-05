"use client";

import { Accordion, AccordionItem } from "@heroui/accordion";
import { RoomMember } from "./menus/RoomMember";
import { usePresenceListener } from "ably/react";
import { ChatRoomProvider } from "@ably/chat/react";
import { Chat } from "./menus/Chat";

export function AccordionMenu({roomId , username}: {roomId: string , username: string}) {
    const { presenceData } = usePresenceListener(`room:${roomId}`);
    return (
        <ChatRoomProvider name={`chat:${roomId}`}>
            <Accordion variant="splitted" keepContentMounted defaultExpandedKeys={["chat"]}>
                <AccordionItem key="members" title="参加中のメンバー" subtitle={`合計 ${presenceData.length} 人`}>
                    <RoomMember roomId={roomId} />
                </AccordionItem>
                <AccordionItem key="chat" title="チャット">
                    <Chat username={username}/>
                </AccordionItem>
            </Accordion>
        </ChatRoomProvider>
    )
}