"use client";

// Função para gerar uma cor com base no nome
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

// Função para pegar as iniciais
const getInitials = (name: string) => {
  if (!name) return '?';
  const names = name.split(' ');
  const initials = names.map(n => n[0]).join('');
  return initials.substring(0, 2).toUpperCase();
};

interface AvatarProps {
  name: string;
}

export default function Avatar({ name }: AvatarProps) {
  const initials = getInitials(name);
  const color = stringToColor(name);

  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}