import { Youtube } from 'lucide-react';
import TemplateDashboard from "./TemplateDashboard";
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';

interface Videos {
    id: string;
    url: string;
    title: string;
    attachments: { url: string }[];
}

export default function AboutMeChannelYt() {
    const { profile } = useAuth();
    const { data: videos, loading, error } = useFetch("https://rss.app/feeds/v1.1/Q1cLKorlbqMyux3c.json");
    return (
        <TemplateDashboard profile={profile}>
            <section className="w-full lg:col-span-4 xl:col-span-4">
                <div className="w-fu<ll">
                    <h2 className="text-3xl text-center font-bold mb-6 text-gray-800 dark:text-gray-200">
                        @Becanizado
                    </h2>

                    {loading && <p className="text-center text-gray-500">Cargando videos...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}

                    {!loading && !error && (
                        <div className="flex flex-wrap justify-center overflow-hidden gap-4">
                            {videos?.items?.map(({ id, url, title, attachments }: Videos) => (
                                <a
                                    key={id}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="relative max-w-[250px] rounded-lg overflow-hidden shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer group"
                                >
                                    {/* Imagen del video */}
                                    <img
                                        src={attachments?.[0]?.url}
                                        alt={title}
                                        className="w-full h-60 object-cover"
                                    />

                                    {/* Overlay degradado para texto */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex items-end p-4">
                                        <h3 className="text-white font-semibold text-lg line-clamp-2">
                                            {title}
                                        </h3>
                                    </div>

                                    {/* Badge minimalista */}
                                    <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
                                        Matemáticas
                                    </span>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </TemplateDashboard>

    );
}