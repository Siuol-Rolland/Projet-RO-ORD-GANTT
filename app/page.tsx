"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [cols, setCols] = useState(14);
  const [rows, setRows] = useState(3);

  const increaseCols = () => setCols(prev => prev + 1);
  const decreaseCols = () => setCols(prev => (prev > 1 ? prev - 1 : 1));
  const increaseRows = () => setRows(prev => prev + 1);
  const decreaseRows = () => setRows(prev => (prev > 1 ? prev - 1 : 1));

  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);

  const [tableData, setTableData] = useState(
    Array.from({ length: 3 }, () => Array(14).fill(""))
  );

  useEffect(() => {
    setTableData(prev =>
      prev.map(row => {
        const newRow = [...row];
        if (cols > newRow.length) {
          return [...newRow, ...Array(cols - newRow.length).fill("")];
        } else {
          return newRow.slice(0, cols);
        }
      })
    );
  }, [cols]);

  const handleChange = (rowIndex, colIndex, value) => {
    setTableData(prev => {
      const newData = [...prev];
      newData[rowIndex][colIndex] = value;
      return newData;
    });
  };

  // Récupérer les tâches saisies (ligne 0 = noms des tâches)
  const taskNames = tableData[0].filter(name => name.trim() !== "");

  // Axe horizontal : 0 à 50 par défaut
  const maxTime = 50;
  const timeLabels = Array.from({ length: maxTime + 1 }, (_, i) => i);

  return (
    <div className="min-h-screen p-6 bg-zinc-50">
      <h1 className="text-3xl font-bold text-center text-[#033012] mb-10">
        Bienvenue dans RO ORD GANTT
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TABLEAUX et REPERE ORTHONORME (GANTT) */}
        <div className="md:col-span-2 overflow-x-auto">

          {/* TABLEAU */}
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="w-full text-sm text-left text-gray-700 border-collapse border border-gray-400 shadow-md rounded">
              <thead className="text-xs uppercase">
                <tr>
                  <th className="border border-gray-400 px-4 py-3">Tâches</th>
                  {tableData[0].map((value, i) => (
                    <td key={i} className="border border-gray-400 px-2 py-2">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleChange(0, i, e.target.value)}
                        className="w-full text-center outline-none"
                      />
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b">
                  <td className="px-4 py-3 font-medium text-gray-900">Durée</td>
                  {tableData[1]?.map((value, i) => (
                    <td key={i} className="border border-gray-400 px-2 py-3 text-center">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleChange(1, i, e.target.value)}
                        className="w-full text-center outline-none"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="bg-white">
                  <td className="px-4 py-3 font-medium text-gray-900">Tâches antérieures</td>
                  {tableData[2]?.map((value, i) => (
                    <td key={i} className="border border-gray-400 px-2 py-3 text-center">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleChange(2, i, e.target.value)}
                        className="w-full text-center outline-none"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* REPERE ORTHONORME / GANTTE */}
          {started && (
            <div className="mt-8 p-4 bg-white rounded-lg shadow">
              <h2 className="font-semibold mb-4 text-[#033012]">Visualisation GANTT</h2>

              <div className="overflow-x-auto">
                <div style={{ minWidth: `${(maxTime + 2) * 22}px` }}>

                  {/* GRILLE */}
                  <table
                    className="border-collapse text-xs"
                    style={{ tableLayout: "fixed", width: `${(maxTime + 2) * 22}px` }}
                  >
                    {/* LIGNE DES NUMEROS (axe horizontal) */}
                    <thead>
                      <tr>
                        {/* Cellule vide en haut à gauche (coin) */}
                        <th
                          style={{ width: 32, minWidth: 32 }}
                          className="border-0 bg-white"
                        />
                        {timeLabels.map(t => (
                          <th
                            key={t}
                            style={{ width: 22, minWidth: 22, fontWeight: "normal" }}
                            className="text-center text-gray-600 border-0 pb-1"
                          >
                            {t}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {taskNames.length === 0 ? (
                        /* Message si aucune tâche saisie */
                        <tr>
                          <td
                            colSpan={maxTime + 2}
                            className="text-center text-gray-400 py-12 italic"
                          >
                            Saisissez des tâches dans le tableau ci-dessus pour les voir apparaître ici.
                          </td>
                        </tr>
                      ) : (
                        taskNames.map((taskName, rowIdx) => (
                          <tr key={rowIdx}>
                            {/* Nom de la tâche — axe vertical */}
                            <td
                              style={{ width: 32, minWidth: 32 }}
                              className="text-center font-semibold text-gray-800 border border-gray-300 bg-white"
                            >
                              {taskName}
                            </td>

                            {/* Cellules de la grille (0 à 50) */}
                            {timeLabels.map(t => (
                              <td
                                key={t}
                                style={{ width: 22, minWidth: 22, height: 28 }}
                                className="border border-dashed border-gray-300 bg-white"
                              />
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                </div>
              </div>
            </div>
          )}
        </div>

        {/* DIMENSION & RESOLUTION */}
        <div className="bg-white p-6 rounded-lg shadow">
          {/* DIMENSION */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#033012]">
              Dimension du tableau :
            </h2>
            <div className="flex items-center gap-3 text-gray-600">
              <button
                onClick={decreaseCols}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                ◀
              </button>
              <span>{rows}</span>
              <span className="font-bold">x</span>
              <span>{cols}</span>
              <button
                onClick={increaseCols}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                ▶
              </button>
            </div>
          </div>

          {/* RESOLUTION PAR ETAPE */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold mb-4 text-[#033012]">
              Résolution par étape
            </h2>
            {!started ? (
              <button
                onClick={() => setStarted(true)}
                className="px-3 py-1 rounded bg-green-500 hover:bg-green-600 text-white"
              >
                Commencer
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(prev => Math.max(prev - 1, 0))}
                  className="px-3 py-1 rounded bg-gray-400 hover:bg-gray-500 text-white"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setStep(prev => prev + 1)}
                  className="px-3 py-1 rounded bg-green-500 hover:bg-green-600 text-white"
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
          <p className="text-gray-600">
            Suivez les étapes de calcul du chemin critique (dates au plus tôt, dates au plus tard, marges).
          </p>
        </div>
      </div>
    </div>
  );
}