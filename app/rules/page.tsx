export default function RulesPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-augusta-green mb-6">
          Reglamento Torneo de Golf - 4 Días
        </h1>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-augusta-green mb-3">
              Salidas y Campo
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Se jugará exclusivamente desde bochas blancas.</li>
              <li>
                Si el club recomienda otra salida por condiciones específicas,
                todos los jugadores deberán salir de la misma marca sin
                excepción.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-augusta-green mb-3">
              Condiciones para el Campeonato
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                El ganador del torneo debe haber completado al menos 3 de las 4
                fechas.
              </li>
              <li>
                Si un jugador no puede asistir a una fecha (máximo una), debe
                seleccionar a un compañero del torneo antes del inicio del
                evento.
              </li>
              <li>
                En la fecha de ausencia, se le asignará el score neto obtenido
                por dicho compañero designado.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-augusta-green mb-3">
              Premios
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Ganador del Torneo (Acumulado):</strong> 50 USD por
                participante. En caso de empate, el premio se divide.
              </li>
              <li>
                <strong>Ganador de Jornada:</strong> Mejor score neto diario
                recibe 10 USD por participante. En caso de empate en la jornada,
                no se entrega premio ese día.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-augusta-green mb-3">
              Penalizaciones de Convivencia y Juego
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                El peor score neto de cada día será el responsable de la
                limpieza de la cocina esa noche.
              </li>
              <li>
                <strong>Hoyo en 1 o Águila:</strong> El jugador debe pagar la
                cena o almuerzo de todo el grupo.
              </li>
              <li>
                <strong>No pasar estacas rojas desde el tee:</strong> El jugador
                debe pagar 1 cerveza.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-augusta-green mb-3">
              Reglas Adicionales Sugeridas
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                Prohibido el uso de celulares para temas laborales durante la
                ronda (multa a convenir).
              </li>
              <li>
                Salidas del último día por orden de mérito (el líder sale al
                final).
              </li>
              <li>
                Se recomienda llevar un registro diario de &quot;deudas&quot; de
                cervezas y multas para liquidar al final del viaje.
              </li>
            </ul>
          </section>

          <section className="bg-augusta-green bg-opacity-10 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-augusta-green mb-3">
              ¡Buena Suerte!
            </h2>
            <p className="text-gray-700">
              Disfruten del torneo, jueguen limpio y que gane el mejor.
              Recuerden que el golf es un deporte de honor e integridad.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
