const ships = [
  { id: 1, name: 'Submarino', size: 1, maxAllowed: 3 }, // Submarino pode ser usado 3 vezes
  { id: 2, name: 'Torpedeiro', size: 2, maxAllowed: 2 }, // Torpedeiro pode ser usado 2 vezes
  { id: 3, name: 'Porta-avião', size: 3, maxAllowed: 1 }, // Porta-avião pode ser usado 1 vez
];

module.exports = { ships };// Exporta como propriedade de um objeto
