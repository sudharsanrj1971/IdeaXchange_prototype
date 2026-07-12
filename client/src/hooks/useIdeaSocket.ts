import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSocket, disconnectSocket } from '../socket';
import type { Contribution } from '../api/contributions';

interface IdeaSocketState {
  connected: boolean;
  newContributions: Contribution[];
  updatedContributions: Contribution[];
}

/**
 * Subscribe to real-time contribution events for a specific idea.
 * Joins the idea's socket room and listens for new/updated contributions.
 */
export function useIdeaSocket(ideaId: string | undefined) {
  const { jwt } = useAuth();
  const [state, setState] = useState<IdeaSocketState>({
    connected: false,
    newContributions: [],
    updatedContributions: [],
  });

  useEffect(() => {
    if (!jwt || !ideaId) return;

    const socket = getSocket(jwt);

    const onConnect = () => {
      setState((s) => ({ ...s, connected: true }));
      socket.emit('join-idea', ideaId);
    };

    const onDisconnect = () => {
      setState((s) => ({ ...s, connected: false }));
    };

    const onNewContribution = (contribution: Contribution) => {
      setState((s) => ({
        ...s,
        newContributions: [contribution, ...s.newContributions],
      }));
    };

    const onContributionUpdated = (contribution: Contribution) => {
      setState((s) => ({
        ...s,
        updatedContributions: [contribution, ...s.updatedContributions],
      }));
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('contribution:new', onNewContribution);
    socket.on('contribution:updated', onContributionUpdated);

    if (socket.connected) {
      setState((s) => ({ ...s, connected: true }));
      socket.emit('join-idea', ideaId);
    }

    return () => {
      socket.emit('leave-idea', ideaId);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('contribution:new', onNewContribution);
      socket.off('contribution:updated', onContributionUpdated);
    };
  }, [jwt, ideaId]);

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  return state;
}
