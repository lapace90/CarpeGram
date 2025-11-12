/**
 * Regex patterns pour parser le texte
 */
const HASHTAG_REGEX = /#(\w+)/g;
const MENTION_REGEX = /@([\w.]+)/g;

/**
 * Extrait tous les hashtags d'un texte
 * @param {string} text - Le texte à parser
 * @returns {string[]} - Tableau de hashtags (sans le #)
 */
export const extractHashtags = (text) => {
  if (!text) return [];
  
  const matches = text.match(HASHTAG_REGEX);
  if (!matches) return [];
  
  // Retirer le # et convertir en lowercase, puis dédupliquer
  const hashtags = matches.map(tag => tag.slice(1).toLowerCase());
  return [...new Set(hashtags)];
};

/**
 * Extrait tous les usernames mentionnés d'un texte
 * @param {string} text - Le texte à parser
 * @returns {string[]} - Tableau de usernames (sans le @)
 */
export const extractMentions = (text) => {
  if (!text) return [];
  
  const matches = text.match(MENTION_REGEX);
  if (!matches) return [];
  
  // Retirer le @ et convertir en lowercase, puis dédupliquer
  const usernames = matches.map(mention => mention.slice(1).toLowerCase());
  return [...new Set(usernames)];
};

/**
 * Parse un texte et retourne les hashtags et mentions
 * @param {string} text - Le texte à parser
 * @returns {Object} - { hashtags: string[], mentions: string[] }
 */
export const parseText = (text) => {
  return {
    hashtags: extractHashtags(text),
    mentions: extractMentions(text)
  };
};

/**
 * Découpe un texte en segments (texte normal, hashtag, mention)
 * Utilisé pour l'affichage avec liens cliquables
 * @param {string} text - Le texte à découper
 * @returns {Array} - Tableau de segments { type: 'text'|'hashtag'|'mention', value: string }
 */
export const segmentText = (text) => {
  if (!text) return [];
  
  const segments = [];
  let lastIndex = 0;
  
  // Combine hashtags et mentions dans un seul regex
  const combinedRegex = /(#\w+|@[\w.]+)/g;
  let match;
  
  while ((match = combinedRegex.exec(text)) !== null) {
    // Ajouter le texte avant le match
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        value: text.substring(lastIndex, match.index)
      });
    }
    
    // Ajouter le hashtag ou la mention
    const fullMatch = match[0];
    if (fullMatch.startsWith('#')) {
      segments.push({
        type: 'hashtag',
        value: fullMatch.slice(1) // Sans le #
      });
    } else if (fullMatch.startsWith('@')) {
      segments.push({
        type: 'mention',
        value: fullMatch.slice(1) // Sans le @
      });
    }
    
    lastIndex = match.index + fullMatch.length;
  }
  
  // Ajouter le texte restant
  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      value: text.substring(lastIndex)
    });
  }
  
  return segments;
};

/**
 * Valide un hashtag
 * @param {string} tag - Le hashtag à valider (sans le #)
 * @returns {boolean}
 */
export const isValidHashtag = (tag) => {
  if (!tag) return false;
  // Au moins 1 caractère, max 50, seulement lettres/chiffres/underscore
  return /^\w{1,50}$/.test(tag);
};

/**
 * Valide un username
 * @param {string} username - Le username à valider (sans le @)
 * @returns {boolean}
 */
export const isValidUsername = (username) => {
  if (!username) return false;
  // Au moins 3 caractères, max 30, lettres/chiffres/underscore/point
  return /^[\w.]{3,30}$/.test(username);
};