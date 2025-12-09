import TemplateDashboard from "./TemplateDashboard";
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { useTheme } from '../contexts/ThemeContext';

interface VideoItem {
    title: string;
    link: string;
    thumbnail: string;
    pubDate: string;
}

export default function AboutMeChannelYt() {
    const { profile } = useAuth();
    const { theme } = useTheme();

    const { data: videos, loading, error } = useFetch(
        "https://api.rss2json.com/v1/api.json?rss_url=https://www.youtube.com/feeds/videos.xml?channel_id=UCC845Rgvir2wWzJLKKy-c5g"
    );

    return (
        <TemplateDashboard profile={profile}>
            <section className="w-full lg:col-span-4 xl:col-span-4">
                <div className="w-full">
                    <h2
                        className="text-3xl text-center font-bold mb-6"
                        style={{
                            color: theme === 'light' ? '#1f2937' : '#b7babe'
                        }}
                    >
                        @Becanizado
                    </h2>

                    {loading && <p className="text-center text-gray-500">Cargando videos...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}

                    {!loading && !error && (
                        <div className="flex flex-wrap justify-center overflow-hidden gap-4">
                            {videos?.items?.map(({ title, link, thumbnail }: VideoItem, index: number) => (
                                <a
                                    key={index}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="relative lg:max-w-[250px] max-w-md rounded-lg overflow-hidden shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer group"
                                >
                                    {/* Imagen del video */}
                                    <img
                                        src={thumbnail}
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
