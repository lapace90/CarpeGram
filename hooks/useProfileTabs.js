import { useState, useEffect } from 'react';
import { fetchUserPosts } from '../services/postService';
import { getUserReposts } from '../services/repostService';
import { getUserSavedPosts } from '../services/savedPostsService';
import handleError from '../lib/errorHandler';

/**
 * Hook pour gérer les tabs du profil (Posts, Shared, Saved)
 */
export const useProfileTabs = (userId, isOwnProfile = false) => {
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(false);
  
  // Cache des données par tab
  const [postsData, setPostsData] = useState([]);
  const [sharedData, setSharedData] = useState([]);
  const [savedData, setSavedData] = useState([]);
  
  // Track si les données ont été chargées au moins une fois
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [sharedLoaded, setSharedLoaded] = useState(false);
  const [savedLoaded, setSavedLoaded] = useState(false);

  // Charger les posts au montage
  useEffect(() => {
    if (userId) {
      loadTabData('posts');
    }
  }, [userId]);

  /**
   * Charge les données d'une tab spécifique
   */
  const loadTabData = async (tab) => {
    // Ne pas recharger si déjà chargé (sauf refresh explicite)
    if (tab === 'posts' && postsLoaded) return;
    if (tab === 'shared' && sharedLoaded) return;
    if (tab === 'saved' && savedLoaded) return;

    setLoading(true);

    try {
      let result;

      switch (tab) {
        case 'posts':
          result = await fetchUserPosts(userId);
          if (result.success) {
            setPostsData(result.data || []);
            setPostsLoaded(true);
          }
          break;

        case 'shared':
          result = await getUserReposts(userId);
          if (result.success) {
            setSharedData(result.data || []);
            setSharedLoaded(true);
          }
          break;

        case 'saved':
          // Saved posts: seulement pour son propre profil
          if (!isOwnProfile) {
            setSavedData([]);
            setSavedLoaded(true);
            break;
          }
          result = await getUserSavedPosts(userId);
          if (result.success) {
            setSavedData(result.data || []);
            setSavedLoaded(true);
          }
          break;

        default:
          break;
      }

      if (result && !result.success) {
        handleError(result, `Load ${tab}`);
      }
    } catch (error) {
      console.error(`Load ${tab} error:`, error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Switch vers une nouvelle tab
   */
  const switchTab = async (tab) => {
    setActiveTab(tab);
    await loadTabData(tab);
  };

  /**
   * Force le refresh de la tab actuelle
   */
  const refreshCurrentTab = async () => {
    // Reset le flag "loaded" pour forcer le rechargement
    switch (activeTab) {
      case 'posts':
        setPostsLoaded(false);
        break;
      case 'shared':
        setSharedLoaded(false);
        break;
      case 'saved':
        setSavedLoaded(false);
        break;
    }

    await loadTabData(activeTab);
  };

  /**
   * Refresh toutes les tabs (après un delete par exemple)
   */
  const refreshAllTabs = async () => {
    setPostsLoaded(false);
    setSharedLoaded(false);
    setSavedLoaded(false);
    
    await loadTabData(activeTab);
  };

  /**
   * Obtenir les données de la tab active
   */
  const getCurrentTabData = () => {
    switch (activeTab) {
      case 'posts':
        return postsData;
      case 'shared':
        return sharedData;
      case 'saved':
        return savedData;
      default:
        return [];
    }
  };

  /**
   * Obtenir le nombre d'items dans chaque tab
   */
  const getTabCounts = () => ({
    posts: postsData.length,
    shared: sharedData.length,
    saved: savedData.length,
  });

  return {
    // State
    activeTab,
    loading,
    currentData: getCurrentTabData(),
    
    // Counts
    postsCount: postsData.length,
    sharedCount: sharedData.length,
    savedCount: savedData.length,
    
    // Actions
    switchTab,
    refreshCurrentTab,
    refreshAllTabs,
    loadTabData,
  };
};