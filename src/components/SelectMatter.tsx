import { MATTERS } from "../data/matters";

export default function SelectMatter() {
    return (
        <select className="w-full p-4 py-2 cursor-pointer rounded-md text-gray-800" >
            {
                MATTERS.map((matter) => (
                    <option key={matter} value={matter}>
                        {matter}
                    </option>
                ))
            }
        </select>
    );
}