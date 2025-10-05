import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal , ModalContent, ModalHeader, useDisclosure } from "@heroui/modal"
import Image from "next/image";
import { useState } from "react";
import { useChannel } from "ably/react";
import dayjs from "dayjs";

export function Search({roomId}: {roomId: string}) {
    const {publish} = useChannel(`room:${roomId}`)
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [inputValue, setInputValue] = useState('');
    const [results, setResults] = useState<{id : {kind : string , videoId : string} , snippet : {title : string , channelTitle : string , publishedAt : string}}[]>([]);
    const handleSearch = async () => {
        if (!inputValue.trim()) return;
        const res = await fetch(`/api/search?q=${encodeURIComponent(inputValue.trim())}`);
        const data = await res.json();
        setResults(data.items);
    }
    return (
        <>
        <Button onPress={onOpen}>検索して動画を探す</Button>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl" placement="bottom-center" scrollBehavior="outside">
            <ModalHeader>
                検索
            </ModalHeader>
            <ModalContent>
                        <div className="flex place-content-center sm:pt-4 pt-12 w-full">
                          <div className="flex gap-x-2 w-[400px]">
                              <Input
                              type="text"
                              placeholder="検索ワードを入力"
                              className=""
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  handleSearch();
                                }
                              }}
                            />
                            <Button
                              variant='solid'
                              color='primary'
                              onClick={handleSearch}
                            >
                              検索
                            </Button>
                          </div>
                      </div>
                      <div className="min-h-64 px-4">
                        {results.length === 0 && (
                            <p className="text-center mt-4 text-gray-500">検索結果がありません</p>
                        )}
                        {results.map((item) => (
                          item.id.kind === "youtube#video" && (
                            <div key={item.id.videoId} onClick={() => {
                              onOpenChange();
                              publish({data : {ytid : item.id.videoId , playing: false , seek: 0}})
                            }} className="relative my-6 break-all sm:flex items-start gap-4 cursor-pointer rounded-lg shadow-md hover:bg-gray-100 transition-colors">
                                <Image
                                src={`https://i.ytimg.com/vi/${item.id?.videoId}/hqdefault.jpg`}
                                alt=""
                                width={120 * 2.5}
                                height={67.5 * 2.5}
                                className="inline sm:rounded-md rounded-t-lg aspect-video object-cover w-full sm:w-[300px]"
                                unoptimized
                                />
                              <div className="sm:inline">
                                <div className="py-4 px-2 sm:px-0 flex flex-col gap-y-1">
                                    <p className="">{item.snippet.title}</p>
                                    <p className='text-slate-600 text-sm'>{item.snippet.channelTitle} ・ {dayjs(item.snippet.publishedAt).format('YYYY年MM月DD日')} </p>
                                </div>
                              </div>
                            </div>
                          )
                        ))}
                </div>
            </ModalContent>
        </Modal>
        </>
    )
}