"use client";

import { AccordionMenu } from "@/components/AccordionMenu";
import { ConnectionState } from "@/components/ConnectionState";
import { Player } from "@/components/Player";
import Ably from "ably";
import { AblyProvider , ChannelProvider } from "ably/react"
import { ChatClient } from "@ably/chat"
import { ChatClientProvider} from "@ably/chat/react"
import { useEffect, useState } from "react";
import { Search } from "@/components/Search";
import { Button } from "@heroui/button";
import { Shere } from "@/components/menus/Share";


export default function RoomPage({ roomId , username }: { roomId: string  , username: string}) {
    const [realtimeClient, setRealtimeClient] = useState<Ably.Realtime | null>(null);
    const [chatClient, setChatClient] = useState<ChatClient | null>(null);
    const [isHost , setIsHost] = useState<boolean>(false);

    useEffect(() => {
        const initAbly = async () => {
            const baseAuthUrl = `${window.location.origin}/api/ably-auth?roomId=${roomId}`;
            // トークンとisHost情報を取得
            const response = await fetch(baseAuthUrl);
            const authData = await response.json();
            const initialClientId = authData.clientId;
            const isHost = authData.isHost;
            setIsHost(isHost);
            
            const client = new Ably.Realtime({ 
                authCallback: async (tokenParams, callback) => {
                    console.log(tokenParams)
                    try {
                        // 常に同じclientIdを使用
                        const authUrl = `${baseAuthUrl}&clientId=${initialClientId}`;
                        const response = await fetch(authUrl);
                        const tokenRequest = await response.json();
                        callback(null, tokenRequest);
                    } catch (error) {
                        callback(error instanceof Error ? error.message : String(error), null);
                    }
                }
            });
            
            const chatClient = new ChatClient(client);
            setRealtimeClient(client);
            setChatClient(chatClient);
            
            const channel = client.channels.get(`room:${roomId}`);
            
            // プレゼンス変更の監視を設定
            channel.presence.subscribe('leave', async (member) => {
                
                // 退出したメンバーが部屋主だった場合、トークンを再取得
                if (member.data?.isHost) {                    
                    try {
                        // authCallbackを再トリガーしてトークンを更新
                        // これにより同じclientIdで新しい権限のトークンが取得される
                        await client.auth.authorize();                    
                        // 新しい権限を確認するためにAPIを呼び出し
                        const authUrl = `${baseAuthUrl}&clientId=${initialClientId}`;
                        const newTokenResponse = await fetch(authUrl);
                        const newTokenData = await newTokenResponse.json();
                        
                        // isHostステートを更新
                        setIsHost(newTokenData.isHost);
                        
                        // プレゼンス情報を更新
                        await channel.presence.update({ userName: username, isHost: newTokenData.isHost });
                    } catch (error) {
                        console.error('Error updating presence after host leave:', error);
                    }
                }
            });
            
            await channel.presence.enter({ userName: username, isHost: isHost });
        };
        
        initAbly();
        
        return () => {
            if (realtimeClient) {
                realtimeClient.close();
            }
        };
    }, [roomId, username]);

    if (!realtimeClient) {
        return <div className="">Connecting to Ably...</div>;
    }
    return (
        <AblyProvider client={realtimeClient}>
            <ChatClientProvider client={chatClient!}>
                <ChannelProvider channelName={`room:${roomId}`}>
                    <div className="space-y-4">
                        <ConnectionState roomId={roomId} />
                        <div className="md:flex md:space-x-4">
                            <div className="md:static fixed bottom-4 left-0 right-0 px-4 md:px-0 md:w-1/3 z-50">
                                <AccordionMenu roomId={roomId} username={username}/>
                            </div>
                            <div className="md:flex-auto">
                                <div className="">
                                    <Player roomId={roomId} isHost={isHost}/>
                                    <div className="mt-4 flex justify-end gap-x-2">
                                        {isHost && (
                                                <Search roomId={roomId} />
                                        )}
                                        <Shere roomId={roomId} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ChannelProvider>
            </ChatClientProvider>
        </AblyProvider>
    )
}