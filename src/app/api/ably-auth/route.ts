import Ably from "ably"
import { nanoid } from "nanoid"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
    const ramdomClientId = nanoid(10)
    const searchParams = req.nextUrl.searchParams
    const clientId = searchParams.get('clientId') || ramdomClientId
    const roomId = searchParams.get('roomId')
    if (!roomId) {
        return new Response('roomId is required', { status: 400 })
    }
    const channelName = `room:${roomId}`;
    const ably = new Ably.Rest(process.env.ABLY_API_KEY!)
    const presencePage = await ably.channels.get(channelName).presence.get();

    // 部屋主の決定ロジック（API側で管理）
    let isHost = false;

    if (presencePage.items.length === 0) {
        // 誰もいない場合は最初の入室者が部屋主
        isHost = true;
    } else {
        // 既存メンバーの中に部屋主がいるか確認
        const hasHost = presencePage.items.some(member => member.data?.isHost === true);

        if (!hasHost) {
            // 部屋主がいない場合、入室時刻でソートして最も早いメンバーを部屋主にする
            const sortedMembers = [...presencePage.items].sort((a, b) =>
                (a.data?.joinedAt || 0) - (b.data?.joinedAt || 0)
            );

            // 最も早く入室したメンバーのclientIdと比較
            if (sortedMembers.length > 0 && sortedMembers[0].clientId === clientId) {
                isHost = true;
            }
        }
    }

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
        ttl: 1000 * 60 * 60,
    })
    return Response.json({ ...token, isHost })
}