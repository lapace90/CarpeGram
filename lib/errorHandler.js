import { Alert } from 'react-native';

/**
 * Gestionnaire centralisé des erreurs
 */
export const handleError = (error, context = '') => {
  console.error(`[${context}]`, error);
  
  const message = error.message || error.error || 'Something went wrong';
  
  Alert.alert('Error', message);
};

export default handleError;