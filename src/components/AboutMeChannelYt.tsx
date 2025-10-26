import { Link } from "react-router-dom";
import { Youtube } from 'lucide-react';
import TemplateDashboard from "./TemplateDashboard";

export default function AboutMeChannelYt() {
    return (
        <TemplateDashboard>
            <div className="w-full lg:col-span-2 xl:col-span-3">
                <section className="w-full mx-auto py-10">
                    <div className="space-y-4 max-w-3xl">
                        <h2 className="text-3xl font-bold text-white">
                            Sobre el canal de <span className="text-[#00e0ff]">@Becanizado</span>
                        </h2>

                        <p className="text-[#d8dbdf] text-lg leading-relaxed">
                            Este canal está pensado exclusivamente para apoyar a mis alumnos en su aprendizaje.
                            Aquí podrás encontrar explicaciones claras, ejercicios resueltos paso a paso y
                            contenido complementario a lo que trabajamos en clase.
                        </p>

                        <p className="text-[#d8dbdf] text-lg leading-relaxed">
                            La idea es que puedan repasar los temas a su propio ritmo, reforzar los conceptos
                            que aún generan dudas y prepararse mejor para exámenes y tareas sin estrés.
                        </p>

                        <ol className="space-y-2 text-[#b7babe] text-base">
                            <li>1. Apoyo directo a los temas vistos en clase</li>
                            <li>2. Explicaciones breves, precisas y entendibles</li>
                            <li>3. Ejercicios guía para que puedan practicar</li>
                            <li>4. Contenido disponible cuando lo necesiten</li>
                        </ol>

                        <p className="text-[#d8dbdf] text-md">
                            Una vez se publiquen los primeros videos, compartiré el enlace aquí mismo para que
                            tengan acceso directo al material.
                        </p>
                    </div>

                    <Link to="/sobre-mi-canal-yt" className="inline-block mt-4 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 transition-colors shadow-lg font-bold text-white flex gap-4 w-max items-center">
                        <Youtube size={20} />
                        Ir al Canal y Suscribirme!
                    </Link>
                </section>
            </div>


        </TemplateDashboard>
    );
}