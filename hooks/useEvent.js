import { useState, useEffect } from 'react';
import { 
  getEventById, 
  joinEvent, 
  leaveEvent,
  getEventParticipants 
} from '../services/eventService';

/**
 * Hook pour gérer un event individuel
 */
export const useEvent = (eventId, currentUserId) => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [isParticipant, setIsParticipant] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadEvent();
      loadParticipants();
    }
  }, [eventId]);

  const loadEvent = async () => {
    setLoading(true);
    const result = await getEventById(eventId, currentUserId);
    
    if (result.success) {
      setEvent(result.data);
      setIsParticipant(result.data.is_participant || false);
    }
    
    setLoading(false);
  };

  const loadParticipants = async () => {
    const result = await getEventParticipants(eventId);
    
    if (result.success) {
      setParticipants(result.data);
    }
  };

  const handleJoin = async () => {
    if (!currentUserId || joining) return;

    setJoining(true);
    const result = await joinEvent(eventId, currentUserId);
    
    if (result.success) {
      setIsParticipant(true);
      setEvent(prev => ({
        ...prev,
        participants_count: (prev?.participants_count || 0) + 1
      }));
      loadParticipants(); // Recharger la liste
    }
    
    setJoining(false);
    return result;
  };

  const handleLeave = async () => {
    if (!currentUserId || joining) return;

    setJoining(true);
    const result = await leaveEvent(eventId, currentUserId);
    
    if (result.success) {
      setIsParticipant(false);
      setEvent(prev => ({
        ...prev,
        participants_count: Math.max((prev?.participants_count || 0) - 1, 0)
      }));
      loadParticipants(); // Recharger la liste
    }
    
    setJoining(false);
    return result;
  };

  return {
    event,
    loading,
    participants,
    isParticipant,
    joining,
    handleJoin,
    handleLeave,
    refresh: loadEvent,
  };
};