"use client";

// React hooks are exported from the 'ably/react' path of the 'ably' package.
import { useAbly, useConnectionStateListener } from 'ably/react';
import { useState } from 'react';
import { Chip } from '@heroui/chip';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDoorOpen, faCrown} from "@fortawesome/free-solid-svg-icons";

export function ConnectionState({roomId, isHost}: {roomId?: string, isHost?: boolean}) {
  const ably = useAbly();
  const [connectionState, setConnectionState] = useState(ably.connection.state);

  useConnectionStateListener((stateChange) => {
    setConnectionState(stateChange.current);
  });

  return (
    <div className='flex items-center space-x-6'>
      <p className='flex gap-x-1 items-center text-2xl'>
        <FontAwesomeIcon icon={faDoorOpen} />
        <span className='font-bold'>{roomId}</span>
      </p>
        <Chip variant='dot' color={
            connectionState === 'connected' ? 'success' : 'warning'}>
            {connectionState}
        </Chip>
        {isHost && (
          <Chip 
            startContent={<FontAwesomeIcon icon={faCrown} className="text-yellow-500" />}
            variant='flat' 
            color='warning'
          >
            Host
          </Chip>
        )}
    </div>
  );
}
