import React from 'react';
import { MapPin, Phone, Mail,Smartphone } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <div className="mt-16 bg-[#1a365d] rounded-2xl overflow-hidden shadow-xl text-white">
      <div className="p-8 md:p-12">
        <div className="flex flex-col md:flex-row gap-8 items-start justify-between">

          <div className="md:w-1/2">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-serif font-bold mb-8 tracking-tight border-l-4 border-white-600 pl-6">
                Dónde adquirirlo
              </h2>
            </div>
            <p className="text-blue-100 leading-relaxed text-lg">
              Si desea adquirir la edición física del <span className="font-bold italic">DAE</span>, lo puede hacer en la sede de la Academia Ecuatoriana de la Lengua.
            </p>
          </div>

          <div className="md:w-1/2 bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/10">
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-blue-300 shrink-0 mt-1" />
                <div>
                  <span className="block font-bold text-sm uppercase tracking-wider text-blue-200 mb-1">Dirección</span>
                  <p className="leading-snug">
                    Calle Cuenca N4-77 y Chile, junto a la plazoleta de La Merced.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-blue-300 shrink-0 mt-1" />
                <div>
                  <span className="block font-bold text-sm uppercase tracking-wider text-blue-200 mb-1">Teléfono</span>
                  <p>+593 (02) 257-0782</p>
                  <p>0988349311</p>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <Smartphone className="w-6 h-6 text-blue-300 shrink-0 mt-1" />
                <div>
                  <span className="block font-bold text-sm uppercase tracking-wider text-blue-200 mb-1">Celular</span>
                  <p>098 834 9311</p>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-blue-300 shrink-0 mt-1" />
                <div>
                  <span className="block font-bold text-sm uppercase tracking-wider text-blue-200 mb-1">Correo Electrónico</span>
                  <a href="mailto:biblioteca.ael@gmail.com" className="hover:text-blue-300 transition-colors underline decoration-blue-300/30 underline-offset-4">
                    biblioteca.ael@gmail.com
                  </a>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Contact;
