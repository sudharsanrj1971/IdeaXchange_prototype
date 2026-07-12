// src/pages/ProjectDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import StateStepper from '../components/StateStepper';
import LedgerTimeline from '../components/LedgerTimeline';
import ImpactScoreBadge from '../components/ImpactScoreBadge';
import { fetchProject } from '../services/projectService';
import { io, Socket } from 'socket.io-client';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (id) {
      fetchProject(id).then(setProject);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const newSocket = io(BASE_URL, { transports: ['websocket'] });
    newSocket.emit('joinProject', id);

    newSocket.on('scoreUpdate', (payload: any) => {
      // The payload now has { block, projectImpactScore }
      setProject((prev: any) => {
        if (!prev) return prev;
        return { ...prev, impactScore: payload.projectImpactScore };
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leaveProject', id);
      newSocket.disconnect();
    };
  }, [id]);

  if (!project) {
    return <div className="text-center py-20 text-purple-300">Loading project…</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-4xl font-bold text-pink-400">{project.title}</h1>
      <p className="text-gray-300">{project.description}</p>
      <ImpactScoreBadge score={project.impactScore || 0} />
      <StateStepper currentState={project.status || project.state || 'Submitted'} />
      <LedgerTimeline projectId={project._id} socket={socket} />
    </div>
  );
}
