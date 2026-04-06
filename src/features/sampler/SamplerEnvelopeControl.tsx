import { useState, useEffect } from "react";

type Props = {
  label: "ATTACK" | "RELEASE";
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
};

export default function SamplerEnvelopeControl({
  label,
  min,
  max,
  value,
  onChange,
}: Props) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setLocalValue(newValue);
    onChange(newValue); // immediate for responsiveness
  };

  return (
    <div className="bg-zinc-900 border border-neutral-700 p-3">
      <div className="flex justify-between text-xs text-neutral-500 mb-1">
        <span>{label}</span>
        <span className="font-mono">{localValue} ms</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={localValue}
        onChange={handleChange}
        className="w-full accent-violet-500"
      />
    </div>
  );
}
