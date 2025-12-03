import React, { useEffect, useState } from "react";
import Airtable from "airtable";
import backendUrl from "@/const/backendUrl";

const base = new Airtable({ apiKey: backendUrl.secretKey }).base(
  backendUrl.airtableBase
);

export default function PublicRankList() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);

    try {
      const scoreRecs = await base("Scores").select().all();
      const internRecs = await base("interns_selection_2025").select().all();

      const scoreMap = {};
      scoreRecs.forEach((r) => (scoreMap[r.id] = r.fields));

      const internMap = {};

      internRecs.forEach((r) => {
        const f = r.fields;
        const chestLinkId = Array.isArray(f.CHEST_NO) ? f.CHEST_NO[0] : null;
        if (!chestLinkId) return;

        const scoreLinked = scoreMap[chestLinkId];
        if (!scoreLinked) return;

        const chestText = scoreLinked.CHEST_NO;

        internMap[chestText] = {
          name: f.Name || "---",
          dept: f.department || f.DEPT || "---",
        };
      });

      const list = scoreRecs.map((r) => {
        const s = r.fields;
        const chest = s.CHEST_NO;

        return {
          chestNo: chest,
          name: internMap[chest]?.name || "---",
          dept: internMap[chest]?.dept || "---",
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

  const filtered = rows.filter((r) => {
    const text = search.toLowerCase();
    return (
      r.chestNo.toLowerCase().includes(text) ||
      r.name.toLowerCase().includes(text) ||
      r.dept.toLowerCase().includes(text)
    );
  });

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">SelectionList 2k26</h1>

      <div className="flex gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-300 border"></div>
          <span className="text-sm font-medium">Selected</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-300 border"></div>
          <span className="text-sm font-medium">Waiting List</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-300 border"></div>
          <span className="text-sm font-medium">Rejected</span>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by chest, name or department"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />


      {loading && <div className="text-center py-10">Loading...</div>}

      {!loading && (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-center">SL NO</th>
                <th className="p-2 text-center">Chest</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Department</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((r, i) => {
                const rank = i + 1;

                let bg = "";
                if (r.final === 0) bg = "bg-red-50 bg-opacity-75";
                else if (rank <= 12) bg = "bg-green-50 bg-opacity-75";
                else bg = "bg-yellow-50 bg-opacity-75";

                return (
                  <tr key={i} className={`${bg} border-b hover:bg-opacity-50`}>
                    <td className="p-2 text-center font-semibold">#{rank}</td>
                    <td className="p-2 text-center font-semibold">{r.chestNo}</td>
                    <td className="p-2">{r.name}</td>
                    <td className="p-2">{r.dept}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
