import { useEffect, useState } from "react";

const MiniChart = ({ colorClass = "bg-primary" }) => {
  const [heights, setHeights] = useState([30, 50, 40, 70, 50, 90, 60]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeights(prev => {
        const newHeights = [...prev.slice(1), Math.floor(Math.random() * 80) + 20];
        return newHeights;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-end gap-1 h-8 w-24">
      {heights.map((h, i) => (
        <div 
          key={i} 
          className={`w-2.5 rounded-t-sm transition-all duration-500 ease-in-out ${colorClass}`}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
};

export default MiniChart;
