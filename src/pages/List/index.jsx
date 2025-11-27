import React, { useState, useCallback } from "react";
import Airtable from "airtable";
import backendUrl from "@/const/backendUrl";
import { Search, Loader, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const base = new Airtable({ apiKey: backendUrl.secretKey }).base(
  backendUrl.airtableBase
);

/* -------------------------------------------------
   Helper functions
------------------------------------------------- */

const clamp = (v, min = 0, max = 10) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(min, Math.min(max, n));
};

const sum = (arr) =>
  arr.reduce((acc, v) => acc + (Number.isFinite(Number(v)) ? Number(v) : 0), 0);

/* -------------------------------------------------
   Child Components
------------------------------------------------- */

const ProfileCard = ({ student }) => (
  <div className="bg-white rounded-xl p-4 shadow">
    <div className="flex gap-4 items-center">
      <div className="bg-indigo-700 text-white px-4 py-3 rounded-lg text-lg font-bold">
        {student.chestNo}
      </div>
      <div>
        <h2 className="text-xl font-semibold">{student.form?.Name}</h2>
        <p className="text-gray-600">{student.form?.department}</p>
        <p className="text-gray-500 text-sm">
          Admission No: {student.admissionNo}
        </p>
      </div>
    </div>
  </div>
);

const StageTab = ({ title, criteria }) => {
  const subtotal = sum(criteria.map((c) => clamp(c.value)));
  const max = sum(criteria.map((c) => c.max));

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <div className="flex justify-between mb-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <div className="text-gray-700 font-semibold">
          {subtotal}/{max}
        </div>
      </div>

      <div className="space-y-4">
        {criteria.map((c) => (
          <div
            key={c.key}
            className="border rounded-md p-3 flex justify-between"
          >
            <div>
              <div className="font-medium">{c.label}</div>
              <div className="text-xs text-gray-500">
                Reason: {c.reason || "—"}
              </div>
            </div>
            <div className="bg-gray-100 px-3 py-1 rounded font-semibold">
              {c.value}/{c.max}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TaskCard = ({ task }) => {
  const link = Array.isArray(task.Task_Link)
    ? task.Task_Link[0]
    : task.Task_Link;

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-semibold mb-2">Task Submission</h3>
      <p>Role: {task.Task_Role || "—"}</p>

      <p className="mt-2">
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-600 underline"
          >
            Open Task Link
          </a>
        ) : (
          <span className="text-gray-500">No Task Link</span>
        )}
      </p>
    </div>
  );
};

const FormResponses = ({ form }) => {
  const data = [
    ["Email", form.email],
    ["Phone", form.Phone_number],
    ["Department", form.department],
    ["Year", form.year],
    ["Preferred Role", form.preferred_role],
    ["Expectations", form.expectations],
    ["Why join", form.reason],
    ["Hobby", form.hobby],
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-semibold mb-3">Form Responses</h3>

      <div className="space-y-2">
        {data.map(([label, value]) => (
          <div key={label} className="border-b pb-2 flex justify-between">
            <span className="text-gray-600">{label}</span>
            <span className="text-right">{value || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------
   Main Component
------------------------------------------------- */

export default function SelectionViewer() {
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [searchMode, setSearchMode] = useState("admission");
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState(null);
  const [tab, setTab] = useState("s1");

  const S1_SCHEMA = [
    { key: "S1_Completion_Timeliness", label: "Completion & Timeliness", max: 8 },
    { key: "S1_Skill_Technical", label: "Technical Skill", max: 12 },
    { key: "S1_Originality", label: "Originality", max: 6 },
    { key: "S1_Relevance", label: "Relevance", max: 4 },
  ];

  const S2_SCHEMA = [
    { key: "S2_Interest", label: "Interest & Initiative", max: 7 },
    { key: "S2_TaskUnderstanding", label: "Task Understanding", max: 7 },
    { key: "S2_Communication", label: "Communication", max: 7 },
    { key: "S2_TeamSpirit", label: "Team Spirit", max: 7 },
    { key: "S2_LearningMindset", label: "Learning Mindset", max: 7 },
  ];

  const S3_SCHEMA = [
    { key: "S3_Teamwork", label: "Teamwork", max: 12 },
    { key: "S3_Leadership", label: "Leadership", max: 10 },
    { key: "S3_ProblemSolving", label: "Problem Solving", max: 8 },
    { key: "S3_Reliability", label: "Reliability", max: 5 },
  ];

  const buildCriteria = (scores, schema) =>
    schema.map((s) => ({
      ...s,
      value: scores[s.key] || 0,
      reason: scores[`${s.key}_Reason`] || "",
    }));

  const getStudent = async () => {
    if (!searchText.trim()) return;

    setLoading(true);
    setStudent(null);

    const query =
      searchMode === "chest"
        ? searchText.trim().toUpperCase()
        : searchText.trim();

    const filter = `{${searchMode === "chest" ? "CHEST_NO" : "Admission_No"}} = '${query}'`;

    try {
      const formRec = await base("interns_selection_2025")
        .select({ filterByFormula: filter, maxRecords: 1 })
        .firstPage();

      const scoreRec = await base("Scores")
        .select({ filterByFormula: filter, maxRecords: 1 })
        .firstPage();

      const taskRec = await base("Task_Submit")
        .select({ filterByFormula: filter, maxRecords: 1 })
        .firstPage();

      if (!formRec.length && !scoreRec.length) {
        setStudent({});
        return;
      }

      const form = formRec[0]?.fields || {};
      const scores = scoreRec[0]?.fields || {};
      const task = taskRec[0]?.fields || {};

      const chest =
        Array.isArray(form.CHEST_NO) ? form.CHEST_NO[0] : form.CHEST_NO;

      const totals = {
        s1: sum(S1_SCHEMA.map((s) => clamp(scores[s.key]))),
        s2: sum(S2_SCHEMA.map((s) => clamp(scores[s.key]))),
        s3: sum(S3_SCHEMA.map((s) => clamp(scores[s.key]))),
        bonus: clamp(scores.Bonus_Participation, 0, 5),
      };
      totals.grand = totals.s1 + totals.s2 + totals.s3 + totals.bonus;

      setStudent({
        form,
        scores,
        task,
        chestNo: scores.CHEST_NO || (searchMode === "chest" ? query : chest),
        // chestNo: scores.CHEST_NO || (searchMode === "chest" ? query : chest),
        admissionNo: form.Admission_No,
        totals,
      });
    } catch (err) {
      console.error("ERR", err);
    } finally {
      setLoading(false);
    }
  };

  const s1Criteria = buildCriteria(student?.scores || {}, S1_SCHEMA);
  const s2Criteria = buildCriteria(student?.scores || {}, S2_SCHEMA);
  const s3Criteria = buildCriteria(student?.scores || {}, S3_SCHEMA);

  return (
    <div className="w-full p-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Search Toggle */}
        <div className="flex gap-3 justify-center mb-4 flex-wrap">
          {["chest", "admission"].map((m) => (
            <button
              key={m}
              onClick={() => setSearchMode(m)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                searchMode === m
                  ? "bg-indigo-700 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {m === "chest" ? "Chest No" : "Admission No"}
            </button>
          ))}

            {/* Add Scores Btn */}
            <div className="flex justify-end">
              <button
                onClick={() => navigate("/admin/add")}
                className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
              >
                <Plus size={16} /> Add Scores
              </button>
            </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <input
            className="flex-1 p-3 rounded-lg border"
            placeholder={`Search by ${
              searchMode === "chest" ? "Chest No" : "Admission No"
            }`}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && getStudent()}
          />
          <button
            onClick={getStudent}
            className="px-5 bg-indigo-700 text-white rounded-lg flex items-center gap-2"
          >
            <Search size={18} />
            Search
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-10">
            <Loader size={30} className="animate-spin text-indigo-700" />
          </div>
        )}

        {/* Student Found */}
        {student && student.form && (
          <>
          

            <ProfileCard student={student} />

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                ["Stage 1", student.totals.s1, "/30"],
                ["Stage 2", student.totals.s2, "/35"],
                ["Stage 3", student.totals.s3, "/35"],
                ["Bonus", student.totals.bonus, "/5"],
              ].map(([label, val, out]) => (
                <div key={label} className="bg-white p-4 rounded-xl shadow">
                  <div className="text-xs text-gray-500 uppercase">
                    {label}
                  </div>
                  <div className="text-2xl font-bold text-indigo-700">
                    {val}
                    {out}
                  </div>
                </div>
              ))}
            </div>

            {/* Grand Total */}
            <div className="bg-indigo-700 text-white p-4 rounded-xl text-center text-lg font-semibold">
              Total Score: {student.totals.grand}/105
            </div>

            {/* Tabs */}
            <div className="flex gap-3 mt-6 overflow-x-auto">
              {[
                ["s1", "Stage 1"],
                ["s2", "Stage 2"],
                ["s3", "Stage 3"],
                ["task", "Task"],
                ["form", "Form"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-4 py-2 rounded-lg ${
                    tab === key
                      ? "bg-indigo-700 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Panels */}
            <div className="mt-4 ">
              {tab === "s1" && (
                <StageTab title="Stage 1 — Task Evaluation" criteria={s1Criteria} />
              )}
              {tab === "s2" && (
                <StageTab title="Stage 2 — Interview Assessment" criteria={s2Criteria} />
              )}
              {tab === "s3" && (
                <StageTab title="Stage 3 — Camp Performance" criteria={s3Criteria} />
              )}
              {tab === "task" && <TaskCard task={student.task} />}
              {tab === "form" && <FormResponses form={student.form} />}
            </div>
          </>
        )}

        {/* Not found */}
        {student && !student.form && (
          <div className="text-center py-10 text-gray-600">
            No student found
          </div>
        )}

        {/* if not search starting  */}
        {!student && !loading && (
          <div className="text-center py-10 text-gray-600">
           {/* need a creative */}
           Find the candidate selection details by searching above.
          </div>
        )}
      </div>
    </div>
  );
}
