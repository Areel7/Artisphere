export const getAvatarColor = (name) => {
  const hash = Array.from(name || "U").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    "from-rose-500 to-orange-400",
    "from-blue-500 to-cyan-400",
    "from-emerald-500 to-teal-400",
    "from-violet-500 to-fuchsia-400",
    "from-fuchsia-500 to-pink-500",
    "from-amber-500 to-yellow-400",
    "from-indigo-500 to-blue-500",
    "from-red-500 to-rose-400",
  ];
  return colors[hash % colors.length];
};
