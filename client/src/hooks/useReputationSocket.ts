import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../socket';

interface ReputationEvent {
  userId: string;
  delta: number;
  newTotal: number;
  reason: string;
}

/**
 * Subscribe to real-time reputation change events for the current user.
 */
export function useReputationSocket() {
  const { jwt, user } = useAuth();
  const [latestEvent, setLatestEvent] = useState<ReputationEvent | null>(null);

  useEffect(() => {
    if (!jwt || !user) return;

    const socket = getSocket(jwt);

    const onReputation = (event: ReputationEvent) => {
      if (event.userId === user.uid) {
        setLatestEvent(event);
      }
    };

    socket.on('reputation:updated', onReputation);

    return () => {
      socket.off('reputation:updated', onReputation);
    };
  }, [jwt, user]);

  return { latestEvent };
}
