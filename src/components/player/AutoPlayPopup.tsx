import { Button } from '@heroui/button'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal'

export function AutoPlayPopup({showAutoplayModal , setShowAutoplayModal , handleEnableAutoplay , setHasInteracted}: {showAutoplayModal: boolean , setShowAutoplayModal: (value: boolean) => void , handleEnableAutoplay: () => void , setHasInteracted: (value: boolean) => void}) {
    return (
        <Modal 
            isOpen={showAutoplayModal} 
            onClose={() => {setShowAutoplayModal(false); setHasInteracted(true);}}
            placement="center"
        >
                <ModalContent>
                            <ModalHeader className="flex flex-col gap-1">
                                プレイヤーを正常に再生できません
                            </ModalHeader>
                            <ModalBody>
                                <p>
                                    ブラウザの設定により、動画の自動再生がブロックされている可能性があります。
                                </p>
                                <p>
                                    下のボタンをクリックして自動再生を許可してください。
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button 
                                    color="primary" 
                                    onPress={handleEnableAutoplay}
                                >
                                    自動再生を許可
                                </Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
    )
}