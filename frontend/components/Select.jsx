export default function Select({ label, value, onChange, options }) {
    return (
        <div className="flex flex-col">
            <label className="text-xs text-secondary mb-1">{label}</label>
            <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-white border border-gray-300 rounded-xl px-3 py-2 cursor-pointer focus:ring-accentDark">
                {options.map((op, idx) => <option key={idx} value={op.value}>{op.label}</option>)}
            </select>
        </div>
    );
} 