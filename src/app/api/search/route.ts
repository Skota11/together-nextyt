import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    if (!query) {
        return new Response("Missing query", { status: 400 });
    }
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=AIzaSyC1KMsyjrnEfHJ3xnQtPX0DSxWHfyjUBeo&maxResults=50&type=video&regionCode=jp`);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
        return Response.json({ error: 'No results found' }, { status: 404 })
    }

    return Response.json(data)
}