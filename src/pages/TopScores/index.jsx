import React, { useEffect, useState } from "react";
import Airtable from "airtable";
import backendUrl from "@/const/backendUrl";

const base = new Airtable({ apiKey: backendUrl.secretKey }).base(
  backendUrl.airtableBase
);

export default function TopScores() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
  setLoading(true);

  try {
    const scoreRecs = await base("Scores").select().all();
    const internRecs = await base("interns_selection_2025").select().all();

    const scoreMap = {};
    scoreRecs.forEach((r) => {
      scoreMap[r.id] = r.fields; 
    });

    const internNameMap = {};

    internRecs.forEach((r) => {
      const f = r.fields;

      const chestLinkId = Array.isArray(f.CHEST_NO)
        ? f.CHEST_NO[0]
        : null;

      if (!chestLinkId) return;

      const scoreLinked = scoreMap[chestLinkId];
      if (!scoreLinked) return;

      const chestText = scoreLinked.CHEST_NO;

      internNameMap[chestText] = f.Name;
    });

    const list = scoreRecs.map((r) => {
      const s = r.fields;
      const chest = s.CHEST_NO;

      return {
        chestNo: chest,
        name: internNameMap[chest] || "---",
        s1: s.TOTAL_S1 || 0,
        s2: s.TOTAL_S2 || 0,
        s3: s.TOTAL_S3 || 0,
        withoutS1: (s.TOTAL_S2 || 0) + (s.TOTAL_S3 || 0) + (s.Bonus_Participation || 0),
        final: s.FINAL_TOTAL || 0,
      };
    });

    list.sort((a, b) => b.final - a.final);

    setRows(list);
  } catch (e) {
    console.error(e);
  }

  setLoading(false);
};


  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Top Scoring List</h1>

      {loading && <div className="text-center py-10">Loading...</div>}

      {!loading && (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Chest</th>
                <th className="p-2">Name</th>
                <th className="p-2">S1 (30)</th>
                <th className="p-2">S2 (35)</th>
                <th className="p-2">S3 (35)</th>
                <th className="p-2">Final (105)</th>
                <th className="p-2">without S1(75)</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-semibold text-center">{i + 1}</td>
                  <td className="p-2 font-semibold text-center">{r.chestNo}</td>
                  <td className="p-2 ">{r.name}</td>
                  <td className="p-2 text-center">{r.s1}</td>
                  <td className="p-2 text-center">{r.s2}</td>
                  <td className="p-2 text-center">{r.s3}</td>
                  <td className="p-2 font-bold text-indigo-700 text-center">{r.final}</td>
                  <td className="p-2 font-bold text-indigo-700 text-center">{r.withoutS1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
