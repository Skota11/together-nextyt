"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useRef } from "react";

export default function RoomPage() {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <div className="flex flex-col gap-8">
            <h1 className="text-xl">NextTube Together</h1>
            <div className="">
                <h1 className="text-xl font-bold my-2">部屋を作成する</h1>
                <p>部屋名を決めて、共有します。</p>
                <p>部屋名に使えるのは英数字のみです。</p>
                <div className="flex items-center gap-4">
                    <Input ref={inputRef} placeholder="部屋名を入力" className="w-full max-w-xs my-4"/>
                    <Button onClick={() => {
                        const roomId = inputRef.current?.value;
                        if(!roomId || roomId.trim() === ""){
                            alert("部屋名を入力してください");
                            return;
                        }
                        if(!/^[a-zA-Z0-9]+$/.test(roomId)){
                            alert("部屋名には英数字のみ使用できます");
                            return;
                        }
                        window.location.href = `/room/${roomId}`
                    }} color="primary">部屋を作成</Button>
                </div>
            </div>
            <div className="">
                <h1 className="text-xl font-bold my-2">部屋に参加する</h1>
                <p>部屋主またはその部屋のメンバーから共有リンクを受け取ってください。</p>
            </div>
        </div>
    )
}