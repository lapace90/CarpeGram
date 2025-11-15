import { useState, useEffect } from 'react';
import { getConversationById } from '../services/messageService';

export const useConversation = (conversationId, currentUserId) => {
  const [conversation, setConversation] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (conversationId && currentUserId) {
      loadConversation();
    }
  }, [conversationId, currentUserId]);

  const loadConversation = async () => {
    setLoading(true);
    const result = await getConversationById(conversationId, currentUserId);
    if (result.success) {
      setConversation(result.data.conversation);
      setOtherUser(result.data.otherUser);
    }
    setLoading(false);
  };

  return { conversation, otherUser, loading, refresh: loadConversation };
};