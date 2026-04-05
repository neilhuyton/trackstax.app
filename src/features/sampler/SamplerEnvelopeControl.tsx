type Props = {
  label: string;
  min: number;
  max: number;
  defaultValue: number;
};

export default function SamplerEnvelopeControl({
  label,
  min,
  max,
  defaultValue,
}: Props) {
  return (
    <div className="bg-zinc-900 border border-neutral-700 p-3">
      <div className="text-xs text-neutral-500 mb-1">{label}</div>
      <input
        type="range"
        min={min}
        max={max}
        defaultValue={defaultValue}
        className="w-full accent-violet-500"
      />
    </div>
  );
}
