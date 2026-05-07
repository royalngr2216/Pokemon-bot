function getRandomColor() {
  const colors = [
    0x5865F2,
    0x57F287,
    0xFEE75C,
    0xEB459E,
    0xED4245,
    0x3498DB,
    0x9B59B6,
    0x1ABC9C,
    0xE67E22,
    0x95A5A6
  ];

  return colors[
    Math.floor(Math.random() * colors.length)
  ];
}

module.exports = {
  getRandomColor
};
