export const getFlag = (code: string) => {
  const flags: Record<string, string> = {
    KR: "https://cdn-icons-png.flaticon.com/512/197/197582.png", // كوريا
    CN: "https://cdn-icons-png.flaticon.com/512/197/197375.png", // الصين
    JP: "https://cdn-icons-png.flaticon.com/512/197/197604.png", // اليابان
  };
  return flags[code] || "";
};

export const getStatusColor = (status: string) => {
    switch(status) {
        case 'Ongoing': return { bg: 'bg-green-600', text: 'مستمر' };
        case 'Completed': return { bg: 'bg-blue-600', text: 'مكتمل' };
        case 'Hiatus': return { bg: 'bg-gray-600', text: 'متوقف' };
        default: return { bg: 'bg-gray-600', text: status };
    }
};
