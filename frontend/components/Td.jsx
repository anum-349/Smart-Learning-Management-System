export default function Td({ children, className }) {
    return <td className={`px-2 py-4 whitespace-nowrap text-primary text-left ${className}`}>{children}</td>;
}
