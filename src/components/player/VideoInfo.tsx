import { useEffect, useState } from "react"

type Info = {
    title: string
}

export function VideoInfo ({ytid}: {ytid?: string}) {
    const [info , setInfo] = useState<Info | null>(null)
    useEffect(() => {
        const f = async() => {
            if(!ytid) return;
            const res = await fetch(`/api/youtube?id=${ytid}`);
            const data = await res.json();
            setInfo({
                title: data.snippet.title
            })
        }
        f()
    } , [ytid])
    return (
        <h1 className="text-lg font-bold my-4 truncate">{info?.title}</h1>
    )
}