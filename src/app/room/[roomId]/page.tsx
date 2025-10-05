import RoomClient from "./RoomClient";

export default async function RoomPage({
    params, 
    searchParams
} : {
    params: Promise<{roomId: string}>, 
    searchParams: Promise<{[key: string]: string | string[] | undefined}>
}) {
    const {roomId} = await params;
    const username = (await searchParams).username as string || "名無しさん";
    return (
        <div>
            <RoomClient roomId={roomId} username={username} />
        </div>
    )
}