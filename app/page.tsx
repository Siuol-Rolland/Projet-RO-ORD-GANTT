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

  const [criticalStep, setCriticalStep] = useState(0);
  const [showCritical, setShowCritical] = useState(false);

  const [successorStep, setSuccessorStep] = useState(0);
  const [showSuccessors, setShowSuccessors] = useState(false);
  const [successorPhase, setSuccessorPhase] = useState(0);

  // ✅ NOUVEAU : état pour les barres oranges (dates au plus tard)
  const [showLateDates, setShowLateDates] = useState(false);
  const [lateDateStep, setLateDateStep] = useState(0); // 0 = aucune, puis on révèle de la dernière vers la première

  const stepsList = [
    "Positionnement des tâches",
    "Chemin critique",
    "Les tâches successeurs",
    "Date au plutard",
    "Marge totale",
    ".....",
    "Marge libre",
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

  const taskNames = tableData[0].filter(name => name.trim() !== "");

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

  // ✅ Calcul complet ES/EF/LS/LF + marge
  const calculateCriticalPath = (tasks) => {
    const es = {};
    const ef = {};
    const ls = {};
    const lf = {};

    tasks.forEach(task => {
      if (task.deps.length === 0) {
        es[task.name] = 0;
      } else {
        es[task.name] = Math.max(...task.deps.map(d => ef[d] || 0));
      }
      ef[task.name] = es[task.name] + task.duration;
    });

    const projectEnd = Math.max(...Object.values(ef));

    const successors = {};
    tasks.forEach(t => { successors[t.name] = []; });
    tasks.forEach(t => {
      t.deps.forEach(dep => {
        if (successors[dep]) successors[dep].push(t.name);
      });
    });

    [...tasks].reverse().forEach(task => {
      if (successors[task.name].length === 0) {
        lf[task.name] = projectEnd;
      } else {
        lf[task.name] = Math.min(...successors[task.name].map(s => ls[s]));
      }
      ls[task.name] = lf[task.name] - task.duration;
    });

    const result = {};
    tasks.forEach(task => {
      const margin = ls[task.name] - es[task.name];
      result[task.name] = {
        es: es[task.name],
        ef: ef[task.name],
        ls: ls[task.name],   // ✅ NOUVEAU
        lf: lf[task.name],   // ✅ NOUVEAU
        isCritical: margin === 0,
      };
    });

    return { result, projectEnd };
  };

  const { result: criticalData = {}, projectEnd = 0 } =
    tasks.length > 0 ? calculateCriticalPath(tasks) : {};

  const criticalPath = tasks
    .filter(t => criticalData[t.name]?.isCritical)
    .map(t => t.name);

  const calculateSuccessors = (tasks) => {
    const successors = {};
    tasks.forEach(t => { successors[t.name] = []; });
    tasks.forEach(t => {
      t.deps.forEach(dep => {
        if (successors[dep]) successors[dep].push(t.name);
      });
    });
    return successors;
  };

  const successorsData = tasks.length > 0 ? calculateSuccessors(tasks) : {};

  const isAllTasksDisplayed = tasks.length > 0 && step >= tasks.length - 1;
  const isCriticalComplete = showCritical && criticalStep === criticalPath.length;
  const successorEntries = Object.entries(successorsData);
  const isSuccessorsComplete = showSuccessors && successorStep === successorEntries.length;
  const currentTask = successorEntries[successorStep]?.[0];

  // ✅ NOUVEAU : La liste des tâches dans l'ordre INVERSE pour l'animation des dates au plus tard
  // On révèle de la dernière tâche vers la première
  const reversedTaskNames = [...taskNames].reverse();

  // ✅ Nombre de tâches dont la barre orange est déjà affichée
  // lateDateStep = 0 → aucune, 1 → dernière tâche, 2 → avant-dernière, etc.
  const isLateDatesComplete = showLateDates && lateDateStep >= tasks.length;

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
                <tr className="bg-white border-b">
                  <td className="px-4 py-3 font-medium text-gray-900">Tâches antérieures</td>
                  {tableData[2]?.map((value, i) => (
                    <td key={i} className="border border-gray-400 px-2 py-3 text-center">
                      {(() => {
                        const value = tableData[2][i];
                        if (showSuccessors && successorPhase === 0 && currentTask) {
                          const parts = value.split(",").map(v => v.trim());
                          return parts.map((part, idx) => (
                            <span
                              key={idx}
                              className={part === currentTask ? "text-red-500 font-bold" : ""}
                            >
                              {part}
                              {idx < parts.length - 1 ? ", " : ""}
                            </span>
                          ));
                        }
                        return (
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleChange(2, i, e.target.value)}
                            className="w-full text-center outline-none"
                          />
                        );
                      })()}
                    </td>
                  ))}
                </tr>

                {/* Tâches successeurs */}
                {showSuccessors && (
                  <tr className="bg-white">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      Tâches successeurs
                    </td>
                    {taskNames.map((taskName, i) => {
                      const currentEntry = successorEntries[i];
                      const isVisible =
                        i < successorStep ||
                        (i === successorStep && successorPhase >= 1);
                      return (
                        <td key={i} className="border border-gray-400 px-2 py-3 text-center">
                          {isVisible && currentEntry
                            ? currentEntry[1].length === 0
                              ? "Fin"
                              : currentEntry[1].join(", ")
                            : ""}
                        </td>
                      );
                    })}
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* REPERE ORTHONORME / GANTT */}
          {started && (
            <div className="mt-8 p-4 bg-white rounded-lg shadow">
              <div className="overflow-x-auto">
                <div style={{ minWidth: `${(maxTime + 2) * 22}px` }}>
                  <table
                    className="border-collapse text-xs"
                    style={{ tableLayout: "fixed", width: `${(maxTime + 2) * 22}px` }}
                  >
                    <thead>
                      <tr>
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
                        <tr>
                          <td colSpan={maxTime + 2} className="text-center text-gray-400 py-12 italic">
                            Saisissez des tâches dans le tableau ci-dessus pour les voir apparaître ici.
                          </td>
                        </tr>
                      ) : (
                        tasks.map((task, rowIdx) => {
                          const isVisible = rowIdx <= step;
                          const info = criticalData[task.name];

                          // ✅ Barre bleue/verte : de es+1 à ef (date au plus tôt)
                          // ✅ Barre rouge : chemin critique
                          // ✅ Barre orange : de ef+1 à lf (marge = date au plus tard - date au plus tôt)
                          //    Elle s'affiche seulement si la tâche a été "révélée" dans l'animation
                          //    L'animation va de la dernière tâche (index tasks.length-1) vers la première (index 0)
                          //    reversedTaskNames[0] = dernière tâche, révélée au clic 1
                          //    reversedTaskNames[lateDateStep-1] = tâche révélée au dernier clic

                          // Index dans la liste inversée
                          const reversedIdx = tasks.length - 1 - rowIdx;
                          // La barre orange est visible si showLateDates ET que cet index < lateDateStep
                          const isOrangeVisible =
                            showLateDates &&
                            reversedIdx < lateDateStep;

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
                                if (!isVisible || !info) {
                                  return (
                                    <td
                                      key={t}
                                      style={{ width: 22, minWidth: 22, height: 28 }}
                                      className="border border-dashed bg-white"
                                    />
                                  );
                                }

                                // Barre bleue/verte : date au plus tôt (es → ef)
                                const isEarlyDate = t > info.es && t <= info.ef;

                                // Chemin critique
                                const critIndex = criticalPath.indexOf(task.name);
                                const isCritVisible =
                                  showCritical &&
                                  critIndex !== -1 &&
                                  critIndex >= criticalPath.length - criticalStep;
                                const isCriticalCell = isEarlyDate && isCritVisible;

                                // ✅ Barre orange : marge (ef → lf), seulement si pas chemin critique
                                const isOrangeDate =
                                  isOrangeVisible &&
                                  t > info.ls &&
                                  t <= info.lf;

                                let bgColor = "bg-white";

                                if (isCriticalCell) bgColor = "bg-red-500";
                                else if (isEarlyDate) bgColor = "bg-green-400";
                                else if (isOrangeDate) bgColor = "bg-orange-400";

                                return (
                                  <td
                                    key={t}
                                    style={{
                                      width: 22,
                                      minWidth: 22,
                                      height: 28,
                                      padding: 0,
                                      position: "relative",
                                      overflow: "hidden",
                                      borderRadius: 2,
                                    }}
                                    className="border border-dashed bg-white"
                                  >
                                    {/* BARRE ORANGE (haut) */}
                                    {isOrangeDate && (
                                      <div
                                        className="bg-orange-400"
                                        style={{
                                          position: "absolute",
                                          top: 0,
                                          left: 0,
                                          width: "100%",
                                          height: "40%",
                                        }}
                                      />
                                    )}

                                    {/* BARRE VERTE ou ROUGE (bas) */}
                                    {(isEarlyDate || isCriticalCell) && (
                                      <div
                                        className={isCriticalCell ? "bg-red-500" : "bg-green-400"}
                                        style={{
                                          position: "absolute",
                                          bottom: 0,
                                          left: 0,
                                          width: "100%",
                                          height: "60%",
                                        }}
                                      />
                                    )}
                                  </td>
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

              {/* Légende */}
              <div className="flex gap-4 mt-3 text-xs text-gray-600 flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-4 bg-green-400 rounded" /> Tâche normale (Date au plus tôt)
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-4 bg-red-400 rounded" /> Chemin critique
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-4 bg-orange-400 rounded" /> Date au plus tard (marge)
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-4 bg-blue-400 rounded" /> (-------)
                </span>
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
                  onClick={() => {
                    // ── ÉTAPE 1 : Affichage des tâches (Gantt) ──
                    if (step < tasks.length - 1) {
                      setStep(prev => prev + 1);
                    }

                    // ── ÉTAPE 2 : Chemin critique ──
                    else if (!showCritical) {
                      setShowCritical(true);
                    } else if (criticalStep < criticalPath.length) {
                      setCriticalStep(prev => prev + 1);
                    }

                    // ── ÉTAPE 3 : Successeurs ──
                    else if (!showSuccessors) {
                      setShowSuccessors(true);
                    } else if (!isSuccessorsComplete) {
                      if (successorPhase === 0) {
                        setSuccessorPhase(2);
                      } else {
                        setSuccessorPhase(0);
                        setSuccessorStep(prev => prev + 1);
                      }
                    }

                    // ── ÉTAPE 4 : Dates au plus tard (barres oranges) ──
                    // On active d'abord, puis on révèle une tâche à la fois
                    // de la DERNIÈRE vers la PREMIÈRE
                    else if (!showLateDates) {
                      setShowLateDates(true);
                      setLateDateStep(1); // révèle la dernière tâche
                    } else if (lateDateStep < tasks.length) {
                      setLateDateStep(prev => prev + 1);
                    }

                    // ── Étapes suivantes (non encore implémentées) ──
                    // else { ... }
                  }}
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

            {stepsList.map((label, index) => {
              const isStepDone =
                (index === 0 && isAllTasksDisplayed) ||
                (index === 1 && isCriticalComplete) ||
                (index === 2 && isSuccessorsComplete) ||
                (index === 3 && isLateDatesComplete); // ✅ NOUVEAU : étape 4 cochée quand toutes les barres oranges sont affichées

              return (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50 mb-1">
                  <div
                    className={`w-6 h-6 flex items-center justify-center rounded-full text-white text-sm ${
                      isStepDone ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    {isStepDone ? "✓" : index + 1}
                  </div>
                  <p className={`text-sm ${isStepDone ? "text-green-700 line-through" : "text-gray-600"}`}>
                    {label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}