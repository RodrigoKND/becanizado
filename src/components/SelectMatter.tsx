import { MATTERS } from "../data/matters";

interface SelectMatterProps {
    title?: string;
    value: string;
    onChange: (matter: string) => void;
}

export default function SelectMatter({ title, value, onChange }: SelectMatterProps) {
    return (
        <div>
            <label htmlFor="matter-filter" className="label">
                {title || 'Filtrar por materia'}
            </label>
            <select 
                id="matter-filter"
                className="input w-full cursor-pointer"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">Todas las materias</option>
                {
                    MATTERS.map((matter) => (
                        <option key={matter} value={matter}>
                            {matter}
                        </option>
                    ))
                }
            </select>
        </div>
    );
}