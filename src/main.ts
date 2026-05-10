import { SuperMarioGame } from './config/gameConfig';

// Create the game instance when the window loads
window.onload = () => {
  const game = new SuperMarioGame({
    width: 800,
    height: 600,
    parent: 'game-container'
  });
};