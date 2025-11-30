// Generate gradient background based on game name
export const getGameImage = (gameName) => {
  const gradients = {
    'Liên Quân Mobile': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'PUBG Mobile': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'Free Fire': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'Mobile Legends': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'Genshin Impact': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'Valorant': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'Wild Rift': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'Call of Duty Mobile': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'Arena of Valor': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'Clash Royale': 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
    'Brawl Stars': 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    'Tốc Chiến': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  };

  return gradients[gameName] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
};

// Get game icon/emoji
export const getGameIcon = (gameName) => {
  const icons = {
    'Liên Quân Mobile': '⚔️',
    'PUBG Mobile': '🔫',
    'Free Fire': '💥',
    'Mobile Legends': '⚡',
    'Genshin Impact': '🌟',
    'Valorant': '🎯',
    'Wild Rift': '⚔️',
    'Call of Duty Mobile': '🎮',
    'Arena of Valor': '🛡️',
    'Clash Royale': '👑',
    'Brawl Stars': '⭐',
    'Tốc Chiến': '⚔️',
  };

  return icons[gameName] || '🎮';
};

