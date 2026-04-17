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

  const stepsList = [
    "Positionnement des tâches",
    "Calcul des durées",
    "Positionnement des tâches",
    "Construction du diagramme GANTT",
  ];

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
  const timeLabels = Array.from({ length: maxTime }, (_, i) => i + 1);

  const isTableComplete = tableData.every(row =>
    row.every(cell => cell.trim() !== "")
  );

  const tasks = taskNames.map((name, i) => {
    const duration = parseInt(tableData[1][i]) || 0;

    const depsRaw = tableData[2][i];
    const deps =
      depsRaw.trim() === "-" || depsRaw.trim() === ""
        ? []
        : depsRaw.split(",").map(d => d.trim());

    return { name, duration, deps };
  });
  
  const calculateSchedule = (tasks) => {
    const result = {};

    tasks.forEach(task => {
      let start = 1;

      if (task.deps.length > 0) {
        start = Math.max(
          ...task.deps.map(dep => result[dep]?.end || 1)
        );
      }

      result[task.name] = {
        start,
        end: start + task.duration,
      };
    });

    return result;
  };

  const schedule = calculateSchedule(tasks);

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
                        type="number"
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
              {/* <h2 className="font-semibold mb-4 text-[#033012]">Visualisation GANTT</h2> */}

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
                        className="text-center text-gray-600 border-0 pb-1"
                      >
                        0
                      </th>

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
                        tasks.map((task, rowIdx) => {
                        const taskSchedule = schedule[task.name];

                        return (
                          <tr key={rowIdx}>
                            {/* Nom tâche */}
                            <td
                              style={{ width: 32, minWidth: 32 }}
                              className="text-center font-semibold text-gray-800 border border-gray-300 bg-white"
                            >
                              {task.name}
                            </td>

                            {/* Grille */}
                            {timeLabels.map(t => {
                              const isVisible = rowIdx <= step; // 👈 contrôle étape
                              const isActive =
                                isVisible &&
                                t >= taskSchedule.start &&
                                t < taskSchedule.end;

                              return (
                                <td
                                  key={t}
                                  style={{ width: 22, minWidth: 22, height: 28 }}
                                  className={`border border-dashed ${
                                    isActive ? "bg-green-400" : "bg-white"
                                  }`}
                                />
                              );
                            })}
                          </tr>
                        );
                      })
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
                disabled={!isTableComplete}
                className={`px-3 py-1 rounded text-white ${
                  isTableComplete
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
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

          {/* MESSAGE D'ERREUR */}
          {!isTableComplete && !started && (
            <p className="text-red-500 text-sm mt-2">
              Veuillez remplir toutes les cellules avant de commencer.
            </p>
          )}
          <div>
            <h2 className="text-xl font-bold text-[#033012]">Etapes de réalisation ORD GANTT :</h2>
            {/* <p className="text-gray-600">
              1. Saisissez les tâches, leurs durées et leurs dépendances dans le tableau de gauche.
            </p>
            <p className="text-gray-600">
              2. Cliquez sur "Commencer" pour générer la visualisation GANTT à droite.
            </p>
            <p className="text-gray-600">
              3. Utilisez les boutons "Précédent" et "Suivant" pour suivre étape par étape la construction du diagramme de GANTT.
            </p>
            <p className="text-gray-600">
              4. Observez comment les tâches sont positionnées en fonction de leurs durées et de leurs dépendances, et comment le chemin critique se dessine progressivement.
            </p>
            <p>
              5. Analysez les résultats à chaque étape pour comprendre l'impact des dépendances et des durées sur le planning global du projet.
            </p> 
            <p className="text-gray-600">
              Suivez les étapes de calcul du chemin critique (dates au plus tôt, dates au plus tard, marges).
            </p>
            */}
            {stepsList.map((label, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50">
                <div
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-white text-sm ${
                    step >= index ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  {step >= index ? "✓" : index + 1}
                </div>

                <p
                  className={`text-sm ${
                    step >= index ? "text-green-700 line-through" : "text-gray-600"
                  }`}
                >
                  {label}
                </p>
              </div>
            ))}
                        
          </div>
          
        </div>
      </div>
    </div>
  );
}