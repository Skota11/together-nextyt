"use client";

import { AccordionMenu } from "@/components/AccordionMenu";
import { ConnectionState } from "@/components/ConnectionState";
import { Player } from "@/components/Player";
import Ably, { RealtimeChannel } from "ably";
import { AblyProvider , ChannelProvider } from "ably/react"
import { ChatClient } from "@ably/chat"
import { ChatClientProvider} from "@ably/chat/react"
import { useEffect, useState, useRef } from "react";
import { Search } from "@/components/Search";
import { Shere } from "@/components/menus/Share";

export default function RoomPage({ roomId , username }: { roomId: string  , username: string}) {
    const [realtimeClient, setRealtimeClient] = useState<Ably.Realtime | null>(null);
    const [chatClient, setChatClient] = useState<ChatClient | null>(null);
    const [isHost, setIsHost] = useState<boolean>(false);
    const clientIdRef = useRef<string>('');
    const isReauthorizingRef = useRef<boolean>(false);
    const isHostRef = useRef<boolean>(false);

    // isHostRefを同期
    useEffect(() => {
        isHostRef.current = isHost;
    }, [isHost]);

    useEffect(() => {
        let client: Ably.Realtime | null = null;
        let channel: RealtimeChannel | null = null;
        
        const initAbly = async () => {
            const baseAuthUrl = `${window.location.origin}/api/ably-auth?roomId=${roomId}`;
            
            // 初回トークン取得
            const response = await fetch(baseAuthUrl);
            const authData = await response.json();
            const initialClientId = authData.clientId;
            clientIdRef.current = initialClientId;
            setIsHost(authData.isHost);
            isHostRef.current = authData.isHost;
            
            client = new Ably.Realtime({ 
                authCallback: async (tokenParams, callback) => {
                    try {
                        const authUrl = `${baseAuthUrl}&clientId=${initialClientId}`;
                        const response = await fetch(authUrl);
                        const tokenRequest = await response.json();
                        
                        // サーバーが決定したisHost状態を反映
                        setIsHost(tokenRequest.isHost);
                        isHostRef.current = tokenRequest.isHost;
                        
                        callback(null, tokenRequest);
                    } catch (error) {
                        callback(error instanceof Error ? error.message : String(error), null);
                    }
                }
            });
            
            const chatClientInstance = new ChatClient(client);
            setRealtimeClient(client);
            setChatClient(chatClientInstance);
            
            channel = client.channels.get(`room:${roomId}`);
            
            // Hostが抜けた時の処理
            channel.presence.subscribe('leave', async (member) => {
                // 退出したのがHostでなければ何もしない
                if (!member.data?.isHost) return;
                
                // 自分が既にHostなら何もしない
                if (isHostRef.current) return;
                
                // 再認可中なら何もしない
                if (isReauthorizingRef.current) return;
                
                // サーバーに問い合わせて新Hostを決定してもらう
                // 少し待ってからリクエスト（プレゼンスリストの更新を待つ）
                isReauthorizingRef.current = true;
                
                setTimeout(async () => {
                    try {
                        if (!client) return;
                        
                        // トークンを再取得（サーバーがHost決定）
                        await client.auth.authorize();
                        
                        // 新しいHost状態でプレゼンスを更新
                        if (channel && isHostRef.current) {
                            await channel.presence.update({ userName: username, isHost: true });
                        }
                    } catch (error) {
                        console.error('Error during host handover:', error);
                    } finally {
                        isReauthorizingRef.current = false;
                    }
                }, 500);
            });
            
            // 自分自身を入室させる
            await channel.presence.enter({ userName: username, isHost: authData.isHost });
        };
        
        initAbly();
        
        return () => {
            if (client) {
                client.close();
            }
        };
    }, [roomId, username]);

    // isHost変更時にプレゼンス情報を更新
    useEffect(() => {
        if (realtimeClient && clientIdRef.current) {
            const channel = realtimeClient.channels.get(`room:${roomId}`);
            channel.presence.update({ userName: username, isHost }).catch(console.error);
        }
    }, [isHost, realtimeClient, roomId, username]);

    if (!realtimeClient) {
        return <div className="">Connecting to Ably...</div>;
    }
    
    return (
        <AblyProvider client={realtimeClient}>
            <ChatClientProvider client={chatClient!}>
                <ChannelProvider channelName={`room:${roomId}`}>
                    <div className="space-y-4 mb-8">
                        <ConnectionState roomId={roomId} isHost={isHost} />
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