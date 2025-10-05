import EnterUsername from "./EnterUsername";
import RoomClient from "./RoomClient";

export default async function RoomPage({
    params, 
    searchParams
} : {
    params: Promise<{roomId: string}>, 
    searchParams: Promise<{[key: string]: string | string[] | undefined}>
}) {
    const {roomId} = await params;
    const username = (await searchParams).username;
    console.log(username)
    if(username === undefined || username === "") {
        return <EnterUsername roomId={roomId} />
    }
    return (
        <div>
            <RoomClient roomId={roomId} username={username as string || "名無しさん"} />
        </div>
    )
}