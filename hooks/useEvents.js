import { useState, useEffect } from 'react';
import { 
  getUpcomingEvents,
  getUserEvents,
  getUserParticipatingEvents 
} from '../services/eventService';

/**
 * Hook pour gérer une liste d'events
 */
export const useEvents = (type = 'upcoming', userId = null) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [type, userId]);

  const loadEvents = async () => {
    setLoading(true);
    let result;

    switch (type) {
      case 'upcoming':
        result = await getUpcomingEvents(20, 0);
        break;
      case 'user':
        if (userId) result = await getUserEvents(userId, 20);
        break;
      case 'participating':
        if (userId) result = await getUserParticipatingEvents(userId, 20);
        break;
      default:
        result = { success: false };
    }

    if (result.success) {
      setEvents(result.data);
      setHasMore(result.data.length === 20);
    }

    setLoading(false);
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;

    const offset = events.length;
    let result;

    switch (type) {
      case 'upcoming':
        result = await getUpcomingEvents(20, offset);
        break;
      default:
        return;
    }

    if (result.success) {
      setEvents([...events, ...result.data]);
      setHasMore(result.data.length === 20);
    }
  };

  return {
    events,
    loading,
    hasMore,
    loadMore,
    refresh: loadEvents,
  };
};