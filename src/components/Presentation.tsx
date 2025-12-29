import React from 'react';

/**
 * Componente de presentación institucional para el Diccionario académico de ecuatorianismos (DAE).
 * Este módulo integra la justificación técnica y académica extraída del documento oficial,
 * manteniendo una arquitectura de diseño limpia y tipografía optimizada para lectura extensa.
 */
const PresentationSection = () => {
    return (
        <section className="max-w-4xl mx-auto bg-white  overflow-hidden ">
            <div className="p-8 md:p-12 border-b border-gray-50">
                <h2 className="text-3xl font-serif font-bold text-[#1a365d] mb-8 tracking-tight border-l-4 border-blue-600 pl-6">
                    Presentación del Diccionario
                </h2>

                <div className="space-y-6 text-gray-800 leading-relaxed font-sans text-wrap">
                    {/* Introducción Institucional */}
                    <div className="group">
                        <p className="text-gray-700">
                            El <span className="italic text-gray-900">Diccionario académico de ecuatorianismos</span> <span className="italic">(DAE)</span> es una obra lexicográfica de carácter descriptivo, sincrónico y diferencial. Reúne más de diez mil palabras y fue concebido para registrar y explicar el léxico del español tal como se habla y se escribe en el Ecuador. Su publicación coincide de manera significativa con la conmemoración del sesquicentenario de fundación de la Academia Ecuatoriana de la Lengua —creada entre 1874 y 1875— la institución cultural más antigua del país y la segunda de su tipo en América.
                        </p>
                    </div>

                    {/* Fundamentación Metodológica */}
                    <div className="group">
                        <p className="text-gray-700">
                            La elaboración del <span className="italic">DAE</span> fue posible gracias al trabajo sostenido de la Comisión de Lexicografía de la Academia Ecuatoriana de la Lengua, integrada por académicos y lexicógrafos egresados de la Escuela de Lexicografía Hispánica de la RAE, además de la participación eventual de colaboradores de distintas áreas del conocimiento.
                        </p>
                    </div>

                    {/* Innovación y Alcance Digital */}
                    <div className="group">
                        <p className="text-gray-700">
                            Palabra por palabra, acepción por acepción, ejemplo por ejemplo, el <span className="italic">DAE</span> se elaboró con meticulosidad y entrega durante poco más de diez años de trabajo continuo. Se apoya en un amplio corpus textual propio <a href="https://corpha.ec/" className='text-blue-600' target="_blank" rel="noopener noreferrer">(corpha.ec)</a>  , que abarca desde 1930 hasta la actualidad, lo que permite describir el estado contemporáneo del español ecuatoriano. Asimismo, incorpora marcas diatópicas, diastráticas y diafásicas que orientan al lector sobre la vitalidad, distribución y condiciones de empleo de cada palabra.
                        </p>
                    </div>

                    <div className="group">
                        <p className="text-gray-700">
                            En ese sentido, esta primera edición completamente digital —y la tercera edición del DAE— no solo ofrece una herramienta de consulta, sino también un testimonio cultural y lingüístico que fortalece el reconocimiento del español del Ecuador dentro del conjunto del mundo hispanohablante.
                        </p>
                    </div>

                    <div className="group">
                        <p className="text-gray-700">
                            Construida sobre un motor de búsqueda especializado, esta versión en línea permitirá explorar con precisión lemas, acepciones, marcas, etimologías, nombres científicos y ejemplos. Asimismo, facilitará búsquedas ágiles, cruces de información y futuras actualizaciones. De esta manera, el DAE se transforma en una herramienta dinámica que entra plenamente en el siglo XXI, y en una memoria lingüística hecha para ser consultada y reapropiada por quienes compartimos y apreciamos los ecuatorianismos.
                        </p>
                    </div>
                    <div className="group">
                        <p className="text-gray-700">
                            Este resultado ha sido posible gracias al invaluable apoyo del Ministerio de Educación, Deporte y Cultura del Ecuador, que acompañó y respaldó este proyecto desde sus primeras etapas.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PresentationSection;