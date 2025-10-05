import { faClipboard, faShare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@heroui/button";
import { Modal, ModalContent } from "@heroui/modal";
import { useState } from "react";

export function Shere({roomId}: {roomId: string}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    return (
        <div>
            <Button onClick={() => {setIsOpen(true)}}>この部屋を共有</Button>
            <Modal isOpen={isOpen} onOpenChange={setIsOpen} size="md" placement="center">
                <ModalContent>
                    <div className="flex flex-col gap-4 p-4">
                        <h2 className="text-lg font-bold">この部屋のURLを共有</h2>
                        <p>以下のURLをコピーして、他の人と共有してください。</p>
                        <input
                            type="text"
                            readOnly
                            value={`${window.location.origin}/room/${roomId}`}
                            className="w-full p-2 border border-gray-300 rounded"
                            onFocus={(e) => e.target.select()}
                        />
                        <Button onClick={() => {
                            navigator.share ? navigator.share({title: 'NextTube together', text: '一緒に動画を見よう！', url: `${window.location.origin}/room/${roomId}`}) : alert("このブラウザではシェア機能は利用できません");
                        }}><FontAwesomeIcon icon={faShare} />共有</Button>
                        <Button onClick={() => {
                            //より確実にコピーできるように、navigator.clipboard APIを使用できないときは、input要素を選択してコピーする
                            if(navigator.clipboard){
                                navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
                            } else {
                                const input = document.createElement('input');
                                input.value = `${window.location.origin}/room/${roomId}`;
                                document.body.appendChild(input);
                                input.select();
                                document.execCommand('copy');
                                document.body.removeChild(input);
                            }
                            setIsCopied(true);
                        }}>{isCopied ? (<span>コピーしました！</span>)  : (<><FontAwesomeIcon icon={faClipboard} /><span>URLをコピー</span></>)}</Button>
                    </div>
                </ModalContent>
            </Modal>
        </div>
    )
}