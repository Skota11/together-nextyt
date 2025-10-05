import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const videoId = searchParams.get("id");
    if (!videoId) {
        return new Response("Missing video ID", { status: 400 });
    }
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=id,snippet,statistics&id=${videoId}&key=AIzaSyC1KMsyjrnEfHJ3xnQtPX0DSxWHfyjUBeo`);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
        return Response.json({ error: 'Video not found' }, { status: 404 })
    }

    const video = data.items[0];
    return Response.json({
        snippet: video.snippet,
        statistics: video.statistics
    })
}