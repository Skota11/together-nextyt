import Ably from "ably"
import { nanoid } from "nanoid"
import { NextRequest } from "next/server"

/**
 * Host決定ロジック（サーバー側で一元管理）:
 * 
 * 1. 部屋に誰もいない → 最初の入室者がHost
 * 2. 既存メンバーにHostがいる → 新規入室者はHostにならない
 * 3. Hostがいない（Hostが退出した直後）→ 
 *    clientIdを辞書順でソートし、最小のclientIdがHost
 * 
 * これにより、複数クライアントが同時にリクエストしても
 * 必ず同じ人がHostに選ばれる（決定論的）
 */
export async function GET(req: NextRequest) {
    const randomClientId = nanoid(10)
    const searchParams = req.nextUrl.searchParams
    const clientId = searchParams.get('clientId') || randomClientId
    const roomId = searchParams.get('roomId')
    
    if (!roomId) {
        return new Response('roomId is required', { status: 400 })
    }
    
    const channelName = `room:${roomId}`;
    const ably = new Ably.Rest(process.env.ABLY_API_KEY!)
    const presencePage = await ably.channels.get(channelName).presence.get();

    // 既存メンバー（現在のclientIdは除外）
    const existingMembers = presencePage.items.filter(
        member => member.clientId && member.clientId !== clientId
    );

    let isHost = false;

    if (existingMembers.length === 0) {
        // 誰もいなければ自動的にHost
        isHost = true;
    } else {
        // 既存メンバーにHostがいるかチェック
        const currentHost = existingMembers.find(m => m.data?.isHost === true);
        
        if (currentHost) {
            // Hostがいる → 新規入室者はHostにならない
            isHost = false;
        } else {
            // Hostがいない → clientIdが最小の人がHost
            // 全員のclientId（既存 + 自分）をソートして判定
            const allClientIds = [
                ...existingMembers.map(m => m.clientId || ''),
                clientId
            ].filter(id => id !== '').sort();
            
            // 最小のclientIdが自分ならHost
            isHost = allClientIds[0] === clientId;
        }
    }

    // Hostの場合のみpublish権限を付与
    const capability = isHost
        ? {
            [`chat:${roomId}:*`]: ['publish', 'subscribe', 'presence', 'history'],
            [`room:${roomId}`]: ['publish', 'subscribe', 'presence', 'history'],
        }
        : {
            [`chat:${roomId}:*`]: ['publish', 'subscribe', 'presence', 'history'],
            [`room:${roomId}`]: ['subscribe', 'presence', 'history'],
        };
    
    const token = await ably.auth.createTokenRequest({
        clientId: clientId,
        capability: JSON.stringify(capability),
        ttl: 1000 * 60 * 60, // 1時間
    })
    
    return Response.json({ ...token, isHost })
}