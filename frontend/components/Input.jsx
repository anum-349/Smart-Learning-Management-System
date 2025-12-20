export default function Input({ label, value, type= "text", onChange, placeholder }) {
    return (
        <div className="flex flex-col">
            <label className="text-xs text-secondary mb-1">{label}</label>
            <input value={value} 
            onChange={(e) => onChange(e.target.value)}
             placeholder={placeholder} 
             type={type}
             className="bg-white border border-gray-300 rounded-xl px-3 py-2 focus:ring-accentDark placeholder:text-secondary" />
        </div>
    )
}