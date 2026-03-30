const GridExtraRow = () => {
  return (
    <div className="grid grid-cols-8 gap-1.5 bg-[#2a2a2a] rounded-lg overflow-hidden">
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="flex items-center justify-center bg-[#3a3a3a] text-white text-sm font-bold"
        >
          {i + 1}
        </div>
      ))}
    </div>
  );
};

export default GridExtraRow;
