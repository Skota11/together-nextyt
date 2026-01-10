import { useChannel } from 'ably/react'
import React, { useEffect, useRef, useState } from 'react'
import ReactPlayer from 'react-player'
import { useAbly } from 'ably/react'
import { AutoPlayPopup } from './player/AutoPlayPopup'
import { VideoInfo } from './player/VideoInfo'

export function Player({roomId , isHost}: {roomId: string , isHost: boolean}) {
    const ably = useAbly();
    const [ytid , setYtid] = useState<string >("")
    const [playing , setPlaying] = useState<boolean>(true)
    const [showAutoplayModal, setShowAutoplayModal] = useState<boolean>(false)
    const [hasInteracted, setHasInteracted] = useState<boolean>(false)
    const playerRef = useRef<HTMLVideoElement>(null);

    const handleEnableAutoplay = () => {
        setHasInteracted(true);
        setShowAutoplayModal(false);
        setPlaying(true);
    };

    const {publish} = useChannel(`room:${roomId}` , (message) => {
        if(message.data.ytid !== ytid){
            setYtid(message.data.ytid)
        }
            if(message.clientId === ably.auth.clientId) return;
            setPlaying(message.data.playing)
            //playingに対応できない時用に
            if(message.data.playing){
                if(!hasInteracted){
                    setShowAutoplayModal(true);
                }
                playerRef.current?.play();
            }else {
                playerRef.current?.pause();
            }
        if(message.data.seek !== undefined && playerRef.current){
            if(message.clientId === ably.auth.clientId) return;
            const currentTime = playerRef.current.currentTime;
            if(Math.abs(currentTime - message.data.seek) > 1){
                // シーク処理
                playerRef.current.currentTime = message.data.seek;
            }
        }
    })

    // 定期的にプレイヤーのStateを送信（ホストのみ）
    useEffect(() => {
        if (!isHost || ytid === "") return;
        const intervalId = setInterval(() => {
            if (playerRef.current) {
                const currentTime = playerRef.current.currentTime;
                publish(`room:${roomId}`, { 
                    ytid, 
                    playing, 
                    seek: currentTime 
                });
            }
        }, 3000); // 3秒ごとに送信

        return () => clearInterval(intervalId);
    }, [isHost, ytid, playing, roomId, publish]);
    
    
    useEffect(() => {
        const handleUserInteraction = () => {
            setHasInteracted(true);
            // インタラクションがあればモーダルは不要
            setShowAutoplayModal(false);
        };

        // 様々なユーザーインタラクションを検知
        document.addEventListener('click', handleUserInteraction);

        return () => {
            // クリーンアップ
            document.removeEventListener('click', handleUserInteraction);
        };
    }, []);
    
    return (
        <div className="">
            <AutoPlayPopup setHasInteracted={setHasInteracted} handleEnableAutoplay={handleEnableAutoplay} showAutoplayModal={showAutoplayModal} setShowAutoplayModal={setShowAutoplayModal}/>
            <div className='aspect-video w-full shadow-lg rounded-xl overflow-hidden'>
                {ytid === "" && (
                    <div className='flex justify-center items-center h-full bg-black text-white'>
                        <p className='text-center'>動画が選択されていません。</p>
                    </div>
                )}
                {ytid !== "" && (
                    <ReactPlayer 
                    src={`https://www.youtube.com/watch?v=${ytid}`}
                    width="100%"
                    height="100%"
                    controls={isHost}
                    playing={playing}
                    ref={playerRef}
                    onPlay={async (e) => {
                            if(!hasInteracted){
                                setShowAutoplayModal(true);
                            }
                            setPlaying(true)
                            if (isHost) {
                                publish(`room:${roomId}` , { ytid, playing: true , seek: e.currentTarget.currentTime })
                            }
                    }}
                    onPause={async (e) => {
                            setPlaying(false)
                            if (isHost) {
                                publish(`room:${roomId}`, { ytid, playing: false , seek: e.currentTarget.currentTime })
                            }
                    }}
                    onSeeked={async (e) => {
                            if (isHost) {
                                publish(`room:${roomId}`, { ytid, playing, seek: e.currentTarget.currentTime })
                            }
                    }}
                />
                )}
            </div>
            <VideoInfo ytid={ytid} />
        </div>
    )
}